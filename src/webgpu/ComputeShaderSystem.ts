/**
 * Compute Shader System — Liquid Metal 粒子物理模拟
 *
 * 架构：
 *   - Particle buffer × 2 (ping-pong): pos(vec2f) + vel(vec2f) = 16 bytes/particle
 *   - Density grid buffer: GRID_W × GRID_H × u32, atomic 计数
 *   - Params uniform: 32 bytes
 *
 * 每帧两次 dispatch（同一 command buffer，GPU 自动屏障）：
 *   1. buildDensityGrid — 统计每格粒子数
 *   2. simulate         — 读密度 + 物理积分 + 写出
 *
 * WGSL 拼接：fetch utils.wgsl + compute.wgsl → 拼接为单个 shader module
 */

import { WebGPUContext } from './WebGPUContext'

// 必须与 compute.wgsl 中的 const 保持一致
const GRID_W = 64
const GRID_H = 64
const GRID_CELLS = GRID_W * GRID_H
const WORKGROUP_SIZE = 256

export class ComputeShaderSystem {
  private device: GPUDevice
  private width: number
  private height: number

  // Pipelines
  private buildDensityPipeline: GPUComputePipeline | null = null
  private simulatePipeline: GPUComputePipeline | null = null
  private bindGroupLayout: GPUBindGroupLayout | null = null

  // Ping-pong bind groups: [0] = A→B, [1] = B→A
  private bindGroups: GPUBindGroup[] = []
  private pingPongIndex = 0

  // Buffers
  private particleBuffers: GPUBuffer[] = [] // [A, B]
  private densityGridBuffer: GPUBuffer | null = null
  private paramsBuffer: GPUBuffer | null = null

  private particleCount: number

  constructor(
    private contextWrapper: WebGPUContext,
    particleCount: number = 100000,
  ) {
    this.device = contextWrapper.device!
    this.width = contextWrapper.width
    this.height = contextWrapper.height
    this.particleCount = particleCount
  }

  // ————————————————— 初始化 —————————————————

  async init(): Promise<void> {
    this.createBuffers()
    this.createParamsBuffer()
    this.createBindGroupLayout()
    await this.createPipelines()
    this.createBindGroups()
    this.initializeParticles()
  }

  // ————————————————— Buffers —————————————————

  private createBuffers(): void {
    // Particle: 16 bytes each (vec2f pos + vec2f vel)
    const particleBytes = this.particleCount * 16

    // Check if particle buffer size exceeds device limits
    const maxBufferSize = this.device.limits.maxStorageBufferBindingSize
    if (particleBytes > maxBufferSize) {
      console.warn(`Particle buffer size (${particleBytes} bytes) exceeds device limit (${maxBufferSize} bytes). Reducing particle count.`)
      this.particleCount = Math.floor((maxBufferSize / 16) * 0.9) // Use 90% of max limit
      console.warn(`Adjusted particle count to ${this.particleCount}`)
    }

    for (let i = 0; i < 2; i++) {
      this.particleBuffers.push(
        this.device.createBuffer({
          label: `particles-${i}`,
          size: this.particleCount * 16,
          usage:
            GPUBufferUsage.STORAGE |
            GPUBufferUsage.COPY_DST |
            GPUBufferUsage.COPY_SRC,
        }),
      )
    }

    // Density grid: GRID_CELLS × u32
    this.densityGridBuffer = this.device.createBuffer({
      label: 'density-grid',
      size: GRID_CELLS * 4,
      usage:
        GPUBufferUsage.STORAGE |
        GPUBufferUsage.COPY_DST,
    })
  }

  private createParamsBuffer(): void {
    // Params struct: 32 bytes (见 compute.wgsl)
    this.paramsBuffer = this.device.createBuffer({
      label: 'params',
      size: 32,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    })
  }

  // ————————————————— Bind Group —————————————————

  private createBindGroupLayout(): void {
    this.bindGroupLayout = this.device.createBindGroupLayout({
      label: 'compute-layout',
      entries: [
        {
          // binding 0: particlesIn (read-only storage)
          binding: 0,
          visibility: GPUShaderStage.COMPUTE,
          buffer: { type: 'read-only-storage' },
        },
        {
          // binding 1: particlesOut (read-write storage)
          binding: 1,
          visibility: GPUShaderStage.COMPUTE,
          buffer: { type: 'storage' },
        },
        {
          // binding 2: params (uniform)
          binding: 2,
          visibility: GPUShaderStage.COMPUTE,
          buffer: { type: 'uniform' },
        },
        {
          // binding 3: densityGrid (read-write storage, atomic)
          binding: 3,
          visibility: GPUShaderStage.COMPUTE,
          buffer: { type: 'storage' },
        },
      ],
    })
  }

  /**
   * 创建两组 bind group 实现 ping-pong：
   *   bindGroups[0]: A(read) → B(write)
   *   bindGroups[1]: B(read) → A(write)
   */
  private createBindGroups(): void {
    const [bufA, bufB] = this.particleBuffers

    for (let i = 0; i < 2; i++) {
      this.bindGroups.push(
        this.device.createBindGroup({
          label: `compute-bind-${i}`,
          layout: this.bindGroupLayout!,
          entries: [
            { binding: 0, resource: { buffer: i === 0 ? bufA : bufB } },
            { binding: 1, resource: { buffer: i === 0 ? bufB : bufA } },
            { binding: 2, resource: { buffer: this.paramsBuffer! } },
            { binding: 3, resource: { buffer: this.densityGridBuffer! } },
          ],
        }),
      )
    }
  }

  // ————————————————— Pipelines —————————————————

  private async createPipelines(): Promise<void> {
    const shaderModule = await this.loadShaderModule()
    const layout = this.device.createPipelineLayout({
      bindGroupLayouts: [this.bindGroupLayout!],
    })

    this.buildDensityPipeline = this.device.createComputePipeline({
      label: 'build-density',
      layout,
      compute: { module: shaderModule, entryPoint: 'buildDensityGrid' },
    })

    this.simulatePipeline = this.device.createComputePipeline({
      label: 'simulate',
      layout,
      compute: { module: shaderModule, entryPoint: 'simulate' },
    })
  }

  /**
   * 加载自包含的 compute.wgsl（已内联全部工具函数）
   */
  private async loadShaderModule(): Promise<GPUShaderModule> {
    const resp = await fetch('/shaders/compute.wgsl')
    if (!resp.ok) {
      throw new Error(`Failed to load compute shader: ${resp.status}`)
    }

    const code = await resp.text()

    const module = this.device.createShaderModule({
      label: 'liquid-metal-compute',
      code,
    })

    // 开发阶段：检查编译错误
    if (module.getCompilationInfo) {
      const info = await module.getCompilationInfo()
      for (const msg of info.messages) {
        if (msg.type === 'error') {
          console.error(`WGSL error [${msg.lineNum}:${msg.linePos}]: ${msg.message}`)
        }
      }
    }

    return module
  }

  // ————————————————— 粒子初始化 —————————————————

  private initializeParticles(): void {
    // 每粒子 4 个 f32: pos.x, pos.y, vel.x, vel.y
    const data = new Float32Array(this.particleCount * 4)

    for (let i = 0; i < this.particleCount; i++) {
      const offset = i * 4
      // 均匀分布在 [0.05, 0.95]，带随机抖动
      data[offset + 0] = 0.05 + Math.random() * 0.9 // pos.x
      data[offset + 1] = 0.05 + Math.random() * 0.9 // pos.y
      data[offset + 2] = 0.0 // vel.x
      data[offset + 3] = 0.0 // vel.y
    }

    // 写入两个 buffer（初始状态相同）
    this.device.queue.writeBuffer(this.particleBuffers[0], 0, data)
    this.device.queue.writeBuffer(this.particleBuffers[1], 0, data)
  }

  // ————————————————— 每帧更新 —————————————————

  /**
   * 更新 uniform 参数
   */
  updateParameters(
    dt: number,
    time: number,
    mousePos: [number, number],
    mouseForce: number,
  ): void {
    if (!this.paramsBuffer) return

    // Params 布局：32 bytes，必须与 WGSL struct 完全一致
    const buf = new ArrayBuffer(32)
    const view = new DataView(buf)
    view.setFloat32(0, dt, true)                  // dt
    view.setFloat32(4, time, true)                // time
    view.setFloat32(8, this.width, true)          // resolution.x
    view.setFloat32(12, this.height, true)        // resolution.y
    view.setFloat32(16, mousePos[0], true)        // mouse.x
    view.setFloat32(20, mousePos[1], true)        // mouse.y
    view.setFloat32(24, mouseForce, true)         // mouseForce
    view.setUint32(28, this.particleCount, true)  // particleCount (u32)

    this.device.queue.writeBuffer(this.paramsBuffer, 0, buf)
  }

  /**
   * 执行一帧物理模拟
   *
   * 单个 command buffer 内两次 compute pass：
   *   1. clearBuffer(densityGrid) — GPU 侧清零
   *   2. buildDensityGrid dispatch — 统计密度
   *   3. simulate dispatch — 物理积分
   *
   * 同一 command buffer 内 pass 之间有隐式屏障
   */
  dispatch(): void {
    if (!this.buildDensityPipeline || !this.simulatePipeline) return

    const workgroupCount = Math.ceil(this.particleCount / WORKGROUP_SIZE)
    const bindGroup = this.bindGroups[this.pingPongIndex]

    const encoder = this.device.createCommandEncoder({ label: 'compute-frame' })

    // —— 清零密度网格 ——
    encoder.clearBuffer(this.densityGridBuffer!)

    // —— Pass 1: 构建密度网格 ——
    const pass1 = encoder.beginComputePass({ label: 'build-density' })
    pass1.setPipeline(this.buildDensityPipeline)
    pass1.setBindGroup(0, bindGroup)
    pass1.dispatchWorkgroups(workgroupCount)
    pass1.end()

    // —— Pass 2: 粒子物理模拟 ——
    const pass2 = encoder.beginComputePass({ label: 'simulate' })
    pass2.setPipeline(this.simulatePipeline)
    pass2.setBindGroup(0, bindGroup)
    pass2.dispatchWorkgroups(workgroupCount)
    pass2.end()

    this.device.queue.submit([encoder.finish()])

    // —— Ping-pong 交换 ——
    this.pingPongIndex = 1 - this.pingPongIndex
  }

  // ————————————————— 外部接口 —————————————————

  /** 当前帧的粒子位置 buffer（用于渲染管线 vertex/storage 绑定） */
  getCurrentPositionBuffer(): GPUBuffer {
    // dispatch 后 pingPongIndex 已翻转，所以当前可读的是上一次的 write buffer
    // pingPongIndex=0 时上一帧写入了 bufB → 读 bufB (index 1)
    // pingPongIndex=1 时上一帧写入了 bufA → 读 bufA (index 0)
    return this.particleBuffers[1 - this.pingPongIndex]
  }

  getParticleCount(): number {
    return this.particleCount
  }

  onResize(): void {
    this.width = this.contextWrapper.width
    this.height = this.contextWrapper.height
  }

  destroy(): void {
    this.particleBuffers.forEach((b) => b.destroy())
    this.densityGridBuffer?.destroy()
    this.paramsBuffer?.destroy()

    this.particleBuffers = []
    this.densityGridBuffer = null
    this.paramsBuffer = null
    this.buildDensityPipeline = null
    this.simulatePipeline = null
    this.bindGroupLayout = null
    this.bindGroups = []
  }
}
