/**
 * WebGPU Context Manager
 * GPU 设备初始化、swapchain 配置、资源管理
 */

export class WebGPUContext {
  device: GPUDevice | null = null
  context: GPUCanvasContext | null = null
  format: GPUTextureFormat = 'bgra8unorm'
  width: number = 0
  height: number = 0

  constructor(private canvas: HTMLCanvasElement) {}

  async init(): Promise<void> {
    if (!navigator.gpu) {
      throw new Error('WebGPU not supported on this browser')
    }

    const adapter = await navigator.gpu.requestAdapter({
      powerPreference: 'high-performance',
    })
    if (!adapter) {
      throw new Error('Could not request WebGPU adapter')
    }

    this.device = await adapter.requestDevice({
      requiredLimits: {
        maxStorageBufferBindingSize: adapter.limits.maxStorageBufferBindingSize,
      },
    })

    // 使用浏览器推荐的格式（通常是 bgra8unorm）
    this.format = navigator.gpu.getPreferredCanvasFormat()

    this.context = this.canvas.getContext('webgpu')
    if (this.context && this.device) {
      this.context.configure({
        device: this.device,
        format: this.format,
        alphaMode: 'opaque',
      })
    }

    this.resize()
  }

  resize(): void {
    const { clientWidth, clientHeight } = this.canvas
    if (this.width === clientWidth && this.height === clientHeight) return

    this.width = clientWidth
    this.height = clientHeight
    this.canvas.width = this.width
    this.canvas.height = this.height

    // Reconfigure is not needed for resize in WebGPU
    // The context uses canvas dimensions automatically
  }

  destroy(): void {
    this.device?.destroy()
    this.device = null
    this.context = null
  }

  isReady(): boolean {
    return !!this.device && !!this.context
  }

  getCurrentTextureView(): GPUTextureView {
    return this.context!.getCurrentTexture().createView()
  }

  createTexture(
    width: number,
    height: number,
    format: GPUTextureFormat = 'rgba16float',
    usage?: GPUTextureUsageFlags,
    label?: string,
  ): GPUTexture {
    return this.device!.createTexture({
      label: label ?? 'offscreen-texture',
      size: [width, height],
      format,
      usage: usage ?? (GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING),
    })
  }
}
