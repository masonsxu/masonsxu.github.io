import * as THREE from 'three'
import type { InputManager } from './InputManager'
import type { Updatable } from '../engine/GameEngine'

export class ThirdPersonCamera implements Updatable {
  readonly camera: THREE.PerspectiveCamera
  target = new THREE.Vector3()
  private theta = 0.4
  private phi = 0.6
  private distance = 12
  private thetaTarget = 0.4
  private phiTarget = 0.6
  private distTarget = 12
  private readonly input: InputManager
  private readonly sensitivity = 0.003

  constructor(camera: THREE.PerspectiveCamera, input: InputManager) {
    this.camera = camera
    this.input = input
  }

  update(_dt: number, _time: number): void {
    const look = this.input.consumeLook()
    if (look.x !== 0 || look.y !== 0) {
      this.thetaTarget -= look.x * this.sensitivity
      this.phiTarget = THREE.MathUtils.clamp(
        this.phiTarget + look.y * this.sensitivity,
        0.15,
        1.3,
      )
    }

    this.theta += (this.thetaTarget - this.theta) * 0.08
    this.phi += (this.phiTarget - this.phi) * 0.08
    this.distance += (this.distTarget - this.distance) * 0.08

    const offset = new THREE.Vector3(
      this.distance * Math.sin(this.phi) * Math.sin(this.theta),
      this.distance * Math.cos(this.phi),
      this.distance * Math.sin(this.phi) * Math.cos(this.theta),
    )

    this.camera.position.copy(this.target).add(offset)
    this.camera.lookAt(this.target)
  }
}
