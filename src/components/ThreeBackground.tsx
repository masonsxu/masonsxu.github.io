import { useEffect, useRef, useState } from 'react'
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  CatmullRomCurve3,
  Color,
  DynamicDrawUsage,
  FogExp2,
  Group,
  PerspectiveCamera,
  Points,
  PointsMaterial,
  Scene,
  Vector3,
  WebGLRenderer,
} from 'three'

const BG = 0x0a0a0c
const WORLD_UP = new Vector3(0, 1, 0)
const ALT_UP = new Vector3(0, 0, 1)

const PALETTE = {
  gold: new Color(0xd4af37),
  lightGold: new Color(0xf2d288),
  pearl: new Color(0xfcfcfc),
  shadow: new Color(0x101115),
}

type ViewportState = {
  width: number
  height: number
  mobile: boolean
  pixelRatio: number
}

type SceneConfig = {
  mobile: boolean
  reduced: boolean
  dustCount: number
  veilCount: number
  emberCount: number
  spineCount: number
  motion: number
}

type PointLayer = {
  positions: Float32Array
  colors: Float32Array
  positionAttr: BufferAttribute
  colorAttr: BufferAttribute
  geometry: BufferGeometry
  material: PointsMaterial
  points: Points
}

type VeilParticle = {
  pathIndex: number
  t: number
  offsetU: number
  offsetV: number
  radius: number
  phase: number
  speed: number
  tone: number
  drift: number
}

type DustParticle = {
  base: Vector3
  phase: number
  drift: number
  glow: number
}

type Ember = {
  pathIndex: number
  t: number
  speed: number
  phase: number
  bias: number
}

type SpineParticle = {
  pathIndex: number
  t: number
  phase: number
  width: number
  drift: number
  brightness: number
}

type HaloAnchor = {
  pathIndex: number
  t: number
  phase: number
  spread: number
}

function h(n: number): number {
  return ((Math.sin(n * 127.1 + 311.7) * 43758.5453) % 1 + 1) % 1
}

function makeGlow(coreSharpness = 0.12, softEdge = 0.38, size = 96) {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size

  const ctx = canvas.getContext('2d')!
  const c = size / 2
  const gradient = ctx.createRadialGradient(c, c, 0, c, c, c)
  gradient.addColorStop(0, 'rgba(255,255,255,1)')
  gradient.addColorStop(coreSharpness, 'rgba(255,255,255,0.88)')
  gradient.addColorStop(softEdge, 'rgba(255,255,255,0.16)')
  gradient.addColorStop(0.72, 'rgba(255,255,255,0.03)')
  gradient.addColorStop(1, 'rgba(255,255,255,0)')

  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, size, size)

  return new CanvasTexture(canvas)
}

function getViewportState(): ViewportState {
  const mobile = window.innerWidth < 768

  return {
    width: window.innerWidth,
    height: window.innerHeight,
    mobile,
    pixelRatio: Math.min(window.devicePixelRatio, mobile ? 1.05 : 1.28),
  }
}

function getSceneConfig(mobile: boolean, reduced: boolean): SceneConfig {
  return {
    mobile,
    reduced,
    dustCount: reduced ? (mobile ? 96 : 170) : mobile ? 200 : 320,
    veilCount: reduced ? (mobile ? 280 : 440) : mobile ? 560 : 960,
    emberCount: reduced ? (mobile ? 4 : 6) : mobile ? 8 : 14,
    spineCount: reduced ? (mobile ? 96 : 144) : mobile ? 160 : 228,
    motion: reduced ? 0.18 : 1,
  }
}

function createPointLayer(
  count: number,
  materialOptions: ConstructorParameters<typeof PointsMaterial>[0],
  texture: CanvasTexture,
): PointLayer {
  const positions = new Float32Array(count * 3)
  const colors = new Float32Array(count * 3)
  const geometry = new BufferGeometry()
  const positionAttr = new BufferAttribute(positions, 3)
  const colorAttr = new BufferAttribute(colors, 3)

  positionAttr.setUsage(DynamicDrawUsage)
  colorAttr.setUsage(DynamicDrawUsage)
  geometry.setAttribute('position', positionAttr)
  geometry.setAttribute('color', colorAttr)

  const material = new PointsMaterial({
    ...materialOptions,
    map: texture,
    sizeAttenuation: true,
    transparent: true,
    blending: AdditiveBlending,
    depthWrite: false,
    vertexColors: true,
  })

  const points = new Points(geometry, material)
  points.frustumCulled = false

  return {
    positions,
    colors,
    positionAttr,
    colorAttr,
    geometry,
    material,
    points,
  }
}

function markLayerNeedsUpdate(...layers: PointLayer[]) {
  for (const layer of layers) {
    layer.positionAttr.needsUpdate = true
    layer.colorAttr.needsUpdate = true
  }
}

function getSilkPaths(mobile: boolean) {
  if (mobile) {
    return [
      new CatmullRomCurve3([
        new Vector3(10, 26, -24),
        new Vector3(18, 18, -10),
        new Vector3(32, 10, 4),
        new Vector3(50, -10, 18),
      ], false, 'catmullrom', 0.4),
      new CatmullRomCurve3([
        new Vector3(12, -18, -18),
        new Vector3(26, -8, -4),
        new Vector3(40, 6, 10),
        new Vector3(56, 24, 22),
      ], false, 'catmullrom', 0.42),
      new CatmullRomCurve3([
        new Vector3(20, 30, -8),
        new Vector3(32, 18, 2),
        new Vector3(46, -2, 14),
        new Vector3(62, -22, 26),
      ], false, 'catmullrom', 0.38),
    ]
  }

  return [
    new CatmullRomCurve3([
      new Vector3(10, 30, -28),
      new Vector3(24, 20, -12),
      new Vector3(46, 10, 4),
      new Vector3(78, -18, 20),
    ], false, 'catmullrom', 0.4),
    new CatmullRomCurve3([
      new Vector3(16, -24, -22),
      new Vector3(32, -10, -8),
      new Vector3(56, 10, 8),
      new Vector3(88, 30, 24),
    ], false, 'catmullrom', 0.42),
    new CatmullRomCurve3([
      new Vector3(26, 34, -10),
      new Vector3(42, 18, 0),
      new Vector3(62, -4, 14),
      new Vector3(92, -26, 28),
    ], false, 'catmullrom', 0.38),
  ]
}

function sampleFrame(
  curve: CatmullRomCurve3,
  t: number,
  position: Vector3,
  normal: Vector3,
  binormal: Vector3,
  tangent: Vector3,
) {
  curve.getPointAt(t, position)
  curve.getTangentAt(t, tangent).normalize()

  const up = Math.abs(tangent.dot(WORLD_UP)) > 0.94 ? ALT_UP : WORLD_UP
  normal.copy(up).cross(tangent).normalize()

  if (normal.lengthSq() < 1e-4) {
    normal.set(1, 0, 0).cross(tangent).normalize()
  }

  binormal.copy(tangent).cross(normal).normalize()
}

export default function ThreeBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mouseRef = useRef({ x: 0, y: 0 })
  const [disabled, setDisabled] = useState(false)

  useEffect(() => {
    if (disabled) return

    const canvas = canvasRef.current
    if (!canvas) return

    let raf = 0
    let resizeRaf = 0
    let destroyed = false
    const disposables: { dispose(): void }[] = []

    const onPointerMove = (event: PointerEvent) => {
      mouseRef.current.x = (event.clientX / window.innerWidth) * 2 - 1
      mouseRef.current.y = -(event.clientY / window.innerHeight) * 2 + 1
    }

    const onPointerLeave = () => {
      mouseRef.current.x = 0
      mouseRef.current.y = 0
    }

    const onContextLost = (event: Event) => {
      event.preventDefault()
      destroyed = true
      cancelAnimationFrame(raf)
      if (resizeRaf !== 0) cancelAnimationFrame(resizeRaf)
      setDisabled(true)
    }

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const viewport = getViewportState()
    const config = getSceneConfig(viewport.mobile, reduced)
    const glow = makeGlow(0.12, 0.38, 96)
    const crispGlow = makeGlow(0.06, 0.24, 96)
    const silkPaths = getSilkPaths(config.mobile)
    const haloAnchors: HaloAnchor[] = config.mobile
      ? [
          { pathIndex: 0, t: 0.24, phase: 0.2, spread: 1.25 },
          { pathIndex: 1, t: 0.54, phase: 1.1, spread: 1.45 },
          { pathIndex: 2, t: 0.76, phase: 1.9, spread: 1.18 },
          { pathIndex: 0, t: 0.84, phase: 2.5, spread: 0.92 },
        ]
      : [
          { pathIndex: 0, t: 0.22, phase: 0.2, spread: 1.25 },
          { pathIndex: 1, t: 0.46, phase: 1.1, spread: 1.68 },
          { pathIndex: 2, t: 0.68, phase: 1.9, spread: 1.4 },
          { pathIndex: 0, t: 0.82, phase: 2.5, spread: 1.08 },
          { pathIndex: 1, t: 0.88, phase: 3.1, spread: 0.9 },
        ]

    disposables.push(glow, crispGlow)

    const scene = new Scene()
    scene.fog = new FogExp2(BG, config.mobile ? 0.0155 : 0.0115)

    const camera = new PerspectiveCamera(config.mobile ? 55 : 50, viewport.width / viewport.height, 0.1, 320)
    camera.position.set(0, 0, 112)

    const renderer = new WebGLRenderer({
      canvas,
      antialias: false,
      alpha: false,
      powerPreference: 'low-power',
    })
    renderer.setPixelRatio(viewport.pixelRatio)
    renderer.setSize(viewport.width, viewport.height)
    renderer.setClearColor(BG, 1)

    if (destroyed) {
      renderer.dispose()
      return
    }

    disposables.push(renderer)

    const auraGroup = new Group()
    auraGroup.position.x = config.mobile ? 1.5 : 5
    scene.add(auraGroup)

    const veilData: VeilParticle[] = []
    for (let i = 0; i < config.veilCount; i++) {
      const pathIndex = Math.min(silkPaths.length - 1, Math.floor(h(i * 5 + 1) * silkPaths.length))
      const t = 0.07 + h(i * 7 + 3) * 0.86
      const compression = 0.6 + (1 - Math.abs(t - 0.56) * 1.4)
      const spread = (config.mobile ? 4.4 : 7.1) * compression

      veilData.push({
        pathIndex,
        t,
        offsetU: (h(i * 11 + 5) - 0.5) * spread,
        offsetV: (h(i * 13 + 7) - 0.5) * spread * 0.72,
        radius: (0.18 + h(i * 17 + 11) * 1.16) * (config.mobile ? 1.35 : 2),
        phase: h(i * 19 + 13),
        speed: 0.07 + h(i * 23 + 17) * 0.14,
        tone: h(i * 29 + 19),
        drift: 0.0014 + h(i * 31 + 23) * 0.0052,
      })
    }

    const dustData: DustParticle[] = []
    for (let i = 0; i < config.dustCount; i++) {
      dustData.push({
        base: new Vector3(
          (h(i * 37 + 1) - 0.18) * (config.mobile ? 112 : 160),
          (h(i * 41 + 3) - 0.5) * (config.mobile ? 88 : 104),
          -(56 + h(i * 43 + 5) * 116),
        ),
        phase: h(i * 47 + 7),
        drift: 0.14 + h(i * 53 + 11) * 0.42,
        glow: h(i * 59 + 13),
      })
    }

    const emberData: Ember[] = []
    for (let i = 0; i < config.emberCount; i++) {
      emberData.push({
        pathIndex: i % silkPaths.length,
        t: h(i * 61 + 17),
        speed: 0.01 + h(i * 67 + 19) * 0.02,
        phase: h(i * 71 + 23),
        bias: h(i * 73 + 29),
      })
    }

    const spineData: SpineParticle[] = []
    for (let i = 0; i < config.spineCount; i++) {
      const pick = h(i * 79 + 3)
      const pathIndex = pick < 0.46 ? 0 : pick < 0.8 ? 1 : 2
      const t = 0.1 + h(i * 83 + 7) * 0.82
      const focus = 1 - Math.min(1, Math.abs(t - 0.56) * 1.45)

      spineData.push({
        pathIndex,
        t,
        phase: h(i * 89 + 11),
        width: (0.08 + h(i * 97 + 13) * 0.34) * (0.6 + focus * 0.55) * (config.mobile ? 0.76 : 1),
        drift: 0.0008 + h(i * 101 + 17) * 0.0016,
        brightness: 0.9 + h(i * 103 + 19) * 0.55,
      })
    }

    const veilLayer = createPointLayer(
      config.veilCount,
      {
        size: config.mobile ? 2.2 : 3,
        opacity: config.reduced ? 0.32 : 0.5,
      },
      glow,
    )
    auraGroup.add(veilLayer.points)

    const spineLayer = createPointLayer(
      config.spineCount,
      {
        size: config.mobile ? 3.4 : 4.6,
        opacity: config.reduced ? 0.34 : 0.64,
      },
      crispGlow,
    )
    auraGroup.add(spineLayer.points)

    const dustLayer = createPointLayer(
      config.dustCount,
      {
        size: config.mobile ? 1 : 1.25,
        opacity: config.reduced ? 0.16 : 0.28,
      },
      glow,
    )
    scene.add(dustLayer.points)

    const emberLayer = createPointLayer(
      config.emberCount,
      {
        size: config.mobile ? 5.2 : 7,
        opacity: config.reduced ? 0.5 : 0.82,
      },
      crispGlow,
    )
    auraGroup.add(emberLayer.points)

    const haloLayer = createPointLayer(
      haloAnchors.length,
      {
        size: config.mobile ? 22 : 32,
        opacity: config.reduced ? 0.08 : 0.16,
      },
      glow,
    )
    auraGroup.add(haloLayer.points)

    disposables.push(
      veilLayer.geometry,
      veilLayer.material,
      spineLayer.geometry,
      spineLayer.material,
      dustLayer.geometry,
      dustLayer.material,
      emberLayer.geometry,
      emberLayer.material,
      haloLayer.geometry,
      haloLayer.material,
    )

    const point = new Vector3()
    const normal = new Vector3()
    const binormal = new Vector3()
    const tangent = new Vector3()
    const offset = new Vector3()
    const scratchColorA = new Color()
    const scratchColorB = new Color()
    let previous = performance.now()

    const animate = (now: number) => {
      if (destroyed) return
      raf = requestAnimationFrame(animate)

      const delta = Math.min((now - previous) / 1000, 0.1)
      previous = now
      const time = now * 0.001
      const mouseX = mouseRef.current.x
      const mouseY = mouseRef.current.y

      for (let i = 0; i < veilData.length; i++) {
        const particle = veilData[i]
        const path = silkPaths[particle.pathIndex]
        const dynamicT = (particle.t + Math.sin(time * particle.speed + particle.phase * 8) * particle.drift * config.motion + 1) % 1

        sampleFrame(path, dynamicT, point, normal, binormal, tangent)

        const sway = Math.sin(time * (0.22 + particle.speed) + particle.phase * 11) * particle.radius * config.motion
        const lift = Math.cos(time * (0.18 + particle.speed * 0.8) + particle.phase * 13) * particle.radius * 0.72 * config.motion

        offset.copy(normal).multiplyScalar(particle.offsetU + sway)
        offset.addScaledVector(binormal, particle.offsetV + lift)
        point.add(offset)

        const band = 1 - Math.min(1, Math.abs(dynamicT - 0.56) * 1.48)
        const pulse = (Math.sin(time * (0.34 + particle.speed) + particle.phase * 17) + 1) * 0.5
        const intensity = 0.072 + band * 0.135 + pulse * 0.04 + particle.tone * 0.05

        scratchColorA.lerpColors(PALETTE.shadow, PALETTE.gold, 0.54 + band * 0.28)
        scratchColorB.copy(scratchColorA)
        scratchColorB.lerp(PALETTE.lightGold, 0.24 + band * 0.24)
        scratchColorB.lerp(PALETTE.pearl, Math.max(0, particle.tone - 0.84) * 1.4)
        scratchColorB.multiplyScalar(intensity)

        veilLayer.positions[i * 3] = point.x
        veilLayer.positions[i * 3 + 1] = point.y
        veilLayer.positions[i * 3 + 2] = point.z
        veilLayer.colors[i * 3] = scratchColorB.r
        veilLayer.colors[i * 3 + 1] = scratchColorB.g
        veilLayer.colors[i * 3 + 2] = scratchColorB.b
      }

      for (let i = 0; i < spineData.length; i++) {
        const particle = spineData[i]
        const path = silkPaths[particle.pathIndex]
        const dynamicT = (particle.t + Math.sin(time * 0.12 + particle.phase * 6) * particle.drift * config.motion + 1) % 1

        sampleFrame(path, dynamicT, point, normal, binormal, tangent)

        const focus = 1 - Math.min(1, Math.abs(dynamicT - 0.56) * 1.5)
        offset.copy(normal).multiplyScalar(Math.sin(time * 0.55 + particle.phase * 14) * particle.width * (0.18 + focus * 0.34))
        offset.addScaledVector(binormal, Math.cos(time * 0.42 + particle.phase * 16) * particle.width * 0.38)
        point.add(offset)

        const flare = 0.34 + ((Math.sin(time * 0.9 + particle.phase * 21) + 1) * 0.5) * 0.54
        scratchColorA.lerpColors(PALETTE.gold, PALETTE.pearl, 0.26 + focus * 0.46)
        scratchColorA.multiplyScalar((0.12 + focus * 0.16 + flare * 0.16) * particle.brightness)

        spineLayer.positions[i * 3] = point.x
        spineLayer.positions[i * 3 + 1] = point.y
        spineLayer.positions[i * 3 + 2] = point.z
        spineLayer.colors[i * 3] = scratchColorA.r
        spineLayer.colors[i * 3 + 1] = scratchColorA.g
        spineLayer.colors[i * 3 + 2] = scratchColorA.b
      }

      for (let i = 0; i < dustData.length; i++) {
        const particle = dustData[i]
        const driftX = Math.sin(time * 0.05 + particle.phase * 11) * particle.drift * config.motion
        const driftY = Math.cos(time * 0.035 + particle.phase * 13) * particle.drift * 0.7 * config.motion
        const twinkle = 0.01 + particle.glow * 0.024 + ((Math.sin(time * 0.24 + particle.phase * 19) + 1) * 0.5) * 0.008

        dustLayer.positions[i * 3] = particle.base.x + driftX
        dustLayer.positions[i * 3 + 1] = particle.base.y + driftY
        dustLayer.positions[i * 3 + 2] = particle.base.z

        scratchColorA.lerpColors(PALETTE.shadow, PALETTE.lightGold, 0.34)
        scratchColorA.multiplyScalar(twinkle)
        dustLayer.colors[i * 3] = scratchColorA.r
        dustLayer.colors[i * 3 + 1] = scratchColorA.g
        dustLayer.colors[i * 3 + 2] = scratchColorA.b
      }

      for (let i = 0; i < emberData.length; i++) {
        const ember = emberData[i]
        const path = silkPaths[ember.pathIndex]
        const travelT = (ember.t + time * ember.speed * config.motion) % 1

        sampleFrame(path, travelT, point, normal, binormal, tangent)
        point.addScaledVector(normal, Math.sin(time * 0.8 + ember.phase * 9) * (0.22 + ember.bias * 0.76))
        point.addScaledVector(binormal, Math.cos(time * 0.65 + ember.phase * 7) * (0.16 + ember.bias * 0.56))

        const pulse = 0.42 + ((Math.sin(time * 1.85 + ember.phase * 23) + 1) * 0.5) * 0.52
        scratchColorA.lerpColors(PALETTE.gold, PALETTE.pearl, 0.46 + ember.bias * 0.2)
        scratchColorA.multiplyScalar(0.18 + pulse * 0.52)

        emberLayer.positions[i * 3] = point.x
        emberLayer.positions[i * 3 + 1] = point.y
        emberLayer.positions[i * 3 + 2] = point.z
        emberLayer.colors[i * 3] = scratchColorA.r
        emberLayer.colors[i * 3 + 1] = scratchColorA.g
        emberLayer.colors[i * 3 + 2] = scratchColorA.b
      }

      for (let i = 0; i < haloAnchors.length; i++) {
        const halo = haloAnchors[i]
        const path = silkPaths[halo.pathIndex]

        sampleFrame(path, halo.t, point, normal, binormal, tangent)
        point.addScaledVector(binormal, Math.sin(time * 0.18 + halo.phase * 9) * halo.spread)
        point.addScaledVector(normal, Math.cos(time * 0.14 + halo.phase * 7) * halo.spread * 0.62)

        const breath = 0.038 + ((Math.sin(time * 0.22 + halo.phase * 11) + 1) * 0.5) * 0.095
        scratchColorA.lerpColors(PALETTE.gold, PALETTE.pearl, 0.12)
        scratchColorA.multiplyScalar(breath)

        haloLayer.positions[i * 3] = point.x
        haloLayer.positions[i * 3 + 1] = point.y
        haloLayer.positions[i * 3 + 2] = point.z
        haloLayer.colors[i * 3] = scratchColorA.r
        haloLayer.colors[i * 3 + 1] = scratchColorA.g
        haloLayer.colors[i * 3 + 2] = scratchColorA.b
      }

      markLayerNeedsUpdate(veilLayer, spineLayer, dustLayer, emberLayer, haloLayer)

      auraGroup.rotation.y += (mouseX * 0.044 - auraGroup.rotation.y) * 0.03
      auraGroup.rotation.x += ((mouseY * 0.024 - 0.013) - auraGroup.rotation.x) * 0.026
      auraGroup.position.y = Math.sin(time * 0.11) * 0.56 * config.motion
      dustLayer.points.rotation.y += delta * 0.008 * config.motion
      dustLayer.points.rotation.x = -0.12 + Math.sin(time * 0.08) * 0.018

      camera.position.x += (mouseX * 1.45 - camera.position.x) * 0.016
      camera.position.y += (mouseY * 0.96 - camera.position.y) * 0.016
      camera.lookAt(config.mobile ? 18 : 28, 0, 0)

      renderer.render(scene, camera)
    }

    const applyResize = () => {
      resizeRaf = 0
      const nextViewport = getViewportState()
      camera.aspect = nextViewport.width / nextViewport.height
      camera.updateProjectionMatrix()
      renderer.setPixelRatio(nextViewport.pixelRatio)
      renderer.setSize(nextViewport.width, nextViewport.height)
    }

    const onResize = () => {
      if (resizeRaf !== 0) return
      resizeRaf = requestAnimationFrame(applyResize)
    }

    canvas.addEventListener('webglcontextlost', onContextLost, false)
    window.addEventListener('pointermove', onPointerMove, { passive: true })
    window.addEventListener('pointerleave', onPointerLeave)
    window.addEventListener('resize', onResize)
    disposables.push({ dispose: () => window.removeEventListener('resize', onResize) })

    raf = requestAnimationFrame(animate)

    return () => {
      destroyed = true
      cancelAnimationFrame(raf)
      if (resizeRaf !== 0) cancelAnimationFrame(resizeRaf)
      canvas.removeEventListener('webglcontextlost', onContextLost)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerleave', onPointerLeave)
      window.removeEventListener('resize', onResize)
      disposables.forEach((item) => item.dispose())
    }
  }, [disabled])

  return (
    <div className="fixed inset-0 z-[-2] overflow-hidden" aria-hidden="true" style={{ pointerEvents: 'none' }}>
      {!disabled && <canvas ref={canvasRef} className="block h-full w-full" />}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(90deg, rgba(7,7,9,0.96) 0%, rgba(7,7,9,0.91) 24%, rgba(7,7,9,0.5) 46%, rgba(7,7,9,0.1) 70%, rgba(7,7,9,0.3) 100%)',
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 79% 30%, rgba(212,175,55,0.19) 0%, rgba(212,175,55,0.1) 15%, rgba(212,175,55,0.028) 28%, rgba(10,10,12,0) 46%)',
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 72% 56%, rgba(242,210,136,0.082) 0%, rgba(242,210,136,0.032) 15%, rgba(10,10,12,0) 32%)',
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 64% 54%, rgba(255,248,230,0.048) 0%, rgba(255,248,230,0.02) 11%, rgba(10,10,12,0) 30%)',
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at center, rgba(10,10,12,0) 38%, rgba(10,10,12,0.3) 70%, rgba(5,5,7,0.88) 100%)',
        }}
      />
    </div>
  )
}
