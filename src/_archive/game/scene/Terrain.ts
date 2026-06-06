import * as THREE from 'three'
import type { Updatable } from '../engine/GameEngine'

function hash2D(px: number, py: number): number {
  let n = Math.sin(px * 127.1 + py * 311.7) * 43758.5453
  return n - Math.floor(n)
}

function smoothNoise(x: number, y: number): number {
  const ix = Math.floor(x), iy = Math.floor(y)
  const fx = x - ix, fy = y - iy
  const sx = fx * fx * (3 - 2 * fx)
  const sy = fy * fy * (3 - 2 * fy)
  const v00 = hash2D(ix, iy)
  const v10 = hash2D(ix + 1, iy)
  const v01 = hash2D(ix, iy + 1)
  const v11 = hash2D(ix + 1, iy + 1)
  const a = v00 + (v10 - v00) * sx
  const b = v01 + (v11 - v01) * sx
  return a + (b - a) * sy
}

function fbm(x: number, y: number, octaves = 4): number {
  let value = 0, amp = 1, freq = 1, max = 0
  for (let i = 0; i < octaves; i++) {
    value += amp * smoothNoise(x * freq, y * freq)
    max += amp
    amp *= 0.5
    freq *= 2
  }
  return value / max
}

export class Terrain implements Updatable {
  readonly mesh: THREE.Mesh
  private readonly heightData: Float32Array
  private readonly size: number
  private readonly segments: number

  constructor(scene: THREE.Scene, size = 120, segments = 128) {
    this.size = size
    this.segments = segments
    const geo = new THREE.PlaneGeometry(size, size, segments, segments)
    geo.rotateX(-Math.PI / 2)

    const pos = geo.attributes.position as THREE.BufferAttribute
    this.heightData = new Float32Array(pos.count)

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i)
      const z = pos.getZ(i)
      const nx = x / size + 0.5
      const nz = z / size + 0.5
      const h = (fbm(nx * 3, nz * 3) - 0.4) * 3.5
      const h2 = Math.max(fbm(nx * 6 + 100, nz * 6 + 100), 0) * 0.8
      const height = Math.max(h + h2, -0.3)
      pos.setY(i, height)
      this.heightData[i] = height
    }

    geo.computeVertexNormals()

    const mat = new THREE.MeshToonMaterial({
      color: new THREE.Color('#6da56d'),
      flatShading: false,
    })

    this.mesh = new THREE.Mesh(geo, mat)
    this.mesh.receiveShadow = true
    this.mesh.castShadow = true
    scene.add(this.mesh)
  }

  getHeight(x: number, z: number): number {
    const seg = this.segments
    const size = this.size
    const half = size / 2
    const u = THREE.MathUtils.clamp((x + half) / size, 0, 1)
    const v = THREE.MathUtils.clamp((z + half) / size, 0, 1)
    const col = Math.floor(u * seg)
    const row = Math.floor(v * seg)
    const idx = row * (seg + 1) + col
    if (idx < 0 || idx >= this.heightData.length - seg - 2) return 0
    const h1 = this.heightData[idx] ?? 0
    const h2 = this.heightData[idx + 1] ?? 0
    const h3 = this.heightData[idx + seg + 1] ?? 0
    const h4 = this.heightData[idx + seg + 2] ?? 0
    const fu = (u * seg) - col
    const fv = (v * seg) - row
    const ha = h1 + (h2 - h1) * fu
    const hb = h3 + (h4 - h3) * fu
    return ha + (hb - ha) * fv
  }

  update(_dt: number, _time: number): void {}
}
