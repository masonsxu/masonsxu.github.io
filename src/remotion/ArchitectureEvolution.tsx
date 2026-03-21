import {
  AbsoluteFill,
  Easing,
  Sequence,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion'

// ─── 可配置常量（基于真实项目数据，已脱敏）─────────────────────
const MICROSERVICE_COUNT = 8
const DOMAIN = 'masonsxu-github-io.pages.dev'
const SLOGAN = 'Luxury is the balance of design and function.'

/** 真实 RPC 服务列表（已脱敏） */
const SERVICES = [
  'Identity', 'DataLake', 'Analytics', 'Records',
  'Documents', 'Imaging', 'Viewer', 'OCR',
].slice(0, MICROSERVICE_COUNT)

/** DDD 分层（真实项目目录结构） */
const DDD_LAYERS = [
  { name: 'handler.go', desc: 'Adapter · Param Validation', color: '#34d399', path: 'handler.go' },
  { name: 'biz/logic', desc: 'Business Rules · Transactions', color: '#60a5fa', path: 'biz/logic/' },
  { name: 'biz/dal', desc: 'Repository · GORM v1.31', color: '#fbbf24', path: 'biz/dal/' },
  { name: 'biz/converter', desc: 'Facade Pattern · DTO \u2194 Model', color: '#a78bfa', path: 'biz/converter/' },
  { name: 'models/', desc: 'GORM · UUID PK · PG 17', color: '#94a3b8', path: 'models/' },
] as const

/** Converter Facade 子转换器（真实项目） */
const SUB_CONVERTERS = [
  { label: 'User', color: '#34d399' },
  { label: 'Org', color: '#60a5fa' },
  { label: 'Dept', color: '#fbbf24' },
  { label: 'Memb', color: '#fb923c' },
  { label: 'Auth', color: '#f87171' },
  { label: 'Enum', color: '#a78bfa' },
  { label: 'Base', color: '#94a3b8' },
] as const

/** API Gateway 中间件链（真实项目顺序） */
const MIDDLEWARE_CHAIN = [
  'requestid', 'OTel', 'Log', 'CORS', 'Context', 'Error', 'JWT', 'Casbin',
] as const

/** Gateway Clean Architecture 分层 */
const GATEWAY_LAYERS = [
  { name: 'biz/handler', desc: 'HTTP Request Handler', color: '#34d399' },
  { name: 'app/assembler', desc: 'HTTP DTO \u2194 RPC DTO', color: '#60a5fa' },
  { name: 'domain/service', desc: 'Business Orchestration', color: '#fbbf24' },
  { name: 'infra/client', desc: 'Kitex RPC Client', color: '#a78bfa' },
] as const

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
  red: '#ef4444',
  redDim: 'rgba(239, 68, 68, 0.15)',
  green: '#4ade80',
  blue: '#60a5fa',
}

// ─── 通用样式工厂 ───────────────────────────────────────────
const mono = (size: number, color = C.text, weight = 400) => ({
  fontSize: size,
  fontFamily: "'JetBrains Mono', monospace",
  color,
  fontWeight: weight,
})

// ─── 背景网格 + 粒子 ─────────────────────────────────────────
const BackgroundGrid: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const gridSpacing = 60
  const cols = Math.ceil(1920 / gridSpacing) + 1
  const rows = Math.ceil(1080 / gridSpacing) + 1

  const driftX = interpolate(frame, [0, 25 * fps], [0, 50], { extrapolateRight: 'clamp' })
  const driftY = interpolate(frame, [0, 25 * fps], [0, -30], { extrapolateRight: 'clamp' })
  const gridOpacity = interpolate(frame, [0, 2 * fps], [0, 1], {
    extrapolateRight: 'clamp', easing: Easing.out(Easing.quad),
  })

  const particles = Array.from({ length: 20 }, (_, i) => {
    const seed = i * 137.5
    const baseX = (seed * 7.3) % 1920
    const baseY = (seed * 3.7) % 1080
    const speed = 0.3 + (i % 5) * 0.15
    const y = baseY + interpolate((frame + i * 1.2 * fps) % (8 * fps), [0, 4 * fps, 8 * fps], [0, -40 * speed, 0], { easing: Easing.inOut(Easing.sin) })
    const x = baseX + interpolate((frame + i * 1.2 * fps) % (10 * fps), [0, 5 * fps, 10 * fps], [0, 20 * speed, 0], { easing: Easing.inOut(Easing.sin) })
    const twinkle = interpolate((frame + i * 15) % (3 * fps), [0, 1.5 * fps, 3 * fps], [0.2, 0.8, 0.2], { easing: Easing.inOut(Easing.sin) })
    return <circle key={i} cx={x} cy={y} r={1.5 + (i % 3) * 0.5} fill={C.gold} opacity={twinkle * gridOpacity} />
  })

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
        {particles}
      </svg>
    </AbsoluteFill>
  )
}

// ─── 阶段 1：序幕 - Python Era (0–5s) ───────────────────────
const PythonEra: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const blockSpring = spring({ frame, fps, config: { damping: 200 }, durationInFrames: Math.round(1.2 * fps) })
  const blockX = interpolate(blockSpring, [0, 1], [-400, 280])
  const shakeX = interpolate((frame * 7) % (fps * 0.5), [0, fps * 0.125, fps * 0.25, fps * 0.375, fps * 0.5], [0, 3, -2, 4, 0])
  const shakeY = interpolate((frame * 11) % (fps * 0.4), [0, fps * 0.1, fps * 0.2, fps * 0.3, fps * 0.4], [0, -2, 3, -1, 0])

  const warningDelay = Math.round(1.8 * fps)
  const warningSpring = spring({ frame, fps, config: { damping: 15, stiffness: 200 }, delay: warningDelay })
  const blink = interpolate((frame - warningDelay) % (fps * 0.8), [0, fps * 0.4, fps * 0.8], [1, 0.3, 1], { extrapolateLeft: 'clamp' })
  const warningBlink = frame > warningDelay ? blink : 0

  const titleSpring = spring({ frame, fps, config: { damping: 200 }, delay: Math.round(0.6 * fps), durationInFrames: Math.round(0.8 * fps) })
  const subSpring = spring({ frame, fps, config: { damping: 200 }, delay: Math.round(1.2 * fps), durationInFrames: Math.round(0.8 * fps) })
  const metricsDelay = Math.round(2.5 * fps)

  const metrics = [
    { label: 'Response Time', value: '500ms+', color: C.red },
    { label: 'Deploy Cycle', value: '4h+', color: C.red },
    { label: 'Coupling', value: 'TIGHT', color: C.red },
    { label: 'Observability', value: 'NONE', color: C.red },
  ]

  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ position: 'absolute', left: blockX, top: '50%', transform: `translate(0, -50%) translate(${shakeX}px, ${shakeY}px)`, opacity: interpolate(blockSpring, [0, 1], [0, 1]) }}>
        <div style={{ width: 420, height: 340, backgroundColor: C.surface, border: `2px solid ${C.redDim}`, borderRadius: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, position: 'relative', overflow: 'hidden' }}>
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} style={{ position: 'absolute', left: 24, top: 28 + i * 36, width: 80 + ((i * 47) % 180), height: 6, backgroundColor: C.muted, opacity: interpolate(frame, [Math.round(0.8 * fps) + i * 4, Math.round(1.2 * fps) + i * 4], [0, 0.15], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }), borderRadius: 3 }} />
          ))}
          <div style={{ ...mono(48, C.muted, 700), opacity: interpolate(titleSpring, [0, 1], [0, 0.6]), letterSpacing: 2 }}>Python</div>
          <div style={{ ...mono(22, C.muted), opacity: interpolate(subSpring, [0, 1], [0, 0.4]), letterSpacing: 3 }}>MONOLITH</div>
        </div>
        <div style={{ position: 'absolute', top: -40, left: '50%', transform: 'translateX(-50%)', opacity: interpolate(warningSpring, [0, 1], [0, warningBlink]), display: 'flex', alignItems: 'center', gap: 8, padding: '8px 20px', backgroundColor: C.redDim, border: `1px solid ${C.red}`, borderRadius: 8, whiteSpace: 'nowrap' as const }}>
          <span style={{ fontSize: 18, color: C.red }}>&#x26A0;</span>
          <span style={{ ...mono(16, C.red, 600) }}>Response Time: 500ms+</span>
        </div>
      </div>

      <div style={{ position: 'absolute', right: 200, top: '50%', transform: 'translateY(-50%)', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {metrics.map((m, i) => {
          const d = metricsDelay + i * Math.round(0.15 * fps)
          const s = spring({ frame, fps, config: { damping: 20, stiffness: 200 }, delay: d })
          return (
            <div key={i} style={{ opacity: interpolate(s, [0, 1], [0, 1]), transform: `translateX(${interpolate(s, [0, 1], [40, 0])}px)`, padding: '12px 22px', backgroundColor: C.surface, border: `1px solid ${C.redDim}`, borderRadius: 10, minWidth: 240 }}>
              <div style={{ ...mono(11, C.muted), letterSpacing: 1, marginBottom: 4 }}>{m.label}</div>
              <div style={{ ...mono(26, m.color, 700) }}>{m.value}</div>
            </div>
          )
        })}
      </div>

      <div style={{ position: 'absolute', bottom: 60, left: '50%', transform: 'translateX(-50%)', opacity: interpolate(frame, [3 * fps, 3.5 * fps], [0, 0.5], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) }}>
        <span style={{ ...mono(14, C.muted), letterSpacing: 3 }}>PHASE 01 / THE LEGACY</span>
      </div>
    </AbsoluteFill>
  )
}

// ─── 阶段 2：转折 - The Transformation (5–10s) ──────────────
const Transformation: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const coreSpring = spring({ frame, fps, config: { damping: 15, stiffness: 100 }, durationInFrames: Math.round(1.5 * fps) })
  const coreScale = interpolate(coreSpring, [0, 1], [0, 1])
  const coreRotate = interpolate(coreSpring, [0, 1], [180, 0])
  const corePulse = interpolate(frame % (2 * fps), [0, fps, 2 * fps], [1, 1.05, 1], { easing: Easing.inOut(Easing.sin) })

  const glowRadius = interpolate(frame, [0, 2 * fps], [0, 300], { extrapolateRight: 'clamp', easing: Easing.out(Easing.quad) })
  const glowOpacity = interpolate(frame, [0, fps, 2 * fps], [0, 0.3, 0.08], { extrapolateRight: 'clamp' })

  const labelSpring = spring({ frame, fps, config: { damping: 200 }, delay: Math.round(fps), durationInFrames: Math.round(0.8 * fps) })

  const fissionStart = Math.round(2 * fps)
  const cols = 4
  const cellW = 170
  const cellH = 54
  const gapX = 14
  const gapY = 12
  const gridW = cols * cellW + (cols - 1) * gapX
  const gridStartX = 960 - gridW / 2
  const gridStartY = 590

  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
      <svg viewBox="0 0 1920 1080" style={{ position: 'absolute', width: '100%', height: '100%' }}>
        <defs>
          <radialGradient id="coreGlow2">
            <stop offset="0%" style={{ stopColor: C.gold, stopOpacity: 0.15 }} />
            <stop offset="100%" style={{ stopColor: C.gold, stopOpacity: 0 }} />
          </radialGradient>
        </defs>
        <circle cx={960} cy={360} r={glowRadius} fill="url(#coreGlow2)" opacity={glowOpacity * 3} />
        <circle cx={960} cy={360} r={glowRadius} fill="none" stroke={C.gold} strokeWidth={1.5} opacity={glowOpacity} />
      </svg>

      <div style={{ position: 'absolute', top: 240, left: '50%', transform: `translateX(-50%) rotate(${coreRotate}deg) scale(${coreScale * corePulse})` }}>
        <div style={{ width: 180, height: 180, borderRadius: 24, backgroundColor: C.surface, border: `2px solid ${C.gold}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: `0 0 60px ${C.goldGlow}, inset 0 0 30px ${C.goldDim}` }}>
          <div style={{ ...mono(28, C.gold, 700), letterSpacing: 1 }}>Go 1.24</div>
          <div style={{ width: 60, height: 1, backgroundColor: C.gold, opacity: 0.4 }} />
          <div style={{ ...mono(14, C.text), letterSpacing: 2, opacity: 0.8 }}>CloudWeGo</div>
        </div>
      </div>

      <div style={{ position: 'absolute', top: 450, left: '50%', transform: 'translateX(-50%)', opacity: interpolate(labelSpring, [0, 1], [0, 1]), textAlign: 'center' }}>
        <div style={{ ...mono(18, C.gold, 600), letterSpacing: 3 }}>THE NEW CORE</div>
        <div style={{ ...mono(13, C.muted), letterSpacing: 2, marginTop: 6 }}>Kitex v0.15 RPC + Hertz v0.9 HTTP + Wire DI</div>
      </div>

      {SERVICES.map((name, i) => {
        const row = Math.floor(i / cols)
        const col = i % cols
        const targetX = gridStartX + col * (cellW + gapX)
        const targetY = gridStartY + row * (cellH + gapY)
        const serviceDelay = fissionStart + i * Math.round(0.07 * fps)
        const serviceSpring = spring({ frame, fps, config: { damping: 12, stiffness: 120 }, delay: serviceDelay })
        const fromX = 960 - cellW / 2
        const fromY = 360
        const x = interpolate(serviceSpring, [0, 1], [fromX, targetX])
        const y = interpolate(serviceSpring, [0, 1], [fromY, targetY])

        return (
          <div key={i} style={{ position: 'absolute', left: x, top: y, width: cellW, height: cellH, transform: `scale(${interpolate(serviceSpring, [0, 1], [0.3, 1])})`, opacity: interpolate(serviceSpring, [0, 1], [0, 1]) }}>
            <div style={{ width: '100%', height: '100%', backgroundColor: C.surface, border: `1px solid ${C.goldDim}`, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: C.green, opacity: 0.8 }} />
              <span style={{ ...mono(13, C.text, 500), letterSpacing: 1 }}>{name}</span>
            </div>
          </div>
        )
      })}

      <div style={{ position: 'absolute', bottom: 40, left: '50%', transform: 'translateX(-50%)', opacity: interpolate(frame, [3 * fps, 3.5 * fps], [0, 0.5], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) }}>
        <span style={{ ...mono(14, C.muted), letterSpacing: 3 }}>PHASE 02 / THE TRANSFORMATION</span>
      </div>
    </AbsoluteFill>
  )
}

// ─── 阶段 3：高潮 - 全链路请求追踪 (10–20s) ─────────────────
// 叙事：一个金色光点从右侧进入 Gateway，穿过中间件链、
//       沿 Thrift RPC 路径穿梭到 RPC Service，自上而下点亮 DDD 层，
//       最终触发底部性能指标数字滚动。
//
// 时序：
//   0-1s    Ghost 入场（两个面板幽灵隐现 + 流动边框）
//   1-3s    Gateway 激活（光点经过中间件 → 标签提亮）
//   3-4.5s  Thrift RPC 穿梭（非线性加速）
//   4.5-7s  RPC 处理（DDD 层依次高亮 + 注释滑入）
//   7-10s   指标更新（数字滚动 + 颜色跳变）

const CL = { extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const }

const NewArchitecture: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  // ═══════ 时间轴关键帧 ═══════
  const T = {
    ghostEnd: 1 * fps,
    probeEnter: 1 * fps,
    mwStart: 1.3 * fps,
    mwEnd: 2.6 * fps,
    gwDescend: 2.6 * fps,
    gwDescendEnd: 3 * fps,
    transitStart: 3 * fps,
    transitEnd: 4.5 * fps,
    rpcStart: 4.5 * fps,
    rpcEnd: 7 * fps,
    metricsStart: 7 * fps,
  }

  // ═══════ 布局常量 ═══════
  const RPC_PANEL = { x: 80, y: 110, w: 450 }
  const GW_PANEL = { x: 1060, y: 110, w: 450 }
  const RPC_CX = RPC_PANEL.x + RPC_PANEL.w / 2 + 20
  const GW_CX = GW_PANEL.x + GW_PANEL.w / 2

  // RPC 各层 y 中心坐标（5层，间距 56px）
  const rpcLayerY = DDD_LAYERS.map((_, i) => 195 + i * 56)
  // Gateway 各层 y 中心坐标（4层，间距 48px）
  const gwLayerY = GATEWAY_LAYERS.map((_, i) => 240 + i * 48)
  // 中间件 y 中心
  const MW_Y = 168

  // ═══════ Ghost 容器透明度 ═══════
  const ghostOpacity = interpolate(frame, [0, T.ghostEnd], [0, 0.2], { ...CL, easing: Easing.out(Easing.quad) })
  const gwPanelOpacity = interpolate(frame, [T.probeEnter, T.probeEnter + 0.4 * fps], [0.2, 0.9], CL)
  const rpcPanelOpacity = interpolate(frame, [T.transitEnd, T.transitEnd + 0.4 * fps], [0.2, 0.9], CL)

  // ═══════ 流动边框偏移 ═══════
  const borderFlow = frame * 0.8

  // ═══════ 光点位置（分段计算）═══════
  const probeVisible = frame >= T.probeEnter && frame < T.rpcEnd + 0.5 * fps

  const probePos = (() => {
    // 段1: 从右侧飞入 Gateway (1-1.3s)
    if (frame < T.mwStart) {
      const t = interpolate(frame, [T.probeEnter, T.mwStart], [0, 1], CL)
      return {
        x: interpolate(t, [0, 1], [1920, GW_CX]),
        y: interpolate(t, [0, 1], [350, MW_Y]),
      }
    }
    // 段2: 穿过中间件区域 (1.3-2.6s) — 从右向左缓行
    if (frame < T.gwDescend) {
      const t = interpolate(frame, [T.mwStart, T.mwEnd], [0, 1], CL)
      return {
        x: interpolate(t, [0, 1], [GW_PANEL.x + GW_PANEL.w - 30, GW_PANEL.x + 40]),
        y: MW_Y,
      }
    }
    // 段3: 下行穿过 Gateway 层 (2.6-3s)
    if (frame < T.transitStart) {
      const t = interpolate(frame, [T.gwDescend, T.gwDescendEnd], [0, 1], CL)
      return {
        x: GW_CX,
        y: interpolate(t, [0, 1], [gwLayerY[0], gwLayerY[3] + 20]),
      }
    }
    // 段4: Thrift RPC 穿梭 (3-4.5s) — Easing.in 非线性加速
    if (frame < T.transitEnd) {
      const t = interpolate(frame, [T.transitStart, T.transitEnd], [0, 1], {
        ...CL, easing: Easing.in(Easing.quad),
      })
      const p0x = GW_CX, p0y = gwLayerY[3] + 20
      const p1x = 880, p1y = 370
      const p2x = 640, p2y = 220
      const p3x = RPC_CX, p3y = rpcLayerY[0]
      return {
        x: (1 - t) ** 3 * p0x + 3 * (1 - t) ** 2 * t * p1x + 3 * (1 - t) * t ** 2 * p2x + t ** 3 * p3x,
        y: (1 - t) ** 3 * p0y + 3 * (1 - t) ** 2 * t * p1y + 3 * (1 - t) * t ** 2 * p2y + t ** 3 * p3y,
      }
    }
    // 段5: 下行穿过 RPC DDD 层 (4.5-7s)
    if (frame < T.rpcEnd) {
      const t = interpolate(frame, [T.rpcStart, T.rpcEnd], [0, 1], CL)
      return {
        x: RPC_CX,
        y: interpolate(t, [0, 1], [rpcLayerY[0], rpcLayerY[4]]),
      }
    }
    return { x: RPC_CX, y: rpcLayerY[4] }
  })()

  // 光点淡出
  const probeFade = interpolate(frame, [T.rpcEnd, T.rpcEnd + 0.5 * fps], [1, 0], CL)

  // ═══════ 中间件高亮（光点穿过时依次点亮）═══════
  const mwCount = MIDDLEWARE_CHAIN.length
  const mwSpan = T.mwEnd - T.mwStart
  const getMwActive = (i: number) => {
    const activateAt = T.mwStart + (i / mwCount) * mwSpan
    return interpolate(frame, [activateAt, activateAt + 4], [0, 1], CL)
  }

  // ═══════ Gateway 层高亮 ═══════
  const gwLayerSpan = T.gwDescendEnd - T.gwDescend
  const getGwLayerActive = (i: number) => {
    const activateAt = T.gwDescend + (i / GATEWAY_LAYERS.length) * gwLayerSpan
    return interpolate(frame, [activateAt, activateAt + 4], [0, 1], CL)
  }

  // ═══════ RPC 层高亮 ═══════
  const rpcLayerSpan = T.rpcEnd - T.rpcStart
  const getRpcLayerActive = (i: number) => {
    const activateAt = T.rpcStart + (i / DDD_LAYERS.length) * rpcLayerSpan
    return interpolate(frame, [activateAt, activateAt + 5], [0, 1], CL)
  }

  // ═══════ 指标数据 ═══════
  const metricsData = [
    { label: 'Deploy Cycle', from: '4h', to: '30min', badge: '-87%', color: C.green },
    { label: 'Service Count', from: '1', to: '8+', badge: 'Decoupled', color: C.gold },
    { label: 'Error Tracking', from: '30min', to: '2min', badge: 'Jaeger', color: C.blue },
    { label: 'Accuracy', from: '95%', to: '99.9%', badge: '+4.9%', color: C.green },
  ]

  // ═══════ 标题 ═══════
  const titleOpacity = interpolate(frame, [0, 0.8 * fps], [0, 1], CL)

  return (
    <AbsoluteFill>
      {/* ─── 顶部标题 ─── */}
      <div style={{ position: 'absolute', top: 28, left: '50%', transform: 'translateX(-50%)', opacity: titleOpacity, textAlign: 'center' }}>
        <span style={{ ...mono(20, C.gold, 600), letterSpacing: 5 }}>REQUEST TRACING</span>
        <div style={{ ...mono(11, C.muted), letterSpacing: 2, marginTop: 5 }}>Go 1.24 · Kitex v0.15 · Hertz v0.9 · GORM v1.31 · PostgreSQL 17</div>
      </div>

      {/* ═══════ 左侧：RPC Service DDD（Ghost → 激活）═══════ */}
      <div style={{
        position: 'absolute', left: RPC_PANEL.x, top: RPC_PANEL.y,
        opacity: frame < T.transitEnd ? ghostOpacity : rpcPanelOpacity,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <div style={{ width: 3, height: 16, backgroundColor: C.gold, borderRadius: 2 }} />
          <span style={{ ...mono(13, C.gold, 600), letterSpacing: 2 }}>RPC SERVICE</span>
          <span style={{ ...mono(10, C.muted), letterSpacing: 1 }}>Identity Srv (Kitex)</span>
        </div>

        <div style={{ width: RPC_PANEL.w, padding: '14px 16px', backgroundColor: C.surface, border: `1px solid ${C.goldDim}`, borderRadius: 14 }}>
          {DDD_LAYERS.map((layer, i) => {
            const active = getRpcLayerActive(i)
            const baseOpacity = frame < T.transitEnd ? 0.25 : interpolate(frame, [T.transitEnd, T.transitEnd + 0.3 * fps], [0.25, 0.5], CL)
            const layerOpacity = interpolate(active, [0, 1], [baseOpacity, 1])
            // 克制的 scale: 仅 1.0 → 1.02
            const layerScale = interpolate(active, [0, 1], [1, 1.02])
            const isConverter = layer.name === 'biz/converter'

            // 右侧注释滑入
            const descX = interpolate(active, [0, 1], [20, 0])
            const descOpacity = interpolate(active, [0, 1], [0, 1])

            return (
              <div key={layer.name}>
                <div style={{
                  height: 42,
                  opacity: layerOpacity,
                  transform: `scale(${layerScale})`,
                  backgroundColor: active > 0.5 ? `${layer.color}18` : `${layer.color}08`,
                  border: `1px solid ${active > 0.5 ? `${layer.color}60` : `${layer.color}20`}`,
                  borderRadius: 7,
                  display: 'flex', alignItems: 'center', paddingLeft: 14, paddingRight: 14, gap: 10,
                }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: layer.color, opacity: interpolate(active, [0, 1], [0.3, 1]) }} />
                  <span style={{ ...mono(12, C.text, 600), letterSpacing: 0.5, minWidth: 100 }}>{layer.path}</span>
                  <span style={{ ...mono(9, C.muted), marginLeft: 'auto', opacity: descOpacity, transform: `translateX(${descX}px)` }}>{layer.desc}</span>
                </div>

                {/* Converter 子转换器 */}
                {isConverter && active > 0.8 && (
                  <div style={{ display: 'flex', gap: 4, padding: '5px 0 2px 24px', flexWrap: 'wrap' }}>
                    {SUB_CONVERTERS.map((sub, si) => {
                      const subProgress = interpolate(frame, [T.rpcStart + (3 / 5) * rpcLayerSpan + si * 2, T.rpcStart + (3 / 5) * rpcLayerSpan + si * 2 + 5], [0, 1], CL)
                      return (
                        <div key={sub.label} style={{
                          padding: '2px 7px', backgroundColor: `${sub.color}12`, border: `1px solid ${sub.color}30`,
                          borderRadius: 4, opacity: subProgress, transform: `scale(${interpolate(subProgress, [0, 1], [0.7, 1])})`,
                        }}>
                          <span style={{ ...mono(8, sub.color, 600) }}>{sub.label}</span>
                        </div>
                      )
                    })}
                  </div>
                )}

                {i < DDD_LAYERS.length - 1 && (
                  <div style={{ textAlign: 'center', height: 8, lineHeight: '8px', color: C.gold, fontSize: 8, opacity: layerOpacity * 0.4 }}>&#x25BC;</div>
                )}
              </div>
            )
          })}

          {/* Wire DI */}
          <div style={{
            marginTop: 8, padding: '5px 10px', border: `1px dashed ${C.gold}25`, borderRadius: 6, textAlign: 'center',
            opacity: interpolate(frame, [T.rpcEnd - 0.5 * fps, T.rpcEnd], [0, 0.6], CL),
          }}>
            <span style={{ ...mono(9, C.gold), letterSpacing: 2 }}>Google Wire · Compile-time DI</span>
          </div>
        </div>
      </div>

      {/* ═══════ 右侧：API Gateway（Ghost → 激活）═══════ */}
      <div style={{
        position: 'absolute', left: GW_PANEL.x, top: GW_PANEL.y,
        opacity: frame < T.probeEnter ? ghostOpacity : gwPanelOpacity,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <div style={{ width: 3, height: 16, backgroundColor: '#34d399', borderRadius: 2 }} />
          <span style={{ ...mono(13, '#34d399', 600), letterSpacing: 2 }}>API GATEWAY</span>
          <span style={{ ...mono(10, C.muted), letterSpacing: 1 }}>Hertz HTTP :8888</span>
        </div>

        {/* 中间件链 */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ ...mono(9, C.muted), letterSpacing: 1.5, marginBottom: 5 }}>MIDDLEWARE PIPELINE</div>
          <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
            {MIDDLEWARE_CHAIN.map((mw, i) => {
              const active = getMwActive(i)
              const isAuth = mw === 'JWT' || mw === 'Casbin'
              const mwColor = isAuth ? '#f87171' : mw === 'OTel' ? '#2dd4bf' : C.gold
              // 激活时：背景提亮 + 克制的 spring 弹缩 (1.0 → 1.06 → 1.0)
              const mwScale = interpolate(active, [0, 0.5, 1], [1, 1.06, 1])
              const bgAlpha = active > 0.3 ? '30' : '0a'
              const borderAlpha = active > 0.3 ? '60' : '20'
              return (
                <div key={mw} style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{
                    padding: '3px 8px',
                    backgroundColor: `${mwColor}${bgAlpha}`,
                    border: `1px solid ${mwColor}${borderAlpha}`,
                    borderRadius: 4,
                    transform: `scale(${mwScale})`,
                  }}>
                    <span style={{ ...mono(9, mwColor, 600), opacity: interpolate(active, [0, 1], [0.35, 1]) }}>{mw}</span>
                  </div>
                  {i < MIDDLEWARE_CHAIN.length - 1 && (
                    <span style={{ ...mono(7, C.muted), margin: '0 1px', opacity: 0.3 }}>&rarr;</span>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Gateway 分层 */}
        <div style={{ width: GW_PANEL.w, padding: '12px 14px', backgroundColor: C.surface, border: `1px solid ${C.goldDim}`, borderRadius: 14 }}>
          {GATEWAY_LAYERS.map((layer, i) => {
            const active = getGwLayerActive(i)
            const baseOp = frame < T.probeEnter ? 0.2 : 0.35
            const layerOpacity = interpolate(active, [0, 1], [baseOp, 1])
            const layerScale = interpolate(active, [0, 1], [1, 1.02])
            const descX = interpolate(active, [0, 1], [15, 0])

            return (
              <div key={layer.name}>
                <div style={{
                  height: 38,
                  opacity: layerOpacity,
                  transform: `scale(${layerScale})`,
                  backgroundColor: active > 0.5 ? `${layer.color}18` : `${layer.color}08`,
                  border: `1px solid ${active > 0.5 ? `${layer.color}50` : `${layer.color}18`}`,
                  borderRadius: 7,
                  display: 'flex', alignItems: 'center', paddingLeft: 14, paddingRight: 14, gap: 10,
                }}>
                  <div style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: layer.color, opacity: interpolate(active, [0, 1], [0.3, 1]) }} />
                  <span style={{ ...mono(11, C.text, 600), letterSpacing: 0.5, minWidth: 110 }}>{layer.name}</span>
                  <span style={{ ...mono(9, C.muted), marginLeft: 'auto', opacity: interpolate(active, [0, 1], [0, 1]), transform: `translateX(${descX}px)` }}>{layer.desc}</span>
                </div>
                {i < GATEWAY_LAYERS.length - 1 && (
                  <div style={{ textAlign: 'center', height: 7, lineHeight: '7px', color: C.gold, fontSize: 8, opacity: layerOpacity * 0.3 }}>&#x25BC;</div>
                )}
              </div>
            )
          })}
        </div>

        {/* 错误流 */}
        <div style={{
          marginTop: 8, padding: '5px 10px', border: `1px dashed ${C.red}25`, borderRadius: 6,
          opacity: interpolate(frame, [T.gwDescendEnd, T.gwDescendEnd + 0.5 * fps], [0, 0.5], CL),
        }}>
          <span style={{ ...mono(8, C.red), letterSpacing: 1 }}>Error: ErrNo &rarr; BizStatusError &rarr; TTHeader &rarr; APIError</span>
        </div>
      </div>

      {/* ═══════ SVG 层：流动边框 + 连接路径 + 光点 ═══════ */}
      <svg viewBox="0 0 1920 1080" style={{ position: 'absolute', width: '100%', height: '100%', pointerEvents: 'none' }}>
        <defs>
          <filter id="probeGlow">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="softGlow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Ghost 流动边框 — RPC 面板 */}
        <rect
          x={RPC_PANEL.x - 2} y={RPC_PANEL.y + 30} width={RPC_PANEL.w + 4} height={440}
          rx={16} fill="none" stroke={C.gold} strokeWidth={1}
          strokeDasharray="16 12" strokeDashoffset={-borderFlow}
          opacity={frame < T.transitEnd ? ghostOpacity * 0.6 : interpolate(frame, [T.transitEnd, T.transitEnd + 0.5 * fps], [ghostOpacity * 0.6, 0.08], CL)}
        />
        {/* Ghost 流动边框 — Gateway 面板 */}
        <rect
          x={GW_PANEL.x - 2} y={GW_PANEL.y + 30} width={GW_PANEL.w + 4} height={380}
          rx={16} fill="none" stroke="#34d399" strokeWidth={1}
          strokeDasharray="16 12" strokeDashoffset={-borderFlow}
          opacity={frame < T.probeEnter ? ghostOpacity * 0.6 : interpolate(frame, [T.probeEnter, T.probeEnter + 0.5 * fps], [ghostOpacity * 0.6, 0.08], CL)}
        />

        {/* Thrift RPC 连接路径（光点经过时显现）*/}
        {(() => {
          const pathD = `M ${GW_CX} ${gwLayerY[3] + 20} C 880 370 640 220 ${RPC_CX} ${rpcLayerY[0]}`
          const pathVisible = interpolate(frame, [T.transitStart, T.transitStart + 0.3 * fps], [0, 1], CL)
          // 路径流动效果
          const flowOffset = interpolate(frame, [T.transitStart, T.transitEnd], [600, 0], CL)
          return (
            <g opacity={pathVisible * 0.35}>
              <path d={pathD} fill="none" stroke={C.gold} strokeWidth={1.5} strokeDasharray="8 10" strokeDashoffset={flowOffset} />
              <text x={760} y={280} textAnchor="middle" fill={C.gold} fontSize={10} fontFamily="'JetBrains Mono', monospace" opacity={0.7} letterSpacing={2}>
                Thrift RPC
              </text>
            </g>
          )
        })()}

        {/* 可观测性标签（RPC 处理阶段显现）*/}
        {(() => {
          const otelOpacity = interpolate(frame, [T.rpcStart + 1 * fps, T.rpcStart + 1.5 * fps], [0, 0.45], CL)
          return (
            <g opacity={otelOpacity}>
              <rect x={600} y={480} width={210} height={26} rx={13} fill="none" stroke="#2dd4bf" strokeWidth={1} opacity={0.35} />
              <text x={705} y={497} textAnchor="middle" fill="#2dd4bf" fontSize={9} fontFamily="'JetBrains Mono', monospace" fontWeight={600} letterSpacing={1}>OpenTelemetry + Jaeger</text>
              <rect x={600} y={514} width={210} height={26} rx={13} fill="none" stroke="#94a3b8" strokeWidth={1} opacity={0.35} />
              <text x={705} y={531} textAnchor="middle" fill="#94a3b8" fontSize={9} fontFamily="'JetBrains Mono', monospace" fontWeight={600} letterSpacing={1}>zerolog v1.34 + OTelHook</text>
            </g>
          )
        })()}

        {/* ═══ 金色光点 (Probe) ═══ */}
        {probeVisible && (
          <g opacity={probeFade}>
            {/* 尾迹光晕 */}
            <circle cx={probePos.x} cy={probePos.y} r={12} fill={C.gold} opacity={0.08} />
            <circle cx={probePos.x} cy={probePos.y} r={7} fill={C.gold} opacity={0.15} />
            {/* 核心光点 */}
            <circle cx={probePos.x} cy={probePos.y} r={4} fill={C.gold} filter="url(#probeGlow)" opacity={0.9} />
            {/* trace-id 标签 */}
            <text
              x={probePos.x + 12} y={probePos.y - 8}
              fontSize={8} fontFamily="'JetBrains Mono', monospace"
              fill={C.gold} opacity={0.5}
            >
              trace-4bf92f35
            </text>
          </g>
        )}
      </svg>

      {/* ═══════ 底部：性能指标 ═══════ */}
      <div style={{ position: 'absolute', bottom: 72, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 18 }}>
        {metricsData.map((m, i) => {
          const cardDelay = T.metricsStart + i * Math.round(0.25 * fps)
          const cs = spring({ frame, fps, config: { damping: 200 }, delay: cardDelay, durationInFrames: Math.round(0.6 * fps) })
          const valueFlip = spring({ frame, fps, config: { damping: 200 }, delay: cardDelay + Math.round(0.4 * fps), durationInFrames: Math.round(0.8 * fps) })
          const showNew = valueFlip > 0.5
          const pulse = interpolate((frame - cardDelay) % (2 * fps), [0, fps, 2 * fps], [0.7, 1, 0.7], { easing: Easing.inOut(Easing.sin) })
          const glow = frame > cardDelay + 0.4 * fps ? pulse : 0

          return (
            <div key={i} style={{
              opacity: interpolate(cs, [0, 1], [0, 1]),
              transform: `translateY(${interpolate(cs, [0, 1], [20, 0])}px)`,
              padding: '12px 18px', backgroundColor: C.surface, border: `1px solid ${C.goldDim}`,
              borderRadius: 10, minWidth: 190, textAlign: 'center',
            }}>
              <div style={{ ...mono(9, C.muted), letterSpacing: 1, marginBottom: 7 }}>{m.label}</div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <span style={{ ...mono(20, showNew ? C.muted : C.red, 700), textDecoration: showNew ? 'line-through' : 'none', opacity: showNew ? 0.3 : 1 }}>{m.from}</span>
                {showNew && (
                  <>
                    <span style={{ ...mono(12, C.gold), opacity: 0.4 }}>&rarr;</span>
                    <span style={{ ...mono(20, m.color, 700), textShadow: `0 0 ${10 * glow}px ${C.goldGlow}` }}>{m.to}</span>
                  </>
                )}
              </div>
              {showNew && (
                <div style={{ marginTop: 5, padding: '2px 7px', display: 'inline-block', backgroundColor: `${m.color}15`, borderRadius: 4, opacity: glow }}>
                  <span style={{ ...mono(9, m.color, 600) }}>{m.badge}</span>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* 底部阶段标签 */}
      <div style={{ position: 'absolute', bottom: 28, left: '50%', transform: 'translateX(-50%)', opacity: interpolate(frame, [0.5 * fps, fps], [0, 0.4], CL) }}>
        <span style={{ ...mono(13, C.muted), letterSpacing: 3 }}>PHASE 03 / FULL-STACK REQUEST TRACING</span>
      </div>
    </AbsoluteFill>
  )
}

// ─── 阶段 4：落幕 - The Essence (20–25s) ────────────────────
const Essence: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const fadeIn = interpolate(frame, [0, 1.5 * fps], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.quad) })
  const diamondSpring = spring({ frame, fps, config: { damping: 15, stiffness: 100 }, delay: Math.round(0.3 * fps) })
  const diamondRotate = interpolate(diamondSpring, [0, 1], [180, 45])
  const sloganSpring = spring({ frame, fps, config: { damping: 200 }, delay: Math.round(0.8 * fps), durationInFrames: Math.round(1.2 * fps) })
  const lineSpring = spring({ frame, fps, config: { damping: 200 }, delay: Math.round(1.5 * fps), durationInFrames: Math.round(0.8 * fps) })
  const domainSpring = spring({ frame, fps, config: { damping: 200 }, delay: Math.round(2.2 * fps), durationInFrames: Math.round(0.8 * fps) })

  const glowRadius = interpolate(frame, [0, 2 * fps], [0, 500], { extrapolateRight: 'clamp', easing: Easing.out(Easing.quad) })
  const glowOpacity = interpolate(frame, [0, fps, 2 * fps], [0, 0.2, 0.05], { extrapolateRight: 'clamp' })
  const fadeOut = interpolate(frame, [4 * fps, 5 * fps], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', opacity: fadeIn * fadeOut }}>
      <svg viewBox="0 0 1920 1080" style={{ position: 'absolute', width: '100%', height: '100%' }}>
        <defs>
          <radialGradient id="essenceGlow2">
            <stop offset="0%" style={{ stopColor: C.gold, stopOpacity: 0.1 }} />
            <stop offset="100%" style={{ stopColor: C.gold, stopOpacity: 0 }} />
          </radialGradient>
        </defs>
        <circle cx={960} cy={540} r={glowRadius} fill="url(#essenceGlow2)" opacity={glowOpacity * 3} />
        <circle cx={960} cy={540} r={glowRadius} fill="none" stroke={C.gold} strokeWidth={1.5} opacity={glowOpacity} />
      </svg>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
        <div style={{ width: 16, height: 16, backgroundColor: C.gold, transform: `rotate(${diamondRotate}deg) scale(${interpolate(diamondSpring, [0, 1], [0, 1])})`, opacity: interpolate(diamondSpring, [0, 1], [0, 0.7]), marginBottom: 16 }} />
        <div style={{ fontSize: 36, fontWeight: 400, fontFamily: "'Playfair Display', serif", fontStyle: 'italic', color: C.gold, letterSpacing: 2, textAlign: 'center', maxWidth: 1000, lineHeight: 1.5, opacity: interpolate(sloganSpring, [0, 1], [0, 1]), transform: `translateY(${interpolate(sloganSpring, [0, 1], [30, 0])}px)` }}>
          &ldquo;{SLOGAN}&rdquo;
        </div>
        <div style={{ width: interpolate(lineSpring, [0, 1], [0, 400]), height: 1, backgroundColor: C.gold, opacity: 0.5, marginTop: 8 }} />
        <div style={{ ...mono(20, C.muted), letterSpacing: 3, opacity: interpolate(domainSpring, [0, 1], [0, 0.7]), marginTop: 8 }}>{DOMAIN}</div>
        <div style={{ width: 8, height: 8, backgroundColor: C.gold, transform: 'rotate(45deg)', opacity: interpolate(domainSpring, [0, 1], [0, 0.4]), marginTop: 12 }} />
      </div>
    </AbsoluteFill>
  )
}

// ─── 主组合 (25s / 750 帧 / 30fps) ─────────────────────────
export const ArchitectureEvolution: React.FC = () => {
  const { fps } = useVideoConfig()

  return (
    <AbsoluteFill style={{ backgroundColor: C.bg }}>
      <BackgroundGrid />

      <Sequence durationInFrames={Math.round(5 * fps)} premountFor={fps}>
        <PythonEra />
      </Sequence>

      <Sequence from={Math.round(5 * fps)} durationInFrames={Math.round(5 * fps)} premountFor={fps}>
        <Transformation />
      </Sequence>

      <Sequence from={Math.round(10 * fps)} durationInFrames={Math.round(10 * fps)} premountFor={fps}>
        <NewArchitecture />
      </Sequence>

      <Sequence from={Math.round(20 * fps)} durationInFrames={Math.round(5 * fps)} premountFor={fps}>
        <Essence />
      </Sequence>
    </AbsoluteFill>
  )
}
