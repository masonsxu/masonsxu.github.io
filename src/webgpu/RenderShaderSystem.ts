/**
 * Enhanced Render Shader System
 * 
 * 实现材质系统、点 splatting、基础光照
 * 支持 Matte Titanium 和液态黑曜石材质
 */

import { WebGPUContext } from './WebGPUContext'

export class RenderShaderSystem {
  private device: GPUDevice
  private context: GPUCanvasContext
  private format: GPUTextureFormat

  pipeline: GPURenderPipeline | null = null
  private bindGroupLayout: GPUBindGroupLayout | null = null

  // 缓存每个 buffer 对应的 bind group（ping-pong 两个 buffer）
  private bindGroupCache = new Map<GPUBuffer, GPUBindGroup>()
  private currentBindGroup: GPUBindGroup | null = null

  // 材质参数缓冲区
  private materialParamsBuffer: GPUBuffer | null = null

  // 点 splatting 纹理
  private splatTexture: GPUTexture | null = null
  private splatSampler: GPUSampler | null = null

  // 光照参数
  private lightParamsBuffer: GPUBuffer | null = null

  constructor(ctxWrapper: WebGPUContext) {
    this.device = ctxWrapper.device!
    this.context = ctxWrapper.context!
    this.format = ctxWrapper.format
  }

  async init(): Promise<void> {
    this.createSplatTexture()
    this.createMaterialParams()
    this.createLightParams()
    this.createBindGroupLayout()
    this.createPipeline()
  }

  /**
   * 创建点 splatting 纹理（径向渐变）
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

        // 软边圆形
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
      {
        texture: this.splatTexture,
      },
      data,
      {
        bytesPerRow: size * 4,
        rowsPerImage: size,
      },
      {
        width: size,
        height: size,
      }
    )

    this.splatSampler = this.device.createSampler({
      label: 'splat-sampler',
      addressModeU: 'clamp-to-edge',
      addressModeV: 'clamp-to-edge',
      magFilter: 'linear',
      minFilter: 'linear',
    })
  }

  /**
   * 创建材质参数
   */
  private createMaterialParams(): void {
    // Matte Titanium 基底
    const titaniumBase = [0.02, 0.02, 0.02] // #050505
    const titaniumRoughness = 0.95 // 高粗糙度
    const titaniumMetallic = 0.1 // 低金属度

    // 液态黑曜石
    const obsidianColor = [0.05, 0.05, 0.06]
    const obsidianRoughness = 0.08 // 低粗糙度
    const obsidianMetallic = 0.9 // 高金属度

    // 两种材质的混合
    const mixFactor = 0.3 // 30% 液态表面

    this.materialParamsBuffer = this.device.createBuffer({
      label: 'material-params',
      size: 64, // 16 floats
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    })

    const params = new Float32Array([
      ...titaniumBase,
      titaniumRoughness,
      titaniumMetallic,
      ...obsidianColor,
      obsidianRoughness,
      obsidianMetallic,
      mixFactor,
      0, 0, 0, // padding
    ])

    this.device.queue.writeBuffer(this.materialParamsBuffer, 0, params)
  }

  /**
   * 创建光照参数
   */
  private createLightParams(): void {
    this.lightParamsBuffer = this.device.createBuffer({
      label: 'light-params',
      size: 48, // 需要符合 WGSL struct 对齐（16 字节边界）
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    })

    const params = new Float32Array([
      0.3, 0.5, 0.8, 0, // 光照方向 + padding
      1.0, 0.9, 0.8, 0, // 暖色光 + padding
      1.2, 0, // 强度 + padding
      0, 0, 0, 0, // time + padding（对齐到 16 字节）
    ])

    this.device.queue.writeBuffer(this.lightParamsBuffer, 0, params)
  }

  private createBindGroupLayout(): void {
    this.bindGroupLayout = this.device.createBindGroupLayout({
      label: 'render-layout',
      entries: [
        {
          binding: 0,
          visibility: GPUShaderStage.VERTEX,
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
          visibility: GPUShaderStage.FRAGMENT,
          buffer: { type: 'uniform' },
        },
        {
          binding: 4,
          visibility: GPUShaderStage.FRAGMENT,
          buffer: { type: 'uniform' },
        },
      ],
    })
  }

  private createPipeline(): void {
    const module = this.device.createShaderModule({
      label: 'enhanced-particle-render-shader',
      code: /* wgsl */ `
        struct Particle {
          pos: vec2f,
          vel: vec2f,
        }

        struct MaterialParams {
          titaniumBase: vec3f,
          titaniumRoughness: f32,
          titaniumMetallic: f32,
          obsidianColor: vec3f,
          obsidianRoughness: f32,
          obsidianMetallic: f32,
          mixFactor: f32,
          _padding: vec3f,
        }

        struct LightParams {
          lightDir: vec3f,
          lightColor: vec3f,
          lightIntensity: f32,
          time: f32,
        }

        @group(0) @binding(0) var<storage, read> particles: array<Particle>;
        @group(0) @binding(1) var splatTexture: texture_2d<f32>;
        @group(0) @binding(2) var splatSampler: sampler;
        @group(0) @binding(3) var<uniform> materialParams: MaterialParams;
        @group(0) @binding(4) var<uniform> lightParams: LightParams;

        struct VsOut {
          @builtin(position) pos: vec4f,
          @location(0) velocity: vec2f,
          @location(1) screenPos: vec2f,
        }

        @vertex
        fn vs(@builtin(vertex_index) vid: u32) -> VsOut {
          let p = particles[vid].pos;
          let v = particles[vid].vel;

          // [0,1] -> [-1,1] clip space, Y 翻转
          let clip = vec2f(p.x * 2.0 - 1.0, 1.0 - p.y * 2.0);

          var output: VsOut;
          output.pos = vec4f(clip, 0.0, 1.0);
          output.velocity = v;
          output.screenPos = clip;

          return output;
        }

        @fragment
        fn fs(input: VsOut) -> @location(0) vec4f {
          // 简化：直接渲染整个像素
          // 使用基于屏幕位置的噪声来创建纹理效果
          let noise = sin(input.screenPos.x * 20.0) * cos(input.screenPos.y * 20.0) * 0.5 + 0.5;

          // 金色基础颜色
          let baseColor = vec3f(0.83, 0.68, 0.21);

          // 添加速度发光
          let speed = length(input.velocity);
          let glow = smoothstep(0.0, 0.5, speed) * 0.8;
          var finalColor = baseColor * (0.5 + noise * 0.3) + vec3f(glow);

          // 添加时间动画闪烁
          let shimmer = sin(lightParams.time * 4.0 + input.screenPos.x * 10.0 + input.screenPos.y * 10.0) * 0.15;
          finalColor = finalColor + vec3f(shimmer * 0.5);

          // 基于距离中心的淡出（创建圆形效果）
          let distFromCenter = length(input.screenPos);
          let alpha = 1.0 - smoothstep(0.0, 1.4, distFromCenter);

          return vec4f(finalColor, alpha * 0.7);
        }
      `,
    })

    // 检查编译错误
    const compilationInfoPromise = module.getCompilationInfo()
    if (compilationInfoPromise) {
      compilationInfoPromise.then((info) => {
        for (const msg of info.messages) {
          if (msg.type === 'error') {
            console.error(`WGSL error [${msg.lineNum}:${msg.linePos}]: ${msg.message}`)
          }
        }
      }).catch((err) => {
        console.error('Failed to get shader compilation info:', err)
      })
    }

    this.pipeline = this.device.createRenderPipeline({
      label: 'enhanced-particle-render-pipeline',
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
            { binding: 3, resource: { buffer: this.materialParamsBuffer! } },
            { binding: 4, resource: { buffer: this.lightParamsBuffer! } },
          ],
        }),
      )
    }
    this.currentBindGroup = this.bindGroupCache.get(buffer)!
  }

  render(particleCount: number): void {
    if (!this.pipeline || !this.currentBindGroup) return

    const view = this.context.getCurrentTexture().createView()
    const encoder = this.device.createCommandEncoder({ label: 'render' })

    const pass = encoder.beginRenderPass({
      colorAttachments: [
        {
          view,
          clearValue: { r: 0.05, g: 0.05, b: 0.05, a: 1.0 }, // 稍微亮一点的背景
          loadOp: 'clear',
          storeOp: 'store',
        },
      ],
    })

    pass.setPipeline(this.pipeline)
    pass.setBindGroup(0, this.currentBindGroup)
    pass.draw(particleCount)
    pass.end()

    this.device.queue.submit([encoder.finish()])
  }

  /**
   * Update uniform matrices for the render pipeline
   */
  updateUniforms(_projectionMatrix: Float32Array, _viewMatrix: Float32Array, time: number): void {
    // 更新光照参数中的时间
    if (this.lightParamsBuffer && this.device) {
      // time 在偏移 36 处（lightIntensity 之后）
      this.device.queue.writeBuffer(this.lightParamsBuffer, 36, new Float32Array([time]))
    }
  }

  /**
   * 更新材质混合
   */
  setMaterialMix(mixFactor: number): void {
    if (this.materialParamsBuffer && this.device) {
      this.device.queue.writeBuffer(this.materialParamsBuffer, 44, new Float32Array([mixFactor]))
    }
  }

  destroy(): void {
    this.pipeline = null
    this.bindGroupLayout = null
    this.bindGroupCache.clear()
    this.currentBindGroup = null

    this.splatTexture?.destroy()
    this.materialParamsBuffer?.destroy()
    this.lightParamsBuffer?.destroy()

    this.splatTexture = null
    this.splatSampler = null
    this.materialParamsBuffer = null
    this.lightParamsBuffer = null
  }
}
