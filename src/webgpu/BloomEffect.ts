/**
 * Bloom Effect — 可分离高斯模糊
 *
 * 架构：
 *   - 两张 rgba16float 半分辨率纹理（ping-pong）
 *   - 两个独立 uniform buffer（H/V 各一个，避免参数覆盖）
 *   - 单个 pipeline，方向由 uniform 控制
 *   - Pass 1: 亮度提取 + 水平模糊 → textureA
 *   - Pass 2: 垂直模糊 → textureB
 */

import { WebGPUContext } from './WebGPUContext'
import { SHADER_UTILS_WGSL } from './shaderUtils'

export class BloomEffect {
  private device: GPUDevice

  private pipeline: GPURenderPipeline | null = null
  private layout: GPUBindGroupLayout | null = null

  private uniformBufferH: GPUBuffer | null = null
  private uniformBufferV: GPUBuffer | null = null
  private sampler: GPUSampler | null = null

  private textureA: GPUTexture | null = null
  private textureB: GPUTexture | null = null
  private currentWidth = 0
  private currentHeight = 0

  constructor(ctx: WebGPUContext) {
    this.device = ctx.device!
  }

  async init(): Promise<void> {
    this.createSampler()
    this.createUniformBuffers()
    this.createPipeline()
  }

  private createSampler(): void {
    this.sampler = this.device.createSampler({
      label: 'bloom-sampler',
      addressModeU: 'clamp-to-edge',
      addressModeV: 'clamp-to-edge',
      magFilter: 'linear',
      minFilter: 'linear',
    })
  }

  private createUniformBuffers(): void {
    const size = 32 // threshold(f32) + strength(f32) + direction(vec2f) + texelSize(vec2f) + _pad(vec2f)
    this.uniformBufferH = this.device.createBuffer({
      label: 'bloom-params-h',
      size,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    })
    this.uniformBufferV = this.device.createBuffer({
      label: 'bloom-params-v',
      size,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    })
  }

  /** 在 init/resize 后调用，预写 uniform 参数 */
  updateUniforms(): void {
    if (!this.uniformBufferH || !this.uniformBufferV) return

    const dataH = new ArrayBuffer(32)
    const viewH = new DataView(dataH)
    viewH.setFloat32(0, 0.5, true)                     // threshold
    viewH.setFloat32(4, 0.7, true)                     // strength
    viewH.setFloat32(8, 1.0, true)                     // direction.x (horizontal)
    viewH.setFloat32(12, 0.0, true)                    // direction.y
    viewH.setFloat32(16, 1.0 / this.currentWidth, true) // texelSize.x
    viewH.setFloat32(20, 1.0 / this.currentHeight, true)// texelSize.y
    this.device.queue.writeBuffer(this.uniformBufferH, 0, dataH)

    const dataV = new ArrayBuffer(32)
    const viewV = new DataView(dataV)
    viewV.setFloat32(0, 0.5, true)                     // threshold
    viewV.setFloat32(4, 0.7, true)                     // strength
    viewV.setFloat32(8, 0.0, true)                     // direction.x
    viewV.setFloat32(12, 1.0, true)                    // direction.y (vertical)
    viewV.setFloat32(16, 1.0 / this.currentWidth, true) // texelSize.x
    viewV.setFloat32(20, 1.0 / this.currentHeight, true)// texelSize.y
    this.device.queue.writeBuffer(this.uniformBufferV, 0, dataV)
  }

  private createPipeline(): void {
    const code = SHADER_UTILS_WGSL + /* wgsl */ `

struct BloomParams {
  threshold: f32,
  strength: f32,
  direction: vec2f,
  texelSize: vec2f,
  _pad: vec2f,
}

@group(0) @binding(0) var inputTex: texture_2d<f32>;
@group(0) @binding(1) var inputSamp: sampler;
@group(0) @binding(2) var<uniform> params: BloomParams;

const WEIGHTS: array<f32, 9> = array<f32, 9>(
  0.0510, 0.0762, 0.1065, 0.1358, 0.1610, 0.1358, 0.1065, 0.0762, 0.0510
);

struct VsOut {
  @builtin(position) pos: vec4f,
  @location(0) uv: vec2f,
}

const QUAD_POS: array<vec2f, 6> = array<vec2f, 6>(
  vec2f(-1.0, -1.0), vec2f( 1.0, -1.0), vec2f(-1.0,  1.0),
  vec2f(-1.0,  1.0), vec2f( 1.0, -1.0), vec2f( 1.0,  1.0),
);
const QUAD_UV: array<vec2f, 6> = array<vec2f, 6>(
  vec2f(0.0, 1.0), vec2f(1.0, 1.0), vec2f(0.0, 0.0),
  vec2f(0.0, 0.0), vec2f(1.0, 1.0), vec2f(1.0, 0.0),
);

@vertex
fn vs(@builtin(vertex_index) vid: u32) -> VsOut {
  var out: VsOut;
  out.pos = vec4f(QUAD_POS[vid], 0.0, 1.0);
  out.uv = QUAD_UV[vid];
  return out;
}

@fragment
fn fs(input: VsOut) -> @location(0) vec4f {
  var color = vec4f(0.0);

  for (var i = 0; i < 9; i++) {
    let offset = params.direction * (f32(i) - 4.0) * params.texelSize;
    let sample = textureSample(inputTex, inputSamp, input.uv + offset);

    let brightness = dot(sample.rgb, vec3f(0.2126, 0.7152, 0.0722));
    let contribution = max(brightness - params.threshold, 0.0) / max(brightness, 0.001);

    color += vec4f(sample.rgb * contribution, 1.0) * WEIGHTS[i];
  }

  color *= params.strength;
  return color;
}
`

    const module = this.device.createShaderModule({
      label: 'bloom-shader',
      code,
    })

    module.getCompilationInfo().then((info) => {
      for (const msg of info.messages) {
        if (msg.type === 'error') {
          console.error(`Bloom WGSL [${msg.lineNum}:${msg.linePos}]: ${msg.message}`)
        }
      }
    }).catch(() => {})

    this.layout = this.device.createBindGroupLayout({
      label: 'bloom-layout',
      entries: [
        { binding: 0, visibility: GPUShaderStage.FRAGMENT, texture: { sampleType: 'float' } },
        { binding: 1, visibility: GPUShaderStage.FRAGMENT, sampler: { type: 'filtering' } },
        { binding: 2, visibility: GPUShaderStage.FRAGMENT, buffer: { type: 'uniform' } },
      ],
    })

    this.pipeline = this.device.createRenderPipeline({
      label: 'bloom-pipeline',
      layout: this.device.createPipelineLayout({ bindGroupLayouts: [this.layout] }),
      vertex: { module, entryPoint: 'vs' },
      fragment: {
        module,
        entryPoint: 'fs',
        targets: [{ format: 'rgba16float' }],
      },
      primitive: { topology: 'triangle-list' },
    })
  }

  ensureTextures(canvasW: number, canvasH: number): void {
    const halfW = Math.ceil(canvasW / 2)
    const halfH = Math.ceil(canvasH / 2)

    if (this.currentWidth === halfW && this.currentHeight === halfH) return

    this.textureA?.destroy()
    this.textureB?.destroy()

    const usage = GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING
    this.textureA = this.device.createTexture({ label: 'bloom-a', size: [halfW, halfH], format: 'rgba16float', usage })
    this.textureB = this.device.createTexture({ label: 'bloom-b', size: [halfW, halfH], format: 'rgba16float', usage })

    this.currentWidth = halfW
    this.currentHeight = halfH

    this.updateUniforms()
  }

  /** 水平模糊 pass：HDR 纹理 → textureA */
  renderH(pass: GPURenderPassEncoder, inputTexture: GPUTexture): void {
    if (!this.pipeline || !this.uniformBufferH || !this.sampler || !this.textureA) return

    const bindGroup = this.device.createBindGroup({
      label: 'bloom-bind-h',
      layout: this.layout!,
      entries: [
        { binding: 0, resource: inputTexture.createView() },
        { binding: 1, resource: this.sampler },
        { binding: 2, resource: { buffer: this.uniformBufferH } },
      ],
    })

    pass.setPipeline(this.pipeline)
    pass.setBindGroup(0, bindGroup)
    pass.draw(6)
  }

  /** 垂直模糊 pass：textureA → textureB */
  renderV(pass: GPURenderPassEncoder): void {
    if (!this.pipeline || !this.uniformBufferV || !this.sampler || !this.textureA || !this.textureB) return

    const bindGroup = this.device.createBindGroup({
      label: 'bloom-bind-v',
      layout: this.layout!,
      entries: [
        { binding: 0, resource: this.textureA.createView() },
        { binding: 1, resource: this.sampler },
        { binding: 2, resource: { buffer: this.uniformBufferV } },
      ],
    })

    pass.setPipeline(this.pipeline)
    pass.setBindGroup(0, bindGroup)
    pass.draw(6)
  }

  getIntermediateTexture(): GPUTexture {
    return this.textureA!
  }

  getOutputTexture(): GPUTexture {
    return this.textureB!
  }

  onResize(): void {
    // Textures will be recreated lazily in ensureTextures
  }

  destroy(): void {
    this.textureA?.destroy()
    this.textureB?.destroy()
    this.uniformBufferH?.destroy()
    this.uniformBufferV?.destroy()

    this.textureA = null
    this.textureB = null
    this.uniformBufferH = null
    this.uniformBufferV = null
    this.sampler = null
    this.pipeline = null
    this.layout = null
  }
}
