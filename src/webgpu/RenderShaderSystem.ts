/**
 * Render Shader System — 液态金属粒子渲染
 *
 * 简洁的 2D 粒子渲染管线：
 *   - point-list topology + 动态 point_size
 *   - splat texture 径向软粒子
 *   - 速度着色：慢 → 深色液态金属，快 → 金色高光
 *   - 时间 shimmer 微光效果
 *
 * Bind group layout:
 *   binding 0: 粒子 storage buffer (read-only)
 *   binding 1: splat texture
 *   binding 2: splat sampler
 *   binding 3: uniform (pointSize, time — 16 bytes)
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

  // Uniform buffer: pointSize(f32) + time(f32) = 8 bytes, padded to 16
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

        // 归一化坐标 [-1, 1]
        const nx = (x / size) * 2 - 1
        const ny = (y / size) * 2 - 1

        // 径向距离
        const dist = Math.sqrt(nx * nx + ny * ny)

        // 软边圆形：中心亮，边缘柔和衰减
        let alpha = 1.0 - dist
        alpha = Math.max(0, alpha)
        alpha = Math.pow(alpha, 1.5) // 使边缘更柔和

        data[idx] = 255     // R
        data[idx + 1] = 255 // G
        data[idx + 2] = 255 // B
        data[idx + 3] = alpha * 255 // A
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
      size: 16, // pointSize(f32) + time(f32) + 8 bytes padding
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
          time: f32,
        }

        @group(0) @binding(0) var<storage, read> particles: array<Particle>;
        @group(0) @binding(1) var splatTex: texture_2d<f32>;
        @group(0) @binding(2) var splatSamp: sampler;
        @group(0) @binding(3) var<uniform> uniforms: RenderUniforms;

        struct VsOut {
          @builtin(position) pos: vec4f,
          @builtin(point_size) size: f32,
          @location(0) velocity: vec2f,
          @location(1) uv: vec2f,
        }

        @vertex
        fn vs(@builtin(vertex_index) vid: u32) -> VsOut {
          let p = particles[vid].pos;
          let v = particles[vid].vel;

          // [0,1] -> [-1,1] clip space, Y 翻转
          let clip = vec2f(p.x * 2.0 - 1.0, 1.0 - p.y * 2.0);

          // 速度越快，点越大（基础大小 + 速度加成）
          let speed = length(v);
          let sizeBoost = smoothstep(0.0, 0.08, speed) * uniforms.pointSize * 0.6;

          var output: VsOut;
          output.pos = vec4f(clip, 0.0, 1.0);
          output.size = uniforms.pointSize + sizeBoost;
          output.velocity = v;
          output.uv = clip; // 归一化 UV 用于 shimmer

          return output;
        }

        @fragment
        fn fs(input: VsOut) -> @location(0) vec4f {
          // 采样 splat 纹理（point center 对应 texture center）
          let splatAlpha = textureSample(splatTex, splatSamp, vec2f(0.5)).a;

          // 速度着色：慢 → 深色液态金属，快 → 金色高光
          let speed = length(input.velocity);
          let t = smoothstep(0.0, 0.06, speed);

          // 深色液态金属底色
          let darkMetal = vec3f(0.10, 0.10, 0.12);
          // 金色高光
          let gold = vec3f(0.831, 0.686, 0.216);

          var color = mix(darkMetal, gold, t);

          // 时间 shimmer：基于粒子 UV 坐标（非屏幕坐标），微光闪烁
          let shimmer = sin(uniforms.time * 3.0 + input.uv.x * 15.0 + input.uv.y * 15.0) * 0.5 + 0.5;
          color += vec3f(shimmer * 0.08 * t); // 速度快的粒子 shimmer 更明显

          // alpha = splat 衰减 × 亮度
          let brightness = 0.4 + t * 0.6;
          let alpha = splatAlpha * brightness;

          return vec4f(color, alpha);
        }
      `,
    })

    // 检查编译错误
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
        topology: 'point-list',
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
   * 更新 uniform 参数（pointSize + time）
   */
  updateUniforms(pointSize: number, time: number): void {
    if (!this.uniformBuffer) return
    // 16 bytes: pointSize(f32) + time(f32) + 8 padding
    const data = new Float32Array([pointSize, time, 0, 0])
    this.device.queue.writeBuffer(this.uniformBuffer, 0, data)
  }

  /**
   * 渲染粒子到外部 render pass
   * @param pass 外部 render pass（支持合并到同一个 command encoder）
   */
  renderToPass(pass: GPURenderPassEncoder, particleCount: number): void {
    if (!this.pipeline || !this.currentBindGroup) return

    pass.setPipeline(this.pipeline)
    pass.setBindGroup(0, this.currentBindGroup)
    pass.draw(particleCount)
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
