/**
 * UI Interaction Layer — 纯 CPU 状态追踪器
 * 转换屏幕坐标为归一化坐标，提供鼠标力场状态
 */

export class UIInteractionLayer {
  private width: number
  private height: number

  private mousePos: [number, number] = [0, 0]
  private mouseForce: number = 0
  private isMouseDown: boolean = false

  private forceDecay: number = 0.92
  private baseForce: number = 0.6
  private forceBuildRate: number = 0.012

  // 存储事件处理器引用，确保 removeEventListener 正确移除
  private boundHandlers: {
    mousedown: (e: MouseEvent) => void
    mousemove: (e: MouseEvent) => void
    mouseup: () => void
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
      mousedown: (e) => this.onMouseDown(e),
      mousemove: (e) => this.onMouseMove(e),
      mouseup: () => this.onMouseUp(),
      mouseleave: () => this.onMouseUp(),
      touchstart: (e) => this.onTouchStart(e),
      touchmove: (e) => this.onTouchMove(e),
      touchend: () => this.onMouseUp(),
      touchcancel: () => this.onMouseUp(),
      resize: () => this.onResize(),
    }

    window.addEventListener('mousedown', this.boundHandlers.mousedown)
    window.addEventListener('mousemove', this.boundHandlers.mousemove)
    window.addEventListener('mouseup', this.boundHandlers.mouseup)
    window.addEventListener('mouseleave', this.boundHandlers.mouseleave)
    window.addEventListener('touchstart', this.boundHandlers.touchstart, { passive: true })
    window.addEventListener('touchmove', this.boundHandlers.touchmove, { passive: true })
    window.addEventListener('touchend', this.boundHandlers.touchend, { passive: true })
    window.addEventListener('touchcancel', this.boundHandlers.touchcancel, { passive: true })
    window.addEventListener('resize', this.boundHandlers.resize)
  }

  private onMouseDown(e: MouseEvent): void {
    this.isMouseDown = true
    this.updateMousePosition(e.clientX, e.clientY)
  }

  private onMouseMove(e: MouseEvent): void {
    if (this.isMouseDown) {
      this.updateMousePosition(e.clientX, e.clientY)
    }
  }

  private onMouseUp(): void {
    this.isMouseDown = false
    this.mouseForce = 0
  }

  private onTouchStart(e: TouchEvent): void {
    if (e.touches.length > 0) {
      this.isMouseDown = true
      const touch = e.touches[0]
      this.updateMousePosition(touch.clientX, touch.clientY)
    }
  }

  private onTouchMove(e: TouchEvent): void {
    if (this.isMouseDown && e.touches.length > 0) {
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

  getMouseForce(): number {
    if (this.isMouseDown) {
      this.mouseForce = Math.min(this.mouseForce + this.forceBuildRate, this.baseForce)
    } else if (this.mouseForce > 0.005) {
      this.mouseForce *= this.forceDecay
    } else {
      this.mouseForce = 0
    }
    return this.mouseForce
  }

  destroy(): void {
    window.removeEventListener('mousedown', this.boundHandlers.mousedown)
    window.removeEventListener('mousemove', this.boundHandlers.mousemove)
    window.removeEventListener('mouseup', this.boundHandlers.mouseup)
    window.removeEventListener('mouseleave', this.boundHandlers.mouseleave)
    window.removeEventListener('touchstart', this.boundHandlers.touchstart)
    window.removeEventListener('touchmove', this.boundHandlers.touchmove)
    window.removeEventListener('touchend', this.boundHandlers.touchend)
    window.removeEventListener('touchcancel', this.boundHandlers.touchcancel)
    window.removeEventListener('resize', this.boundHandlers.resize)
  }
}
