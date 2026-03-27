/**
 * Post FX — 最终合成 + 后处理
 *
 * 算法顺序：
 *   1. 合成 scene + bloom
 *   2. 暗角（径向衰减）
 *   3. ACES Filmic 色调映射
 *   4. Gamma 校正
 *
 * Bindings:
 *   binding 0: sceneTexture (texture_2d<f32>)
 *   binding 1: sceneSampler (filtering)
 *   binding 2: bloomTexture (texture_2d<f32>)
 *   binding 3: bloomSampler (filtering)
 *   binding 4: params (uniform, 12 bytes)
 *
 * 渲染目标：canvas format (bgra8unorm)
 */

import { WebGPUContext } from './WebGPUContext'
import { SHADER_UTILS_WGSL } from './shaderUtils'

export class PostFX {
  private device: GPUDevice
  private canvasFormat: GPUTextureFormat

  private pipeline: GPURenderPipeline | null = null
  private layout: GPUBindGroupLayout | null = null
  private uniformBuffer: GPUBuffer | null = null
  private sampler: GPUSampler | null = null

  constructor(ctx: WebGPUContext) {
    this.device = ctx.device!
    this.canvasFormat = ctx.format
  }

  async init(): Promise<void> {
    this.createSampler()
    this.createUniformBuffer()
    this.writeUniforms()
    this.createPipeline()
  }

  private writeUniforms(): void {
    if (!this.uniformBuffer) return
    const data = new Float32Array([
      1.0,  // vignetteStrength
      0.8,  // bloomStrength
      0, 0,  // _pad
    ])
    this.device.queue.writeBuffer(this.uniformBuffer, 0, data)
  }

  private createSampler(): void {
    this.sampler = this.device.createSampler({
      label: 'postfx-sampler',
      addressModeU: 'clamp-to-edge',
      addressModeV: 'clamp-to-edge',
      magFilter: 'linear',
      minFilter: 'linear',
    })
  }

  private createUniformBuffer(): void {
    // vignetteStrength(f32) + bloomStrength(f32) + _pad(vec2f) = 12 bytes (pad to 16)
    this.uniformBuffer = this.device.createBuffer({
      label: 'postfx-params',
      size: 16,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    })
  }

  private createPipeline(): void {
    const code = SHADER_UTILS_WGSL + /* wgsl */ `

struct PostFXParams {
  vignetteStrength: f32,
  bloomStrength: f32,
  _pad: vec2f,
}

@group(0) @binding(0) var sceneTex: texture_2d<f32>;
@group(0) @binding(1) var sceneSamp: sampler;
@group(0) @binding(2) var bloomTex: texture_2d<f32>;
@group(0) @binding(3) var bloomSamp: sampler;
@group(0) @binding(4) var<uniform> params: PostFXParams;

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
  let scene = textureSample(sceneTex, sceneSamp, input.uv);
  let bloom = textureSample(bloomTex, bloomSamp, input.uv);

  // 1. 合成
  var color = scene.rgb + bloom.rgb * params.bloomStrength;

  // 2. 暗角
  let center = vec2f(0.5);
  let dist = distance(input.uv, center) * 1.414;
  let vignette = 1.0 - dist * dist * params.vignetteStrength;
  color *= smoothstep(0.0, 1.0, vignette);

  // 3. ACES Filmic 色调映射
  color = (color * (2.51 * color + 0.03)) / (color * (2.43 * color + 0.59) + 0.14);

  // 4. Gamma 校正
  color = pow(clamp(color, vec3f(0.0), vec3f(1.0)), vec3f(1.0 / 2.2));

  return vec4f(color, 1.0);
}
`

    const module = this.device.createShaderModule({
      label: 'postfx-shader',
      code,
    })

    module.getCompilationInfo().then((info) => {
      for (const msg of info.messages) {
        if (msg.type === 'error') {
          console.error(`PostFX WGSL [${msg.lineNum}:${msg.linePos}]: ${msg.message}`)
        }
      }
    }).catch(() => {})

    this.layout = this.device.createBindGroupLayout({
      label: 'postfx-layout',
      entries: [
        { binding: 0, visibility: GPUShaderStage.FRAGMENT, texture: { sampleType: 'float' } },
        { binding: 1, visibility: GPUShaderStage.FRAGMENT, sampler: { type: 'filtering' } },
        { binding: 2, visibility: GPUShaderStage.FRAGMENT, texture: { sampleType: 'float' } },
        { binding: 3, visibility: GPUShaderStage.FRAGMENT, sampler: { type: 'filtering' } },
        { binding: 4, visibility: GPUShaderStage.FRAGMENT, buffer: { type: 'uniform' } },
      ],
    })

    this.pipeline = this.device.createRenderPipeline({
      label: 'postfx-pipeline',
      layout: this.device.createPipelineLayout({ bindGroupLayouts: [this.layout] }),
      vertex: { module, entryPoint: 'vs' },
      fragment: {
        module,
        entryPoint: 'fs',
        targets: [{ format: this.canvasFormat }],
      },
      primitive: { topology: 'triangle-list' },
    })
  }

  renderToPass(
    pass: GPURenderPassEncoder,
    sceneTexture: GPUTexture,
    bloomTexture: GPUTexture,
  ): void {
    if (!this.pipeline || !this.sampler) return

    const bindGroup = this.device.createBindGroup({
      label: 'postfx-bind',
      layout: this.layout!,
      entries: [
        { binding: 0, resource: sceneTexture.createView() },
        { binding: 1, resource: this.sampler },
        { binding: 2, resource: bloomTexture.createView() },
        { binding: 3, resource: this.sampler },
        { binding: 4, resource: { buffer: this.uniformBuffer! } },
      ],
    })

    pass.setPipeline(this.pipeline)
    pass.setBindGroup(0, bindGroup)
    pass.draw(6)
  }

  destroy(): void {
    this.uniformBuffer?.destroy()

    this.uniformBuffer = null
    this.sampler = null
    this.pipeline = null
    this.layout = null
  }
}
