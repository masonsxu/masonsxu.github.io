import * as THREE from 'three'
import type { Updatable } from '../engine/GameEngine'
import type { Terrain } from './Terrain'

const TREE_POSES = [
  { x: -8, z: -5 }, { x: -15, z: 5 }, { x: 5, z: -18 },
  { x: 12, z: -8 }, { x: -5, z: 15 }, { x: 20, z: 10 },
  { x: -22, z: -10 }, { x: 18, z: -15 }, { x: -12, z: -22 },
  { x: 25, z: -5 }, { x: -25, z: 15 }, { x: 8, z: 25 },
  { x: -18, z: -18 }, { x: 30, z: 5 }, { x: -30, z: -5 },
  { x: 3, z: -30 }, { x: 15, z: 20 }, { x: -20, z: 20 },
  { x: 7, z: -7 }, { x: -7, z: -12 },
]

const TREE_SCALES = [1.0, 0.8, 1.2, 0.9, 1.1, 0.85, 1.15, 0.95, 1.05, 0.75]

export class Vegetation implements Updatable {
  private treeTrunks: THREE.InstancedMesh | null = null
  private treeCrowns: THREE.InstancedMesh | null = null

  constructor(scene: THREE.Scene, terrain: Terrain) {
    this.buildTrees(scene, terrain)
  }

  private buildTrees(scene: THREE.Scene, terrain: Terrain): void {
    const trunkGeo = new THREE.CylinderGeometry(0.08, 0.12, 1.2, 6)
    const crownGeo = new THREE.SphereGeometry(0.7, 6, 5)
    crownGeo.scale(1, 0.85, 1)

    const trunkMat = new THREE.MeshToonMaterial({ color: '#6b4a2e' })
    const crownMat = new THREE.MeshToonMaterial({ color: '#3d8a3d' })

    const count = TREE_POSES.length
    const trunkDummy = new THREE.Object3D()
    const crownDummy = new THREE.Object3D()

    this.treeTrunks = new THREE.InstancedMesh(trunkGeo, trunkMat, count)
    this.treeCrowns = new THREE.InstancedMesh(crownGeo, crownMat.clone(), count)

    for (let i = 0; i < count; i++) {
      const scale = TREE_SCALES[i % TREE_SCALES.length] ?? 1.0
      const px = (TREE_POSES[i]?.x ?? 0) + (Math.random() - 0.5) * 2
      const pz = (TREE_POSES[i]?.z ?? 0) + (Math.random() - 0.5) * 2
      const py = terrain.getHeight(px, pz)

      trunkDummy.position.set(px, py, pz)
      trunkDummy.scale.setScalar(scale)
      trunkDummy.updateMatrix()
      this.treeTrunks.setMatrixAt(i, trunkDummy.matrix)

      crownDummy.position.set(px, py + 1.2 * scale * 0.5 + 0.6 * scale, pz)
      crownDummy.scale.setScalar(scale)
      crownDummy.updateMatrix()
      this.treeCrowns.setMatrixAt(i, crownDummy.matrix)
    }

    this.treeTrunks.instanceMatrix.needsUpdate = true
    this.treeCrowns.instanceMatrix.needsUpdate = true

    this.treeTrunks.castShadow = true
    this.treeCrowns.castShadow = true

    scene.add(this.treeTrunks)
    scene.add(this.treeCrowns)
  }

  update(_dt: number, _time: number): void {}
}
