import React from 'react'
import {
  AbsoluteFill,
  Easing,
  Sequence,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion'

// ════════════════════════════════════════════════════════════════
// GitHub Contribution Heatmap — 20s Remotion Composition
// ════════════════════════════════════════════════════════════════
//
// 数据驱动接口：
//   contributions  —  ContributionDay[] （week/day/intensity/count）
//                     - week: 0-52, 53 周热力图列
//                     - day:  0-6, Sun=0 … Sat=6
//                     - intensity: 0-4 (GitHub 4 级色阶)
//                     - count: 原始提交数（可选，用于 tooltip）
//
//   achievements   —  Achievement[] （里程碑标注）
//                     - label: 显示文本，如 "Merged PR #27 to hertz-contrib/jwt"
//                     - sub:   副标题，如 "Fix Token Refresh · 2025-12-15"
//                     - week/day: 对应网格坐标
//
// 如何修改热力图形态：
//   1. 替换 RAW_COUNTS 数组 → 改变贡献分布
//      数组为 53×7=371 个整数，按 [week0-day0, week0-day1, ..., week52-day6] 排列
//      每个值 = 当天的 commit 数，会自动映射为 intensity 0-4
//
//   2. 调整 countToIntensity 阈值 → 改变色阶分界
//      默认: 0→0, 1-2→1, 3-5→2, 6-10→3, 11+→4
//
//   3. 修改 DEFAULT_ACHIEVEMENTS → 改变里程碑标注
//      week/day 坐标需与 RAW_COUNTS 对齐
//
//   4. 修改 MONTH_LABELS / MONTH_WEEKS → 适配不同年份的月份偏移
//
// ════════════════════════════════════════════════════════════════

// ─── Props 接口 ──────────────────────────────────────────────
export interface ContributionDay {
  week: number
  day: number
  intensity: number // 0-4
  count?: number
}

export interface Achievement {
  label: string
  sub: string
  week: number
  day: number
}

export interface HeatmapProps {
  contributions?: ContributionDay[]
  achievements?: Achievement[]
}

// ─── 真实数据（GitHub GraphQL API 2025-03-23 → 2026-03-22）──
// 53 周 × 7 天，count → intensity: 0→0, 1-2→1, 3-5→2, 6-10→3, 11+→4
// prettier-ignore
const RAW_COUNTS = [
  0,0,0,0,0,0,0, 0,0,0,0,0,0,0, 0,0,0,0,0,0,0, 0,0,0,0,0,0,0,
  0,0,0,0,0,0,0, 0,0,0,0,0,0,0, 0,0,0,0,0,0,0, 0,0,0,0,0,0,0,
  0,0,0,2,0,0,0, 0,0,0,0,0,0,0, 0,0,0,0,0,0,0, 0,0,0,0,0,0,0,
  0,0,0,0,0,0,0, 0,0,0,0,0,0,0, 0,0,0,0,0,0,0, 12,0,0,5,13,0,0,
  0,0,0,0,0,0,0, 0,0,0,0,0,0,0, 0,0,0,0,0,0,0, 0,0,0,0,0,0,0,
  0,26,9,1,1,0,0, 0,0,1,0,0,0,0, 0,0,0,0,0,0,0, 0,0,0,0,0,0,0,
  0,0,0,0,0,0,0, 0,3,0,1,0,0,0, 0,0,1,0,1,1,0, 0,0,0,0,0,0,0,
  0,0,0,0,0,0,0, 0,0,0,0,0,0,0, 0,1,0,0,0,0,0, 0,0,0,0,0,0,0,
  0,0,0,0,0,0,0, 0,0,0,0,0,0,0, 0,0,0,0,0,0,0, 0,0,0,0,0,0,0,
  0,0,0,2,0,3,0, 4,0,0,4,4,0,6, 2,6,8,4,0,0,5, 7,4,0,0,0,0,1,
  1,0,1,0,1,2,0, 3,0,3,0,3,1,0, 0,0,0,0,0,0,0, 0,0,10,1,2,0,1,
  1,1,3,12,0,1,0, 0,0,0,0,0,0,0, 0,0,0,0,0,0,0, 0,0,2,15,10,4,10,
  6,3,1,0,8,5,5, 8,0,11,2,10,14,3, 7,3,0,0,3,0,5, 2,7,25,2,
]

const countToIntensity = (count: number): number => {
  if (count === 0) return 0
  if (count <= 2) return 1
  if (count <= 5) return 2
  if (count <= 10) return 3
  return 4
}

// ─── 网格布局常量 ────────────────────────────────────────────
const WEEKS = 53
const DAYS = 7
const CELL = 14  // 方格边长 px
const GAP = 3    // 方格间距 px
const STEP = CELL + GAP  // 单步 = 17px
const GRID_W = WEEKS * STEP
const GRID_H = DAYS * STEP
const GRID_X = (1920 - GRID_W) / 2
const GRID_Y = (1080 - GRID_H) / 2

// 月份标签（真实日历：起始 2025-03-23，week 0 = 3 月末尾）
const MONTH_LABELS = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar']
const MONTH_WEEKS = [1, 5, 10, 14, 19, 23, 27, 32, 36, 40, 45, 49]

// ─── 数据生成 ────────────────────────────────────────────────
const generateContributions = (): ContributionDay[] => {
  const data: ContributionDay[] = []
  for (let i = 0; i < RAW_COUNTS.length && i < WEEKS * DAYS; i++) {
    data.push({
      week: Math.floor(i / 7),
      day: i % 7,
      intensity: countToIntensity(RAW_COUNTS[i]),
      count: RAW_COUNTS[i],
    })
  }
  return data
}

const DEFAULT_CONTRIBUTIONS = generateContributions()

// 真实 PR（日期 → 网格坐标，起始日 2025-03-23 Sun = w0 d0）
const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  { label: 'Merged PR #84 to cloudwego/abcoder', sub: 'Go 1.25 Sonic Dep · 2025-09-12', week: 24, day: 5 },
  { label: 'Merged PR #27 to hertz-contrib/jwt', sub: 'Fix Token Refresh · 2025-12-15', week: 38, day: 1 },
  { label: 'Merged PR #67 to hertz-contrib/otel', sub: 'Tracing Race Condition · 2025-12-25', week: 39, day: 4 },
  { label: 'PR #32 to hertz-contrib/jwt', sub: 'Transparent Refresh MW · 2026-03-10', week: 50, day: 2 },
]

// ─── 配色（Midnight Pearl）────────────────────────────────────
const C = {
  bg: '#0a0a0a',
  surface: '#121214',
  surfaceLight: '#1a1a1f',
  text: '#f5f5f5',
  muted: '#a1a1aa',
  gold: '#d4af37',
  goldDim: 'rgba(212, 175, 55, 0.15)',
  goldGlow: 'rgba(212, 175, 55, 0.6)',
  gridLine: 'rgba(212, 175, 55, 0.04)',
  // 热力图四级色阶：深灰 → 珍珠白 → 金
  heat: ['#161618', '#2a2a2e', '#5c5c64', '#b8b8c0', '#d4af37'] as const,
}

const CL = { extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const }

const mono = (size: number, color = C.text, weight = 400): React.CSSProperties => ({
  fontSize: size,
  fontFamily: "'JetBrains Mono', monospace",
  color,
  fontWeight: weight,
})

// ─── 确定性伪随机（保证帧间一致）─────────────────────────────
const hash = (n: number) => {
  const v = Math.sin(n * 127.1 + 311.7) * 43758.5453
  return v - Math.floor(v)
}

// ─── 粒子飞入起点（预计算，避免每帧重算）─────────────────────
// 为每个有贡献的格子生成一个随机屏幕外起点
const computeParticleOrigins = (contributions: ContributionDay[]) =>
  contributions.map((_cell, i) => {
    const r = hash(i * 3.7)
    const angle = r * Math.PI * 2
    // 屏幕外 200-400px 处随机起点
    const dist = 300 + hash(i * 7.1) * 200
    return {
      x: 960 + Math.cos(angle) * dist * (1920 / 1080),
      y: 540 + Math.sin(angle) * dist,
    }
  })

// ─── 格子坐标工具 ───────────────────────────────────────────
const cellX = (week: number) => GRID_X + week * STEP
const cellY = (day: number) => GRID_Y + day * STEP
const cellCX = (week: number) => cellX(week) + CELL / 2
const cellCY = (day: number) => cellY(day) + CELL / 2

// ════════════════════════════════════════════════════════════════
// Phase 1: 星空背景 (0-4s)
// 深邃 Midnight Pearl，极细网格线渐显，粒子呼吸闪烁
// ════════════════════════════════════════════════════════════════
const CosmosPhase: React.FC<{ contributions: ContributionDay[] }> = ({ contributions }) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  // 网格线渐显
  const gridOpacity = interpolate(frame, [fps, 3 * fps], [0, 0.06], {
    ...CL, easing: Easing.out(Easing.quad),
  })

  // 标题入场
  const titleProgress = spring({ frame, fps, config: { damping: 200 }, durationInFrames: Math.round(1.2 * fps) })
  const subProgress = spring({ frame, fps, config: { damping: 200 }, delay: Math.round(0.5 * fps) })

  // 有贡献的格子作为"远方星尘"
  const activeCells = contributions.filter(c => c.intensity > 0)
  const dustScale = interpolate(frame, [0, 4 * fps], [0.2, 0.5], { ...CL, easing: Easing.out(Easing.quad) })
  const dustOpacity = interpolate(frame, [0.5 * fps, 3 * fps], [0, 0.12], CL)
  const perspZ = interpolate(frame, [0, 4 * fps], [0.45, 0.8], { ...CL, easing: Easing.out(Easing.quad) })

  return (
    <AbsoluteFill>
      <svg viewBox="0 0 1920 1080" style={{ width: '100%', height: '100%' }}>
        {/* 极细网格线 — 暗示贡献网格的存在 */}
        <g opacity={gridOpacity}>
          {Array.from({ length: WEEKS + 1 }, (_, i) => (
            <line key={`v${i}`}
              x1={GRID_X + i * STEP} y1={GRID_Y}
              x2={GRID_X + i * STEP} y2={GRID_Y + GRID_H}
              stroke={C.gold} strokeWidth={0.5}
            />
          ))}
          {Array.from({ length: DAYS + 1 }, (_, i) => (
            <line key={`h${i}`}
              x1={GRID_X} y1={GRID_Y + i * STEP}
              x2={GRID_X + GRID_W} y2={GRID_Y + i * STEP}
              stroke={C.gold} strokeWidth={0.5}
            />
          ))}
        </g>

        {/* 远方星尘 — 有贡献的格子以微弱光点出现在对应位置 */}
        <g style={{ transform: `translate(960px, 540px) scale(${perspZ}) translate(-960px, -540px)` }}>
          {activeCells.map((cell, i) => {
            const cx = cellCX(cell.week)
            const cy = cellCY(cell.day)
            const drift = Math.sin(i * 0.7 + frame * 0.015) * 4
            const driftY = Math.cos(i * 1.1 + frame * 0.012) * 3
            const twinkle = interpolate(
              (frame + i * 17) % (2.5 * fps),
              [0, 1.25 * fps, 2.5 * fps],
              [0.3, 1, 0.3],
              { easing: Easing.inOut(Easing.sin) },
            )
            const delay = (i * 0.6) % (2 * fps)
            const fadeIn = interpolate(frame, [delay, delay + fps], [0, 1], CL)

            return (
              <rect key={`${cell.week}-${cell.day}`}
                x={cx - CELL * dustScale / 2 + drift}
                y={cy - CELL * dustScale / 2 + driftY}
                width={CELL * dustScale} height={CELL * dustScale}
                rx={2}
                fill={C.heat[cell.intensity]}
                opacity={dustOpacity * fadeIn * twinkle * (0.4 + cell.intensity * 0.15)}
              />
            )
          })}
        </g>
      </svg>

      {/* 标题 */}
      <div style={{
        position: 'absolute', top: 100, left: 0, right: 0, textAlign: 'center',
      }}>
        <div style={{
          ...mono(18, C.gold, 600), letterSpacing: 6,
          opacity: interpolate(titleProgress, [0, 1], [0, 0.8]),
          transform: `translateY(${interpolate(titleProgress, [0, 1], [20, 0])}px)`,
        }}>
          CONTRIBUTION HEATMAP
        </div>
        <div style={{
          ...mono(12, C.muted), letterSpacing: 2, marginTop: 10,
          opacity: interpolate(subProgress, [0, 1], [0, 0.5]),
        }}>
          365 Days of Building · 356 Contributions
        </div>
        <div style={{
          ...mono(10, C.muted), letterSpacing: 2, marginTop: 6,
          opacity: interpolate(subProgress, [0, 1], [0, 0.35]),
        }}>
          2025.03 — 2026.03 · @masonsxu
        </div>
      </div>

      {/* 阶段标签 */}
      <div style={{
        position: 'absolute', bottom: 50, left: '50%', transform: 'translateX(-50%)',
        opacity: interpolate(frame, [2 * fps, 2.5 * fps], [0, 0.4], CL),
      }}>
        <span style={{ ...mono(12, C.muted), letterSpacing: 3 }}>PHASE 01 / THE COSMOS</span>
      </div>
    </AbsoluteFill>
  )
}

// ════════════════════════════════════════════════════════════════
// Phase 2: 粒子汇聚 (4-12s)
// 金色粒子从屏幕随机位置飞入对应方格，被击中的格子产生涟漪脉冲
// ════════════════════════════════════════════════════════════════
const ConvergePhase: React.FC<{ contributions: ContributionDay[] }> = React.memo(({ contributions }) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  // 预计算粒子起点
  const origins = React.useMemo(() => computeParticleOrigins(contributions), [contributions])

  // 缓慢 zoom in
  const zoom = interpolate(frame, [0, 8 * fps], [0.88, 1.0], { ...CL, easing: Easing.out(Easing.quad) })

  // 序贯激活：8s 内依次点亮全部 371 个格子
  const totalCells = WEEKS * DAYS
  const activeDur = 7.5 * fps
  const activeStart = 0.3 * fps

  // 网格外框
  const borderOpacity = interpolate(frame, [0, fps], [0, 0.08], CL)

  return (
    <AbsoluteFill>
      <svg viewBox="0 0 1920 1080"
        style={{ width: '100%', height: '100%', transform: `scale(${zoom})` }}
      >
        <defs>
          <filter id="hmGlow">
            <feGaussianBlur stdDeviation="5" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <radialGradient id="rippleGrad">
            <stop offset="0%" stopColor={C.gold} stopOpacity="0.3" />
            <stop offset="100%" stopColor={C.gold} stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* 流动虚线外框 */}
        <rect
          x={GRID_X - 16} y={GRID_Y - 32}
          width={GRID_W + 32} height={GRID_H + 64}
          rx={10} fill="none" stroke={C.gold} strokeWidth={0.8}
          strokeDasharray="10 8" strokeDashoffset={-frame * 0.4}
          opacity={borderOpacity}
        />

        {/* 月份标签 */}
        {MONTH_LABELS.map((month, mi) => {
          const mx = GRID_X + MONTH_WEEKS[mi] * STEP
          const op = interpolate(frame, [0.3 * fps + mi * 2, 1.2 * fps + mi * 2], [0, 0.35], CL)
          return (
            <text key={month} x={mx} y={GRID_Y - 14}
              fill={C.muted} fontSize={10} fontFamily="'JetBrains Mono', monospace"
              opacity={op}>
              {month}
            </text>
          )
        })}

        {/* 星期标签 */}
        {[1, 3, 5].map(di => (
          <text key={di} x={GRID_X - 10} y={cellCY(di) + 4}
            fill={C.muted} fontSize={9} fontFamily="'JetBrains Mono', monospace"
            textAnchor="end"
            opacity={interpolate(frame, [0.3 * fps, 1.2 * fps], [0, 0.3], CL)}>
            {['', 'Mon', '', 'Wed', '', 'Fri', ''][di]}
          </text>
        ))}

        {/* ═══ 371 个贡献方格 + 粒子飞入 + 涟漪 ═══ */}
        {contributions.map((cell, i) => {
          const idx = cell.week * DAYS + cell.day
          const activateAt = activeStart + (idx / totalCells) * activeDur
          const progress = interpolate(frame, [activateAt, activateAt + 8], [0, 1], CL)

          const cx = cellX(cell.week)
          const cy = cellY(cell.day)
          const ccx = cx + CELL / 2
          const ccy = cy + CELL / 2

          const color = C.heat[cell.intensity]
          const targetOp = cell.intensity === 0 ? 0.35 : 0.9

          // ── 粒子飞入轨迹（仅 intensity > 0）──
          // 使用 cubic easing 模拟加速→减速的丝滑轨迹
          const hasParticle = cell.intensity > 0
          let particleX = 0, particleY = 0, particleOp = 0
          if (hasParticle) {
            const org = origins[i]
            const pStart = activateAt - 12 // 提前 12 帧开始飞
            const pEnd = activateAt + 2
            const pt = interpolate(frame, [pStart, pEnd], [0, 1], CL)
            // Easing.bezier 做出丝滑的 S 曲线轨迹
            const eased = interpolate(pt, [0, 1], [0, 1], {
              easing: Easing.bezier(0.25, 0.1, 0.25, 1),
            })
            particleX = org.x + (ccx - org.x) * eased
            particleY = org.y + (ccy - org.y) * eased
            particleOp = interpolate(pt, [0, 0.05, 0.85, 1], [0, 0.95, 0.95, 0], CL)
          }

          // ── 涟漪脉冲（仅 intensity > 0）──
          const rippleT = hasParticle
            ? interpolate(frame, [activateAt, activateAt + 18], [0, 1], CL)
            : 0
          const rippleR = interpolate(rippleT, [0, 1], [2, 22])
          const rippleOp = interpolate(rippleT, [0, 0.2, 1], [0, 0.5, 0], CL)

          // ── 击中白闪 ──
          const flashOp = hasParticle
            ? interpolate(frame, [activateAt, activateAt + 2, activateAt + 8], [0, 0.7, 0], CL)
            : 0

          return (
            <g key={`${cell.week}-${cell.day}`}>
              {/* 涟漪圆 */}
              {rippleT > 0 && rippleT < 1 && (
                <circle cx={ccx} cy={ccy} r={rippleR}
                  fill="url(#rippleGrad)" opacity={rippleOp}
                />
              )}
              {/* 击中闪光 */}
              {flashOp > 0 && (
                <rect x={cx - 1} y={cy - 1}
                  width={CELL + 2} height={CELL + 2} rx={3}
                  fill={cell.intensity >= 4 ? C.gold : C.text}
                  opacity={flashOp * 0.5} filter="url(#hmGlow)"
                />
              )}
              {/* 方格本体 */}
              <rect x={cx} y={cy} width={CELL} height={CELL} rx={2}
                fill={color}
                opacity={interpolate(progress, [0, 1], [0.06, targetOp])}
              />
              {/* 飞入粒子 */}
              {hasParticle && particleOp > 0 && (
                <>
                  {/* 粒子尾迹 */}
                  <circle cx={particleX} cy={particleY} r={6}
                    fill={C.gold} opacity={particleOp * 0.08}
                  />
                  {/* 核心光点 */}
                  <circle cx={particleX} cy={particleY} r={2.5}
                    fill={C.gold} opacity={particleOp} filter="url(#hmGlow)"
                  />
                </>
              )}
            </g>
          )
        })}
      </svg>

      {/* 右下角实时计数器 */}
      {(() => {
        const countVal = Math.round(interpolate(
          frame, [activeStart, activeStart + activeDur], [0, 356], CL,
        ))
        const counterOp = interpolate(frame, [fps, 1.5 * fps], [0, 0.6], CL)
        return (
          <div style={{
            position: 'absolute', bottom: 80, right: 120, opacity: counterOp,
            display: 'flex', alignItems: 'baseline', gap: 8,
          }}>
            <span style={{ ...mono(36, C.text, 700) }}>{countVal}</span>
            <span style={{ ...mono(12, C.muted), letterSpacing: 1 }}>contributions</span>
          </div>
        )
      })()}

      {/* 阶段标签 */}
      <div style={{
        position: 'absolute', bottom: 40, left: '50%', transform: 'translateX(-50%)',
        opacity: interpolate(frame, [0.5 * fps, fps], [0, 0.35], CL),
      }}>
        <span style={{ ...mono(12, C.muted), letterSpacing: 3 }}>PHASE 02 / CONVERGE</span>
      </div>
    </AbsoluteFill>
  )
})

// ════════════════════════════════════════════════════════════════
// Phase 3: 关键里程碑标注 (12-17s)
// 成就悬浮卡片 spring 弹出 + 对应格子金色脉冲 + SVG 连接线
// ════════════════════════════════════════════════════════════════
const MilestonePhase: React.FC<{
  contributions: ContributionDay[]
  achievements: Achievement[]
}> = ({ contributions, achievements }) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  // 每个成就卡片的间隔帧
  const cardInterval = Math.round(1.1 * fps)

  // 统计数据
  const activeDays = contributions.filter(c => c.intensity > 0).length
  const highDays = contributions.filter(c => c.intensity >= 3).length

  return (
    <AbsoluteFill>
      {/* 完整热力图（已填充状态）+ 成就光晕 — 统一 SVG 层 */}
      <svg viewBox="0 0 1920 1080" style={{ width: '100%', height: '100%' }}>
        <defs>
          <filter id="msGlow">
            <feGaussianBlur stdDeviation="8" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* 月份标签 */}
        {MONTH_LABELS.map((m, i) => (
          <text key={m} x={GRID_X + MONTH_WEEKS[i] * STEP} y={GRID_Y - 14}
            fill={C.muted} fontSize={10} fontFamily="'JetBrains Mono', monospace" opacity={0.3}>
            {m}
          </text>
        ))}

        {/* 完整热力图 */}
        {contributions.map((cell) => {
          const cx = cellX(cell.week), cy = cellY(cell.day)
          const ccx = cx + CELL / 2, ccy = cy + CELL / 2

          // 检查是否为成就格子
          const ai = achievements.findIndex(a => a.week === cell.week && a.day === cell.day)
          const isAch = ai >= 0

          // 成就格子脉冲光芒
          let glow = 0
          if (isAch) {
            const achAt = ai * cardInterval
            const achIn = interpolate(frame, [achAt, achAt + Math.round(0.4 * fps)], [0, 1], CL)
            const pulse = interpolate(
              (frame - achAt) % fps, [0, 0.5 * fps, fps], [0.6, 1, 0.6],
              { easing: Easing.inOut(Easing.sin) },
            )
            glow = achIn * pulse
          }

          return (
            <g key={`${cell.week}-${cell.day}`}>
              {/* 成就光晕 */}
              {isAch && glow > 0 && (
                <>
                  <circle cx={ccx} cy={ccy} r={24 * glow}
                    fill={C.gold} opacity={0.06 * glow} />
                  <circle cx={ccx} cy={ccy} r={14 * glow}
                    fill={C.gold} opacity={0.15 * glow} filter="url(#msGlow)" />
                </>
              )}
              {/* 方格 */}
              <rect x={cx} y={cy} width={CELL} height={CELL} rx={2}
                fill={isAch && glow > 0.3 ? C.gold : C.heat[cell.intensity]}
                opacity={cell.intensity === 0 ? 0.35 : (isAch && glow > 0.3 ? glow : 0.9)}
              />
            </g>
          )
        })}

        {/* 连接虚线：从成就格子到右侧卡片区域 */}
        {achievements.map((ach, i) => {
          const achAt = i * cardInterval
          const lineOp = interpolate(frame, [achAt + 5, achAt + Math.round(0.5 * fps)], [0, 0.2], CL)
          const fromX = cellCX(ach.week)
          const fromY = cellCY(ach.day)
          // 卡片右侧起始 x
          const toX = 1560
          const toY = 260 + i * 110

          // 贝塞尔连接线
          const midX = (fromX + toX) / 2 + 60
          return (
            <path key={`line-${i}`}
              d={`M ${fromX} ${fromY} C ${midX} ${fromY} ${midX} ${toY} ${toX} ${toY}`}
              fill="none" stroke={C.gold} strokeWidth={1}
              strokeDasharray="4 4" opacity={lineOp}
            />
          )
        })}
      </svg>

      {/* 成就悬浮卡片 */}
      {achievements.map((ach, i) => {
        const achAt = i * cardInterval
        // spring 抖动效果：damping 12 让卡片有明显弹性
        const cardSpring = spring({
          frame, fps,
          config: { damping: 12, stiffness: 180 },
          delay: achAt,
        })
        const cardOp = interpolate(cardSpring, [0, 1], [0, 1])
        const cardX = interpolate(cardSpring, [0, 1], [80, 0])
        const cardScale = interpolate(cardSpring, [0, 1], [0.85, 1])

        return (
          <div key={i} style={{
            position: 'absolute',
            right: 80,
            top: 240 + i * 110,
            opacity: cardOp,
            transform: `translateX(${cardX}px) scale(${cardScale})`,
          }}>
            <div style={{
              padding: '14px 20px',
              backgroundColor: C.surfaceLight,
              border: `1px solid ${C.goldDim}`,
              borderLeft: `3px solid ${C.gold}`,
              borderRadius: 10,
              minWidth: 280,
              backdropFilter: 'blur(8px)',
            }}>
              {/* 状态标识 */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6,
              }}>
                <div style={{
                  width: 8, height: 8, borderRadius: '50%',
                  backgroundColor: ach.label.startsWith('Merged') ? '#4ade80' : C.gold,
                }} />
                <span style={{ ...mono(9, ach.label.startsWith('Merged') ? '#4ade80' : C.gold, 600), letterSpacing: 1 }}>
                  {ach.label.startsWith('Merged') ? 'MERGED' : 'SUBMITTED'}
                </span>
              </div>
              {/* 主标题 */}
              <div style={{ ...mono(13, C.text, 600), letterSpacing: 0.3, lineHeight: 1.4 }}>
                {ach.label}
              </div>
              {/* 副标题 */}
              <div style={{ ...mono(10, C.muted), marginTop: 4, letterSpacing: 0.5 }}>
                {ach.sub}
              </div>
            </div>
          </div>
        )
      })}

      {/* 左下角统计 */}
      {(() => {
        const statsAt = Math.round(3.5 * fps)
        const statsSp = spring({ frame, fps, config: { damping: 200 }, delay: statsAt })
        return (
          <div style={{
            position: 'absolute', left: 100, bottom: 120,
            opacity: interpolate(statsSp, [0, 1], [0, 1]),
            transform: `translateY(${interpolate(statsSp, [0, 1], [12, 0])}px)`,
            display: 'flex', gap: 28, alignItems: 'center',
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ ...mono(30, C.text, 700) }}>356</div>
              <div style={{ ...mono(9, C.muted), letterSpacing: 1.5 }}>TOTAL</div>
            </div>
            <div style={{ width: 1, height: 36, backgroundColor: C.gold, opacity: 0.2 }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ ...mono(30, C.gold, 700) }}>{activeDays}</div>
              <div style={{ ...mono(9, C.muted), letterSpacing: 1.5 }}>ACTIVE DAYS</div>
            </div>
            <div style={{ width: 1, height: 36, backgroundColor: C.gold, opacity: 0.2 }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ ...mono(30, C.gold, 700) }}>{highDays}</div>
              <div style={{ ...mono(9, C.muted), letterSpacing: 1.5 }}>HIGH INTENSITY</div>
            </div>
          </div>
        )
      })()}

      {/* 阶段标签 */}
      <div style={{
        position: 'absolute', bottom: 40, left: '50%', transform: 'translateX(-50%)',
        opacity: interpolate(frame, [0.3 * fps, 0.8 * fps], [0, 0.35], CL),
      }}>
        <span style={{ ...mono(12, C.muted), letterSpacing: 3 }}>PHASE 03 / MILESTONES</span>
      </div>
    </AbsoluteFill>
  )
}

// ════════════════════════════════════════════════════════════════
// Phase 4: 宏观定格 (17-20s)
// 镜头拉远展示全年完整贡献版图，中央文字浮现后淡出
// ════════════════════════════════════════════════════════════════
const FinalePhase: React.FC<{ contributions: ContributionDay[] }> = ({ contributions }) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const fadeIn = interpolate(frame, [0, 0.8 * fps], [0, 1], { ...CL, easing: Easing.out(Easing.quad) })
  const wallScale = interpolate(frame, [0, 1.2 * fps], [1.0, 0.82], { ...CL, easing: Easing.out(Easing.quad) })
  const wallOp = interpolate(frame, [0, 0.8 * fps], [0.8, 0.2], CL)

  // 中央文字
  const sloganSp = spring({ frame, fps, config: { damping: 200 }, delay: Math.round(0.6 * fps) })
  const lineSp = spring({ frame, fps, config: { damping: 200 }, delay: Math.round(1.2 * fps) })
  const domainSp = spring({ frame, fps, config: { damping: 200 }, delay: Math.round(1.6 * fps) })

  // 辉光
  const glowR = interpolate(frame, [0, 1.5 * fps], [0, 420], { ...CL, easing: Easing.out(Easing.quad) })
  const glowOp = interpolate(frame, [0, 0.8 * fps, 1.5 * fps], [0, 0.12, 0.04], CL)

  // 尾部淡出
  const fadeOut = interpolate(frame, [2.4 * fps, 3 * fps], [1, 0], CL)

  return (
    <AbsoluteFill style={{ opacity: fadeIn * fadeOut }}>
      {/* 中心辉光 */}
      <svg viewBox="0 0 1920 1080" style={{ position: 'absolute', width: '100%', height: '100%' }}>
        <defs>
          <radialGradient id="fGlow">
            <stop offset="0%" stopColor={C.gold} stopOpacity="0.08" />
            <stop offset="100%" stopColor={C.gold} stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx={960} cy={540} r={glowR} fill="url(#fGlow)" opacity={glowOp * 3} />
      </svg>

      {/* 缩小的完整热力图 */}
      <svg viewBox="0 0 1920 1080"
        style={{
          position: 'absolute', width: '100%', height: '100%',
          transform: `scale(${wallScale})`, opacity: wallOp,
        }}
      >
        {contributions.map((cell) => (
          <rect key={`${cell.week}-${cell.day}`}
            x={cellX(cell.week)} y={cellY(cell.day)}
            width={CELL} height={CELL} rx={2}
            fill={C.heat[cell.intensity]}
            opacity={cell.intensity === 0 ? 0.25 : 0.65}
          />
        ))}
      </svg>

      {/* 中央文字 */}
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 14,
      }}>
        <div style={{
          fontSize: 30, fontWeight: 400,
          fontFamily: "'Playfair Display', serif", fontStyle: 'italic',
          color: C.gold, letterSpacing: 2, textAlign: 'center',
          maxWidth: 900, lineHeight: 1.5,
          opacity: interpolate(sloganSp, [0, 1], [0, 1]),
          transform: `translateY(${interpolate(sloganSp, [0, 1], [20, 0])}px)`,
        }}>
          &ldquo;Architecture is a long-term commitment.&rdquo;
        </div>
        <div style={{
          width: interpolate(lineSp, [0, 1], [0, 260]),
          height: 1, backgroundColor: C.gold, opacity: 0.45,
        }} />
        <div style={{
          ...mono(13, C.muted), letterSpacing: 3,
          opacity: interpolate(domainSp, [0, 1], [0, 0.55]),
        }}>
          masonsxu-github-io.pages.dev
        </div>
      </div>
    </AbsoluteFill>
  )
}

// ════════════════════════════════════════════════════════════════
// 全局背景粒子（全时长 20s 呼吸闪烁）
// ════════════════════════════════════════════════════════════════
const AmbientParticles: React.FC = React.memo(() => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const opacity = interpolate(frame, [0, 2 * fps], [0, 1], {
    ...CL, easing: Easing.out(Easing.quad),
  })

  return (
    <AbsoluteFill>
      <svg viewBox="0 0 1920 1080" style={{ width: '100%', height: '100%', opacity }}>
        {Array.from({ length: 24 }, (_, i) => {
          const bx = (i * 137.5 * 7.3) % 1920
          const by = (i * 137.5 * 3.7) % 1080
          const speed = 0.3 + (i % 5) * 0.12
          const x = bx + interpolate(
            (frame + i * 1.2 * fps) % (10 * fps),
            [0, 5 * fps, 10 * fps], [0, 18 * speed, 0],
            { easing: Easing.inOut(Easing.sin) },
          )
          const y = by + interpolate(
            (frame + i * 1.2 * fps) % (8 * fps),
            [0, 4 * fps, 8 * fps], [0, -35 * speed, 0],
            { easing: Easing.inOut(Easing.sin) },
          )
          const tw = interpolate(
            (frame + i * 17) % (3 * fps),
            [0, 1.5 * fps, 3 * fps], [0.1, 0.5, 0.1],
            { easing: Easing.inOut(Easing.sin) },
          )
          return (
            <circle key={i} cx={x} cy={y}
              r={1 + (i % 3) * 0.4} fill={C.gold} opacity={tw}
            />
          )
        })}
      </svg>
    </AbsoluteFill>
  )
})

// ════════════════════════════════════════════════════════════════
// 主组合 — 20s / 600 帧 / 30fps / 1920×1080
// ════════════════════════════════════════════════════════════════
export const GitHubHeatmap: React.FC<HeatmapProps> = ({
  contributions = DEFAULT_CONTRIBUTIONS,
  achievements = DEFAULT_ACHIEVEMENTS,
}) => {
  const { fps } = useVideoConfig()

  return (
    <AbsoluteFill style={{ backgroundColor: C.bg }}>
      {/* 全时长背景粒子 */}
      <AmbientParticles />

      {/* Phase 1: 星空 + 网格隐现 (0-4s) */}
      <Sequence durationInFrames={Math.round(4 * fps)} premountFor={fps}>
        <CosmosPhase contributions={contributions} />
      </Sequence>

      {/* Phase 2: 粒子汇聚 + 方格生长 (4-12s) */}
      <Sequence from={Math.round(4 * fps)} durationInFrames={Math.round(8 * fps)} premountFor={fps}>
        <ConvergePhase contributions={contributions} />
      </Sequence>

      {/* Phase 3: 里程碑标注 (12-17s) */}
      <Sequence from={Math.round(12 * fps)} durationInFrames={Math.round(5 * fps)} premountFor={fps}>
        <MilestonePhase contributions={contributions} achievements={achievements} />
      </Sequence>

      {/* Phase 4: 宏观定格 (17-20s) */}
      <Sequence from={Math.round(17 * fps)} durationInFrames={Math.round(3 * fps)} premountFor={fps}>
        <FinalePhase contributions={contributions} />
      </Sequence>

      <div style={{ position: 'absolute', bottom: 24, right: 32, pointerEvents: 'none', opacity: 0.18 }}>
        <span style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: '#a1a1aa', fontWeight: 400, letterSpacing: 2 }}>Masons.Xu | 2026</span>
      </div>
    </AbsoluteFill>
  )
}
