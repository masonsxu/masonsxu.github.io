import {
  AbsoluteFill,
  Easing,
  Sequence,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion'

// ─── Props 类型（可通过 GitHub API 注入真实数据）─────────────────
export interface ProjectData {
  repoName: string
  stars: number
  prs: number
  merged: number
  agentsMdLines: number
}

const DEFAULT_DATA: ProjectData = {
  repoName: 'cloudwego-microservice-demo',
  stars: 3,
  prs: 0,
  merged: 0,
  agentsMdLines: 331,
}

// ─── 配色（Midnight Pearl）─────────────────────────────────────
const C = {
  bg: '#0a0a0a',
  surface: '#121214',
  text: '#f5f5f5',
  muted: '#a1a1aa',
  gold: '#d4af37',
  goldDim: 'rgba(212, 175, 55, 0.15)',
  goldGlow: 'rgba(212, 175, 55, 0.6)',
  gridLine: 'rgba(212, 175, 55, 0.06)',
  green: '#4ade80',
}

// ─── 背景网格 ──────────────────────────────────────────────────
const BackgroundGrid: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const gridSpacing = 60
  const cols = Math.ceil(1920 / gridSpacing) + 1
  const rows = Math.ceil(1080 / gridSpacing) + 1

  const driftX = interpolate(frame, [0, 20 * fps], [0, 40], {
    extrapolateRight: 'clamp',
  })
  const driftY = interpolate(frame, [0, 20 * fps], [0, -25], {
    extrapolateRight: 'clamp',
  })
  const gridOpacity = interpolate(frame, [0, 2 * fps], [0, 1], {
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.quad),
  })

  const particles = Array.from({ length: 16 }, (_, i) => {
    const seed = i * 137.5
    const baseX = (seed * 7.3) % 1920
    const baseY = (seed * 3.7) % 1080
    const speed = 0.3 + (i % 5) * 0.15

    const y = baseY + interpolate(
      (frame + i * 1.2 * fps) % (8 * fps),
      [0, 4 * fps, 8 * fps],
      [0, -40 * speed, 0],
      { easing: Easing.inOut(Easing.sin) },
    )
    const x = baseX + interpolate(
      (frame + i * 1.2 * fps) % (10 * fps),
      [0, 5 * fps, 10 * fps],
      [0, 20 * speed, 0],
      { easing: Easing.inOut(Easing.sin) },
    )
    const twinkle = interpolate(
      (frame + i * 15) % (3 * fps),
      [0, 1.5 * fps, 3 * fps],
      [0.2, 0.8, 0.2],
      { easing: Easing.inOut(Easing.sin) },
    )

    return (
      <circle
        key={i}
        cx={x}
        cy={y}
        r={1.5 + (i % 3) * 0.5}
        fill={C.gold}
        opacity={twinkle * gridOpacity}
      />
    )
  })

  return (
    <AbsoluteFill>
      <svg
        viewBox="0 0 1920 1080"
        style={{ width: '100%', height: '100%', opacity: gridOpacity }}
      >
        <g style={{ transform: `translate(${driftX}px, ${driftY}px)` }}>
          {Array.from({ length: cols }, (_, i) => (
            <line
              key={`v${i}`}
              x1={i * gridSpacing} y1={0}
              x2={i * gridSpacing} y2={1080}
              stroke={C.gridLine} strokeWidth={1}
            />
          ))}
          {Array.from({ length: rows }, (_, i) => (
            <line
              key={`h${i}`}
              x1={0} y1={i * gridSpacing}
              x2={1920} y2={i * gridSpacing}
              stroke={C.gridLine} strokeWidth={1}
            />
          ))}
        </g>
        {particles}
      </svg>
    </AbsoluteFill>
  )
}

// ─── 终端打字效果 (0–5s) ────────────────────────────────────────
const TerminalTyping: React.FC<{ data: ProjectData }> = ({ data }) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const CHAR_FRAMES = 2
  const CURSOR_BLINK = 16

  const line1 = `$ Fetching repository: ${data.repoName}...`
  const line2 = `[INFO] Stars: ${data.stars} | PRs: ${data.prs} | Merged: ${data.merged}`
  const line3 = `[INFO] AGENTS.md: ${data.agentsMdLines}+ lines of executable knowledge`
  const line4 = '$ Dashboard ready.'

  const lines = [line1, line2, line3, line4]
  const delays = [0, line1.length * CHAR_FRAMES + 10, 0, 0]
  // 计算每行的累积起始帧
  const lineStarts: number[] = []
  let cumFrame = 0
  for (let i = 0; i < lines.length; i++) {
    cumFrame += delays[i]
    lineStarts.push(cumFrame)
    cumFrame += lines[i].length * CHAR_FRAMES + 8
  }

  // 终端窗口弹入
  const termSpring = spring({
    frame,
    fps,
    config: { damping: 200 },
    durationInFrames: Math.round(0.8 * fps),
  })
  const termScale = interpolate(termSpring, [0, 1], [0.9, 1])
  const termOpacity = interpolate(termSpring, [0, 1], [0, 1])

  // 光标闪烁
  const cursorOpacity = interpolate(
    frame % CURSOR_BLINK,
    [0, CURSOR_BLINK / 2, CURSOR_BLINK],
    [1, 0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  )

  // 卡片弹出（在打字完成后）
  const cardDelay = cumFrame + 5
  const cardSpring = spring({
    frame,
    fps,
    config: { damping: 15, stiffness: 80 },
    delay: cardDelay,
  })
  const cardScale = interpolate(cardSpring, [0, 1], [0.8, 1])
  const cardOpacity = interpolate(cardSpring, [0, 1], [0, 1])

  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
      {/* 终端窗口 */}
      <div
        style={{
          width: 1200,
          transform: `scale(${termScale})`,
          opacity: termOpacity,
        }}
      >
        {/* 标题栏 */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '12px 16px',
            backgroundColor: '#1a1a1e',
            borderRadius: '12px 12px 0 0',
            borderBottom: `1px solid ${C.goldDim}`,
          }}
        >
          <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#ff5f56' }} />
          <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#ffbd2e' }} />
          <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#27c93f' }} />
          <span
            style={{
              marginLeft: 12,
              fontSize: 14,
              fontFamily: "'JetBrains Mono', monospace",
              color: C.muted,
            }}
          >
            terminal — {data.repoName}
          </span>
        </div>

        {/* 终端内容 */}
        <div
          style={{
            padding: '24px 28px',
            backgroundColor: C.surface,
            borderRadius: '0 0 12px 12px',
            border: `1px solid ${C.goldDim}`,
            borderTop: 'none',
            minHeight: 200,
          }}
        >
          {lines.map((line, i) => {
            const localFrame = frame - lineStarts[i]
            if (localFrame < 0) return null

            const chars = Math.min(
              line.length,
              Math.floor(localFrame / CHAR_FRAMES),
            )
            const typed = line.slice(0, chars)
            const isComplete = chars >= line.length
            const isActive = i === lines.length - 1
              ? !isComplete
              : !isComplete || (i < lines.length - 1 && frame < lineStarts[i + 1])

            return (
              <div
                key={i}
                style={{
                  fontSize: 20,
                  fontFamily: "'JetBrains Mono', monospace",
                  color: line.startsWith('$') ? C.green : C.text,
                  lineHeight: 1.8,
                  whiteSpace: 'pre',
                }}
              >
                <span>{typed}</span>
                {isActive && !isComplete && (
                  <span style={{ opacity: cursorOpacity, color: C.gold }}>|</span>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* 右下方预告卡片 */}
      <div
        style={{
          position: 'absolute',
          bottom: 120,
          right: 200,
          opacity: cardOpacity,
          transform: `scale(${cardScale})`,
          padding: '16px 24px',
          backgroundColor: C.surface,
          border: `1px solid ${C.goldDim}`,
          borderRadius: 10,
        }}
      >
        <span
          style={{
            fontSize: 16,
            fontFamily: "'Noto Sans SC', sans-serif",
            color: C.gold,
          }}
        >
          Loading Dashboard...
        </span>
      </div>
    </AbsoluteFill>
  )
}

// ─── 数据增长 + 环形进度 (5–12s) ────────────────────────────────
const DataGrowth: React.FC<{ data: ProjectData }> = ({ data }) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  // 整体入场
  const enterSpring = spring({
    frame,
    fps,
    config: { damping: 200 },
    durationInFrames: Math.round(1 * fps),
  })

  const metrics = [
    { label: 'Stars', value: data.stars, icon: '\u2605', color: '#fbbf24' },
    { label: 'Pull Requests', value: data.prs, icon: '\u21C4', color: '#60a5fa' },
    { label: 'Merged', value: data.merged, icon: '\u2713', color: '#34d399' },
    { label: 'AGENTS.md Lines', value: data.agentsMdLines, icon: '\u2630', color: C.gold },
  ]

  // 数字滚动时间：0 到 5s 内完成
  const rollDuration = 5 * fps

  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
      <div
        style={{
          display: 'flex',
          gap: 60,
          opacity: enterSpring,
          transform: `translateY(${interpolate(enterSpring, [0, 1], [40, 0])}px)`,
        }}
      >
        {/* 左侧：4个指标卡片 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
          {metrics.map((m, i) => {
            const delay = i * Math.round(0.3 * fps)
            const cardSpring = spring({
              frame,
              fps,
              config: { damping: 20, stiffness: 200 },
              delay,
            })
            const cardX = interpolate(cardSpring, [0, 1], [-60, 0])
            const cardOpacity = interpolate(cardSpring, [0, 1], [0, 1])

            // 数字滚动
            const rollStart = delay + Math.round(0.5 * fps)
            const currentValue = Math.round(
              interpolate(
                frame,
                [rollStart, rollStart + rollDuration],
                [0, m.value],
                { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.quad) },
              ),
            )

            // 金色外发光脉动
            const glowPulse = interpolate(
              (frame + i * 20) % (2 * fps),
              [0, fps, 2 * fps],
              [0.4, 1, 0.4],
              { easing: Easing.inOut(Easing.sin) },
            )

            return (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 20,
                  opacity: cardOpacity,
                  transform: `translateX(${cardX}px)`,
                  padding: '18px 28px',
                  backgroundColor: C.surface,
                  border: `1px solid ${C.goldDim}`,
                  borderRadius: 10,
                  minWidth: 380,
                }}
              >
                <span style={{ fontSize: 32, color: m.color }}>{m.icon}</span>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: 14,
                      fontFamily: "'Noto Sans SC', sans-serif",
                      color: C.muted,
                      letterSpacing: 1,
                    }}
                  >
                    {m.label}
                  </div>
                  <div
                    style={{
                      fontSize: 42,
                      fontWeight: 700,
                      fontFamily: "'JetBrains Mono', monospace",
                      color: C.text,
                      textShadow: `0 0 ${20 * glowPulse}px ${C.goldGlow}`,
                    }}
                  >
                    {m.label === 'AGENTS.md Lines' ? `${currentValue}+` : currentValue}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* 右侧：环形进度条 */}
        <RingProgress frame={frame} fps={fps} value={data.agentsMdLines} />
      </div>
    </AbsoluteFill>
  )
}

// ─── 环形进度条子组件 ──────────────────────────────────────────
const RingProgress: React.FC<{ frame: number; fps: number; value: number }> = ({
  frame,
  fps,
  value,
}) => {
  const radius = 160
  const strokeWidth = 14
  const center = 200
  const circumference = 2 * Math.PI * radius

  // 进度动画：从 0 到目标百分比
  const targetPercent = Math.min(value / 400, 1)
  const progress = interpolate(
    frame,
    [Math.round(0.5 * fps), Math.round(5 * fps)],
    [0, targetPercent],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.quad) },
  )
  const offset = circumference * (1 - progress)

  // 百分比数字
  const displayPercent = Math.round(progress * 100)

  // 外发光脉动
  const glowPulse = interpolate(
    frame % (2 * fps),
    [0, fps, 2 * fps],
    [0.3, 0.8, 0.3],
    { easing: Easing.inOut(Easing.sin) },
  )

  // 入场弹性
  const ringSpring = spring({
    frame,
    fps,
    config: { damping: 200 },
    durationInFrames: Math.round(1 * fps),
  })

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 20,
        opacity: ringSpring,
        transform: `scale(${interpolate(ringSpring, [0, 1], [0.8, 1])})`,
      }}
    >
      <svg width={center * 2} height={center * 2} viewBox={`0 0 ${center * 2} ${center * 2}`}>
        {/* 背景圆环 */}
        <circle
          cx={center} cy={center} r={radius}
          fill="none"
          stroke={C.goldDim}
          strokeWidth={strokeWidth}
        />
        {/* 进度圆环 */}
        <circle
          cx={center} cy={center} r={radius}
          fill="none"
          stroke={C.gold}
          strokeWidth={strokeWidth}
          strokeDasharray={`${circumference}`}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${center} ${center})`}
          style={{
            filter: `drop-shadow(0 0 ${12 * glowPulse}px ${C.goldGlow})`,
          }}
        />
        {/* 中心文字 */}
        <text
          x={center} y={center - 15}
          textAnchor="middle"
          dominantBaseline="middle"
          fill={C.text}
          fontSize={56}
          fontWeight={700}
          fontFamily="'JetBrains Mono', monospace"
          style={{
            filter: `drop-shadow(0 0 ${10 * glowPulse}px ${C.goldGlow})`,
          }}
        >
          {displayPercent}%
        </text>
        <text
          x={center} y={center + 30}
          textAnchor="middle"
          dominantBaseline="middle"
          fill={C.muted}
          fontSize={16}
          fontFamily="'Noto Sans SC', sans-serif"
        >
          AI Knowledge Encoded
        </text>
      </svg>
      <div
        style={{
          fontSize: 14,
          fontFamily: "'Noto Sans SC', sans-serif",
          color: C.gold,
          letterSpacing: 2,
        }}
      >
        AI 可执行知识编码进度
      </div>
    </div>
  )
}

// ─── 微服务拓扑 (12–18s) ────────────────────────────────────────
// 真实架构：Client → Hertz Gateway → Identity Service (Kitex) → Storage Layer
interface TopoNode {
  id: string
  label: string
  sub: string
  x: number
  y: number
  w: number
  h: number
  color: string
  iconChar: string
}

interface TopoEdge {
  from: string
  to: string
  path: string
  label?: string
}

const TOPO_NODES: TopoNode[] = [
  // 第 1 层：客户端
  { id: 'client', label: 'Client', sub: 'Web / App / API', x: 60, y: 400, w: 150, h: 72, color: '#94a3b8', iconChar: '\u{1F310}' },
  // 第 2 层：API 网关（Hertz）
  { id: 'gateway', label: 'Hertz Gateway', sub: ':8080 · HTTP Router', x: 340, y: 400, w: 210, h: 72, color: '#34d399', iconChar: '\u{26A1}' },
  // 中间件展示卡片（网关下方）
  { id: 'mw', label: 'Middleware Chain', sub: 'JWT → Casbin → OTel → CORS', x: 340, y: 530, w: 210, h: 56, color: '#34d399', iconChar: '\u{1F6E1}' },
  // 第 3 层：Identity Service（Kitex RPC）
  { id: 'identity', label: 'Identity Service', sub: ':8891 · Kitex (Thrift)', x: 700, y: 400, w: 230, h: 72, color: C.gold, iconChar: '\u{1F464}' },
  // 业务模块展示（Identity 下方）
  { id: 'modules', label: '9 Modules', sub: 'Auth·User·Org·Role·Menu...', x: 700, y: 530, w: 230, h: 56, color: C.gold, iconChar: '\u{1F4E6}' },
  // 第 4 层：存储
  { id: 'pg', label: 'PostgreSQL', sub: ':5432 · GORM', x: 1080, y: 215, w: 170, h: 64, color: '#60a5fa', iconChar: '\u{1F5C4}' },
  { id: 'redis', label: 'Redis', sub: ':6379 · Cache', x: 1080, y: 325, w: 170, h: 64, color: '#f87171', iconChar: '\u{26A1}' },
  { id: 'rustfs', label: 'RustFS (S3)', sub: ':9000 · Object', x: 1080, y: 435, w: 170, h: 64, color: '#fb923c', iconChar: '\u{1F4BE}' },
  { id: 'etcd', label: 'etcd', sub: ':2379 · Discovery', x: 1080, y: 545, w: 170, h: 64, color: '#a78bfa', iconChar: '\u{1F50D}' },
  { id: 'jaeger', label: 'Jaeger', sub: ':16686 · Tracing', x: 1080, y: 655, w: 170, h: 64, color: '#2dd4bf', iconChar: '\u{1F4CA}' },
]

const TOPO_EDGES: TopoEdge[] = [
  { from: 'client', to: 'gateway', path: 'M 210 436 C 260 436 290 436 340 436', label: 'HTTP' },
  { from: 'gateway', to: 'identity', path: 'M 550 436 C 600 436 650 436 700 436', label: 'Thrift RPC' },
  { from: 'gateway', to: 'mw', path: 'M 445 472 C 445 490 445 510 445 530' },
  { from: 'identity', to: 'modules', path: 'M 815 472 C 815 490 815 510 815 530' },
  // Identity → 存储层
  { from: 'identity', to: 'pg', path: 'M 930 420 C 980 420 1020 260 1080 247' },
  { from: 'identity', to: 'redis', path: 'M 930 430 C 980 430 1030 365 1080 357' },
  { from: 'identity', to: 'rustfs', path: 'M 930 445 C 975 445 1030 460 1080 467' },
  { from: 'identity', to: 'etcd', path: 'M 930 455 C 980 455 1020 565 1080 577' },
  { from: 'identity', to: 'jaeger', path: 'M 930 465 C 980 465 1020 670 1080 687' },
  // Gateway 也连 Redis 和 etcd
  { from: 'gateway', to: 'redis', path: 'M 550 420 C 750 350 950 340 1080 357' },
  { from: 'gateway', to: 'etcd', path: 'M 550 455 C 750 520 950 560 1080 577' },
]

const LAYER_LABELS = [
  { text: 'ENTRY', x: 135, color: '#94a3b8' },
  { text: 'GATEWAY', x: 445, color: '#34d399' },
  { text: 'RPC SERVICE', x: 815, color: C.gold },
  { text: 'INFRASTRUCTURE', x: 1165, color: '#60a5fa' },
]

const TopologyAnimation: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const titleSpring = spring({
    frame,
    fps,
    config: { damping: 200 },
    durationInFrames: Math.round(1 * fps),
  })

  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
      {/* 标题 */}
      <div
        style={{
          position: 'absolute',
          top: 40,
          width: '100%',
          textAlign: 'center',
          opacity: titleSpring,
          transform: `translateY(${interpolate(titleSpring, [0, 1], [20, 0])}px)`,
        }}
      >
        <span
          style={{
            fontSize: 34,
            fontWeight: 300,
            fontFamily: "'Noto Sans SC', sans-serif",
            color: C.text,
            letterSpacing: 4,
          }}
        >
          Production Architecture
        </span>
        <span
          style={{
            display: 'block',
            marginTop: 6,
            fontSize: 15,
            color: C.muted,
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          CloudWeGo &middot; Hertz Gateway + Kitex Identity Service
        </span>
      </div>

      <svg viewBox="0 0 1350 800" style={{ width: '90%', height: '82%', marginTop: 50 }}>
        <defs>
          <linearGradient id="edgeGradH" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style={{ stopColor: C.gold, stopOpacity: 0.1 }} />
            <stop offset="50%" style={{ stopColor: C.gold, stopOpacity: 0.45 }} />
            <stop offset="100%" style={{ stopColor: C.gold, stopOpacity: 0.1 }} />
          </linearGradient>
          <linearGradient id="nodeFill" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#1a1a1f', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#121215', stopOpacity: 1 }} />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* 分层标签 */}
        {LAYER_LABELS.map((label, i) => {
          const labelSpring = spring({ frame, fps, config: { damping: 200 }, delay: i * Math.round(0.15 * fps) })
          return (
            <text
              key={label.text}
              x={label.x}
              y={175}
              textAnchor="middle"
              fill={label.color}
              fontSize={11}
              fontFamily="'JetBrains Mono', monospace"
              fontWeight={600}
              letterSpacing={2.5}
              opacity={interpolate(labelSpring, [0, 1], [0, 0.5])}
            >
              {label.text}
            </text>
          )
        })}

        {/* 分层虚线 */}
        {[275, 640, 1010].map((lx, i) => {
          const lineOpacity = interpolate(
            frame,
            [Math.round(0.4 * fps) + i * 5, Math.round(1.2 * fps) + i * 5],
            [0, 0.1],
            { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
          )
          return (
            <line
              key={`divider-${i}`}
              x1={lx} y1={190} x2={lx} y2={750}
              stroke={C.gold} strokeWidth={1}
              strokeDasharray="5 7" opacity={lineOpacity}
            />
          )
        })}

        {/* 连线 + 流动粒子 */}
        {TOPO_EDGES.map((edge, i) => {
          const lineDelay = Math.round(0.8 * fps) + i * Math.round(0.1 * fps)
          const drawSpring = spring({
            frame, fps,
            config: { damping: 200 },
            delay: lineDelay,
            durationInFrames: Math.round(1 * fps),
          })
          const dashLen = 2000
          const dashOffset = interpolate(drawSpring, [0, 1], [dashLen, 0])

          // 流动粒子
          const flowReady = interpolate(drawSpring, [0.9, 1], [0, 1], {
            extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
          })
          const cycleLen = 2.5 * fps
          const t = ((frame + i * 19) % cycleLen) / cycleLen
          const particleOpacity = flowReady * interpolate(
            t, [0, 0.08, 0.92, 1], [0, 0.85, 0.85, 0],
            { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
          )

          // 贝塞尔取点
          const pathNums = edge.path.match(/[\d.]+/g)?.map(Number) ?? []
          let bx = 0, by = 0
          if (pathNums.length >= 8) {
            const [x0, y0, cx1, cy1, cx2, cy2, x3, y3] = pathNums
            bx = (1 - t) ** 3 * x0 + 3 * (1 - t) ** 2 * t * cx1 + 3 * (1 - t) * t ** 2 * cx2 + t ** 3 * x3
            by = (1 - t) ** 3 * y0 + 3 * (1 - t) ** 2 * t * cy1 + 3 * (1 - t) * t ** 2 * cy2 + t ** 3 * y3
          }

          // 连线标签位置（中点）
          let labelX = 0, labelY = 0
          if (edge.label && pathNums.length >= 8) {
            const [x0, y0, cx1, cy1, cx2, cy2, x3, y3] = pathNums
            labelX = 0.125 * x0 + 0.375 * cx1 + 0.375 * cx2 + 0.125 * x3
            labelY = 0.125 * y0 + 0.375 * cy1 + 0.375 * cy2 + 0.125 * y3
          }

          return (
            <g key={`edge-${i}`}>
              <path d={edge.path} fill="none" stroke={C.gold} strokeWidth={5}
                strokeDasharray={dashLen} strokeDashoffset={dashOffset} opacity={0.04} />
              <path d={edge.path} fill="none" stroke="url(#edgeGradH)" strokeWidth={1.5}
                strokeDasharray={dashLen} strokeDashoffset={dashOffset} />
              {pathNums.length >= 8 && (
                <circle cx={bx} cy={by} r={2.5} fill={C.gold}
                  opacity={particleOpacity} filter="url(#glow)" />
              )}
              {edge.label && (
                <text x={labelX} y={labelY - 10} textAnchor="middle"
                  fill={C.muted} fontSize={10} fontFamily="'JetBrains Mono', monospace"
                  opacity={interpolate(drawSpring, [0.5, 1], [0, 0.6], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })}
                >
                  {edge.label}
                </text>
              )}
            </g>
          )
        })}

        {/* 节点 */}
        {TOPO_NODES.map((node, i) => {
          const nodeDelay = Math.round(0.2 * fps) + i * Math.round(0.08 * fps)
          const nodeSpring = spring({ frame, fps, config: { damping: 20, stiffness: 200 }, delay: nodeDelay })
          const nodeScale = interpolate(nodeSpring, [0, 1], [0.7, 1])
          const nodeOpacity = interpolate(nodeSpring, [0, 1], [0, 1])

          const breathe = interpolate(
            (frame + i * 18) % (3 * fps),
            [0, 1.5 * fps, 3 * fps], [0, 0.12, 0],
            { easing: Easing.inOut(Easing.sin) },
          )

          const cx = node.x + node.w / 2
          const cy = node.y + node.h / 2
          const isSub = node.id === 'mw' || node.id === 'modules'

          return (
            <g
              key={node.id}
              style={{
                opacity: nodeOpacity,
                transform: `translate(${cx}px, ${cy}px) scale(${nodeScale}) translate(${-cx}px, ${-cy}px)`,
                transformOrigin: `${cx}px ${cy}px`,
              }}
            >
              <rect x={node.x - 3} y={node.y - 3} width={node.w + 6} height={node.h + 6}
                rx={isSub ? 8 : 12} fill="none" stroke={node.color} strokeWidth={1}
                opacity={0.12 + breathe} />
              <rect x={node.x} y={node.y} width={node.w} height={node.h}
                rx={isSub ? 6 : 10} fill="url(#nodeFill)" stroke={node.color}
                strokeWidth={isSub ? 1 : 1.5} opacity={0.95}
                strokeDasharray={isSub ? '4 3' : 'none'} />
              <rect x={node.x} y={node.y} width={node.w} height={2.5}
                rx={1.2} fill={node.color} opacity={isSub ? 0.4 : 0.7} />
              <text x={node.x + 14} y={cy + (isSub ? 1 : 1)} fontSize={isSub ? 16 : 18}
                dominantBaseline="middle">
                {node.iconChar}
              </text>
              <text x={node.x + (isSub ? 36 : 40)} y={cy - (isSub ? 5 : 7)} fill={C.text}
                fontSize={isSub ? 12 : 14} fontFamily="'JetBrains Mono', monospace"
                fontWeight={isSub ? 500 : 600} dominantBaseline="middle">
                {node.label}
              </text>
              <text x={node.x + (isSub ? 36 : 40)} y={cy + (isSub ? 11 : 12)} fill={C.muted}
                fontSize={isSub ? 9 : 10} fontFamily="'JetBrains Mono', monospace"
                dominantBaseline="middle">
                {node.sub}
              </text>
            </g>
          )
        })}

        {/* 底部特性标签 */}
        {['Star Topology', 'IDL-First', 'Clean Architecture', 'Full Observability'].map((word, i) => {
          const tagDelay = Math.round(2.5 * fps) + i * Math.round(0.2 * fps)
          const tagSpring = spring({ frame, fps, config: { damping: 200 }, delay: tagDelay })
          const tagX = 310 + i * 200
          return (
            <g key={word} opacity={interpolate(tagSpring, [0, 1], [0, 0.55])}>
              <rect x={tagX - 60} y={760} width={120} height={26} rx={13}
                fill="none" stroke={C.gold} strokeWidth={1} opacity={0.25} />
              <text x={tagX} y={777} textAnchor="middle" fill={C.gold} fontSize={10}
                fontFamily="'Playfair Display', serif" fontStyle="italic" letterSpacing={0.5}>
                {word}
              </text>
            </g>
          )
        })}
      </svg>
    </AbsoluteFill>
  )
}

// ─── 结语 (18–20s) ──────────────────────────────────────────────
const Outro: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  // GitHub ID 入场
  const idSpring = spring({
    frame,
    fps,
    config: { damping: 200 },
    durationInFrames: Math.round(1 * fps),
  })
  const idOpacity = interpolate(idSpring, [0, 1], [0, 1])
  const idY = interpolate(idSpring, [0, 1], [30, 0])

  // 金色分隔线
  const lineSpring = spring({
    frame,
    fps,
    config: { damping: 200 },
    delay: Math.round(0.4 * fps),
    durationInFrames: Math.round(0.8 * fps),
  })
  const lineWidth = interpolate(lineSpring, [0, 1], [0, 300])

  // Slogan 入场
  const sloganSpring = spring({
    frame,
    fps,
    config: { damping: 200 },
    delay: Math.round(0.8 * fps),
    durationInFrames: Math.round(1 * fps),
  })
  const sloganOpacity = interpolate(sloganSpring, [0, 1], [0, 1])
  const sloganY = interpolate(sloganSpring, [0, 1], [20, 0])

  // 外发光
  const glowRadius = interpolate(
    frame,
    [0, Math.round(1.5 * fps)],
    [0, 500],
    { extrapolateRight: 'clamp', easing: Easing.out(Easing.quad) },
  )
  const glowOpacity = interpolate(
    frame,
    [0, Math.round(0.8 * fps), Math.round(1.5 * fps)],
    [0, 0.25, 0],
    { extrapolateRight: 'clamp' },
  )

  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
      {/* 圆形微光 */}
      <svg
        viewBox="0 0 1920 1080"
        style={{ position: 'absolute', width: '100%', height: '100%' }}
      >
        <circle
          cx={960} cy={540} r={glowRadius}
          fill="none" stroke={C.gold} strokeWidth={2} opacity={glowOpacity}
        />
      </svg>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 24,
        }}
      >
        {/* GitHub ID */}
        <div
          style={{
            opacity: idOpacity,
            transform: `translateY(${idY}px)`,
            display: 'flex',
            alignItems: 'center',
            gap: 16,
          }}
        >
          {/* GitHub 图标简化 */}
          <svg width={48} height={48} viewBox="0 0 24 24" fill={C.text}>
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
          </svg>
          <span
            style={{
              fontSize: 64,
              fontWeight: 700,
              fontFamily: "'Playfair Display', serif",
              color: C.text,
              letterSpacing: 4,
            }}
          >
            MasonsXu
          </span>
        </div>

        {/* 金色分隔线 */}
        <div
          style={{
            width: lineWidth,
            height: 1,
            backgroundColor: C.gold,
            opacity: 0.6,
          }}
        />

        {/* Slogan */}
        <div
          style={{
            opacity: sloganOpacity,
            transform: `translateY(${sloganY}px)`,
            fontSize: 28,
            fontWeight: 400,
            fontFamily: "'Playfair Display', serif",
            color: C.gold,
            fontStyle: 'italic',
            letterSpacing: 2,
            textAlign: 'center',
            maxWidth: 900,
          }}
        >
          &ldquo;Architecture is the balance of design and function.&rdquo;
        </div>
      </div>
    </AbsoluteFill>
  )
}

// ─── 主组合 ─────────────────────────────────────────────────────
export const OpenSourceDashboard: React.FC<{ data?: ProjectData }> = ({
  data = DEFAULT_DATA,
}) => {
  const { fps } = useVideoConfig()

  return (
    <AbsoluteFill style={{ backgroundColor: C.bg }}>
      {/* 背景网格 + 粒子（全时长） */}
      <BackgroundGrid />

      {/* 阶段 1：终端打字机 (0–5s) */}
      <Sequence durationInFrames={Math.round(5 * fps)} premountFor={fps}>
        <TerminalTyping data={data} />
      </Sequence>

      {/* 阶段 2：数据增长 + 环形进度 (5–12s) */}
      <Sequence
        from={Math.round(5 * fps)}
        durationInFrames={Math.round(7 * fps)}
        premountFor={fps}
      >
        <DataGrowth data={data} />
      </Sequence>

      {/* 阶段 3：微服务拓扑 (12–18s) */}
      <Sequence
        from={Math.round(12 * fps)}
        durationInFrames={Math.round(6 * fps)}
        premountFor={fps}
      >
        <TopologyAnimation />
      </Sequence>

      {/* 阶段 4：结语 (18–20s) */}
      <Sequence
        from={Math.round(18 * fps)}
        durationInFrames={Math.round(2 * fps)}
        premountFor={fps}
      >
        <Outro />
      </Sequence>
    </AbsoluteFill>
  )
}
