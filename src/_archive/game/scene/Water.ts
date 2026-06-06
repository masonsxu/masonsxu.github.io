import * as THREE from 'three'
import type { Updatable } from '../engine/GameEngine'

export class Water implements Updatable {
  readonly mesh: THREE.Mesh
  private readonly positions: THREE.BufferAttribute
  private readonly baseY: Float32Array
  private readonly vertexCount: number

  constructor(scene: THREE.Scene, x = -20, z = 20, width = 30, depth = 25) {
    const geo = new THREE.PlaneGeometry(width, depth, 32, 32)
    geo.rotateX(-Math.PI / 2)

    this.positions = geo.attributes.position as THREE.BufferAttribute
    this.vertexCount = this.positions.count
    this.baseY = new Float32Array(this.vertexCount)
    for (let i = 0; i < this.vertexCount; i++) {
      this.baseY[i] = this.positions.getY(i)
    }

    const mat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#5a8fc9'),
      roughness: 0.2,
      metalness: 0.1,
      transparent: true,
      opacity: 0.75,
      envMapIntensity: 0.4,
      side: THREE.DoubleSide,
    })

    this.mesh = new THREE.Mesh(geo, mat)
    this.mesh.position.set(x, -0.3, z)
    this.mesh.receiveShadow = true
    scene.add(this.mesh)
  }

  update(_dt: number, time: number): void {
    for (let i = 0; i < this.vertexCount; i++) {
      const x = this.positions.getX(i)
      const z = this.positions.getZ(i)
      const wave = Math.sin(x * 0.5 + time * 0.8) * 0.08
                + Math.sin(z * 0.4 + time * 0.6 + x * 0.3) * 0.06
                + Math.sin((x + z) * 0.3 + time * 1.2) * 0.04
      this.positions.setY(i, this.baseY[i]! + wave)
    }
    this.positions.needsUpdate = true
  }
}
