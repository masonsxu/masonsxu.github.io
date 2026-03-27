/**
 * Particle System — 粒子平流计算 + 薄膜干涉着色渲染
 *
 * 架构：
 *   - 32 bytes/particle: pos(vec2f) + vel(vec2f) + life(f32) + depth(f32) + pad(8 bytes)
 *   - Compute: 沿 FlowField 纹理平流粒子，含生命周期与边界处理
 *   - Render: instanced quad 渲染到 rgba16float HDR 离屏纹理
 *   - 薄膜干涉着色：FBM(pos + time) → 三段 smoothstep 映射金色调色板
 *
 * Compute Bindings:
 *   binding 0: particlesIn (storage, read-only)
 *   binding 1: particlesOut (storage, write)
 *   binding 2: flowField (texture_2d<f32>)
 *   binding 3: params (uniform, 32 bytes)
 *
 * Render Bindings:
 *   binding 0: particles (storage, read-only)
 *   binding 1: splat texture (texture_2d)
 *   binding 2: splat sampler (filtering)
 *   binding 3: render uniforms (uniform, 16 bytes)
 */

import { WebGPUContext } from './WebGPUContext'
import { SHADER_UTILS_WGSL } from './shaderUtils'

const WORKGROUP_SIZE = 256

export class ParticleSystem {
  private device: GPUDevice

  // Compute
  private computePipeline: GPUComputePipeline | null = null
  private computeLayout: GPUBindGroupLayout | null = null
  private computePingPong = 0
  // 按 flow field 纹理缓存 compute bind groups（每种纹理对应 2 个 ping-pong bind group）
  private computeBindGroupCache = new Map<GPUTexture, GPUBindGroup[]>()

  // Render
  private renderPipeline: GPURenderPipeline | null = null
  private renderLayout: GPUBindGroupLayout | null = null
  private renderBindGroupCache = new Map<GPUBuffer, GPUBindGroup>()
  private currentRenderBindGroup: GPUBindGroup | null = null

  // Buffers
  private particleBuffers: GPUBuffer[] = []
  private computeParamsBuffer: GPUBuffer | null = null
  private renderParamsBuffer: GPUBuffer | null = null

  // Textures
  private splatTexture: GPUTexture | null = null
  private splatSampler: GPUSampler | null = null
  private hdrRenderTarget: GPUTexture | null = null

  private particleCount: number

  constructor(
    private ctx: WebGPUContext,
    particleCount: number = 100000,
  ) {
    this.device = ctx.device!
    this.particleCount = particleCount
  }

  async init(): Promise<void> {
    this.createParticleBuffers()
    this.createSplatTexture()
    this.createParamsBuffers()
    await this.createPipelines()
    this.initializeParticles()
  }

  // ————————————————— Buffers —————————————————

  private createParticleBuffers(): void {
    const bytesPerParticle = 32 // 8 floats × 4 bytes
    const totalBytes = this.particleCount * bytesPerParticle

    const maxBufferSize = this.device.limits.maxStorageBufferBindingSize
    if (totalBytes > maxBufferSize) {
      this.particleCount = Math.floor((maxBufferSize / bytesPerParticle) * 0.9)
      console.warn(`Particle count adjusted to ${this.particleCount} due to device limit`)
    }

    for (let i = 0; i < 2; i++) {
      this.particleBuffers.push(
        this.device.createBuffer({
          label: `particles-${i}`,
          size: this.particleCount * bytesPerParticle,
          usage:
            GPUBufferUsage.STORAGE |
            GPUBufferUsage.COPY_DST |
            GPUBufferUsage.COPY_SRC,
        }),
      )
    }
  }

  private createSplatTexture(): void {
    const size = 64
    const data = new Uint8Array(size * size * 4)

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const idx = (y * size + x) * 4
        const nx = x / size
        const ny = y / size
        const dist = Math.sqrt((nx - 0.5) ** 2 + (ny - 0.5) ** 2) * 2.0
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

  private createParamsBuffers(): void {
    this.computeParamsBuffer = this.device.createBuffer({
      label: 'particle-compute-params',
      size: 40, // SimParams: dt(4) + time(4) + resolution(8) + mousePos(8) + mouseForce(4) + _pad1(4) + _pad2(4) + _pad3(4) = 40
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    })

    this.renderParamsBuffer = this.device.createBuffer({
      label: 'particle-render-params',
      size: 16,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    })
  }

  // ————————————————— Pipelines —————————————————

  private async createPipelines(): Promise<void> {
    const computeCode = SHADER_UTILS_WGSL + /* wgsl */ `

struct Particle {
  pos: vec2f,
  vel: vec2f,
  life: f32,
  depth: f32,
}

struct SimParams {
  dt: f32,
  time: f32,
  resolution: vec2f,
  mousePos: vec2f,
  mouseForce: f32,
  _pad1: f32,
  _pad2: f32,
}

@group(0) @binding(0) var<storage, read> particlesIn: array<Particle>;
@group(0) @binding(1) var<storage, read_write> particlesOut: array<Particle>;
@group(0) @binding(2) var flowField: texture_2d<f32>;
@group(0) @binding(3) var<uniform> params: SimParams;

const FLOW_STRENGTH: f32 = 1.5;
const BLEND_RATE: f32 = 0.05;
const VISCOSITY: f32 = 12.0;
const MAX_SPEED: f32 = 0.15;
const LIFE_DECAY: f32 = 0.08;
const GRID_SIZE: f32 = 256.0;

@compute @workgroup_size(256)
fn simulateParticles(@builtin(global_invocation_id) gid: vec3u) {
  let idx = gid.x;
  if (idx >= arrayLength(&particlesIn)) { return; }

  var p = particlesIn[idx];
  let dt = params.dt;
  let t = params.time;

  // 从流场纹理采样流速
  let fieldIdx = clamp(vec2i(p.pos * GRID_SIZE), vec2i(0), vec2i(255));
  let flow = textureLoad(flowField, fieldIdx, 0).rg;

  // 速度混合
  p.vel = mix(p.vel, flow * FLOW_STRENGTH, BLEND_RATE);

  // 粘度阻尼
  p.vel = applyViscosity(p.vel, VISCOSITY, dt);

  // 速度限幅
  let speed = length(p.vel);
  if (speed > MAX_SPEED) {
    p.vel = p.vel * (MAX_SPEED / speed);
  }

  // 直接鼠标推力（次要交互）
  if (params.mouseForce > 0.001) {
    let aspect = params.resolution.x / max(params.resolution.y, 1.0);
    var delta = p.pos - params.mousePos;
    delta.x *= aspect;
    let dist = length(delta);
    if (dist > 0.001 && dist < 0.12) {
      let falloff = smoothstep(0.12, 0.0, dist);
      p.vel += (delta / dist) * falloff * 0.35 * params.mouseForce;
    }
  }

  // 位置更新
  p.pos += p.vel * dt;

  // 生命周期
  p.life -= dt * LIFE_DECAY;
  if (p.life <= 0.0) {
    p.pos = vec2f(hash21(vec2f(f32(idx) + t, f32(idx))),
                  hash21(vec2f(f32(idx), f32(idx) + t)));
    p.vel = vec2f(0.0);
    p.life = 1.0;
    p.depth = 0.3 + hash11(f32(idx)) * 0.7;
  }

  // 边界 wrap
  p.pos = fract(p.pos);

  particlesOut[idx] = p;
}
`

    const renderCode = SHADER_UTILS_WGSL + /* wgsl */ `

struct Particle {
  pos: vec2f,
  vel: vec2f,
  life: f32,
  depth: f32,
}

struct RenderUniforms {
  pointSize: f32,
  canvasW: f32,
  canvasH: f32,
  time: f32,
}

struct VsOut {
  @builtin(position) pos: vec4f,
  @location(0) uv: vec2f,
  @location(1) particlePos: vec2f,
  @location(2) particleVel: vec2f,
  @location(3) particleLife: f32,
  @location(4) particleDepth: f32,
}

@group(0) @binding(0) var<storage, read> particles: array<Particle>;
@group(0) @binding(1) var splatTex: texture_2d<f32>;
@group(0) @binding(2) var splatSamp: sampler;
@group(0) @binding(3) var<uniform> uniforms: RenderUniforms;

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

  let pixelX = p.x * uniforms.canvasW;
  let pixelY = p.y * uniforms.canvasH;

  // 大小基于景深 + 速度
  let speed = length(particle.vel);
  let size = uniforms.pointSize * particle.depth * (1.0 + speed * 3.0);

  let offset = QUAD_OFFSETS[vid] * size;
  let px = pixelX + offset.x;
  let py = pixelY + offset.y;

  let clipX = (px / uniforms.canvasW) * 2.0 - 1.0;
  let clipY = 1.0 - (py / uniforms.canvasH) * 2.0;

  var output: VsOut;
  output.pos = vec4f(clipX, clipY, 0.0, 1.0);
  output.uv = QUAD_UVS[vid];
  output.particlePos = p;
  output.particleVel = particle.vel;
  output.particleLife = particle.life;
  output.particleDepth = particle.depth;

  return output;
}

@fragment
fn fs(input: VsOut) -> @location(0) vec4f {
  let splatAlpha = textureSample(splatTex, splatSamp, input.uv).a;

  // 薄膜干涉着色
  let t = uniforms.time * 0.04;
  let filmNoise = fbm2D(input.particlePos * 4.0 + vec2f(t, t * 0.7), 4u, 0.5, 2.0);

  let darkMetal = vec3f(0.10, 0.10, 0.12);
  let gold = vec3f(0.831, 0.686, 0.216);
  let lightGold = vec3f(0.949, 0.824, 0.533);

  let midColor = mix(darkMetal, gold, smoothstep(-0.3, 0.3, filmNoise));
  var color = mix(midColor, lightGold, smoothstep(0.1, 0.5, filmNoise));

  // 速度亮度加成
  let speedBoost = 1.0 + length(input.particleVel) * 4.0;
  color *= speedBoost;

  // HDR：允许值 > 1.0，为 bloom 提供亮部
  let depthBright = input.particleDepth;
  color *= depthBright * 1.2;

  // 生命周期 alpha 曲线
  let lifeFade = smoothstep(0.0, 0.15, input.particleLife)
               * smoothstep(1.0, 0.85, input.particleLife);
  let alpha = splatAlpha * lifeFade * depthBright * 0.65;

  return vec4f(color * alpha, alpha);
}
`

    const computeModule = this.device.createShaderModule({
      label: 'particle-compute-shader',
      code: computeCode,
    })
    this.checkCompilation(computeModule, 'particle-compute')

    this.computeLayout = this.device.createBindGroupLayout({
      label: 'particle-compute-layout',
      entries: [
        { binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'read-only-storage' } },
        { binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },
        { binding: 2, visibility: GPUShaderStage.COMPUTE, texture: { sampleType: 'float' } },
        { binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' } },
      ],
    })

    this.computePipeline = this.device.createComputePipeline({
      label: 'particle-compute-pipeline',
      layout: this.device.createPipelineLayout({ bindGroupLayouts: [this.computeLayout] }),
      compute: { module: computeModule, entryPoint: 'simulateParticles' },
    })

    const renderModule = this.device.createShaderModule({
      label: 'particle-render-shader',
      code: renderCode,
    })
    this.checkCompilation(renderModule, 'particle-render')

    this.renderLayout = this.device.createBindGroupLayout({
      label: 'particle-render-layout',
      entries: [
        { binding: 0, visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT, buffer: { type: 'read-only-storage' } },
        { binding: 1, visibility: GPUShaderStage.FRAGMENT, texture: { sampleType: 'float' } },
        { binding: 2, visibility: GPUShaderStage.FRAGMENT, sampler: { type: 'filtering' } },
        { binding: 3, visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT, buffer: { type: 'uniform' } },
      ],
    })

    this.renderPipeline = this.device.createRenderPipeline({
      label: 'particle-render-pipeline',
      layout: this.device.createPipelineLayout({ bindGroupLayouts: [this.renderLayout] }),
      vertex: { module: renderModule, entryPoint: 'vs' },
      fragment: {
        module: renderModule,
        entryPoint: 'fs',
        targets: [{
          format: 'rgba16float',
          blend: {
            color: { srcFactor: 'one', dstFactor: 'one' },
            alpha: { srcFactor: 'one', dstFactor: 'one' },
          },
        }],
      },
      primitive: { topology: 'triangle-list' },
    })
  }

  // ————————————————— Bind Groups —————————————————

  /**
   * 设置当前帧的 flow field 读取纹理
   * 按纹理引用缓存 bind groups（flow field 只有 2 张纹理，最多创建 2 套）
   */
  setFlowFieldTexture(texture: GPUTexture): void {
    if (this.computeBindGroupCache.has(texture)) return

    const [bufA, bufB] = this.particleBuffers
    const groups: GPUBindGroup[] = []

    for (let i = 0; i < 2; i++) {
      groups.push(
        this.device.createBindGroup({
          label: `particle-compute-bind-${String(texture.label)}-${i}`,
          layout: this.computeLayout!,
          entries: [
            { binding: 0, resource: { buffer: i === 0 ? bufA : bufB } },
            { binding: 1, resource: { buffer: i === 0 ? bufB : bufA } },
            { binding: 2, resource: texture.createView() },
            { binding: 3, resource: { buffer: this.computeParamsBuffer! } },
          ],
        }),
      )
    }

    this.computeBindGroupCache.set(texture, groups)
  }

  // ————————————————— Particle Init —————————————————

  private initializeParticles(): void {
    const data = new Float32Array(this.particleCount * 8)

    for (let i = 0; i < this.particleCount; i++) {
      const offset = i * 8
      data[offset + 0] = 0.05 + Math.random() * 0.9  // pos.x
      data[offset + 1] = 0.05 + Math.random() * 0.9  // pos.y
      data[offset + 2] = 0                             // vel.x
      data[offset + 3] = 0                             // vel.y
      data[offset + 4] = Math.random()                 // life
      data[offset + 5] = 0.3 + Math.random() * 0.7    // depth
      data[offset + 6] = 0                             // pad
      data[offset + 7] = 0                             // pad
    }

    this.device.queue.writeBuffer(this.particleBuffers[0], 0, data)
    this.device.queue.writeBuffer(this.particleBuffers[1], 0, data)
  }

  // ————————————————— Per-Frame —————————————————

  updateComputeParams(
    dt: number,
    time: number,
    resolution: [number, number],
    mousePos: [number, number],
    mouseForce: number,
  ): void {
    if (!this.computeParamsBuffer) return

    const data = new ArrayBuffer(40)
    const view = new DataView(data)
    view.setFloat32(0, dt, true)
    view.setFloat32(4, time, true)
    view.setFloat32(8, resolution[0], true)
    view.setFloat32(12, resolution[1], true)
    view.setFloat32(16, mousePos[0], true)
    view.setFloat32(20, mousePos[1], true)
    view.setFloat32(24, mouseForce, true)
    view.setFloat32(28, 0, true)
    view.setFloat32(32, 0, true)
    view.setFloat32(36, 0, true)

    this.device.queue.writeBuffer(this.computeParamsBuffer, 0, data)
  }

  updateRenderUniforms(pointSize: number, canvasW: number, canvasH: number, time: number): void {
    if (!this.renderParamsBuffer) return
    const data = new Float32Array([pointSize, canvasW, canvasH, time])
    this.device.queue.writeBuffer(this.renderParamsBuffer, 0, data)
  }

  dispatchCompute(pass: GPUComputePassEncoder, flowFieldTexture: GPUTexture): void {
    if (!this.computePipeline) return

    const groups = this.computeBindGroupCache.get(flowFieldTexture)
    if (!groups) return

    pass.setPipeline(this.computePipeline)
    pass.setBindGroup(0, groups[this.computePingPong])

    const workgroupCount = Math.ceil(this.particleCount / WORKGROUP_SIZE)
    pass.dispatchWorkgroups(workgroupCount)

    this.computePingPong = 1 - this.computePingPong
  }

  renderToPass(pass: GPURenderPassEncoder): void {
    if (!this.renderPipeline) return

    const readBuffer = this.particleBuffers[1 - this.computePingPong]
    this.ensureRenderBindGroup(readBuffer)

    pass.setPipeline(this.renderPipeline)
    pass.setBindGroup(0, this.currentRenderBindGroup!)
    pass.draw(6, this.particleCount)
  }

  private ensureRenderBindGroup(buffer: GPUBuffer): void {
    if (!this.renderBindGroupCache.has(buffer)) {
      this.renderBindGroupCache.set(
        buffer,
        this.device.createBindGroup({
          label: 'particle-render-bind',
          layout: this.renderLayout!,
          entries: [
            { binding: 0, resource: { buffer } },
            { binding: 1, resource: this.splatTexture!.createView() },
            { binding: 2, resource: this.splatSampler! },
            { binding: 3, resource: { buffer: this.renderParamsBuffer! } },
          ],
        }),
      )
    }
    this.currentRenderBindGroup = this.renderBindGroupCache.get(buffer)!
  }

  // ————————————————— HDR Render Target —————————————————

  ensureHDRRenderTarget(width: number, height: number): GPUTexture {
    if (this.hdrRenderTarget && this.hdrRenderTarget.width === width && this.hdrRenderTarget.height === height) {
      return this.hdrRenderTarget
    }

    this.hdrRenderTarget?.destroy()
    this.hdrRenderTarget = this.ctx.createTexture(
      width, height, 'rgba16float',
      GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING,
      'particle-hdr-target',
    )
    return this.hdrRenderTarget
  }

  getHDRRenderTarget(): GPUTexture | null {
    return this.hdrRenderTarget
  }

  // ————————————————— Resize —————————————————

  onResize(): void {
    // HDR render target will be recreated lazily in ensureHDRRenderTarget
    this.hdrRenderTarget?.destroy()
    this.hdrRenderTarget = null
  }

  getParticleCount(): number {
    return this.particleCount
  }

  // ————————————————— Helpers —————————————————

  private checkCompilation(module: GPUShaderModule, label: string): void {
    module.getCompilationInfo().then((info) => {
      for (const msg of info.messages) {
        if (msg.type === 'error') {
          console.error(`${label} WGSL [${msg.lineNum}:${msg.linePos}]: ${msg.message}`)
        }
      }
    }).catch(() => {})
  }

  destroy(): void {
    this.particleBuffers.forEach((b) => b.destroy())
    this.computeParamsBuffer?.destroy()
    this.renderParamsBuffer?.destroy()
    this.splatTexture?.destroy()
    this.hdrRenderTarget?.destroy()

    this.particleBuffers = []
    this.computeParamsBuffer = null
    this.renderParamsBuffer = null
    this.splatTexture = null
    this.splatSampler = null
    this.hdrRenderTarget = null
    this.computePipeline = null
    this.renderPipeline = null
    this.computeLayout = null
    this.renderLayout = null
    this.computeBindGroupCache.clear()
    this.renderBindGroupCache.clear()
    this.currentRenderBindGroup = null
  }
}
