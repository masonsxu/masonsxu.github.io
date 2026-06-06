import * as THREE from 'three'
import { Sky as ThreeSky } from 'three/examples/jsm/objects/Sky.js'
import type { Updatable } from '../engine/GameEngine'

export class SkySystem implements Updatable {
  readonly sky: ThreeSky
  readonly sun: THREE.Vector3

  constructor(scene: THREE.Scene) {
    this.sky = new ThreeSky()
    this.sky.scale.setScalar(450)
    scene.add(this.sky)

    this.sun = new THREE.Vector3()
    const uniforms = (this.sky.material as THREE.ShaderMaterial).uniforms
    uniforms['turbidity'].value = 3
    uniforms['rayleigh'].value = 2
    uniforms['mieCoefficient'].value = 0.005
    uniforms['mieDirectionalG'].value = 0.7

    this.updateSun(0.4)

    scene.background = this.sky
  }

  updateSun(elevation: number): void {
    const phi = THREE.MathUtils.degToRad(90 - elevation * 180)
    const theta = THREE.MathUtils.degToRad(180)
    this.sun.setFromSphericalCoords(1, phi, theta)
    const uniforms = (this.sky.material as THREE.ShaderMaterial).uniforms
    uniforms['sunPosition'].value.copy(this.sun)
  }

  update(dt: number, time: number): void {
    const elevation = 0.35 + Math.sin(time * 0.02) * 0.05
    this.updateSun(elevation)
  }
}
