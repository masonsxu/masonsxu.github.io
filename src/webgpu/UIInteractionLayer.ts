/**
 * UI Interaction Layer — 鼠标/触摸悬停追踪
 * 始终追踪鼠标位置（无需按下），提供平滑的悬停力度指示器
 */

export class UIInteractionLayer {
  private width: number
  private height: number

  private mousePos: [number, number] = [0.5, 0.5]
  private mouseForce: number = 0
  private isMouseActive: boolean = false

  private forceDecay: number = 0.95
  private forceBuildRate: number = 0.05

  private boundHandlers: {
    mousemove: (e: MouseEvent) => void
    mouseleave: () => void
    touchstart: (e: TouchEvent) => void
    touchmove: (e: TouchEvent) => void
    touchend: () => void
    touchcancel: () => void
    resize: () => void
  }

  constructor(
    private updateSize: () => { width: number; height: number },
  ) {
    const size = this.updateSize()
    this.width = size.width
    this.height = size.height

    this.boundHandlers = {
      mousemove: (e) => this.onMouseMove(e),
      mouseleave: () => this.onMouseLeave(),
      touchstart: (e) => this.onTouchStart(e),
      touchmove: (e) => this.onTouchMove(e),
      touchend: () => this.onMouseLeave(),
      touchcancel: () => this.onMouseLeave(),
      resize: () => this.onResize(),
    }

    window.addEventListener('mousemove', this.boundHandlers.mousemove)
    window.addEventListener('mouseleave', this.boundHandlers.mouseleave)
    window.addEventListener('touchstart', this.boundHandlers.touchstart, { passive: true })
    window.addEventListener('touchmove', this.boundHandlers.touchmove, { passive: true })
    window.addEventListener('touchend', this.boundHandlers.touchend, { passive: true })
    window.addEventListener('touchcancel', this.boundHandlers.touchcancel, { passive: true })
    window.addEventListener('resize', this.boundHandlers.resize)
  }

  private onMouseMove(e: MouseEvent): void {
    this.isMouseActive = true
    this.updateMousePosition(e.clientX, e.clientY)
  }

  private onMouseLeave(): void {
    this.isMouseActive = false
  }

  private onTouchStart(e: TouchEvent): void {
    if (e.touches.length > 0) {
      this.isMouseActive = true
      const touch = e.touches[0]
      this.updateMousePosition(touch.clientX, touch.clientY)
    }
  }

  private onTouchMove(e: TouchEvent): void {
    if (e.touches.length > 0) {
      const touch = e.touches[0]
      this.updateMousePosition(touch.clientX, touch.clientY)
    }
  }

  private updateMousePosition(clientX: number, clientY: number): void {
    this.mousePos[0] = clientX / this.width
    this.mousePos[1] = clientY / this.height
  }

  private onResize(): void {
    const size = this.updateSize()
    this.width = size.width
    this.height = size.height
  }

  getMousePos(): [number, number] {
    return this.mousePos
  }

  /** 平滑的悬停力度指示器：鼠标在页面上时递增到 1.0，离开时衰减到 0 */
  getMouseForce(): number {
    if (this.isMouseActive) {
      this.mouseForce = Math.min(this.mouseForce + this.forceBuildRate, 1.0)
    } else if (this.mouseForce > 0.005) {
      this.mouseForce *= this.forceDecay
    } else {
      this.mouseForce = 0
    }
    return this.mouseForce
  }

  destroy(): void {
    window.removeEventListener('mousemove', this.boundHandlers.mousemove)
    window.removeEventListener('mouseleave', this.boundHandlers.mouseleave)
    window.removeEventListener('touchstart', this.boundHandlers.touchstart)
    window.removeEventListener('touchmove', this.boundHandlers.touchmove)
    window.removeEventListener('touchend', this.boundHandlers.touchend)
    window.removeEventListener('touchcancel', this.boundHandlers.touchcancel)
    window.removeEventListener('resize', this.boundHandlers.resize)
  }
}
