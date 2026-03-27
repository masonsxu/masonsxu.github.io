/**
 * Flow Field — 256x256 网格流场计算
 *
 * 架构：
 *   - 两张 rgba16float 纹理（ping-pong）存储 2D 速度场
 *   - 多八度 curl noise 生成有机流速
 *   - 鼠标涟漪扰动通过径向波纹注入
 *   - 与上一帧 92% 混合保证平滑过渡
 *
 * Bindings (compute):
 *   binding 0: prevField — texture_2d<f32>（只读）
 *   binding 1: nextField — texture_storage_2d<rgba16float, write>
 *   binding 2: params — uniform (32 bytes)
 */

import { WebGPUContext } from './WebGPUContext'
import { SHADER_UTILS_WGSL } from './shaderUtils'

const GRID_SIZE = 256
const WORKGROUP_SIZE = 16

export class FlowField {
  private device: GPUDevice

  private pipeline: GPUComputePipeline | null = null
  private bindGroupLayout: GPUBindGroupLayout | null = null
  private bindGroups: GPUBindGroup[] = []
  private pingPongIndex = 0

  private fieldTextures: GPUTexture[] = []
  private paramsBuffer: GPUBuffer | null = null

  constructor(ctx: WebGPUContext) {
    this.device = ctx.device!
  }

  async init(): Promise<void> {
    this.createTextures()
    this.createParamsBuffer()
    this.createPipeline()
    this.createBindGroups()
  }

  private createTextures(): void {
    const usage =
      GPUTextureUsage.STORAGE_BINDING |
      GPUTextureUsage.TEXTURE_BINDING |
      GPUTextureUsage.RENDER_ATTACHMENT

    for (let i = 0; i < 2; i++) {
      this.fieldTextures.push(
        this.device.createTexture({
          label: `flow-field-${i}`,
          size: [GRID_SIZE, GRID_SIZE],
          format: 'rgba16float',
          usage,
        }),
      )
    }
  }

  private createParamsBuffer(): void {
    // FlowFieldParams: dt(f32) + time(f32) + resolution(vec2f) + mousePos(vec2f) + mouseForce(f32) + _pad(f32) = 32 bytes
    this.paramsBuffer = this.device.createBuffer({
      label: 'flow-field-params',
      size: 32,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    })
  }

  private createPipeline(): void {
    const shaderCode = SHADER_UTILS_WGSL + /* wgsl */ `

struct FlowFieldParams {
  dt: f32,
  time: f32,
  resolution: vec2f,
  mousePos: vec2f,
  mouseForce: f32,
  _pad: f32,
}

@group(0) @binding(0) var prevField: texture_2d<f32>;
@group(0) @binding(1) var nextField: texture_storage_2d<rgba16float, write>;
@group(0) @binding(2) var<uniform> params: FlowFieldParams;

const NOISE_SCALE: f32 = 3.0;
const FLOW_SPEED: f32 = 0.12;
const TIME_SCALE: f32 = 0.04;
const SMOOTH_FACTOR: f32 = 0.92;
const RIPPLE_FREQ: f32 = 40.0;
const RIPPLE_DECAY: f32 = 8.0;
const RIPPLE_STRENGTH: f32 = 0.5;

@compute @workgroup_size(16, 16)
fn updateFlowField(@builtin(global_invocation_id) gid: vec3u) {
  let texSize = textureDimensions(prevField);
  if (gid.x >= u32(texSize.x) || gid.y >= u32(texSize.y)) { return; }

  let uv = (vec2f(f32(gid.x), f32(gid.y)) + 0.5) / vec2f(texSize);
  let t = params.time * TIME_SCALE;

  // 多八度 curl noise
  let noiseVel = curlNoise2D(uv * NOISE_SCALE, t) * FLOW_SPEED;

  // 与上一帧混合，保证平滑
  let prev = textureLoad(prevField, gid.xy, 0).rg;
  var field = prev * SMOOTH_FACTOR + noiseVel * (1.0 - SMOOTH_FACTOR);

  // 鼠标涟漪扰动
  if (params.mouseForce > 0.001) {
    let aspect = params.resolution.x / max(params.resolution.y, 1.0);
    let dx = (uv.x - params.mousePos.x) * aspect;
    let dy = uv.y - params.mousePos.y;
    let dist = sqrt(dx * dx + dy * dy);
    let ripple = sin(dist * RIPPLE_FREQ - params.time * 3.0)
               * exp(-dist * RIPPLE_DECAY)
               * params.mouseForce
               * RIPPLE_STRENGTH;
    let dir = normalize(uv - params.mousePos);
    field += dir * ripple;
  }

  textureStore(nextField, gid.xy, vec4f(field, 0.0, 1.0));
}
`

    const module = this.device.createShaderModule({
      label: 'flow-field-shader',
      code: shaderCode,
    })

    this.checkCompilation(module)

    this.bindGroupLayout = this.device.createBindGroupLayout({
      label: 'flow-field-layout',
      entries: [
        {
          binding: 0,
          visibility: GPUShaderStage.COMPUTE,
          texture: { sampleType: 'float' },
        },
        {
          binding: 1,
          visibility: GPUShaderStage.COMPUTE,
          storageTexture: { access: 'write-only', format: 'rgba16float' },
        },
        {
          binding: 2,
          visibility: GPUShaderStage.COMPUTE,
          buffer: { type: 'uniform' },
        },
      ],
    })

    this.pipeline = this.device.createComputePipeline({
      label: 'flow-field-pipeline',
      layout: this.device.createPipelineLayout({
        bindGroupLayouts: [this.bindGroupLayout],
      }),
      compute: { module, entryPoint: 'updateFlowField' },
    })
  }

  private createBindGroups(): void {
    const [texA, texB] = this.fieldTextures

    for (let i = 0; i < 2; i++) {
      this.bindGroups.push(
        this.device.createBindGroup({
          label: `flow-field-bind-${i}`,
          layout: this.bindGroupLayout!,
          entries: [
            { binding: 0, resource: (i === 0 ? texA : texB).createView() },
            { binding: 1, resource: (i === 0 ? texB : texA).createView() },
            { binding: 2, resource: { buffer: this.paramsBuffer! } },
          ],
        }),
      )
    }
  }

  updateParams(
    dt: number,
    time: number,
    resolution: [number, number],
    mousePos: [number, number],
    mouseForce: number,
  ): void {
    if (!this.paramsBuffer) return

    const data = new ArrayBuffer(32)
    const view = new DataView(data)
    view.setFloat32(0, dt, true)
    view.setFloat32(4, time, true)
    view.setFloat32(8, resolution[0], true)
    view.setFloat32(12, resolution[1], true)
    view.setFloat32(16, mousePos[0], true)
    view.setFloat32(20, mousePos[1], true)
    view.setFloat32(24, mouseForce, true)
    view.setFloat32(28, 0, true)

    this.device.queue.writeBuffer(this.paramsBuffer, 0, data)
  }

  dispatch(pass: GPUComputePassEncoder): void {
    if (!this.pipeline) return

    pass.setPipeline(this.pipeline)
    pass.setBindGroup(0, this.bindGroups[this.pingPongIndex])
    pass.dispatchWorkgroups(
      Math.ceil(GRID_SIZE / WORKGROUP_SIZE),
      Math.ceil(GRID_SIZE / WORKGROUP_SIZE),
    )

    this.pingPongIndex = 1 - this.pingPongIndex
  }

  /** 当前可读的流场纹理（上一帧写入的） */
  getCurrentFieldTexture(): GPUTexture {
    return this.fieldTextures[1 - this.pingPongIndex]
  }

  private checkCompilation(module: GPUShaderModule): void {
    module.getCompilationInfo().then((info) => {
      for (const msg of info.messages) {
        if (msg.type === 'error') {
          console.error(`FlowField WGSL [${msg.lineNum}:${msg.linePos}]: ${msg.message}`)
        }
      }
    }).catch(() => {})
  }

  destroy(): void {
    this.fieldTextures.forEach((t) => t.destroy())
    this.paramsBuffer?.destroy()

    this.fieldTextures = []
    this.paramsBuffer = null
    this.pipeline = null
    this.bindGroupLayout = null
    this.bindGroups = []
  }
}
