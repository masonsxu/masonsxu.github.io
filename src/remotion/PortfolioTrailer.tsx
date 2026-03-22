import React from 'react'
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion'
import { TransitionSeries, linearTiming } from '@remotion/transitions'
import { wipe } from '@remotion/transitions/wipe'
import { TechCardVideo } from './TechCardVideo'
import { ArchitectureEvolution } from './ArchitectureEvolution'
import { GitHubHeatmap } from './GitHubHeatmap'

// ════════════════════════════════════════════════════════════════
// PortfolioTrailer — 60s / 1800 帧 / 30fps / 1920x1080
// ════════════════════════════════════════════════════════════════
//
// 时间轴（wipe 快门切场各 0.27s）：
//   0-10.2s  IntroPhase          TechCard 名片 + 口号
//   ~10s     ── wipe 0.27s ──   快门
//   10-25.3s EvolutionPhase      Python → Go 架构演进
//   ~25s     ── wipe 0.27s ──   快门
//   25-45.3s ImpactPhase         Stars/PR 滚动 + 热力图生长
//   ~45s     ── wipe 0.27s ──   快门
//   45-60s   FinalOutro          聚合收束 → 域名定格
//
// 全局层：
//   GlobalBackground            漂浮网格 + 呼吸粒子（60s）
//   CinematicOverlay            暗角 Vignette + 胶片噪点 Grain
//
// ════════════════════════════════════════════════════════════════

// ─── 配色（Midnight Pearl）────────────────────────────────────
const C = {
  bg: '#0a0a0a',
  surface: '#121214',
  text: '#f5f5f5',
  muted: '#a1a1aa',
  gold: '#d4af37',
  goldDim: 'rgba(212, 175, 55, 0.15)',
  goldGlow: 'rgba(212, 175, 55, 0.6)',
  gridLine: 'rgba(212, 175, 55, 0.06)',
}

const CL = { extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const }

const mono = (size: number, color = C.text, weight = 400): React.CSSProperties => ({
  fontSize: size,
  fontFamily: "'JetBrains Mono', monospace",
  color,
  fontWeight: weight,
})

const hash = (n: number) => {
  const v = Math.sin(n * 127.1 + 311.7) * 43758.5453
  return v - Math.floor(v)
}

// ─── 转场与时长 ──────────────────────────────────────────────
// wipe 0.13s = 4 帧；3 段转场共 12 帧重叠 → 几乎硬切
// 场景总帧数 = 1800 + 12 = 1812  →  60s 精确
const FADE_DUR = 4
const SCENE = { intro: 304, evolution: 454, impact: 604, outro: 450 } as const

// ─── 从环境变量读取数据（与 ShowreelGallery 一致）──────────
const STATS_DATA = [
  { label: 'CloudWeGo Stars', value: Number(import.meta.env.VITE_OSS_STARS) || 3, suffix: '', color: '#fbbf24' },
  { label: 'Pull Requests', value: 4, suffix: '', color: '#60a5fa' },
  { label: 'Merged PRs', value: 3, suffix: '', color: '#4ade80' },
  { label: 'AGENTS.md Lines', value: Number(import.meta.env.VITE_OSS_AGENTS_LINES) || 331, suffix: '+', color: C.gold },
  { label: 'Contributions', value: 356, suffix: '', color: C.gold },
]

// ─── 全局漂浮背景（60s 全时长）──────────────────────────────
const GlobalBackground: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const gridSpacing = 60
  const cols = Math.ceil(1920 / gridSpacing) + 1
  const rows = Math.ceil(1080 / gridSpacing) + 1
  const driftX = interpolate(frame, [0, 60 * fps], [0, 80], { extrapolateRight: 'clamp' })
  const driftY = interpolate(frame, [0, 60 * fps], [0, -50], { extrapolateRight: 'clamp' })
  const gridOpacity = interpolate(frame, [0, 2 * fps], [0, 1], { ...CL, easing: Easing.out(Easing.quad) })

  return (
    <AbsoluteFill>
      <svg viewBox="0 0 1920 1080" style={{ width: '100%', height: '100%', opacity: gridOpacity }}>
        <g style={{ transform: `translate(${driftX}px, ${driftY}px)` }}>
          {Array.from({ length: cols }, (_, i) => (
            <line key={`v${i}`} x1={i * gridSpacing} y1={0} x2={i * gridSpacing} y2={1080} stroke={C.gridLine} strokeWidth={1} />
          ))}
          {Array.from({ length: rows }, (_, i) => (
            <line key={`h${i}`} x1={0} y1={i * gridSpacing} x2={1920} y2={i * gridSpacing} stroke={C.gridLine} strokeWidth={1} />
          ))}
        </g>
        {Array.from({ length: 20 }, (_, i) => {
          const bx = (i * 137.5 * 7.3) % 1920
          const by = (i * 137.5 * 3.7) % 1080
          const speed = 0.3 + (i % 5) * 0.12
          const x = bx + interpolate((frame + i * 1.2 * fps) % (10 * fps), [0, 5 * fps, 10 * fps], [0, 18 * speed, 0], { easing: Easing.inOut(Easing.sin) })
          const y = by + interpolate((frame + i * 1.2 * fps) % (8 * fps), [0, 4 * fps, 8 * fps], [0, -35 * speed, 0], { easing: Easing.inOut(Easing.sin) })
          const tw = interpolate((frame + i * 17) % (3 * fps), [0, 1.5 * fps, 3 * fps], [0.1, 0.5, 0.1], { easing: Easing.inOut(Easing.sin) })
          return <circle key={i} cx={x} cy={y} r={1 + (i % 3) * 0.4} fill={C.gold} opacity={tw} />
        })}
      </svg>
    </AbsoluteFill>
  )
}

// ─── 暗角 + 胶片噪点（全局叠加）─────────────────────────────
const CinematicOverlay: React.FC = () => {
  const frame = useCurrentFrame()
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      {/* 暗角 Vignette */}
      <svg viewBox="0 0 1920 1080" style={{ position: 'absolute', width: '100%', height: '100%' }}>
        <defs>
          <radialGradient id="t-vig" cx="50%" cy="50%" r="70%">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="60%" stopColor="transparent" />
            <stop offset="100%" stopColor="#000" stopOpacity="0.55" />
          </radialGradient>
        </defs>
        <rect width="1920" height="1080" fill="url(#t-vig)" />
      </svg>
      {/* 胶片噪点 — 1/4 分辨率渲染节省性能，seed 随帧变化 */}
      <svg viewBox="0 0 480 270" style={{ position: 'absolute', width: '100%', height: '100%', opacity: 0.04, mixBlendMode: 'overlay' }}>
        <filter id="t-grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="3" seed={frame % 60} stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="480" height="270" filter="url(#t-grain)" />
      </svg>
    </AbsoluteFill>
  )
}

// ════════════════════════════════════════════════════════════════
// Phase 1: Intro — TechCard 名片 + 口号 (330 帧 ≈ 11s)
// ════════════════════════════════════════════════════════════════
const IntroPhase: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  // 首帧淡入（影片开头从黑场进入）
  const openFade = interpolate(frame, [0, 0.8 * fps], [0, 1], { ...CL, easing: Easing.out(Easing.quad) })

  // 口号 4-7.5s 出现
  const tagDelay = Math.round(4 * fps)
  const tagIn = spring({ frame, fps, config: { damping: 200 }, delay: tagDelay, durationInFrames: Math.round(fps) })
  const tagOut = interpolate(frame, [7.5 * fps, 8.5 * fps], [1, 0], CL)

  // 阶段标签
  const labelOp = interpolate(frame, [fps, 1.5 * fps], [0, 0.4], CL)

  return (
    <AbsoluteFill style={{ opacity: openFade }}>
      <TechCardVideo />

      {/* 口号叠加 */}
      <div style={{
        position: 'absolute', bottom: 120, left: 0, right: 0, textAlign: 'center',
        opacity: interpolate(tagIn, [0, 1], [0, 1]) * tagOut,
        transform: `translateY(${interpolate(tagIn, [0, 1], [18, 0])}px)`,
      }}>
        <div style={{
          display: 'inline-block', padding: '14px 40px',
          backgroundColor: 'rgba(10,10,10,0.75)', backdropFilter: 'blur(8px)',
          border: `1px solid ${C.goldDim}`, borderRadius: 10,
        }}>
          <span style={{ ...mono(20, C.gold, 500), letterSpacing: 2 }}>
            Crafting High-Performance Microservices with Vibe Coding
          </span>
        </div>
      </div>

      <div style={{ position: 'absolute', top: 40, right: 60, opacity: labelOp }}>
        <span style={{ ...mono(12, C.muted), letterSpacing: 3 }}>01 / INTRO</span>
      </div>
    </AbsoluteFill>
  )
}

// ════════════════════════════════════════════════════════════════
// Phase 2: Evolution — 架构演进 (480 帧 ≈ 16s)
// ════════════════════════════════════════════════════════════════
const EvolutionPhase: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  // 转场文案 5-9s
  const textDelay = Math.round(5 * fps)
  const textIn = spring({ frame, fps, config: { damping: 200 }, delay: textDelay, durationInFrames: Math.round(fps) })
  const textOut = interpolate(frame, [9 * fps, 10 * fps], [1, 0], CL)
  const textOp = interpolate(textIn, [0, 1], [0, 1]) * textOut

  const labelOp = interpolate(frame, [0.5 * fps, fps], [0, 0.4], CL)

  return (
    <AbsoluteFill>
      <ArchitectureEvolution />

      {/* 转场文案 */}
      <div style={{
        position: 'absolute', bottom: 100, left: 0, right: 0, textAlign: 'center',
        opacity: textOp,
        transform: `translateY(${interpolate(textIn, [0, 1], [15, 0])}px)`,
      }}>
        <div style={{
          display: 'inline-block', padding: '12px 36px',
          backgroundColor: 'rgba(10,10,10,0.8)', backdropFilter: 'blur(8px)',
          border: `1px solid ${C.goldDim}`, borderRadius: 8,
        }}>
          <span style={{
            fontSize: 20, fontFamily: "'Playfair Display', serif",
            fontStyle: 'italic', color: C.gold, letterSpacing: 2,
          }}>
            From Monolith to Microservices: 99.9% Accuracy.
          </span>
        </div>
      </div>

      <div style={{ position: 'absolute', top: 40, right: 60, opacity: labelOp }}>
        <span style={{ ...mono(12, C.muted), letterSpacing: 3 }}>02 / EVOLUTION</span>
      </div>
    </AbsoluteFill>
  )
}

// ════════════════════════════════════════════════════════════════
// Phase 3: Impact — Stars/PR + 热力图 (630 帧 ≈ 21s)
// 左侧：滚动计数卡片  右侧背景：GitHubHeatmap 生长动画
// ════════════════════════════════════════════════════════════════
const ImpactPhase: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  // 热力图背景渐显
  const hmOpacity = interpolate(frame, [0, 2 * fps], [0, 0.45], { ...CL, easing: Easing.out(Easing.quad) })

  // 标题
  const titleSp = spring({ frame, fps, config: { damping: 200 }, durationInFrames: Math.round(fps) })

  // 口号 10-17s
  const tagDelay = Math.round(10 * fps)
  const tagIn = spring({ frame, fps, config: { damping: 200 }, delay: tagDelay, durationInFrames: Math.round(fps) })
  const tagOut = interpolate(frame, [17 * fps, 18.5 * fps], [1, 0], CL)

  const labelOp = interpolate(frame, [0.5 * fps, fps], [0, 0.4], CL)

  return (
    <AbsoluteFill>
      {/* 热力图背景（调暗） */}
      <AbsoluteFill style={{ opacity: hmOpacity }}>
        <GitHubHeatmap />
      </AbsoluteFill>

      {/* 左侧渐变遮罩（保证文字可读） */}
      <AbsoluteFill style={{
        background: 'linear-gradient(90deg, rgba(10,10,10,0.9) 0%, rgba(10,10,10,0.7) 30%, rgba(10,10,10,0.15) 55%, transparent 100%)',
      }} />

      {/* 标题 */}
      <div style={{
        position: 'absolute', top: 70, left: 100,
        opacity: interpolate(titleSp, [0, 1], [0, 0.9]),
        transform: `translateY(${interpolate(titleSp, [0, 1], [16, 0])}px)`,
      }}>
        <span style={{ ...mono(20, C.gold, 600), letterSpacing: 6 }}>THE IMPACT</span>
      </div>

      {/* 左侧统计卡片 */}
      <div style={{
        position: 'absolute', left: 100, top: 160, bottom: 160,
        display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 20,
        width: 420,
      }}>
        {STATS_DATA.map((s, i) => {
          const delay = Math.round(1.5 * fps) + i * Math.round(0.45 * fps)
          const cardSp = spring({ frame, fps, config: { damping: 20, stiffness: 200 }, delay })
          const rollEnd = delay + Math.round(3 * fps)
          const current = Math.round(interpolate(frame, [delay, rollEnd], [0, s.value], { ...CL, easing: Easing.out(Easing.quad) }))
          const pulse = interpolate((frame + i * 20) % (2 * fps), [0, fps, 2 * fps], [0.5, 1, 0.5], { easing: Easing.inOut(Easing.sin) })

          return (
            <div key={i} style={{
              opacity: interpolate(cardSp, [0, 1], [0, 1]),
              transform: `translateX(${interpolate(cardSp, [0, 1], [-50, 0])}px)`,
              padding: '14px 24px',
              backgroundColor: C.surface, border: `1px solid ${C.goldDim}`,
              borderLeft: `3px solid ${s.color}`, borderRadius: 10,
            }}>
              <div style={{ ...mono(11, C.muted), letterSpacing: 1.5, marginBottom: 4 }}>{s.label}</div>
              <div style={{ ...mono(34, C.text, 700), textShadow: `0 0 ${12 * pulse}px ${C.goldGlow}` }}>
                {current}{s.suffix}
              </div>
            </div>
          )
        })}
      </div>

      {/* 底部口号 */}
      <div style={{
        position: 'absolute', bottom: 70, left: 0, right: 0, textAlign: 'center',
        opacity: interpolate(tagIn, [0, 1], [0, 1]) * tagOut,
        transform: `translateY(${interpolate(tagIn, [0, 1], [14, 0])}px)`,
      }}>
        <div style={{
          display: 'inline-block', padding: '10px 32px',
          backgroundColor: 'rgba(10,10,10,0.75)', backdropFilter: 'blur(8px)',
          border: `1px solid ${C.goldDim}`, borderRadius: 8,
        }}>
          <span style={{
            fontSize: 18, fontFamily: "'Playfair Display', serif",
            fontStyle: 'italic', color: C.gold, letterSpacing: 2,
          }}>
            CloudWeGo Contributor & Vibe Coding Pioneer.
          </span>
        </div>
      </div>

      <div style={{ position: 'absolute', top: 40, right: 60, opacity: labelOp }}>
        <span style={{ ...mono(12, C.muted), letterSpacing: 3 }}>03 / IMPACT</span>
      </div>
    </AbsoluteFill>
  )
}

// ════════════════════════════════════════════════════════════════
// Phase 4: Outro — 聚合收束 → 域名定格 (450 帧 = 15s)
// ════════════════════════════════════════════════════════════════
const FinalOutro: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  // 辉光
  const glowR = interpolate(frame, [fps, 5 * fps], [0, 500], { ...CL, easing: Easing.out(Easing.quad) })
  const glowOp = interpolate(frame, [fps, 3 * fps, 5 * fps], [0, 0.15, 0.05], CL)

  // 金色粒子向中心聚合 (0-4s)
  const convergence = interpolate(frame, [0, 4 * fps], [0, 1], { ...CL, easing: Easing.bezier(0.25, 0.1, 0.25, 1) })
  const dotsOp = interpolate(frame, [0, fps, 4 * fps, 6 * fps], [0, 0.5, 0.6, 0.08], CL)

  // 菱形
  const diamondSp = spring({ frame, fps, config: { damping: 15, stiffness: 100 }, delay: Math.round(2 * fps) })

  // 中文名
  const nameSp = spring({ frame, fps, config: { damping: 200 }, delay: Math.round(3 * fps), durationInFrames: Math.round(fps) })

  // 英文名
  const enSp = spring({ frame, fps, config: { damping: 200 }, delay: Math.round(4 * fps), durationInFrames: Math.round(0.8 * fps) })

  // 金线
  const lineSp = spring({ frame, fps, config: { damping: 200 }, delay: Math.round(5.5 * fps), durationInFrames: Math.round(0.8 * fps) })

  // Slogan
  const sloganSp = spring({ frame, fps, config: { damping: 200 }, delay: Math.round(6.5 * fps), durationInFrames: Math.round(fps) })

  // 域名
  const urlSp = spring({ frame, fps, config: { damping: 200 }, delay: Math.round(8 * fps), durationInFrames: Math.round(0.8 * fps) })

  // 尾部淡出至黑场
  const finalFade = interpolate(frame, [12.5 * fps, 15 * fps], [1, 0], CL)

  return (
    <AbsoluteFill style={{ opacity: finalFade }}>
      <AbsoluteFill style={{ backgroundColor: C.bg }} />

      <svg viewBox="0 0 1920 1080" style={{ position: 'absolute', width: '100%', height: '100%' }}>
        <defs>
          <radialGradient id="outroGlow">
            <stop offset="0%" stopColor={C.gold} stopOpacity="0.08" />
            <stop offset="100%" stopColor={C.gold} stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx={960} cy={540} r={glowR} fill="url(#outroGlow)" opacity={glowOp * 3} />
        <circle cx={960} cy={540} r={glowR} fill="none" stroke={C.gold} strokeWidth={1.5} opacity={glowOp} />

        {/* 聚合金点 */}
        {Array.from({ length: 48 }, (_, i) => {
          const angle = hash(i * 3) * Math.PI * 2
          const dist = 250 + hash(i * 7) * 450
          const sx = 960 + Math.cos(angle) * dist
          const sy = 540 + Math.sin(angle) * dist
          const x = sx + (960 - sx) * convergence * 0.75
          const y = sy + (540 - sy) * convergence * 0.75
          return (
            <circle key={i} cx={x} cy={y}
              r={1.5 + hash(i * 11) * 2}
              fill={C.gold} opacity={dotsOp * (0.3 + hash(i * 13) * 0.7)}
            />
          )
        })}
      </svg>

      {/* 中央内容 */}
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 16,
      }}>
        {/* 菱形 */}
        <div style={{
          width: 18, height: 18, backgroundColor: C.gold,
          transform: `rotate(${interpolate(diamondSp, [0, 1], [180, 45])}deg) scale(${interpolate(diamondSp, [0, 1], [0, 1])})`,
          opacity: interpolate(diamondSp, [0, 1], [0, 0.7]),
          marginBottom: 14,
        }} />

        {/* 中文名 */}
        <div style={{
          fontSize: 68, fontWeight: 300, fontFamily: "'Noto Sans SC', sans-serif",
          color: C.text, letterSpacing: 14,
          opacity: interpolate(nameSp, [0, 1], [0, 1]),
          transform: `translateY(${interpolate(nameSp, [0, 1], [22, 0])}px)`,
        }}>
          徐俊飞
        </div>

        {/* 英文名 */}
        <div style={{
          fontSize: 26, fontFamily: "'Playfair Display', serif",
          color: C.gold, letterSpacing: 7,
          opacity: interpolate(enSp, [0, 1], [0, 1]),
        }}>
          Masons Xu
        </div>

        <div style={{ height: 6 }} />

        {/* 金线 */}
        <div style={{
          width: interpolate(lineSp, [0, 1], [0, 400]),
          height: 1, backgroundColor: C.gold, opacity: 0.5,
        }} />

        {/* Slogan */}
        <div style={{
          fontSize: 24, fontWeight: 400,
          fontFamily: "'Playfair Display', serif", fontStyle: 'italic',
          color: C.gold, letterSpacing: 2,
          textAlign: 'center', maxWidth: 900, lineHeight: 1.5,
          opacity: interpolate(sloganSp, [0, 1], [0, 1]),
          transform: `translateY(${interpolate(sloganSp, [0, 1], [14, 0])}px)`,
        }}>
          &ldquo;Architecture is the balance of design and function.&rdquo;
        </div>

        <div style={{ height: 8 }} />

        {/* 域名 */}
        <div style={{ ...mono(16, C.muted), letterSpacing: 4, opacity: interpolate(urlSp, [0, 1], [0, 0.7]) }}>
          masonsxu-github-io.pages.dev
        </div>

        {/* 底部菱形 */}
        <div style={{
          width: 10, height: 10, backgroundColor: C.gold,
          transform: `rotate(45deg) scale(${interpolate(urlSp, [0, 1], [0, 1])})`,
          opacity: 0.4, marginTop: 10,
        }} />
      </div>

      {/* 阶段标签 */}
      <div style={{
        position: 'absolute', top: 40, right: 60,
        opacity: interpolate(frame, [0.5 * fps, fps], [0, 0.4], CL) * finalFade,
      }}>
        <span style={{ ...mono(12, C.muted), letterSpacing: 3 }}>04 / FINALE</span>
      </div>
    </AbsoluteFill>
  )
}

// ════════════════════════════════════════════════════════════════
// 主合成 — TransitionSeries + fade 交叉溶解
// ════════════════════════════════════════════════════════════════
export const PortfolioTrailer: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg }}>
      {/* 全时长漂浮背景（转场交叉时从间隙透出微光） */}
      <GlobalBackground />

      <TransitionSeries>
        {/* ── Phase 1: Intro ── */}
        <TransitionSeries.Sequence durationInFrames={SCENE.intro}>
          <IntroPhase />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={wipe({ direction: 'from-left' })}
          timing={linearTiming({ durationInFrames: FADE_DUR })}
        />

        {/* ── Phase 2: Evolution ── */}
        <TransitionSeries.Sequence durationInFrames={SCENE.evolution}>
          <EvolutionPhase />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={wipe({ direction: 'from-left' })}
          timing={linearTiming({ durationInFrames: FADE_DUR })}
        />

        {/* ── Phase 3: Impact ── */}
        <TransitionSeries.Sequence durationInFrames={SCENE.impact}>
          <ImpactPhase />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={wipe({ direction: 'from-left' })}
          timing={linearTiming({ durationInFrames: FADE_DUR })}
        />

        {/* ── Phase 4: Outro ── */}
        <TransitionSeries.Sequence durationInFrames={SCENE.outro}>
          <FinalOutro />
        </TransitionSeries.Sequence>
      </TransitionSeries>

      {/* 品牌水印 */}
      <div style={{ position: 'absolute', bottom: 24, right: 32, pointerEvents: 'none', opacity: 0.18 }}>
        <span style={{ ...mono(11, C.muted), letterSpacing: 2 }}>Masons.Xu | 2026</span>
      </div>

      {/* 全局电影后期：暗角 + 噪点 */}
      <CinematicOverlay />
    </AbsoluteFill>
  )
}
