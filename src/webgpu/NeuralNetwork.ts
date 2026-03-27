/**
 * NeuralNetwork — 神经拓扑星座网络
 *
 * 架构：
 *   - Node buffer: 200 节点 + 2000 微尘（索引 0-199 为节点，200-2199 为微尘）
 *   - Connection buffer: 临近节点对（最大 2000 条）
 *   - Compute: 有机漂移 + 鼠标亮度增强 + 每节点独立脉冲
 *   - CPU 初始化: rejection sampling 节点分布 + 临近连接计算
 *
 * Node struct (32 bytes): pos(vec2f) + vel(vec2f) + size(f32) + depth(f32) + brightness(f32) + pad(f32)
 * Connection struct (16 bytes): nodeA(f32) + nodeB(f32) + strength(f32) + pad(f32)
 * SimParams (32 bytes): dt + time + resolution(vec2f) + mousePos(vec2f) + mouseForce + pad
 */

import { WebGPUContext } from './WebGPUContext'
import { SHADER_UTILS_WGSL } from './shaderUtils'

const NODE_COUNT = 200
const DUST_COUNT = 2000
const TOTAL_COUNT = NODE_COUNT + DUST_COUNT
const MAX_CONNECTIONS = 2000
const CONNECTION_THRESHOLD = 0.15
const MIN_NODE_SPACING = 0.04
const BYTES_PER_NODE = 32 // 8 floats × 4 bytes
const WORKGROUP_SIZE = 64

export class NeuralNetwork {
  private device: GPUDevice

  // Compute
  private computePipeline: GPUComputePipeline | null = null
  private computeLayout: GPUBindGroupLayout | null = null
  private computePingPong = 0
  private computeBindGroups: GPUBindGroup[] = []

  // Buffers
  private nodeBuffers: GPUBuffer[] = []
  private connectionBuffer: GPUBuffer | null = null
  private simParamsBuffer: GPUBuffer | null = null
  private renderParamsBuffer: GPUBuffer | null = null

  // Textures
  private hdrRenderTarget: GPUTexture | null = null

  // Counters
  nodeCount = NODE_COUNT
  dustCount = DUST_COUNT
  connectionCount = 0

  constructor(private ctx: WebGPUContext) {
    this.device = ctx.device!
  }

  async init(): Promise<void> {
    const nodesData = this.generateNodes()
    const connectionsData = this.generateConnections(nodesData)
    this.createBuffers(nodesData, connectionsData)
    await this.createComputePipeline()
    this.createComputeBindGroups()
  }

  // ————————————————— CPU: 节点生成 —————————————————

  private generateNodes(): Float32Array {
    const data = new Float32Array(TOTAL_COUNT * 8)

    // 已放置节点位置（用于 rejection sampling）
    const placed: { x: number; y: number }[] = []

    for (let i = 0; i < NODE_COUNT; i++) {
      let x: number, y: number
      let attempts = 0

      do {
        x = 0.05 + Math.random() * 0.9
        y = 0.05 + Math.random() * 0.9
        attempts++
      } while (this.isTooClose(x, y, placed, MIN_NODE_SPACING) && attempts < 50)

      placed.push({ x, y })

      // 深度层分配
      let depth: number, size: number, brightness: number
      if (i < 60) {
        // 前景：30% 节点
        depth = 0.7 + Math.random() * 0.3
        size = 6 + Math.random() * 4
        brightness = 0.7 + Math.random() * 0.3
      } else if (i < 140) {
        // 中景：40% 节点
        depth = 0.4 + Math.random() * 0.3
        size = 3.5 + Math.random() * 3
        brightness = 0.35 + Math.random() * 0.25
      } else {
        // 背景：30% 节点
        depth = 0.1 + Math.random() * 0.3
        size = 2.5 + Math.random() * 2
        brightness = 0.15 + Math.random() * 0.15
      }

      const offset = i * 8
      data[offset + 0] = x
      data[offset + 1] = y
      data[offset + 2] = 0
      data[offset + 3] = 0
      data[offset + 4] = size
      data[offset + 5] = depth
      data[offset + 6] = brightness
      data[offset + 7] = 0
    }

    // 微尘粒子
    for (let i = NODE_COUNT; i < TOTAL_COUNT; i++) {
      const offset = i * 8
      data[offset + 0] = 0.02 + Math.random() * 0.96
      data[offset + 1] = 0.02 + Math.random() * 0.96
      data[offset + 2] = 0
      data[offset + 3] = 0
      data[offset + 4] = 0.8 + Math.random() * 1.2
      data[offset + 5] = 0.05 + Math.random() * 0.25
      data[offset + 6] = 0.03 + Math.random() * 0.08
      data[offset + 7] = 0
    }

    return data
  }

  private isTooClose(x: number, y: number, placed: { x: number; y: number }[], minDist: number): boolean {
    for (const p of placed) {
      const dx = x - p.x
      const dy = y - p.y
      if (dx * dx + dy * dy < minDist * minDist) return true
    }
    return false
  }

  // ————————————————— CPU: 连接计算 —————————————————

  private generateConnections(nodesData: Float32Array): Float32Array {
    const connections: [number, number, number][] = []

    for (let i = 0; i < NODE_COUNT; i++) {
      const ix = nodesData[i * 8 + 0]
      const iy = nodesData[i * 8 + 1]

      for (let j = i + 1; j < NODE_COUNT; j++) {
        if (connections.length >= MAX_CONNECTIONS) break

        const jx = nodesData[j * 8 + 0]
        const jy = nodesData[j * 8 + 1]
        const dx = ix - jx
        const dy = iy - jy
        const dist = Math.sqrt(dx * dx + dy * dy)

        if (dist < CONNECTION_THRESHOLD) {
          const strength = 1.0 - dist / CONNECTION_THRESHOLD
          connections.push([i, j, strength])
        }
      }

      if (connections.length >= MAX_CONNECTIONS) break
    }

    this.connectionCount = connections.length
    console.log(`NeuralNetwork: ${NODE_COUNT} nodes, ${this.connectionCount} connections, ${DUST_COUNT} dust`)

    const data = new Float32Array(MAX_CONNECTIONS * 4)
    for (let i = 0; i < connections.length; i++) {
      const offset = i * 4
      data[offset + 0] = connections[i][0]
      data[offset + 1] = connections[i][1]
      data[offset + 2] = connections[i][2]
      data[offset + 3] = 0
    }

    return data
  }

  // ————————————————— Buffers —————————————————

  private createBuffers(nodesData: Float32Array, connectionsData: Float32Array): void {
    for (let i = 0; i < 2; i++) {
      this.nodeBuffers.push(
        this.device.createBuffer({
          label: `nodes-${i}`,
          size: TOTAL_COUNT * BYTES_PER_NODE,
          usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST | GPUBufferUsage.COPY_SRC,
        }),
      )
    }

    this.connectionBuffer = this.device.createBuffer({
      label: 'connections',
      size: MAX_CONNECTIONS * 16,
      usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
    })

    this.simParamsBuffer = this.device.createBuffer({
      label: 'sim-params',
      size: 32,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    })

    this.renderParamsBuffer = this.device.createBuffer({
      label: 'render-params',
      size: 32,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    })

    // 上传初始数据
    this.device.queue.writeBuffer(this.nodeBuffers[0], 0, nodesData.buffer as ArrayBuffer)
    this.device.queue.writeBuffer(this.nodeBuffers[1], 0, nodesData.buffer as ArrayBuffer)
    this.device.queue.writeBuffer(this.connectionBuffer!, 0, connectionsData.buffer as ArrayBuffer)
  }

  // ————————————————— Compute Pipeline —————————————————

  private async createComputePipeline(): Promise<void> {
    const code = SHADER_UTILS_WGSL + /* wgsl */ `

struct Node {
  pos: vec2f,
  vel: vec2f,
  size: f32,
  depth: f32,
  brightness: f32,
  _pad: f32,
}

struct SimParams {
  dt: f32,
  time: f32,
  resolution: vec2f,
  mousePos: vec2f,
  mouseForce: f32,
  _pad: f32,
}

@group(0) @binding(0) var<storage, read> nodesIn: array<Node>;
@group(0) @binding(1) var<storage, read_write> nodesOut: array<Node>;
@group(0) @binding(2) var<uniform> params: SimParams;

const NODE_COUNT: u32 = ${NODE_COUNT}u;

@compute @workgroup_size(${WORKGROUP_SIZE})
fn simulateNodes(@builtin(global_invocation_id) gid: vec3u) {
  let idx = gid.x;
  if (idx >= arrayLength(&nodesIn)) { return; }

  var node = nodesIn[idx];
  let dt = params.dt;
  let t = params.time;

  // 有机漂移：每个节点使用不同噪声种子
  let seed = f32(idx);
  let noiseX = simplexNoise2D(node.pos * 2.0 + vec2f(t * 0.05 + seed * 0.1, t * 0.03 + seed * 0.07));
  let noiseY = simplexNoise2D(node.pos * 2.0 + vec2f(t * 0.04 + seed * 0.13, t * 0.06 + seed * 0.11));
  let driftForce = vec2f(noiseX, noiseY) * 0.003 * node.depth;

  // 速度更新 + 阻尼
  node.vel = node.vel * 0.93 + driftForce * dt;
  node.vel = applyViscosity(node.vel, 4.0, dt);

  // 限速
  let speed = length(node.vel);
  let maxSpeed = 0.02 * node.depth;
  if (speed > maxSpeed) {
    node.vel = node.vel * (maxSpeed / speed);
  }

  // 位置更新
  node.pos += node.vel * dt;

  // 柔性边界回弹
  let margin = 0.05;
  if (node.pos.x < margin) { node.vel.x += 0.005; }
  if (node.pos.x > 1.0 - margin) { node.vel.x -= 0.005; }
  if (node.pos.y < margin) { node.vel.y += 0.005; }
  if (node.pos.y > 1.0 - margin) { node.vel.y -= 0.005; }

  // 位置约束
  node.pos = clamp(node.pos, vec2f(0.02), vec2f(0.98));

  // 微尘用 fract wrap，节点用 clamp
  if (idx >= NODE_COUNT) {
    node.pos = fract(node.pos);
  }

  // 鼠标悬停亮度增强
  var baseBright = node.brightness;
  if (params.mouseForce > 0.01) {
    let aspect = params.resolution.x / max(params.resolution.y, 1.0);
    var mouseDelta = node.pos - params.mousePos;
    mouseDelta.x *= aspect;
    let mouseDist = length(mouseDelta);
    let mouseProximity = smoothstep(0.25, 0.0, mouseDist);
    baseBright += mouseProximity * 0.5 * params.mouseForce;
  }

  // 每节点独立脉冲相位
  let pulsePhase = hash11(seed * 7.31);
  let pulse = 0.85 + 0.15 * sin(t * 0.5 + pulsePhase * TAU);
  node.brightness = clamp(baseBright * pulse, 0.0, 1.8);

  nodesOut[idx] = node;
}
`

    const module = this.device.createShaderModule({ label: 'neural-compute', code })
    module.getCompilationInfo().then((info) => {
      for (const msg of info.messages) {
        if (msg.type === 'error') {
          console.error(`NeuralCompute WGSL [${msg.lineNum}:${msg.linePos}]: ${msg.message}`)
        }
      }
    }).catch(() => {})

    this.computeLayout = this.device.createBindGroupLayout({
      label: 'neural-compute-layout',
      entries: [
        { binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'read-only-storage' } },
        { binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },
        { binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' } },
      ],
    })

    this.computePipeline = this.device.createComputePipeline({
      label: 'neural-compute-pipeline',
      layout: this.device.createPipelineLayout({ bindGroupLayouts: [this.computeLayout] }),
      compute: { module, entryPoint: 'simulateNodes' },
    })
  }

  private createComputeBindGroups(): void {
    const [bufA, bufB] = this.nodeBuffers

    this.computeBindGroups = [0, 1].map((i) =>
      this.device.createBindGroup({
        label: `neural-compute-bind-${i}`,
        layout: this.computeLayout!,
        entries: [
          { binding: 0, resource: { buffer: i === 0 ? bufA : bufB } },
          { binding: 1, resource: { buffer: i === 0 ? bufB : bufA } },
          { binding: 2, resource: { buffer: this.simParamsBuffer! } },
        ],
      }),
    )
  }

  // ————————————————— Per-Frame Updates —————————————————

  updateSimParams(
    dt: number,
    time: number,
    resolution: [number, number],
    mousePos: [number, number],
    mouseForce: number,
  ): void {
    if (!this.simParamsBuffer) return
    const data = new ArrayBuffer(32)
    const v = new DataView(data)
    v.setFloat32(0, dt, true)
    v.setFloat32(4, time, true)
    v.setFloat32(8, resolution[0], true)
    v.setFloat32(12, resolution[1], true)
    v.setFloat32(16, mousePos[0], true)
    v.setFloat32(20, mousePos[1], true)
    v.setFloat32(24, mouseForce, true)
    v.setFloat32(28, 0, true)
    this.device.queue.writeBuffer(this.simParamsBuffer, 0, data)
  }

  updateRenderParams(pointScale: number, canvasW: number, canvasH: number, time: number, mousePos: [number, number]): void {
    if (!this.renderParamsBuffer) return
    const data = new ArrayBuffer(32)
    const v = new DataView(data)
    v.setFloat32(0, pointScale, true)
    v.setFloat32(4, canvasW, true)
    v.setFloat32(8, canvasH, true)
    v.setFloat32(12, time, true)
    v.setFloat32(16, mousePos[0], true)
    v.setFloat32(20, mousePos[1], true)
    // pad 24-31 = 0
    this.device.queue.writeBuffer(this.renderParamsBuffer, 0, data)
  }

  // ————————————————— Dispatch —————————————————

  dispatchCompute(pass: GPUComputePassEncoder): void {
    if (!this.computePipeline) return

    pass.setPipeline(this.computePipeline)
    pass.setBindGroup(0, this.computeBindGroups[this.computePingPong])

    const workgroupCount = Math.ceil(TOTAL_COUNT / WORKGROUP_SIZE)
    pass.dispatchWorkgroups(workgroupCount)

    this.computePingPong = 1 - this.computePingPong
  }

  /** 当前可读的 node buffer（上一帧写入的） */
  getReadNodeBuffer(): GPUBuffer {
    return this.nodeBuffers[1 - this.computePingPong]
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
      'neural-hdr-target',
    )
    return this.hdrRenderTarget
  }

  // ————————————————— Accessors —————————————————

  getConnectionBuffer(): GPUBuffer { return this.connectionBuffer! }
  getRenderParamsBuffer(): GPUBuffer { return this.renderParamsBuffer! }
  getDevice(): GPUDevice { return this.device }

  // ————————————————— Resize —————————————————

  onResize(): void {
    this.hdrRenderTarget?.destroy()
    this.hdrRenderTarget = null
  }

  // ————————————————— Cleanup —————————————————

  destroy(): void {
    this.nodeBuffers.forEach((b) => b.destroy())
    this.connectionBuffer?.destroy()
    this.simParamsBuffer?.destroy()
    this.renderParamsBuffer?.destroy()
    this.hdrRenderTarget?.destroy()

    this.nodeBuffers = []
    this.connectionBuffer = null
    this.simParamsBuffer = null
    this.renderParamsBuffer = null
    this.hdrRenderTarget = null
    this.computePipeline = null
    this.computeLayout = null
    this.computeBindGroups = []
  }
}
