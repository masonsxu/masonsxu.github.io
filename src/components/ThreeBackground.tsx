import { useEffect, useRef } from 'react'
import {
  WebGPURenderer,
  PerspectiveCamera,
  Scene,
  FogExp2,
  Color,
  Points,
  BufferGeometry,
  BufferAttribute,
  PointsNodeMaterial,
  StorageBufferAttribute,
  AdditiveBlending,
  CanvasTexture,
  RenderPipeline,
} from 'three/webgpu'
import {
  Fn,
  storage,
  instanceIndex,
  uniform,
  float,
  vec3,
  vec4,
  sin,
  cos,
  If,
  screenUV,
  pass,
  time,
} from 'three/tsl'
import { bloom as bloomFn } from 'three/examples/jsm/tsl/display/BloomNode.js'

// ─── Theme ───────────────────────────────────────────────────────

const BG = 0x0a0a0c

const PALETTE = {
  gold:      new Color(0xd4af37),
  lightGold: new Color(0xf2d288),
  warmGold:  new Color(0xc9a030),
  pearl:     new Color(0xfcfcfc),
  dim:       new Color(0x3a3a40),
}

// ─── Configuration ───────────────────────────────────────────────

function getConfig() {
  const mobile = typeof window !== 'undefined' && window.innerWidth < 768
  return {
    count: mobile ? 30000 : 60000,
    bounds: 140,
  }
}

// ─── Soft glow sprite ────────────────────────────────────────────

function makeGlow() {
  const s = 64, canvas = document.createElement('canvas')
  canvas.width = s; canvas.height = s
  const ctx = canvas.getContext('2d')!
  const c = s / 2
  const g = ctx.createRadialGradient(c, c, 0, c, c, c)
  g.addColorStop(0,    'rgba(255,255,255,1)')
  g.addColorStop(0.1,  'rgba(255,255,255,0.7)')
  g.addColorStop(0.4,  'rgba(255,255,255,0.1)')
  g.addColorStop(0.75, 'rgba(255,255,255,0.02)')
  g.addColorStop(1,    'rgba(255,255,255,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, s, s)
  return new CanvasTexture(canvas)
}

// ─── Deterministic hash ─────────────────────────────────────────

function h(n: number): number {
  return ((Math.sin(n * 127.1 + 311.7) * 43758.5453) % 1 + 1) % 1
}

// ─── Component ───────────────────────────────────────────────────

export default function ThreeBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mouseRef  = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    let raf = 0
    let destroyed = false
    const disposables: { dispose(): void }[] = []

    const onMouse = (e: MouseEvent) => {
      mouseRef.current.x = (e.clientX / window.innerWidth)  * 2 - 1
      mouseRef.current.y = -(e.clientY / window.innerHeight) * 2 + 1
    }
    window.addEventListener('mousemove', onMouse, { passive: true })

    ;(async () => {
      const cfg = getConfig()
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      const motion  = reduced ? 0.1 : 1

      // ── Renderer ─────────────────────────────────────────────

      const scene = new Scene()
      scene.fog = new FogExp2(BG, 0.006)

      const camera = new PerspectiveCamera(
        55, window.innerWidth / window.innerHeight, 0.1, 400,
      )
      camera.position.z = 90

      const renderer = new WebGPURenderer({ canvas, antialias: false })
      renderer.setSize(window.innerWidth, window.innerHeight)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
      renderer.setClearColor(BG, 1)

      try { await renderer.init() } catch { return }
      if (destroyed) { renderer.dispose(); return }

      const glow = makeGlow()
      disposables.push(glow, renderer)

      // ── Particles ────────────────────────────────────────────
      //
      // Three depth tiers give natural layering:
      //   - ~10% bright gold "hero" particles (large, close)
      //   - ~30% medium warm tones (mid-field)
      //   - ~60% dim dust (far, tiny) — these give atmosphere
      //

      const N = cfg.count
      const initPos  = new Float32Array(N * 3)
      const initCol  = new Float32Array(N * 3)
      const initSize = new Float32Array(N)

      for (let i = 0; i < N; i++) {
        // Spread with slight center bias for natural clustering
        const r = h(i * 3)
        const spread = cfg.bounds * (0.6 + r * 0.8)
        initPos[i * 3]     = (h(i * 3)     - 0.5) * spread * 2
        initPos[i * 3 + 1] = (h(i * 3 + 1) - 0.5) * spread * 2
        initPos[i * 3 + 2] = (h(i * 3 + 2) - 0.5) * spread * 2

        // Depth tier determines color & brightness
        const tier = h(i * 11 + 7)
        let c: Color
        let brightness: number
        let size: number

        if (tier < 0.08) {
          // Hero: bright gold or pearl — rare, eye-catching
          c = h(i * 13) < 0.6 ? PALETTE.lightGold : PALETTE.pearl
          brightness = 0.8 + h(i * 17) * 0.2
          size = 1.2 + h(i * 19) * 0.8
        } else if (tier < 0.35) {
          // Mid: warm gold tones
          c = h(i * 23) < 0.5 ? PALETTE.gold : PALETTE.warmGold
          brightness = 0.3 + h(i * 29) * 0.25
          size = 0.5 + h(i * 31) * 0.4
        } else {
          // Dust: dim, monochrome
          c = PALETTE.dim
          brightness = 0.08 + h(i * 37) * 0.12
          size = 0.2 + h(i * 41) * 0.25
        }

        initCol[i * 3]     = c.r * brightness
        initCol[i * 3 + 1] = c.g * brightness
        initCol[i * 3 + 2] = c.b * brightness
        initSize[i] = size
      }

      const posBuf  = new StorageBufferAttribute(initPos, 3)
      const colBuf  = new StorageBufferAttribute(initCol, 3)
      const sizeBuf = new StorageBufferAttribute(initSize, 1)

      const posStore  = storage(posBuf, 'vec3', N)
      const colStore  = storage(colBuf, 'vec3', N)
      const sizeStore = storage(sizeBuf, 'float', N)

      const uMx = uniform(0)
      const uMy = uniform(0)
      const uMotion = uniform(motion)
      const uBounds = uniform(cfg.bounds)

      // ── Compute: gentle curl flow + soft mouse influence ───

      const computeFlow = Fn(() => {
        const i   = instanceIndex
        const pos = posStore.element(i)
        const t   = time.mul(uMotion)

        // Slow, layered curl noise — organic, not mechanical
        const s = float(0.02)
        const vx = sin(pos.y.mul(s).mul(1.3).add(t.mul(0.12))).mul(0.3)
          .add(cos(pos.z.mul(s).mul(0.7).add(t.mul(0.08))).mul(0.15))
        const vy = cos(pos.z.mul(s).mul(0.9).add(t.mul(0.10))).mul(0.25)
          .add(sin(pos.x.mul(s).mul(0.5).add(t.mul(0.07))).mul(0.12))
        const vz = sin(pos.x.mul(s).mul(0.6).add(t.mul(0.06))).mul(0.1)
          .add(cos(pos.y.mul(s).mul(0.8).add(t.mul(0.05))).mul(0.08))

        // Mouse: gentle breeze, not a magnet
        const mw   = vec3(uMx.mul(40), uMy.mul(25), float(0))
        const diff = mw.sub(pos)
        const dist = diff.length().max(1.0)
        const push = diff.normalize().mul(float(2.0).div(dist.add(15.0)))

        const speed = float(0.04).mul(uMotion)
        pos.addAssign(vec3(vx, vy, vz).add(push.mul(0.08)).mul(speed))

        // Soft wrap
        const b = uBounds
        If(pos.x.greaterThan(b), () => { pos.x.subAssign(b.mul(2)) })
        If(pos.x.lessThan(b.negate()), () => { pos.x.addAssign(b.mul(2)) })
        If(pos.y.greaterThan(b), () => { pos.y.subAssign(b.mul(2)) })
        If(pos.y.lessThan(b.negate()), () => { pos.y.addAssign(b.mul(2)) })
        If(pos.z.greaterThan(b), () => { pos.z.subAssign(b.mul(2)) })
        If(pos.z.lessThan(b.negate()), () => { pos.z.addAssign(b.mul(2)) })
      })().compute(N)

      // ── Material ─────────────────────────────────────────────

      const mat = new PointsNodeMaterial({
        transparent: true,
        blending: AdditiveBlending,
        depthWrite: false,
        sizeAttenuation: true,
      })
      mat.size = 1
      mat.map = glow
      mat.positionNode  = posStore.toAttribute()
      mat.colorNode     = vec4(colStore.toAttribute(), 0.65)
      mat.sizeNode      = sizeStore.toAttribute()

      const geom = new BufferGeometry()
      geom.setAttribute('position', new BufferAttribute(new Float32Array(N * 3), 3))
      geom.drawRange.count = N

      const pts = new Points(geom, mat)
      pts.frustumCulled = false
      scene.add(pts)
      disposables.push(geom, mat)

      // ── Post-processing: soft bloom + deep vignette ──────────

      const pipeline = new RenderPipeline(renderer)
      const scenePass = pass(scene, camera)
      scenePass.setMRT(null)
      const color = scenePass.getTextureNode('output')

      // Gentle bloom — just enough to make bright particles glow
      const glow2 = bloomFn(color, 0.45, 0.6, 0.15)

      // Deep vignette — draws the eye inward, adds cinematic depth
      pipeline.outputNode = Fn(() => {
        const uv = screenUV
        const d  = uv.sub(0.5).length()
        const v  = float(1.0).sub(d.mul(1.6).pow(2.2)).clamp(0, 1)
        return color.add(glow2).mul(v)
      })()

      disposables.push(pipeline)

      if (destroyed) return

      // ── Animation ────────────────────────────────────────────

      let prev = performance.now()

      const animate = async (now: number) => {
        if (destroyed) return
        raf = requestAnimationFrame(animate)

        const dt = Math.min((now - prev) / 1000, 0.1)
        prev = now

        uMx.value = mouseRef.current.x
        uMy.value = mouseRef.current.y

        renderer.compute(computeFlow)

        // Very gentle camera drift from mouse — subtle parallax
        camera.position.x += (mouseRef.current.x * 4 - camera.position.x) * 0.008
        camera.position.y += (mouseRef.current.y * 3 - camera.position.y) * 0.008
        camera.lookAt(0, 0, 0)

        // Slow global rotation — gives the scene life without being busy
        pts.rotation.y += dt * 0.003 * motion
        pts.rotation.x += dt * 0.001 * motion

        await pipeline.renderAsync()
      }

      raf = requestAnimationFrame(animate)

      const onResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight
        camera.updateProjectionMatrix()
        renderer.setSize(window.innerWidth, window.innerHeight)
      }
      window.addEventListener('resize', onResize)
      disposables.push({ dispose: () => window.removeEventListener('resize', onResize) })
    })()

    return () => {
      destroyed = true
      cancelAnimationFrame(raf)
      window.removeEventListener('mousemove', onMouse)
      disposables.forEach(d => d.dispose())
    }
  }, [])

  return (
    <div
      className="fixed inset-0 z-[-2]"
      aria-hidden="true"
      style={{ pointerEvents: 'none' }}
    >
      <canvas ref={canvasRef} className="block w-full h-full" />
    </div>
  )
}
