import * as THREE from 'three'
import type { InputManager } from './InputManager'
import type { Updatable } from '../engine/GameEngine'
import type { ThirdPersonCamera } from './ThirdPersonCamera'

function getTerrainHeight(x: number, z: number): number {
  const dummy = new THREE.Object3D()
  dummy.position.set(x, 0, z)
  return dummy.position.y
}

export class Character implements Updatable {
  readonly group: THREE.Group
  private readonly body: THREE.Mesh
  private readonly head: THREE.Mesh
  private readonly input: InputManager
  private readonly cam: ThirdPersonCamera
  private velocity = new THREE.Vector3()
  private isGrounded = true
  private groundedY = 0
  private walkCycle = 0
  private heightFetcher: (x: number, z: number) => number

  constructor(
    scene: THREE.Scene,
    input: InputManager,
    cam: ThirdPersonCamera,
    heightFetcher: (x: number, z: number) => number,
    position?: THREE.Vector3,
  ) {
    this.input = input
    this.cam = cam
    this.heightFetcher = heightFetcher

    this.group = new THREE.Group()
    this.group.position.copy(position ?? new THREE.Vector3(0, 0, 0))

    const bodyMat = new THREE.MeshToonMaterial({ color: '#4a8fc9' })
    const headMat = new THREE.MeshToonMaterial({ color: '#f0d8b8' })

    this.body = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.35, 0.9, 8), bodyMat)
    this.body.position.y = 1.0
    this.body.castShadow = true
    this.group.add(this.body)

    this.head = new THREE.Mesh(new THREE.SphereGeometry(0.22, 8, 8), headMat)
    this.head.position.y = 1.65
    this.head.castShadow = true
    this.group.add(this.head)

    scene.add(this.group)

    this.groundedY = this.getGroundHeight()
    this.group.position.y = this.groundedY
  }

  private getGroundHeight(): number {
    return this.heightFetcher(this.group.position.x, this.group.position.z)
  }

  update(dt: number, time: number): void {
    const move = this.input.getMovement()
    const speed = this.input.sprint ? 4.5 : 2.5
    const isMoving = Math.abs(move.x) > 0.01 || Math.abs(move.y) > 0.01

    const cameraDir = new THREE.Vector3()
    this.cam.camera.getWorldDirection(cameraDir)
    cameraDir.y = 0
    cameraDir.normalize()

    const cameraRight = new THREE.Vector3()
    cameraRight.crossVectors(cameraDir, new THREE.Vector3(0, 1, 0)).normalize()

    const moveVec = new THREE.Vector3()
    moveVec.addScaledVector(cameraRight, move.x)
    moveVec.addScaledVector(cameraDir, move.y)

    if (moveVec.length() > 0.01) {
      moveVec.normalize()
      moveVec.multiplyScalar(speed * dt)

      this.group.position.x += moveVec.x
      this.group.position.z += moveVec.z

      const targetAngle = Math.atan2(moveVec.x, moveVec.z)
      let currentAngle = this.group.rotation.y
      let diff = targetAngle - currentAngle
      while (diff > Math.PI) diff -= Math.PI * 2
      while (diff < -Math.PI) diff += Math.PI * 2
      this.group.rotation.y += diff * 0.12

      this.walkCycle += dt * speed * 0.6
    }

    const groundY = this.getGroundHeight()
    this.groundedY += (groundY - this.groundedY) * 0.15
    this.group.position.y = this.groundedY

    const bob = isMoving ? Math.sin(this.walkCycle) * 0.04 : 0
    this.body.position.y = 1.0 + bob
    this.head.position.y = 1.65 + bob

    const sway = isMoving ? Math.sin(this.walkCycle * 2) * 0.02 : 0
    this.head.rotation.z = sway

    this.cam.target.copy(this.group.position)
    this.cam.target.y += 1.2
  }
}
