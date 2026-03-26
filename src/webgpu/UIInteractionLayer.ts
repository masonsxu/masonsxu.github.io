/**
 * UI Interaction Layer
 * Handles mouse/touch input for surface deformation in the liquid metal simulation
 * Converts screen coordinates to simulation space and applies forces to particle system
 */
import { WebGPUContext } from './WebGPUContext'

export class UIInteractionLayer {
  private device: GPUDevice | null = null
  private width: number = 0
  private height: number = 0

    // Force texture for applying mouse interactions
    private forceTexture: GPUTexture | null = null

  // Current mouse state
  private mousePos: [number, number] = [0, 0] // Normalized device coordinates [-1, 1]
  private mouseForce: number = 0
  private isMouseDown: boolean = false

  // Interaction parameters（Luxury-slow 配置）
  private interactionRadius: number = 0.15 // Radius of influence in normalized coordinates
  private forceDecay: number = 0.92 // 更慢的力衰减（原 0.95 → 0.92）

  constructor(private contextWrapper: WebGPUContext) {
    this.device = contextWrapper.device
    this.width = contextWrapper.width
    this.height = contextWrapper.height

    // Set up resize listener
    window.addEventListener('resize', () => this.onResize())

    // Set up mouse event listeners
    this.setupEventListeners()
  }

  /**
   * Initialize the interaction layer
   * Creates resources for mouse interaction visualization
   */
  async init(): Promise<void> {
    if (!this.device) {
      throw new Error('WebGPU device not initialized')
    }

    await this.createForceResources()
  }

  /**
   * Create force texture and sampler for mouse interaction
   */
  private async createForceResources(): Promise<void> {
    if (!this.device) {
      throw new Error('Device not initialized')
    }

    // Create force texture (RGBA16float for force vectors)
    this.forceTexture = this.device.createTexture({
      size: [this.width, this.height, 1],
      format: 'rgba16float',
      usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.STORAGE_BINDING | GPUTextureUsage.COPY_DST,
    })


  }

  /**
   * Set up mouse and touch event listeners
   */
  private setupEventListeners(): void {
    // Mouse events
    window.addEventListener('mousedown', (e) => this.onMouseDown(e))
    window.addEventListener('mousemove', (e) => this.onMouseMove(e))
    window.addEventListener('mouseup', () => this.onMouseUp())
    window.addEventListener('mouseleave', () => this.onMouseUp())

    // Touch events
    window.addEventListener('touchstart', (e) => this.onTouchStart(e), { passive: true })
    window.addEventListener('touchmove', (e) => this.onTouchMove(e), { passive: true })
    window.addEventListener('touchend', () => this.onTouchEnd(), { passive: true })
    window.addEventListener('touchcancel', () => this.onTouchEnd(), { passive: true })
  }

  /**
   * Handle mouse down event
   */
  private onMouseDown(e: MouseEvent): void {
    this.isMouseDown = true
    this.updateMousePosition(e.clientX, e.clientY)
    this.calculateMouseForce()
  }

  /**
   * Handle mouse move event
   */
  private onMouseMove(e: MouseEvent): void {
    if (this.isMouseDown) {
      this.updateMousePosition(e.clientX, e.clientY)
      this.calculateMouseForce()
    }
  }

  /**
   * Handle mouse up event
   */
  private onMouseUp(): void {
    this.isMouseDown = false
    this.mouseForce = 0
  }

  /**
   * Handle touch start event
   */
  private onTouchStart(e: TouchEvent): void {
    if (e.touches.length > 0) {
      this.isMouseDown = true
      const touch = e.touches[0]
      this.updateMousePosition(touch.clientX, touch.clientY)
      this.calculateMouseForce()
    }
  }

  /**
   * Handle touch move event
   */
  private onTouchMove(e: TouchEvent): void {
    if (this.isMouseDown && e.touches.length > 0) {
      const touch = e.touches[0]
      this.updateMousePosition(touch.clientX, touch.clientY)
      this.calculateMouseForce()
    }
  }

  /**
   * Handle touch end event
   */
  private onTouchEnd(): void {
    this.isMouseDown = false
    this.mouseForce = 0
  }

  /**
   * Update mouse position from client coordinates
   */
  private updateMousePosition(clientX: number, clientY: number): void {
    // 归一化到 [0, 1]，与 compute shader 的粒子坐标系一致
    this.mousePos[0] = clientX / this.width
    this.mousePos[1] = clientY / this.height
  }

  /**
   * Calculate force magnitude based on interaction state
   * Implements luxury-slow response characteristics
   */
  private calculateMouseForce(): void {
    // Base force when interacting（降低基础力）
    const baseForce = 0.6

    // Apply luxury-slow characteristics - gradual build-up and decay
    if (this.isMouseDown) {
      // 更慢的力增长（0.02 → 0.012）
      this.mouseForce = Math.min(this.mouseForce + 0.012, baseForce)
    } else {
      // Gradually decrease force when not interacting
      this.mouseForce *= this.forceDecay

      // Zero out very small forces
      if (this.mouseForce < 0.005) {
        this.mouseForce = 0
      }
    }
  }

  /**
   * Handle window resize events
   */
  private onResize(): void {
    this.width = this.contextWrapper.width
    this.height = this.contextWrapper.height

    // Recreate force resources with new size
    if (this.forceTexture) {
      this.forceTexture.destroy()
      this.forceTexture = null
    }

    // Note: createForceResources is async, but we can't await here in an event handler
    // In production, use a debounce + async queue pattern
    this.createForceResources().catch((err) => {
      console.error('Failed to recreate force texture on resize:', err)
    })
  }

  /**
   * Get current mouse position in normalized device coordinates
   */
  getMousePos(): [number, number] {
    return this.mousePos
  }

  /**
   * Get current mouse force magnitude
   */
  getMouseForce(): number {
    return this.mouseForce
  }

  /**
   * Get interaction radius
   */
  getInteractionRadius(): number {
    return this.interactionRadius
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    window.removeEventListener('resize', () => this.onResize())
    window.removeEventListener('mousedown', (e) => this.onMouseDown(e))
    window.removeEventListener('mousemove', (e) => this.onMouseMove(e))
    window.removeEventListener('mouseup', () => this.onMouseUp())
    window.removeEventListener('mouseleave', () => this.onMouseUp())
    window.removeEventListener('touchstart', (e) => this.onTouchStart(e))
    window.removeEventListener('touchmove', (e) => this.onTouchMove(e))
    window.removeEventListener('touchend', () => this.onTouchEnd())
    window.removeEventListener('touchcancel', () => this.onTouchEnd())

      this.forceTexture?.destroy()

      this.forceTexture = null
  }
}
