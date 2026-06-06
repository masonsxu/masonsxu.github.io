import * as THREE from 'three'
import type { Updatable } from '../engine/GameEngine'

export interface HotspotData {
  id: string
  position: THREE.Vector3
  title: string
  description: string
  icon: string
}

export class Hotspot implements Updatable {
  readonly data: HotspotData
  readonly group: THREE.Group
  private readonly glow: THREE.Sprite
  private cone: THREE.Mesh
  isNearby = false

  constructor(scene: THREE.Scene, data: HotspotData) {
    this.data = data
    this.group = new THREE.Group()
    this.group.position.copy(data.position)
    this.group.position.y += 0.5

    const coneMat = new THREE.MeshToonMaterial({ color: '#f0d040' })
    this.cone = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.5, 6), coneMat)
    this.cone.position.y = 0.25
    this.cone.castShadow = true
    this.group.add(this.cone)

    const glowCanvas = document.createElement('canvas')
    glowCanvas.width = 128
    glowCanvas.height = 128
    const ctx = glowCanvas.getContext('2d')!
    const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64)
    g.addColorStop(0, 'rgba(255,240,160,1)')
    g.addColorStop(0.3, 'rgba(255,220,80,0.6)')
    g.addColorStop(1, 'rgba(255,200,50,0)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, 128, 128)

    const glowTex = new THREE.CanvasTexture(glowCanvas)

    this.glow = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: glowTex,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    )
    this.glow.scale.set(1.5, 1.5, 1)
    this.glow.position.y = 0.5
    this.group.add(this.glow)

    scene.add(this.group)
  }

  update(_dt: number, time: number): void {
    this.cone.rotation.y = time * 0.8
    this.glow.material.opacity = 0.7 + Math.sin(time * 2) * 0.3
    this.group.position.y = this.data.position.y + 0.5 + Math.sin(time * 1.2) * 0.08
    const pulse = 1.2 + Math.sin(time * 1.5) * 0.3
    this.glow.scale.set(pulse, pulse, 1)
  }

  dispose(): void {
    this.glow.material.dispose()
    if (this.glow.material.map) this.glow.material.map.dispose()
  }
}
