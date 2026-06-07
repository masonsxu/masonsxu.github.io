import * as THREE from 'three'
import { Terrain } from '../scene/Terrain'
import { SkySystem } from '../scene/Sky'
import { Water } from '../scene/Water'
import { Vegetation } from '../scene/Vegetation'
import { ToonPipeline, createGradientMap } from '../rendering/ToonPipeline'
import { InputManager } from '../character/InputManager'
import { Character } from '../character/Character'
import { ThirdPersonCamera } from '../character/ThirdPersonCamera'
import { HotspotSystem, type HotspotCallback } from '../interaction/HotspotSystem'
import type { HotspotData } from '../interaction/Hotspot'

export interface GameEngineOptions {
  container: HTMLElement
  onReady?: () => void
  onHotspotNearby?: HotspotCallback
  onInteractRequest?: () => void
}

export interface Updatable {
  update(dt: number, time: number): void
}

export class GameEngine {
  renderer: THREE.WebGLRenderer
  scene: THREE.Scene
  camera: THREE.PerspectiveCamera
  readonly clock = new THREE.Clock()
  readonly input: InputManager

  terrain!: Terrain
  sky!: SkySystem
  water!: Water
  vegetation!: Vegetation
  character!: Character
  thirdPersonCamera!: ThirdPersonCamera
  hotspotSystem!: HotspotSystem

  private pipeline!: ToonPipeline
  private raf = 0
  private ready = false
  private updatables: Updatable[] = []
  private onReady?: () => void
  private onHotspotNearby?: HotspotCallback
  private onInteractRequest?: () => void
  private interactionKeyPressed = false

  constructor(opts: GameEngineOptions) {
    this.onReady = opts.onReady
    this.onHotspotNearby = opts.onHotspotNearby
    this.onInteractRequest = opts.onInteractRequest

    this.input = new InputManager()
    this.input.bind()

    this.renderer = this.createRenderer(opts.container)
    this.scene = this.createScene()
    this.camera = this.createCamera()
    this.thirdPersonCamera = new ThirdPersonCamera(this.camera, this.input)
    this.setupLights()
    this.buildWorld()
    this.addUpdatable(this.thirdPersonCamera)

    this.bindEvents()
    this.animate()
  }

  private createRenderer(container: HTMLElement): THREE.WebGLRenderer {
    const r = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
    })
    r.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    r.setSize(container.clientWidth, container.clientHeight)
    r.shadowMap.enabled = true
    r.shadowMap.type = THREE.PCFSoftShadowMap
    r.toneMapping = THREE.ACESFilmicToneMapping
    r.toneMappingExposure = 1.0
    r.outputColorSpace = THREE.SRGBColorSpace
    r.domElement.style.display = 'block'
    r.domElement.style.touchAction = 'none'
    r.domElement.addEventListener('click', () => {
      if (!this.input.locked) {
        this.input.requestLock(r.domElement)
      }
    })
    container.appendChild(r.domElement)
    return r
  }

  private createScene(): THREE.Scene {
    const s = new THREE.Scene()
    s.fog = new THREE.FogExp2('#b0d0e8', 0.004)
    return s
  }

  private createCamera(): THREE.PerspectiveCamera {
    const container = this.renderer.domElement.parentElement!
    const aspect = container.clientWidth / container.clientHeight
    return new THREE.PerspectiveCamera(45, aspect, 0.1, 500)
  }

  private setupLights(): void {
    const hemi = new THREE.HemisphereLight(0x87ceeb, 0xc4b998, 0.9)
    this.scene.add(hemi)

    const ambient = new THREE.AmbientLight(0xffffff, 0.25)
    this.scene.add(ambient)

    const sun = new THREE.DirectionalLight(0xffe4b5, 2.2)
    sun.position.set(30, 50, -40)
    sun.castShadow = true
    sun.shadow.mapSize.set(4096, 4096)
    sun.shadow.camera.near = 0.5
    sun.shadow.camera.far = 120
    sun.shadow.camera.left = -50
    sun.shadow.camera.right = 50
    sun.shadow.camera.top = 50
    sun.shadow.camera.bottom = -50
    sun.shadow.bias = -0.001
    sun.shadow.normalBias = 0.02
    this.scene.add(sun)
    this.scene.add(sun.target)
  }

  private applyToonMaterials(): void {
    const gradientMap = createGradientMap(4)
    this.scene.traverse((o) => {
      const mesh = o as THREE.Mesh
      if (!mesh.isMesh || !mesh.material) return
      const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
      for (const mat of mats) {
        if (mat instanceof THREE.MeshToonMaterial) {
          mat.gradientMap = gradientMap
          mat.needsUpdate = true
        }
      }
    })
  }

  private buildWorld(): void {
    this.terrain = new Terrain(this.scene)
    this.addUpdatable(this.terrain)

    this.sky = new SkySystem(this.scene)
    this.addUpdatable(this.sky)

    this.water = new Water(this.scene)
    this.addUpdatable(this.water)

    this.vegetation = new Vegetation(this.scene, this.terrain)
    this.addUpdatable(this.vegetation)

    this.hotspotSystem = new HotspotSystem(
      this.scene,
      (x, z) => this.terrain.getHeight(x, z),
    )
    this.hotspotSystem.setProximityCallback((h) => this.onHotspotNearby?.(h))
    this.addUpdatable(this.hotspotSystem)

    this.character = new Character(
      this.scene,
      this.input,
      this.thirdPersonCamera,
      (x, z) => this.terrain.getHeight(x, z),
      new THREE.Vector3(0, 0, 0),
    )
    this.addUpdatable(this.character)

    this.applyToonMaterials()
    this.pipeline = new ToonPipeline(this.renderer, this.scene, this.camera)
  }

  addUpdatable(u: Updatable): void {
    this.updatables.push(u)
  }

  removeUpdatable(u: Updatable): void {
    const idx = this.updatables.indexOf(u)
    if (idx >= 0) this.updatables.splice(idx, 1)
  }

  private onKeyDown = (e: KeyboardEvent): void => {
    if (e.key === 'e' || e.key === 'E') {
      if (!this.interactionKeyPressed) {
        this.interactionKeyPressed = true
        this.onInteractRequest?.()
      }
    }
  }

  private onKeyUp = (e: KeyboardEvent): void => {
    if (e.key === 'e' || e.key === 'E') {
      this.interactionKeyPressed = false
    }
  }

  private animate(): void {
    this.raf = requestAnimationFrame(() => this.animate())
    const dt = Math.min(this.clock.getDelta(), 0.05)
    const time = this.clock.elapsedTime

    if (this.character && this.hotspotSystem) {
      this.hotspotSystem.setPlayerPosition(this.character.group.position)
    }

    for (const u of this.updatables) {
      u.update(dt, time)
    }

    this.pipeline.render()

    if (!this.ready) {
      this.ready = true
      this.onReady?.()
    }
  }

  private onResize = (): void => {
    const container = this.renderer.domElement.parentElement!
    const w = container.clientWidth
    const h = container.clientHeight
    this.camera.aspect = w / h
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(w, h)
    this.pipeline.setSize(w, h)
  }

  private bindEvents(): void {
    window.addEventListener('resize', this.onResize)
    window.addEventListener('keydown', this.onKeyDown)
    window.addEventListener('keyup', this.onKeyUp)
  }

  private unbindEvents(): void {
    window.removeEventListener('resize', this.onResize)
    window.removeEventListener('keydown', this.onKeyDown)
    window.removeEventListener('keyup', this.onKeyUp)
  }

  dispose(): void {
    cancelAnimationFrame(this.raf)
    this.input.unbind()
    this.unbindEvents()
    this.pipeline.dispose()
    this.hotspotSystem.dispose()
    this.updatables.length = 0
    this.scene.traverse((o) => {
      const obj = o as THREE.Mesh
      if (obj.geometry) obj.geometry.dispose()
      if (obj.material) {
        const mats = Array.isArray(obj.material) ? obj.material : [obj.material]
        for (const m of mats) {
          if (m.map) m.map.dispose()
          m.dispose()
        }
      }
    })
    this.renderer.dispose()
    const parent = this.renderer.domElement.parentElement
    if (parent && parent.contains(this.renderer.domElement)) {
      parent.removeChild(this.renderer.domElement)
    }
  }

}
