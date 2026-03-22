import { useEffect, useRef } from 'react'
import * as THREE from 'three'

// ─── Utilities ───────────────────────────────────────────────────

/** Deterministic pseudo-random (project convention) */
function hash(n: number): number {
  return ((Math.sin(n * 127.1 + 311.7) * 43758.5453) % 1 + 1) % 1
}

/** Soft circular glow texture generated from canvas */
function createGlowTexture(size = 128): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!
  const c = size / 2
  const grad = ctx.createRadialGradient(c, c, 0, c, c, c)
  grad.addColorStop(0, 'rgba(255,255,255,1)')
  grad.addColorStop(0.08, 'rgba(255,255,255,0.85)')
  grad.addColorStop(0.35, 'rgba(255,255,255,0.18)')
  grad.addColorStop(0.7, 'rgba(255,255,255,0.03)')
  grad.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, size, size)
  return new THREE.CanvasTexture(canvas)
}

/** Sin/cos flow field — cheap organic divergence-free motion */
function flowVelocity(
  x: number, y: number, z: number, t: number,
): [number, number, number] {
  const s = 0.035
  return [
    Math.sin(y * s * 1.4 + t * 0.18) * 0.5 + Math.cos(z * s * 0.9 + t * 0.13) * 0.25,
    Math.cos(z * s * 1.1 + t * 0.15) * 0.4 + Math.sin(x * s * 0.7 + t * 0.11) * 0.25,
    Math.sin(x * s * 0.8 + t * 0.12) * 0.2 + Math.cos(y * s * 1.2 + t * 0.08) * 0.15,
  ]
}

// ─── Theme Colors ────────────────────────────────────────────────

const CLR = {
  bg: 0x0c0c0e,
  gold: new THREE.Color(0xd4af37),
  lightGold: new THREE.Color(0xf2d288),
  warmGold: new THREE.Color(0xc9a030),
  pearl: new THREE.Color(0xfcfcfc),
  muted: new THREE.Color(0xa1a1aa),
}

// ─── Configuration ───────────────────────────────────────────────

const FLOW_COUNT = 4000
const NODE_COUNT = 100
const DUST_COUNT = 2000
const BOUNDS = 120
const CONNECT_DIST = 20
const MAX_LINES = 400

// ─── Component ───────────────────────────────────────────────────

export default function ThreeBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mouseRef = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const motionScale = reducedMotion ? 0.1 : 1

    // ── Core Setup ───────────────────────────────────────────────

    const scene = new THREE.Scene()
    scene.fog = new THREE.FogExp2(CLR.bg, 0.005)

    const camera = new THREE.PerspectiveCamera(
      60, window.innerWidth / window.innerHeight, 0.1, 500,
    )
    camera.position.z = 80

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: false })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor(CLR.bg, 1)

    const glowTex = createGlowTexture()
    const disposables: { dispose(): void }[] = [glowTex, renderer]

    // Helper: create a Points system
    function makePoints(
      count: number,
      initFn: (i: number, pos: Float32Array, col: Float32Array) => void,
      size: number,
      opacity: number,
    ) {
      const pos = new Float32Array(count * 3)
      const col = new Float32Array(count * 3)
      for (let i = 0; i < count; i++) initFn(i, pos, col)
      const geom = new THREE.BufferGeometry()
      geom.setAttribute('position', new THREE.BufferAttribute(pos, 3))
      geom.setAttribute('color', new THREE.BufferAttribute(col, 3))
      const mat = new THREE.PointsMaterial({
        size,
        map: glowTex,
        vertexColors: true,
        transparent: true,
        opacity,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        sizeAttenuation: true,
      })
      const points = new THREE.Points(geom, mat)
      scene.add(points)
      disposables.push(geom, mat)
      return { geom, points, pos }
    }

    // ═══════════════════════════════════════════════════════════════
    //  LAYER 1 — Nebula: soft ambient golden glow
    // ═══════════════════════════════════════════════════════════════

    const nebulaSprites: THREE.Sprite[] = []
    const nebulaConfigs = [
      { pos: [-40, 25, -90] as const, scale: 90 },
      { pos: [55, -20, -110] as const, scale: 100 },
      { pos: [5, 10, -70] as const, scale: 70 },
      { pos: [-25, -35, -100] as const, scale: 80 },
      { pos: [35, 40, -80] as const, scale: 75 },
    ]
    nebulaConfigs.forEach(({ pos, scale }, i) => {
      const mat = new THREE.SpriteMaterial({
        map: glowTex,
        color: i % 2 === 0 ? CLR.gold : CLR.warmGold,
        transparent: true,
        opacity: 0.025,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
      const sprite = new THREE.Sprite(mat)
      sprite.position.set(pos[0], pos[1], pos[2])
      sprite.scale.set(scale, scale, 1)
      scene.add(sprite)
      nebulaSprites.push(sprite)
      disposables.push(mat)
    })

    // ═══════════════════════════════════════════════════════════════
    //  LAYER 2 — Flow Particles: organic flowing streams
    // ═══════════════════════════════════════════════════════════════

    const flow = makePoints(
      FLOW_COUNT,
      (i, pos, col) => {
        pos[i * 3] = (hash(i * 3) - 0.5) * BOUNDS * 2
        pos[i * 3 + 1] = (hash(i * 3 + 1) - 0.5) * BOUNDS * 2
        pos[i * 3 + 2] = (hash(i * 3 + 2) - 0.5) * BOUNDS * 2
        const r = hash(i * 7 + 13)
        const c = r < 0.45 ? CLR.gold : r < 0.7 ? CLR.lightGold : r < 0.88 ? CLR.warmGold : CLR.pearl
        col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b
      },
      0.7, 0.55,
    )

    // ═══════════════════════════════════════════════════════════════
    //  LAYER 3 — Network: orbiting nodes + dynamic connections
    // ═══════════════════════════════════════════════════════════════

    interface NodeOrbit {
      radius: number; speed: number; phase: number
      tilt: number; elevate: number
      x: number; y: number; z: number
    }
    const orbits: NodeOrbit[] = []

    const nodes = makePoints(
      NODE_COUNT,
      (i, pos, col) => {
        orbits.push({
          radius: 12 + hash(i * 31) * 50,
          speed: (0.02 + hash(i * 37) * 0.05) * (hash(i * 41) > 0.5 ? 1 : -1),
          phase: hash(i * 43) * Math.PI * 2,
          tilt: (hash(i * 47) - 0.5) * Math.PI * 0.7,
          elevate: (hash(i * 53) - 0.5) * 30,
          x: 0, y: 0, z: 0,
        })
        pos[i * 3] = 0; pos[i * 3 + 1] = 0; pos[i * 3 + 2] = 0
        const r = hash(i * 59)
        const c = r < 0.55 ? CLR.gold : r < 0.8 ? CLR.lightGold : CLR.pearl
        col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b
      },
      2.0, 0.85,
    )

    // Dynamic golden connection lines
    const linePos = new Float32Array(MAX_LINES * 6)
    const lineCol = new Float32Array(MAX_LINES * 6)
    const lineGeom = new THREE.BufferGeometry()
    lineGeom.setAttribute('position', new THREE.BufferAttribute(linePos, 3))
    lineGeom.setAttribute('color', new THREE.BufferAttribute(lineCol, 3))
    lineGeom.setDrawRange(0, 0)
    const lineMat = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.3,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
    const linesMesh = new THREE.LineSegments(lineGeom, lineMat)
    scene.add(linesMesh)
    disposables.push(lineGeom, lineMat)

    // ═══════════════════════════════════════════════════════════════
    //  LAYER 4 — Ambient Dust: tiny dim particles for atmosphere
    // ═══════════════════════════════════════════════════════════════

    const dust = makePoints(
      DUST_COUNT,
      (i, pos, col) => {
        pos[i * 3] = (hash(i * 67 + 100) - 0.5) * BOUNDS * 2.5
        pos[i * 3 + 1] = (hash(i * 71 + 200) - 0.5) * BOUNDS * 2.5
        pos[i * 3 + 2] = (hash(i * 73 + 300) - 0.5) * BOUNDS * 2.5
        const dim = 0.25 + hash(i * 79) * 0.3
        col[i * 3] = CLR.muted.r * dim
        col[i * 3 + 1] = CLR.muted.g * dim
        col[i * 3 + 2] = CLR.muted.b * dim
      },
      0.25, 0.25,
    )

    // ═══════════════════════════════════════════════════════════════
    //  LAYER 5 — Wireframe Geometry Accents
    // ═══════════════════════════════════════════════════════════════

    const wireMat = new THREE.MeshBasicMaterial({
      color: CLR.gold,
      wireframe: true,
      transparent: true,
      opacity: 0.05,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })

    const octaGeom = new THREE.OctahedronGeometry(9, 0)
    const octa = new THREE.Mesh(octaGeom, wireMat.clone())
    octa.position.set(-38, 22, -45)
    scene.add(octa)

    const icoGeom = new THREE.IcosahedronGeometry(7, 0)
    const ico = new THREE.Mesh(icoGeom, wireMat.clone())
    ico.position.set(42, -18, -35)
    scene.add(ico)

    const torusGeom = new THREE.TorusGeometry(11, 0.4, 8, 40)
    const torus = new THREE.Mesh(torusGeom, wireMat.clone())
    torus.position.set(10, 35, -55)
    scene.add(torus)

    disposables.push(
      octaGeom, icoGeom, torusGeom, wireMat,
      octa.material as THREE.Material,
      ico.material as THREE.Material,
      torus.material as THREE.Material,
    )

    // ═══════════════════════════════════════════════════════════════
    //  ANIMATION LOOP
    // ═══════════════════════════════════════════════════════════════

    let raf = 0
    let prev = performance.now()
    let time = 0

    const animate = (now: number) => {
      raf = requestAnimationFrame(animate)
      const dt = Math.min((now - prev) / 1000, 0.1)
      prev = now
      time += dt * motionScale

      // ── Camera parallax from mouse position ──
      camera.position.x += (mouseRef.current.x * 8 - camera.position.x) * 0.015
      camera.position.y += (mouseRef.current.y * 5 - camera.position.y) * 0.015
      camera.lookAt(0, 0, 0)

      // ── Flow particles: follow flow field ──
      const fp = flow.pos
      for (let i = 0; i < FLOW_COUNT; i++) {
        const ix = i * 3
        const [vx, vy, vz] = flowVelocity(fp[ix], fp[ix + 1], fp[ix + 2], time)
        fp[ix] += vx * dt * 4 * motionScale
        fp[ix + 1] += vy * dt * 4 * motionScale
        fp[ix + 2] += vz * dt * 4 * motionScale
        // Wrap around bounds
        for (let a = 0; a < 3; a++) {
          if (fp[ix + a] > BOUNDS) fp[ix + a] -= BOUNDS * 2
          if (fp[ix + a] < -BOUNDS) fp[ix + a] += BOUNDS * 2
        }
      }
      flow.geom.attributes.position.needsUpdate = true
      // Gentle global rotation for added drift
      flow.points.rotation.y += dt * 0.006 * motionScale

      // ── Network nodes: orbital motion ──
      const np = nodes.pos
      for (let i = 0; i < NODE_COUNT; i++) {
        const o = orbits[i]
        const angle = o.phase + time * o.speed
        o.x = Math.cos(angle) * o.radius
        o.y = o.elevate + Math.sin(angle) * o.radius * Math.sin(o.tilt) * 0.5
        o.z = Math.sin(angle) * o.radius * Math.cos(o.tilt) * 0.4
        np[i * 3] = o.x
        np[i * 3 + 1] = o.y
        np[i * 3 + 2] = o.z
      }
      nodes.geom.attributes.position.needsUpdate = true

      // ── Dynamic connections with energy pulse ──
      let li = 0
      const pulse = time * 0.4
      for (let i = 0; i < NODE_COUNT && li < MAX_LINES; i++) {
        for (let j = i + 1; j < NODE_COUNT && li < MAX_LINES; j++) {
          const dx = orbits[i].x - orbits[j].x
          const dy = orbits[i].y - orbits[j].y
          const dz = orbits[i].z - orbits[j].z
          const d = Math.sqrt(dx * dx + dy * dy + dz * dz)
          if (d < CONNECT_DIST) {
            const fade = 1 - d / CONNECT_DIST
            const p = Math.sin(pulse + (i + j) * 0.37) * 0.5 + 0.5
            const b = fade * (0.3 + p * 0.7)
            const ci = li * 6
            linePos[ci] = orbits[i].x;     linePos[ci + 1] = orbits[i].y; linePos[ci + 2] = orbits[i].z
            linePos[ci + 3] = orbits[j].x; linePos[ci + 4] = orbits[j].y; linePos[ci + 5] = orbits[j].z
            const gr = CLR.gold.r * b, gg = CLR.gold.g * b, gb = CLR.gold.b * b
            lineCol[ci] = gr;     lineCol[ci + 1] = gg; lineCol[ci + 2] = gb
            lineCol[ci + 3] = gr; lineCol[ci + 4] = gg; lineCol[ci + 5] = gb
            li++
          }
        }
      }
      lineGeom.setDrawRange(0, li * 2)
      lineGeom.attributes.position.needsUpdate = true
      lineGeom.attributes.color.needsUpdate = true

      // ── Dust: slow drift ──
      dust.points.rotation.y += dt * 0.003 * motionScale
      dust.points.rotation.x += dt * 0.001 * motionScale

      // ── Nebula: breathing opacity ──
      nebulaSprites.forEach((s, i) => {
        ;(s.material as THREE.SpriteMaterial).opacity =
          0.02 + Math.sin(time * 0.15 + i * 1.8) * 0.015
      })

      // ── Wireframes: slow rotation ──
      octa.rotation.x += dt * 0.06 * motionScale
      octa.rotation.y += dt * 0.09 * motionScale
      ico.rotation.x += dt * 0.07 * motionScale
      ico.rotation.z += dt * 0.05 * motionScale
      torus.rotation.x += dt * 0.035 * motionScale
      torus.rotation.y += dt * 0.06 * motionScale

      renderer.render(scene, camera)
    }

    raf = requestAnimationFrame(animate)

    // ── Events ───────────────────────────────────────────────────

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }
    const onMouse = (e: MouseEvent) => {
      mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1
      mouseRef.current.y = -(e.clientY / window.innerHeight) * 2 + 1
    }
    window.addEventListener('resize', onResize)
    window.addEventListener('mousemove', onMouse)

    // ── Cleanup ──────────────────────────────────────────────────

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('mousemove', onMouse)
      disposables.forEach(d => d.dispose())
      scene.clear()
    }
  }, [])

  return (
    <div
      className="fixed inset-0 z-[-2]"
      aria-hidden="true"
      style={{ pointerEvents: 'none' }}
    >
      <canvas ref={canvasRef} className="block w-full h-full" />
      {/* Cinematic vignette overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 80% 70% at 50% 50%, transparent 30%, rgba(12,12,14,0.65) 100%)',
        }}
      />
    </div>
  )
}
