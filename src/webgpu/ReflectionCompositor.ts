/**
 * Reflection Compositor
 * 
 * 捕获 UI 元素并渲染反射到液态金属表面
 * 实现 Fresnel 效果、粗糙度模糊和色差
 */

import { WebGPUContext } from './WebGPUContext'

export class ReflectionCompositor {
  private device: GPUDevice | null = null
  private context: GPUCanvasContext | null = null
  private width: number = 0
  private height: number = 0

  // UI 捕获纹理
  private uiTexture: GPUTexture | null = null
  private uiTextureView: GPUTextureView | null = null

  // 反射渲染管线
  private reflectionPipeline: GPURenderPipeline | null = null
  private reflectionBindGroup: GPUBindGroup | null = null
  private reflectionBindGroupLayout: GPUBindGroupLayout | null = null

  // 参数缓冲区
  private paramsBuffer: GPUBuffer | null = null

  // 采样器
  private sampler: GPUSampler | null = null

  constructor(private contextWrapper: WebGPUContext) {
    this.device = contextWrapper.device
    this.context = contextWrapper.context
    this.width = contextWrapper.width
    this.height = contextWrapper.height
  }

  async init(): Promise<void> {
    if (!this.device) {
      throw new Error('WebGPU device not initialized')
    }

    this.createResources()
    this.createRenderPipeline()
  }

  /**
   * 创建渲染资源
   */
  private createResources(): void {
    if (!this.device) return

    // 创建 UI 捕获纹理（RGBA8UNORM 用于颜色精度）
    this.uiTexture = this.device.createTexture({
      label: 'ui-capture-texture',
      size: [this.width, this.height, 1],
      format: 'bgra8unorm',
      usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST,
      mipLevelCount: 1,
    })

    this.uiTextureView = this.uiTexture.createView()

    // 创建参数缓冲区
    this.paramsBuffer = this.device.createBuffer({
      label: 'reflection-params',
      size: 32, // 4 floats: fresnelBias, fresnelScale, roughness, chromaticStrength
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    })

    // 设置默认参数
    this.updateReflectionParams()

    // 创建采样器
    this.sampler = this.device.createSampler({
      label: 'reflection-sampler',
      addressModeU: 'clamp-to-edge',
      addressModeV: 'clamp-to-edge',
      magFilter: 'linear',
      minFilter: 'linear',
      mipmapFilter: 'linear',
    })
  }

  /**
   * 更新反射参数
   */
  private updateReflectionParams(
    fresnelBias: number = 0.1,
    fresnelScale: number = 0.8,
    roughness: number = 0.15,
    chromaticStrength: number = 0.003
  ): void {
    if (!this.paramsBuffer || !this.device) return

    const params = new Float32Array([
      fresnelBias,
      fresnelScale,
      roughness,
      chromaticStrength,
    ])

    this.device.queue.writeBuffer(this.paramsBuffer, 0, params)
  }

  /**
   * 创建反射渲染管线
   */
  private createRenderPipeline(): void {
    if (!this.device) return

    // 创建 Bind Group Layout
    this.reflectionBindGroupLayout = this.device.createBindGroupLayout({
      label: 'reflection-bind-group-layout',
      entries: [
        {
          binding: 0,
          visibility: GPUShaderStage.FRAGMENT,
          sampler: { type: 'filtering' },
        },
        {
          binding: 1,
          visibility: GPUShaderStage.FRAGMENT,
          texture: { sampleType: 'float' },
        },
        {
          binding: 2,
          visibility: GPUShaderStage.FRAGMENT,
          buffer: { type: 'uniform' },
        },
      ],
    })

    // 创建 Shader Module
    const shaderModule = this.device.createShaderModule({
      label: 'reflection-shader',
      code: /* wgsl */ `
        struct ReflectionParams {
          fresnelBias: f32,
          fresnelScale: f32,
          roughness: f32,
          chromaticStrength: f32,
        }

        @group(0) @binding(0) var textureSampler: sampler;
        @group(0) @binding(1) var uiTexture: texture_2d<f32>;
        @group(0) @binding(2) var<uniform> params: ReflectionParams;

        struct VertexOutput {
          @builtin(position) position: vec4f,
          @location(0) uv: vec2f,
        }

        @vertex
        fn vs_main(@builtin(vertex_index) vertexIndex: u32) -> VertexOutput {
          var pos = array<vec2f, 6>(
            vec2f(-1.0, -1.0),
            vec2f(1.0, -1.0),
            vec2f(-1.0, 1.0),
            vec2f(-1.0, 1.0),
            vec2f(1.0, -1.0),
            vec2f(1.0, 1.0)
          );

          var output: VertexOutput;
          output.position = vec4f(pos[vertexIndex], 0.0, 1.0);
          output.uv = pos[vertexIndex] * 0.5 + 0.5;
          output.uv.y = 1.0 - output.uv.y;

          return output;
        }

        @fragment
        fn fs_main(input: VertexOutput) -> @location(0) vec4f {
          // 采样 UI 纹理
          let uiColor = textureSample(uiTexture, textureSampler, input.uv);

          // 简化的 Fresnel 效果（基于 UV 坐标）
          let center = vec2f(0.5, 0.5);
          let dir = normalize(input.uv - center);
          let viewDir = vec3f(dir.x, dir.y, 1.0);
          let normal = vec3f(0.0, 0.0, 1.0);

          let cosAngle = dot(normal, viewDir);
          let fresnel = clamp(params.fresnelBias + params.fresnelScale * pow(1.0 - cosAngle, 3.0), 0.0, 1.0);

          // 简化的色差效果
          let dist = distance(input.uv, center);
          let offset = normalize(input.uv - center) * dist * params.chromaticStrength;

          let r = textureSample(uiTexture, textureSampler, input.uv + offset).r;
          let g = textureSample(uiTexture, textureSampler, input.uv).g;
          let b = textureSample(uiTexture, textureSampler, input.uv - offset).b;

          let chromaticColor = vec3f(r, g, b);

          // 混合
          let finalColor = chromaticColor * fresnel;

          return vec4f(finalColor, fresnel * 0.4);
        }
      `,
    })

    // 创建 Render Pipeline
    this.reflectionPipeline = this.device.createRenderPipeline({
      label: 'reflection-pipeline',
      layout: this.device.createPipelineLayout({
        bindGroupLayouts: [this.reflectionBindGroupLayout],
      }),
      vertex: {
        module: shaderModule,
        entryPoint: 'vs_main',
      },
      fragment: {
        module: shaderModule,
        entryPoint: 'fs_main',
        targets: [
          {
            format: 'bgra8unorm',
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

    // 创建 Bind Group
    this.reflectionBindGroup = this.device.createBindGroup({
      label: 'reflection-bind-group',
      layout: this.reflectionBindGroupLayout,
      entries: [
        { binding: 0, resource: this.sampler! },
        { binding: 1, resource: this.uiTextureView! },
        { binding: 2, resource: { buffer: this.paramsBuffer! } },
      ],
    })
  }

  /**
   * 捕获当前 UI 状态到纹理
   * 
   * 注意：这是一个简化版本，实际实现需要：
   * 1. 创建一个离屏 canvas
   * 2. 使用 html2canvas 或类似库捕获 DOM
   * 3. 将捕获的图像复制到 GPU 纹理
   * 
   * 当前实现使用程序化模式作为占位符
   */
  async captureUI(): Promise<void> {
    if (!this.device || !this.uiTexture) return

    // 程序化生成 UI 模式（占位符）
    const patternData = new Uint8Array(this.width * this.height * 4)
    const time = performance.now() * 0.001

    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const idx = (y * this.width + x) * 4

        // 创建微妙的光泽模式
        const nx = x / this.width
        const ny = y / this.height

        // 金色光泽
        const gold = Math.sin(nx * 20.0 + time) * Math.cos(ny * 20.0 + time * 0.7) * 0.5 + 0.5
        const r = 0.83 * gold * 0.3
        const g = 0.68 * gold * 0.3
        const b = 0.21 * gold * 0.3

        patternData[idx] = r * 255     // R
        patternData[idx + 1] = g * 255 // G
        patternData[idx + 2] = b * 255 // B
        patternData[idx + 3] = 255     // A
      }
    }

    // 将数据复制到纹理
    this.device.queue.writeTexture(
      {
        texture: this.uiTexture,
      },
      patternData,
      {
        bytesPerRow: this.width * 4,
        rowsPerImage: this.height,
      },
      {
        width: this.width,
        height: this.height,
      }
    )
  }

  /**
   * 渲染反射效果
   */
  async renderReflection(): Promise<void> {
    if (!this.device || !this.context || !this.reflectionPipeline || !this.reflectionBindGroup) {
      return
    }

    const commandEncoder = this.device.createCommandEncoder({
      label: 'reflection-encoder',
    })

    // 获取当前纹理视图
    const textureView = this.context.getCurrentTexture().createView()

    const renderPass = commandEncoder.beginRenderPass({
      label: 'reflection-pass',
      colorAttachments: [
        {
          view: textureView,
          loadOp: 'load', // 加载现有内容（粒子渲染结果）
          storeOp: 'store',
        },
      ],
    })

    renderPass.setPipeline(this.reflectionPipeline)
    renderPass.setBindGroup(0, this.reflectionBindGroup)
    renderPass.draw(6) // 绘制全屏四边形
    renderPass.end()

    this.device.queue.submit([commandEncoder.finish()])
  }

  /**
   * 更新反射参数
   */
  setFresnelParams(bias: number, scale: number): void {
    this.updateReflectionParams(bias, scale, undefined, undefined)
  }

  setRoughness(roughness: number): void {
    this.updateReflectionParams(undefined, undefined, roughness, undefined)
  }

  setChromaticStrength(strength: number): void {
    this.updateReflectionParams(undefined, undefined, undefined, strength)
  }

  /**
   * 处理窗口大小调整
   */
  onResize(): void {
    this.width = this.contextWrapper.width
    this.height = this.contextWrapper.height

    // 重新创建资源
    this.uiTexture?.destroy()
    this.createResources()
    this.createRenderPipeline()
  }

  /**
   * 清理资源
   */
  destroy(): void {
    this.uiTexture?.destroy()
    this.paramsBuffer?.destroy()

    this.uiTexture = null
    this.uiTextureView = null
    this.paramsBuffer = null
    this.sampler = null
    this.reflectionPipeline = null
    this.reflectionBindGroup = null
    this.reflectionBindGroupLayout = null
  }
}
