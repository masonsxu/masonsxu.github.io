import { useEffect, useRef } from 'react'

type FieldDot = {
  lane: number
  depth: number
  phase: number
  speed: number
  sway: number
}

const TAU = Math.PI * 2

function hash(n: number) {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453123
  return x - Math.floor(x)
}

function createFieldDots(): FieldDot[] {
  const dots: FieldDot[] = []

  for (let lane = 0; lane < 28; lane += 1) {
    const depth = lane / 27
    const count = 20 + Math.floor(depth * 28)

    for (let i = 0; i < count; i += 1) {
      const id = lane * 1000 + i
      dots.push({
        lane,
        depth,
        phase: hash(id + 11),
        speed: (0.018 + depth * 0.05 + hash(id + 23) * 0.018) * 0.92,
        sway: (hash(id + 31) - 0.5) * 0.16,
      })
    }
  }

  return dots
}

function getWaveY(x: number, width: number, band: number, t: number, split: number) {
  const nx = x / Math.max(width, 1)
  const bandN = band / 27
  const baseY = 18 + bandN * (split - 36)
  const amp = 3.2 + (1 - bandN) * 14
  const freq = 1.1 + bandN * 3.1
  const speed = 0.38 + bandN * 0.8

  const a = Math.sin(nx * TAU * freq - t * speed + band * 0.49) * amp
  const b = Math.sin(nx * TAU * (freq * 2.25) + t * (speed * 1.47) + band * 0.91) * amp * 0.34
  const c = Math.cos(nx * TAU * (freq * 3.4) - t * (speed * 2.1) + band * 1.31) * amp * 0.14

  return baseY + a + b + c
}

export default function SiteBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    const dots = createFieldDots()
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')

    let width = 0
    let height = 0
    let dpr = 1
    let raf = 0

    const resize = () => {
      width = window.innerWidth
      height = window.innerHeight
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.floor(width * dpr)
      canvas.height = Math.floor(height * dpr)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const readTheme = () => {
      const styles = getComputedStyle(document.documentElement)
      return {
        wave: styles.getPropertyValue('--theme-site-bg-wave').trim() || 'rgba(212, 175, 55, 0.28)',
        spark: styles.getPropertyValue('--theme-site-bg-spark').trim() || 'rgba(242, 210, 136, 0.3)',
        dotFar: styles.getPropertyValue('--theme-site-bg-dot').trim() || 'rgba(161, 161, 170, 0.18)',
        dotNear: styles.getPropertyValue('--theme-site-bg-dot-near').trim() || 'rgba(212, 175, 55, 0.34)',
        divider: styles.getPropertyValue('--theme-site-bg-divider').trim() || 'rgba(212, 175, 55, 0.32)',
      }
    }

    const render = (now: number) => {
      const split = height * 0.82
      const bottomHeight = Math.max(height - split, 1)
      const reducedMotion = media.matches
      const t = now * 0.001 * (reducedMotion ? 0.14 : 0.92)
      const theme = readTheme()

      ctx.clearRect(0, 0, width, height)

      // Top field: dense engineering signal ribbons + spark particles
      for (let band = 0; band < 42; band += 1) {
        const alpha = 0.045 + (1 - band / 41) * 0.26
        const lineWidth = 0.42 + (1 - band / 41) * 0.7

        ctx.strokeStyle = theme.wave
        ctx.globalAlpha = Math.min(0.258, alpha)
        ctx.lineWidth = lineWidth
        ctx.beginPath()

        const step = 14
        for (let x = 0; x <= width; x += step) {
          const y = getWaveY(x, width, band * 0.72, t, split)
          if (x === 0) {
            ctx.moveTo(x, y)
          } else {
            ctx.lineTo(x, y)
          }
        }

        ctx.stroke()

        // Sparse spark particles riding the waveform
        const sparkCount = 7
        for (let i = 0; i < sparkCount; i += 1) {
          const seed = band * 100 + i
          const x = (((hash(seed + 7) + t * (0.02 + hash(seed + 13) * 0.08)) % 1) + 1) % 1 * width
          const y = getWaveY(x, width, band * 0.72, t, split)
          const radius = 0.45 + hash(seed + 19) * 0.95

          ctx.fillStyle = theme.spark
          ctx.globalAlpha = 0.055 + hash(seed + 29) * 0.202
          ctx.beginPath()
          ctx.arc(x, y, radius, 0, TAU)
          ctx.fill()
        }
      }

      // Bottom field: perspective drift dots (continuous motion)
      for (let i = 0; i < dots.length; i += 1) {
        const dot = dots[i]
        const d = dot.depth
        const laneBias = dot.lane % 2 === 0 ? -1 : 1

        const spread = width * (0.22 + d * 1.16)
        const horizonLift = Math.pow(d, 1.62) * bottomHeight
        const phase = ((dot.phase + t * dot.speed) % 1) * 2 - 1

        const x = width * 0.5 + phase * spread * 0.48 + laneBias * dot.sway * width
        const y = split + horizonLift
        const size = 0.44 + d * 1.72
        const twinkle = 0.78 + 0.22 * Math.sin(t * 2.2 + dot.phase * TAU)
        const alpha = (0.06 + d * 0.5) * twinkle

        ctx.fillStyle = d > 0.7 ? theme.dotNear : theme.dotFar
        ctx.globalAlpha = Math.min(0.515, Math.max(0.03, alpha))
        ctx.beginPath()
        ctx.arc(x, y, size, 0, TAU)
        ctx.fill()
      }

      // Horizon accent
      ctx.strokeStyle = theme.divider
      ctx.globalAlpha = 0.258
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(width * 0.12, split)
      ctx.lineTo(width * 0.88, split)
      ctx.stroke()

      ctx.globalAlpha = 1
      raf = requestAnimationFrame(render)
    }

    resize()
    raf = requestAnimationFrame(render)
    window.addEventListener('resize', resize)

    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <div aria-hidden="true" className="site-bg-root">
      <div className="site-bg-layer site-bg-base" />
      <canvas ref={canvasRef} className="site-bg-canvas" />
      <div className="site-bg-layer site-bg-mesh" />
      <div className="site-bg-layer site-bg-transition" />
      <div className="site-bg-layer site-bg-grain" />
      <div className="site-bg-layer site-bg-veil" />
    </div>
  )
}
