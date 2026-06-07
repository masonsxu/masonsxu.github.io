export class InputManager {
  readonly keys = new Set<string>()
  mouseX = 0
  mouseY = 0
  private prevMouseX = 0
  private prevMouseY = 0
  private isPointerLocked = false
  private moveX = 0
  private moveY = 0

  private onKeyDown = (e: KeyboardEvent): void => {
    this.keys.add(e.key.toLowerCase())
  }

  private onKeyUp = (e: KeyboardEvent): void => {
    this.keys.delete(e.key.toLowerCase())
  }

  private onMouseMove = (e: MouseEvent): void => {
    if (this.isPointerLocked) {
      this.mouseX += e.movementX
      this.mouseY += e.movementY
    } else {
      this.prevMouseX = e.clientX
      this.prevMouseY = e.clientY
    }
  }

  private onPointerLockChange = (): void => {
    this.isPointerLocked = document.pointerLockElement !== null
  }

  private onPointerLockError = (): void => {
    this.isPointerLocked = false
  }

  requestLock(element: HTMLElement): void {
    element.requestPointerLock()
  }

  exitLock(): void {
    if (document.pointerLockElement) {
      document.exitPointerLock()
    }
  }

  get locked(): boolean {
    return this.isPointerLocked
  }

  /** Returns movement vector: x=right, y=forward, normalized */
  getMovement(): { x: number; y: number } {
    let mx = 0, my = 0
    if (this.keys.has('w') || this.keys.has('arrowup')) my += 1
    if (this.keys.has('s') || this.keys.has('arrowdown')) my -= 1
    if (this.keys.has('d') || this.keys.has('arrowright')) mx += 1
    if (this.keys.has('a') || this.keys.has('arrowleft')) mx -= 1
    const len = Math.hypot(mx, my)
    if (len > 1) { mx /= len; my /= len }
    return { x: mx, y: my }
  }

  get sprint(): boolean {
    return this.keys.has('shift')
  }

  get jump(): boolean {
    return this.keys.has(' ')
  }

  /** Consume accumulated mouse delta for camera orbit */
  consumeLook(): { x: number; y: number } {
    const x = this.mouseX
    const y = this.mouseY
    this.mouseX = 0
    this.mouseY = 0
    return { x, y }
  }

  bind(): void {
    window.addEventListener('keydown', this.onKeyDown)
    window.addEventListener('keyup', this.onKeyUp)
    document.addEventListener('mousemove', this.onMouseMove)
    document.addEventListener('pointerlockchange', this.onPointerLockChange)
    document.addEventListener('pointerlockerror', this.onPointerLockError)
  }

  unbind(): void {
    window.removeEventListener('keydown', this.onKeyDown)
    window.removeEventListener('keyup', this.onKeyUp)
    document.removeEventListener('mousemove', this.onMouseMove)
    document.removeEventListener('pointerlockchange', this.onPointerLockChange)
    document.removeEventListener('pointerlockerror', this.onPointerLockError)
  }
}
