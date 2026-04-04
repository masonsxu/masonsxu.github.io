import { useCallback, useEffect, useRef } from 'react'
import { prepareWithSegments } from '@chenglou/pretext'

const COLS = 80
const ROWS = 42
const FONT_SIZE = 16
const LINE_HEIGHT = 18
const TARGET_ROW_W = 680
const FAMILY = "'Playfair Display', serif"
const FIELD_OVERSAMPLE = 2
const FIELD_COLS = COLS * FIELD_OVERSAMPLE
const FIELD_ROWS = ROWS * FIELD_OVERSAMPLE
const CANVAS_W = 320
const CANVAS_H = Math.round(CANVAS_W * ((ROWS * LINE_HEIGHT) / TARGET_ROW_W))
const FIELD_SCALE_X = FIELD_COLS / CANVAS_W
const FIELD_SCALE_Y = FIELD_ROWS / CANVAS_H
const PARTICLE_N = 160
const SPRITE_R = 18
const ATTRACTOR_R = 14
const LARGE_ATTRACTOR_R = 36
const ATTRACTOR_FORCE_1 = 0.22
const ATTRACTOR_FORCE_2 = 0.06
const FIELD_DECAY = 0.92
const CHARSET = ' .,:;!+-=*#@%&$?ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
const WEIGHTS = [300, 400, 700] as const
const STYLES = ['normal', 'italic'] as const

type FontStyleVariant = typeof STYLES[number]

type PaletteEntry = {
  char: string
  weight: number
  style: FontStyleVariant
  font: string
  width: number
  brightness: number
}

type BrightnessEntry = {
  html: string
  alphaIndex: number
}

type Particle = {
  x: number
  y: number
  vx: number
  vy: number
}

type FieldStamp = {
  radiusX: number
  radiusY: number
  sizeX: number
  sizeY: number
  values: Float32Array
}

function spriteAlphaAt(normalizedDistance: number): number {
  if (normalizedDistance >= 1) return 0
  if (normalizedDistance <= 0.3) return 0.55 + (0.2 - 0.55) * (normalizedDistance / 0.3)
  return 0.2 * (1 - (normalizedDistance - 0.3) / 0.7)
}

function createFieldStamp(radiusPx: number): FieldStamp {
  const fieldRadiusX = radiusPx * FIELD_SCALE_X
  const fieldRadiusY = radiusPx * FIELD_SCALE_Y
  const radiusX = Math.ceil(fieldRadiusX)
  const radiusY = Math.ceil(fieldRadiusY)
  const sizeX = radiusX * 2 + 1
  const sizeY = radiusY * 2 + 1
  const values = new Float32Array(sizeX * sizeY)
  for (let y = -radiusY; y <= radiusY; y++) {
    for (let x = -radiusX; x <= radiusX; x++) {
      const normalizedDistance = Math.sqrt((x / fieldRadiusX) ** 2 + (y / fieldRadiusY) ** 2)
      values[(y + radiusY) * sizeX + x + radiusX] = spriteAlphaAt(normalizedDistance)
    }
  }
  return { radiusX, radiusY, sizeX, sizeY, values }
}

function splatFieldStamp(
  field: Float32Array,
  centerX: number,
  centerY: number,
  stamp: FieldStamp,
): void {
  const gridCenterX = Math.round(centerX * FIELD_SCALE_X)
  const gridCenterY = Math.round(centerY * FIELD_SCALE_Y)
  for (let y = -stamp.radiusY; y <= stamp.radiusY; y++) {
    const gridY = gridCenterY + y
    if (gridY < 0 || gridY >= FIELD_ROWS) continue
    const fieldRowOffset = gridY * FIELD_COLS
    const stampRowOffset = (y + stamp.radiusY) * stamp.sizeX
    for (let x = -stamp.radiusX; x <= stamp.radiusX; x++) {
      const gridX = gridCenterX + x
      if (gridX < 0 || gridX >= FIELD_COLS) continue
      const stampValue = stamp.values[stampRowOffset + x + stamp.radiusX]!
      if (stampValue === 0) continue
      const fieldIndex = fieldRowOffset + gridX
      field[fieldIndex] = Math.min(1, field[fieldIndex]! + stampValue)
    }
  }
}

function wCls(weight: number, style: FontStyleVariant, alphaIndex: number, isDark: boolean): string {
  const weightClass = weight === 300 ? 'ascii-w3' : weight === 400 ? 'ascii-w4' : 'ascii-w7'
  const styleClass = style === 'italic' ? 'ascii-it' : ''
  const alphaClass = `ascii-a${alphaIndex}`
  const themeClass = isDark ? 'ascii-dark' : 'ascii-light'
  return `${weightClass} ${styleClass} ${alphaClass} ${themeClass}`.trim()
}

function esc(ch: string): string {
  if (ch === '<') return '&lt;'
  if (ch === '>') return '&gt;'
  if (ch === '&') return '&amp;'
  return ch
}

export default function TypographicASCII() {
  const containerRef = useRef<HTMLDivElement>(null)
  const rowsRef = useRef<HTMLDivElement[]>([])
  const particlesRef = useRef<Particle[]>([])
  const brightnessFieldRef = useRef(new Float32Array(FIELD_COLS * FIELD_ROWS))
  const animFrameRef = useRef<number>(0)
  const lastTimeRef = useRef<number>(0)
  const isDarkRef = useRef(true)
  const paletteRef = useRef<PaletteEntry[]>([])
  const lookupRef = useRef<BrightnessEntry[]>([])
  const stampsRef = useRef<{ particle: FieldStamp; large: FieldStamp; small: FieldStamp } | null>(null)

  const buildPalette = useCallback(() => {
    const brightnessCanvas = document.createElement('canvas')
    brightnessCanvas.width = 32
    brightnessCanvas.height = 32
    const bCtx = brightnessCanvas.getContext('2d', { willReadFrequently: true })
    if (!bCtx) return

    const palette: PaletteEntry[] = []
    for (const style of STYLES) {
      for (const weight of WEIGHTS) {
        const font = `${style === 'italic' ? 'italic ' : ''}${weight} ${FONT_SIZE}px ${FAMILY}`
        for (const ch of CHARSET) {
          if (ch === ' ') continue
          const prepared = prepareWithSegments(ch, font)
          const width = prepared.widths.length > 0 ? prepared.widths[0]! : 0
          if (width <= 0) continue

          bCtx.clearRect(0, 0, 32, 32)
          bCtx.font = font
          bCtx.fillStyle = '#fff'
          bCtx.textBaseline = 'middle'
          bCtx.fillText(ch, 1, 16)
          const data = bCtx.getImageData(0, 0, 32, 32).data
          let sum = 0
          for (let idx = 3; idx < data.length; idx += 4) sum += data[idx]!
          const brightness = sum / (255 * 32 * 32)

          palette.push({ char: ch, weight, style, font, width, brightness })
        }
      }
    }

    const maxBrightness = Math.max(...palette.map(e => e.brightness))
    if (maxBrightness > 0) {
      for (let i = 0; i < palette.length; i++) {
        palette[i]!.brightness /= maxBrightness
      }
    }
    palette.sort((a, b) => a.brightness - b.brightness)
    paletteRef.current = palette

    const targetCellW = TARGET_ROW_W / COLS
    const lookup: BrightnessEntry[] = []
    for (let brightnessByte = 0; brightnessByte < 256; brightnessByte++) {
      const brightness = brightnessByte / 255
      if (brightness < 0.02) {
        lookup.push({ html: ' ', alphaIndex: 0 })
        continue
      }

      let lo = 0
      let hi = palette.length - 1
      while (lo < hi) {
        const mid = (lo + hi) >> 1
        if (palette[mid]!.brightness < brightness) lo = mid + 1
        else hi = mid
      }

      let bestScore = Infinity
      let best = palette[lo]!
      const start = Math.max(0, lo - 20)
      const end = Math.min(palette.length, lo + 20)
      for (let idx = start; idx < end; idx++) {
        const entry = palette[idx]!
        const brightnessError = Math.abs(entry.brightness - brightness) * 2.5
        const widthError = Math.abs(entry.width - targetCellW) / targetCellW
        const score = brightnessError + widthError
        if (score < bestScore) {
          bestScore = score
          best = entry
        }
      }

      const alphaIndex = Math.max(1, Math.min(10, Math.round(brightness * 10)))
      lookup.push({
        html: `<span class="${wCls(best.weight, best.style, alphaIndex, isDarkRef.current)}">${esc(best.char)}</span>`,
        alphaIndex,
      })
    }
    lookupRef.current = lookup
  }, [])

  const buildRows = useCallback(() => {
    if (!containerRef.current) return
    containerRef.current.innerHTML = ''
    rowsRef.current = []
    for (let row = 0; row < ROWS; row++) {
      const rowEl = document.createElement('div')
      rowEl.className = 'ascii-row'
      rowEl.style.height = `${LINE_HEIGHT}px`
      rowEl.style.lineHeight = `${LINE_HEIGHT}px`
      containerRef.current.appendChild(rowEl)
      rowsRef.current.push(rowEl)
    }
  }, [])

  useEffect(() => {
    const updateTheme = () => {
      isDarkRef.current = document.documentElement.classList.contains('dark')
    }
    updateTheme()

    const observer = new MutationObserver(updateTheme)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })

    document.fonts.ready.then(() => {
      buildPalette()

      stampsRef.current = {
        particle: createFieldStamp(SPRITE_R),
        large: createFieldStamp(LARGE_ATTRACTOR_R),
        small: createFieldStamp(ATTRACTOR_R),
      }

      particlesRef.current = Array.from({ length: PARTICLE_N }, () => {
        const angle = Math.random() * Math.PI * 2
        const radius = Math.random() * 50 + 30
        return {
          x: CANVAS_W / 2 + Math.cos(angle) * radius,
          y: CANVAS_H / 2 + Math.sin(angle) * radius,
          vx: (Math.random() - 0.5) * 0.8,
          vy: (Math.random() - 0.5) * 0.8,
        }
      })

      buildRows()
    })

    return () => observer.disconnect()
  }, [buildPalette, buildRows])

  useEffect(() => {
    const animate = (now: number) => {
      lastTimeRef.current = now

      const particles = particlesRef.current
      const field = brightnessFieldRef.current
      const stamps = stampsRef.current
      const lookup = lookupRef.current
      const rows = rowsRef.current

      if (particles.length === 0 || !stamps || lookup.length === 0 || rows.length === 0) {
        animFrameRef.current = requestAnimationFrame(animate)
        return
      }

      const attractor1X = Math.cos(now * 0.0005) * CANVAS_W * 0.3 + CANVAS_W / 2
      const attractor1Y = Math.sin(now * 0.0007) * CANVAS_H * 0.35 + CANVAS_H / 2
      const attractor2X = Math.cos(now * 0.0009 + Math.PI) * CANVAS_W * 0.25 + CANVAS_W / 2
      const attractor2Y = Math.sin(now * 0.0006 + Math.PI) * CANVAS_H * 0.3 + CANVAS_H / 2

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]!
        const d1x = attractor1X - p.x
        const d1y = attractor1Y - p.y
        const d2x = attractor2X - p.x
        const d2y = attractor2Y - p.y
        const dist1 = d1x * d1x + d1y * d1y
        const dist2 = d2x * d2x + d2y * d2y
        const ax = dist1 < dist2 ? d1x : d2x
        const ay = dist1 < dist2 ? d1y : d2y
        const dist = Math.sqrt(Math.min(dist1, dist2)) + 1
        const force = dist1 < dist2 ? ATTRACTOR_FORCE_1 : ATTRACTOR_FORCE_2
        p.vx += ax / dist * force
        p.vy += ay / dist * force
        p.vx += (Math.random() - 0.5) * 0.25
        p.vy += (Math.random() - 0.5) * 0.25
        p.vx *= 0.96
        p.vy *= 0.96
        p.x += p.vx
        p.y += p.vy
        if (p.x < -SPRITE_R) p.x += CANVAS_W + SPRITE_R * 2
        if (p.x > CANVAS_W + SPRITE_R) p.x -= CANVAS_W + SPRITE_R * 2
        if (p.y < -SPRITE_R) p.y += CANVAS_H + SPRITE_R * 2
        if (p.y > CANVAS_H + SPRITE_R) p.y -= CANVAS_H + SPRITE_R * 2
      }

      for (let i = 0; i < field.length; i++) {
        field[i] = field[i]! * FIELD_DECAY
      }
      for (let i = 0; i < particles.length; i++) {
        splatFieldStamp(field, particles[i]!.x, particles[i]!.y, stamps.particle)
      }
      splatFieldStamp(field, attractor1X, attractor1Y, stamps.large)
      splatFieldStamp(field, attractor2X, attractor2Y, stamps.small)

      for (let row = 0; row < ROWS; row++) {
        let html = ''
        const fieldRowStart = row * FIELD_OVERSAMPLE * FIELD_COLS
        for (let col = 0; col < COLS; col++) {
          const fieldColStart = col * FIELD_OVERSAMPLE
          let brightness = 0
          for (let sy = 0; sy < FIELD_OVERSAMPLE; sy++) {
            const sampleRowOffset = fieldRowStart + sy * FIELD_COLS + fieldColStart
            for (let sx = 0; sx < FIELD_OVERSAMPLE; sx++) {
              brightness += field[sampleRowOffset + sx]!
            }
          }
          const brightnessByte = Math.min(255, ((brightness / (FIELD_OVERSAMPLE * FIELD_OVERSAMPLE)) * 255) | 0)
          html += lookup[brightnessByte]!.html
        }
        rows[row]!.innerHTML = html
      }

      animFrameRef.current = requestAnimationFrame(animate)
    }

    animFrameRef.current = requestAnimationFrame(animate)
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    }
  }, [])

  return (
    <div className="ascii-bg" aria-hidden="true">
      <div ref={containerRef} className="ascii-bg-layer ascii-bg-art" />
    </div>
  )
}
