import React from 'react'
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion'

// ════════════════════════════════════════════════════════════════
// AmbientArchitecture — 60s Hero Background Composition
// ════════════════════════════════════════════════════════════════
//
// 视觉分层:
//   Layer 1: 3D 透视无尽网格 (vanishing point perspective)
//   Layer 2: 流动请求踪迹 (沿网格线的光点 + 尾迹)
//   Layer 3: 幽灵微服务节点 (缓慢浮现消失的矩形框)
//
// 使用: Hero 背景, 外层施加 opacity: 0.4 + filter: blur(2px) contrast(0.9)
// 生产优化: 可 `npx remotion render` → .webm, 用 <video> 标签替代 Player
// ════════════════════════════════════════════════════════════════

const W = 1920
const H = 1080

// Deterministic pseudo-random (Remotion convention — never use Math.random)
const hash = (n: number) => {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453
  return s - Math.floor(s)
}

// Layered sin for organic "deep sea breathing" rhythm
const organicSin = (t: number, seed: number) =>
  0.5 +
  0.25 * Math.sin(t * 0.35 + seed) +
  0.15 * Math.sin(t * 0.17 + seed * 2.3) +
  0.1 * Math.sin(t * 0.53 + seed * 0.7)

// ─── Perspective Grid Pre-computation ───────────────────────────
const VP_X = W / 2
const VP_Y = H * 0.08
const GRID_BOTTOM = H + 120
const H_LINE_COUNT = 22
const V_LINE_COUNT = 28

const hGridLines = Array.from({ length: H_LINE_COUNT }, (_, i) => {
  const t = (i + 1) / (H_LINE_COUNT + 1)
  const y = VP_Y + (GRID_BOTTOM - VP_Y) * t * t
  const ratio = (y - VP_Y) / (GRID_BOTTOM - VP_Y)
  const hw = W * 0.7 * ratio
  return { x1: VP_X - hw, y1: y, x2: VP_X + hw, y2: y }
})

const vGridLines = Array.from({ length: V_LINE_COUNT }, (_, i) => {
  const spread = W * 1.4
  const bx = VP_X - spread / 2 + (i / (V_LINE_COUNT - 1)) * spread
  return { x1: bx, y1: GRID_BOTTOM, x2: VP_X, y2: VP_Y }
})

// ─── Trace Pre-computation ──────────────────────────────────────
const TRACE_COUNT = 14

interface TraceData {
  id: number
  isVertical: boolean
  lineIdx: number
  speed: number
  trailLen: number
  color: string
  opacity: number
  offset: number
  breathSeed: number
}

const tracesData: TraceData[] = Array.from({ length: TRACE_COUNT }, (_, i) => ({
  id: i,
  isVertical: hash(i * 13) > 0.4,
  lineIdx: Math.floor(
    hash(i * 17 + 3) * (hash(i * 13) > 0.4 ? V_LINE_COUNT : H_LINE_COUNT),
  ),
  speed: 0.0008 + hash(i * 31 + 11) * 0.0012,
  trailLen: 0.08 + hash(i * 37 + 13) * 0.12,
  color: hash(i * 41 + 17) > 0.5 ? '#f5f5f5' : '#8a6d3b',
  opacity: 0.1 + hash(i * 43 + 19) * 0.2,
  offset: hash(i * 47 + 23),
  breathSeed: hash(i * 53 + 29) * Math.PI * 2,
}))

// ─── Ghost Node Pre-computation ─────────────────────────────────
const GHOST_COUNT = 6
const SVC_LABELS = [
  'gateway',
  'identity',
  'analytics',
  'records',
  'storage',
  'messaging',
]

interface GhostData {
  id: number
  x: number
  y: number
  w: number
  h: number
  start: number
  dur: number
  fade: number
  label: string
  phase: number
}

const ghostsData: GhostData[] = Array.from({ length: GHOST_COUNT }, (_, i) => ({
  id: i,
  x: 250 + hash(i * 59 + 31) * (W - 600),
  y: 150 + hash(i * 61 + 37) * (H - 450),
  w: 100 + hash(i * 67 + 41) * 140,
  h: 50 + hash(i * 71 + 43) * 70,
  start: Math.floor(hash(i * 73 + 47) * 1400),
  dur: Math.floor(240 + hash(i * 79 + 51) * 360),
  fade: Math.floor(60 + hash(i * 83 + 53) * 120),
  label: SVC_LABELS[i],
  phase: hash(i * 89 + 59) * Math.PI * 2,
}))

// ─── Sub Components ─────────────────────────────────────────────

const PerspectiveGrid: React.FC<{ frame: number; fps: number }> = React.memo(
  ({ frame, fps }) => {
    const breath = organicSin(frame / fps, 0)

    return (
      <g opacity={breath}>
        {hGridLines.map((l, i) => (
          <line
            key={`h${i}`}
            x1={l.x1}
            y1={l.y1}
            x2={l.x2}
            y2={l.y2}
            stroke="#1a1a1a"
            strokeWidth={0.5}
          />
        ))}
        {vGridLines.map((l, i) => (
          <line
            key={`v${i}`}
            x1={l.x1}
            y1={l.y1}
            x2={l.x2}
            y2={l.y2}
            stroke="#1a1a1a"
            strokeWidth={0.5}
          />
        ))}
      </g>
    )
  },
)

const FlowingTraces: React.FC<{ frame: number; fps: number }> = React.memo(
  ({ frame, fps }) => {
    const t = frame / fps

    return (
      <g>
        {tracesData.map((tr) => {
          const line = tr.isVertical
            ? vGridLines[tr.lineIdx % vGridLines.length]
            : hGridLines[tr.lineIdx % hGridLines.length]

          const progress = (tr.offset + frame * tr.speed) % 1
          const tailProgress = Math.max(0, progress - tr.trailLen)

          const hx = line.x1 + (line.x2 - line.x1) * progress
          const hy = line.y1 + (line.y2 - line.y1) * progress
          const tx = line.x1 + (line.x2 - line.x1) * tailProgress
          const ty = line.y1 + (line.y2 - line.y1) * tailProgress

          if (hx < -100 || hx > W + 100 || hy < -100 || hy > H + 100) return null

          const breathMod = organicSin(t, tr.breathSeed)
          const op = tr.opacity * breathMod

          return (
            <g key={`tr${tr.id}`}>
              <line
                x1={tx}
                y1={ty}
                x2={hx}
                y2={hy}
                stroke={tr.color}
                strokeWidth={1}
                strokeLinecap="round"
                opacity={op * 0.6}
              />
              <circle cx={hx} cy={hy} r={2.5} fill={tr.color} opacity={op} />
            </g>
          )
        })}
      </g>
    )
  },
)

const GhostNodes: React.FC<{ frame: number; fps: number }> = React.memo(
  ({ frame, fps }) => {
    const total = 60 * fps
    const t = frame / fps

    return (
      <g>
        {ghostsData.map((n) => {
          const local = frame % total
          const rel = (local - n.start + total) % total
          const totalDur = n.fade * 2 + n.dur
          if (rel > totalDur) return null

          let a: number
          if (rel < n.fade) {
            a = rel / n.fade
          } else if (rel < n.fade + n.dur) {
            a = 1
          } else {
            a = 1 - (rel - n.fade - n.dur) / n.fade
          }
          a = Math.max(0, Math.min(1, a)) * 0.12

          const fy = Math.sin(t * 0.25 + n.phase) * 4
          const perim = 2 * (n.w + n.h)
          const doff = (frame * 0.25 + n.id * 80) % perim

          return (
            <g
              key={`gh${n.id}`}
              opacity={a}
              transform={`translate(0,${fy.toFixed(2)})`}
            >
              <rect
                x={n.x}
                y={n.y}
                width={n.w}
                height={n.h}
                rx={3}
                fill="none"
                stroke="#2a2a2e"
                strokeWidth={0.8}
                strokeDasharray={`${(perim * 0.12).toFixed(1)} ${(perim * 0.88).toFixed(1)}`}
                strokeDashoffset={doff.toFixed(1)}
              />
              <text
                x={n.x + n.w / 2}
                y={n.y + n.h / 2 + 3}
                textAnchor="middle"
                fill="#2a2a2e"
                style={{
                  fontSize: 9,
                  fontFamily: "'JetBrains Mono', monospace",
                  letterSpacing: 2,
                }}
              >
                {n.label}
              </text>
            </g>
          )
        })}
      </g>
    )
  },
)

// ─── Main Composition ─────────────────────────────────────────
export const AmbientArchitecture: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  // Gentle camera drift (incommensurate periods → non-repeating path)
  const panX = Math.sin(frame / fps * 0.05) * 30
  const panY = Math.sin(frame / fps * 0.03) * 15

  return (
    <AbsoluteFill style={{ backgroundColor: '#0a0a0a' }}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        style={{ width: '100%', height: '100%' }}
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <radialGradient id="ambVpGlow">
            <stop offset="0%" stopColor="#1a1a1e" stopOpacity={0.4} />
            <stop offset="100%" stopColor="#0a0a0a" stopOpacity={0} />
          </radialGradient>
        </defs>

        <g transform={`translate(${panX.toFixed(2)},${panY.toFixed(2)})`}>
          {/* Vanishing point ambient glow */}
          <circle cx={VP_X} cy={VP_Y + 40} r={280} fill="url(#ambVpGlow)" />

          <PerspectiveGrid frame={frame} fps={fps} />
          <FlowingTraces frame={frame} fps={fps} />
          <GhostNodes frame={frame} fps={fps} />
        </g>
      </svg>
    </AbsoluteFill>
  )
}
