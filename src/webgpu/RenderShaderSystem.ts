/**
 * Render Shader System — 液态金属粒子渲染
 *
 * Instanced quad 方案（兼容所有 WebGPU 设备）：
 *   - triangle-list topology，每个粒子 = 1 个 quad 实例（6 顶点）
 *   - vertex shader 通过 instance_index 查找粒子数据
 *   - splat texture 径向软粒子
 *   - 速度着色：慢 → 深色液态金属，快 → 金色高光
 *   - 时间 shimmer 微光效果
 *
 * Bind group layout:
 *   binding 0: 粒子 storage buffer (read-only)
 *   binding 1: splat texture
 *   binding 2: splat sampler
 *   binding 3: uniform (pointSize, canvasWidth, canvasHeight, time — 16 bytes)
 */

import { WebGPUContext } from './WebGPUContext'

export class RenderShaderSystem {
  private device: GPUDevice
  private format: GPUTextureFormat

  pipeline: GPURenderPipeline | null = null
  private bindGroupLayout: GPUBindGroupLayout | null = null

  // 缓存每个 buffer 对应的 bind group（ping-pong 两个 buffer）
  private bindGroupCache = new Map<GPUBuffer, GPUBindGroup>()
  private currentBindGroup: GPUBindGroup | null = null

  // Uniform buffer: pointSize(f32) + canvasW(f32) + canvasH(f32) + time(f32) = 16 bytes
  private uniformBuffer: GPUBuffer | null = null

  // 点 splatting 纹理
  private splatTexture: GPUTexture | null = null
  private splatSampler: GPUSampler | null = null

  constructor(ctxWrapper: WebGPUContext) {
    this.device = ctxWrapper.device!
    this.format = ctxWrapper.format
  }

  async init(): Promise<void> {
    this.createSplatTexture()
    this.createUniformBuffer()
    this.createBindGroupLayout()
    this.createPipeline()
  }

  /**
   * 创建点 splatting 纹理（径向渐变软圆）
   */
  private createSplatTexture(): void {
    const size = 64
    const data = new Uint8Array(size * size * 4)

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const idx = (y * size + x) * 4

        // 归一化坐标 [0, 1]
        const nx = x / size
        const ny = y / size

        // 径向距离
        const dist = Math.sqrt((nx - 0.5) ** 2 + (ny - 0.5) ** 2) * 2.0

        // 软边圆形：中心亮，边缘柔和衰减
        let alpha = 1.0 - dist
        alpha = Math.max(0, alpha)
        alpha = Math.pow(alpha, 1.5)

        data[idx] = 255
        data[idx + 1] = 255
        data[idx + 2] = 255
        data[idx + 3] = alpha * 255
      }
    }

    this.splatTexture = this.device.createTexture({
      label: 'splat-texture',
      size: [size, size, 1],
      format: 'rgba8unorm',
      usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST,
    })

    this.device.queue.writeTexture(
      { texture: this.splatTexture },
      data,
      { bytesPerRow: size * 4, rowsPerImage: size },
      { width: size, height: size },
    )

    this.splatSampler = this.device.createSampler({
      label: 'splat-sampler',
      addressModeU: 'clamp-to-edge',
      addressModeV: 'clamp-to-edge',
      magFilter: 'linear',
      minFilter: 'linear',
    })
  }

  private createUniformBuffer(): void {
    this.uniformBuffer = this.device.createBuffer({
      label: 'render-uniforms',
      size: 16, // pointSize(f32) + canvasW(f32) + canvasH(f32) + time(f32)
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    })
  }

  private createBindGroupLayout(): void {
    this.bindGroupLayout = this.device.createBindGroupLayout({
      label: 'render-layout',
      entries: [
        {
          binding: 0,
          visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
          buffer: { type: 'read-only-storage' },
        },
        {
          binding: 1,
          visibility: GPUShaderStage.FRAGMENT,
          texture: { sampleType: 'float' },
        },
        {
          binding: 2,
          visibility: GPUShaderStage.FRAGMENT,
          sampler: { type: 'filtering' },
        },
        {
          binding: 3,
          visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
          buffer: { type: 'uniform' },
        },
      ],
    })
  }

  private createPipeline(): void {
    const module = this.device.createShaderModule({
      label: 'particle-render-shader',
      code: /* wgsl */ `
        struct Particle {
          pos: vec2f,
          vel: vec2f,
        }

        struct RenderUniforms {
          pointSize: f32,
          canvasW: f32,
          canvasH: f32,
          time: f32,
        }

        @group(0) @binding(0) var<storage, read> particles: array<Particle>;
        @group(0) @binding(1) var splatTex: texture_2d<f32>;
        @group(0) @binding(2) var splatSamp: sampler;
        @group(0) @binding(3) var<uniform> uniforms: RenderUniforms;

        struct VsOut {
          @builtin(position) pos: vec4f,
          @location(0) velocity: vec2f,
          @location(1) uv: vec2f,     // splat 纹理 UV (0~1)
          @location(2) particleUV: vec2f, // 归一化粒子坐标，用于 shimmer
        }

        // 单位 quad 的 6 个顶点偏移 + UV（两个三角形）
        // vertex 0,1,2 = 第一个三角形, 3,4,5 = 第二个三角形
        const QUAD_OFFSETS: array<vec2f, 6> = array<vec2f, 6>(
          vec2f(-0.5, -0.5), vec2f( 0.5, -0.5), vec2f(-0.5,  0.5),
          vec2f(-0.5,  0.5), vec2f( 0.5, -0.5), vec2f( 0.5,  0.5),
        );
        const QUAD_UVS: array<vec2f, 6> = array<vec2f, 6>(
          vec2f(0.0, 1.0), vec2f(1.0, 1.0), vec2f(0.0, 0.0),
          vec2f(0.0, 0.0), vec2f(1.0, 1.0), vec2f(1.0, 0.0),
        );

        @vertex
        fn vs(@builtin(vertex_index) vid: u32, @builtin(instance_index) iid: u32) -> VsOut {
          let particle = particles[iid];
          let p = particle.pos;
          let v = particle.vel;

          // 粒子归一化坐标 → 像素坐标 → clip space
          let pixelX = p.x * uniforms.canvasW;
          let pixelY = p.y * uniforms.canvasH;

          // 速度越快 quad 越大
          let speed = length(v);
          let size = uniforms.pointSize * (1.0 + smoothstep(0.0, 0.08, speed) * 0.6);

          // quad 角点偏移（像素空间）
          let offset = QUAD_OFFSETS[vid] * size;
          let px = pixelX + offset.x;
          let py = pixelY + offset.y;

          // 像素 → clip space
          let clipX = (px / uniforms.canvasW) * 2.0 - 1.0;
          let clipY = 1.0 - (py / uniforms.canvasH) * 2.0;

          var output: VsOut;
          output.pos = vec4f(clipX, clipY, 0.0, 1.0);
          output.velocity = v;
          output.uv = QUAD_UVS[vid];
          output.particleUV = p;

          return output;
        }

        @fragment
        fn fs(input: VsOut) -> @location(0) vec4f {
          // 采样 splat 纹理做径向软衰减
          let splatAlpha = textureSample(splatTex, splatSamp, input.uv).a;

          // 速度着色：慢 → 深色液态金属，快 → 金色高光
          let speed = length(input.velocity);
          let t = smoothstep(0.0, 0.06, speed);

          let darkMetal = vec3f(0.10, 0.10, 0.12);
          let gold = vec3f(0.831, 0.686, 0.216);

          var color = mix(darkMetal, gold, t);

          // 时间 shimmer：基于粒子位置坐标
          let shimmer = sin(uniforms.time * 3.0 + input.particleUV.x * 15.0 + input.particleUV.y * 15.0) * 0.5 + 0.5;
          color += vec3f(shimmer * 0.08 * t);

          // alpha = splat 衰减 × 亮度
          let brightness = 0.4 + t * 0.6;
          let alpha = splatAlpha * brightness;

          return vec4f(color, alpha);
        }
      `,
    })

    module.getCompilationInfo().then((info) => {
      for (const msg of info.messages) {
        if (msg.type === 'error') {
          console.error(`WGSL error [${msg.lineNum}:${msg.linePos}]: ${msg.message}`)
        }
      }
    }).catch(() => {})

    this.pipeline = this.device.createRenderPipeline({
      label: 'particle-render-pipeline',
      layout: this.device.createPipelineLayout({
        bindGroupLayouts: [this.bindGroupLayout!],
      }),
      vertex: {
        module,
        entryPoint: 'vs',
      },
      fragment: {
        module,
        entryPoint: 'fs',
        targets: [
          {
            format: this.format,
            blend: {
              color: {
                srcFactor: 'src-alpha',
                dstFactor: 'one-minus-src-alpha',
              },
              alpha: {
                srcFactor: 'one',
                dstFactor: 'one-minus-src-alpha',
              },
            },
          },
        ],
      },
      primitive: {
        topology: 'triangle-list',
      },
    })
  }

  /**
   * 设置粒子 buffer（每帧 ping-pong 切换时调用）
   */
  setParticleBuffer(buffer: GPUBuffer): void {
    if (!this.bindGroupCache.has(buffer)) {
      this.bindGroupCache.set(
        buffer,
        this.device.createBindGroup({
          label: 'render-bind',
          layout: this.bindGroupLayout!,
          entries: [
            { binding: 0, resource: { buffer } },
            { binding: 1, resource: this.splatTexture!.createView() },
            { binding: 2, resource: this.splatSampler! },
            { binding: 3, resource: { buffer: this.uniformBuffer! } },
          ],
        }),
      )
    }
    this.currentBindGroup = this.bindGroupCache.get(buffer)!
  }

  /**
   * 更新 uniform 参数
   */
  updateUniforms(pointSize: number, canvasW: number, canvasH: number, time: number): void {
    if (!this.uniformBuffer) return
    const data = new Float32Array([pointSize, canvasW, canvasH, time])
    this.device.queue.writeBuffer(this.uniformBuffer, 0, data)
  }

  /**
   * 渲染粒子到外部 render pass（instanced draw）
   * @param pass 外部 render pass
   * @param particleCount 粒子数量（instance 数）
   */
  renderToPass(pass: GPURenderPassEncoder, particleCount: number): void {
    if (!this.pipeline || !this.currentBindGroup) return

    pass.setPipeline(this.pipeline)
    pass.setBindGroup(0, this.currentBindGroup)
    // 6 vertices per quad, particleCount instances
    pass.draw(6, particleCount)
  }

  destroy(): void {
    this.pipeline = null
    this.bindGroupLayout = null
    this.bindGroupCache.clear()
    this.currentBindGroup = null

    this.splatTexture?.destroy()
    this.uniformBuffer?.destroy()

    this.splatTexture = null
    this.splatSampler = null
    this.uniformBuffer = null
  }
}
