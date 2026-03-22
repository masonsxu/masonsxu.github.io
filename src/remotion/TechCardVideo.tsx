import {
  AbsoluteFill,
  Easing,
  Sequence,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion'

// ─── 可配置内容 ───────────────────────────────────────────────
const NAME_CN = '徐俊飞'
const NAME_EN = 'Masons Xu'
const ROLE = 'Backend Technical Lead'
const SUBTITLE = 'Distributed Systems Architect'
const DOMAIN = 'masonsxu-github-io.pages.dev'
const SLOGAN = 'Architecture is the balance of design and function.'

const TECH_STACKS = [
  { category: 'Language', items: ['Go 1.24+', 'TypeScript', 'Python'] },
  { category: 'Framework', items: ['Kitex (RPC)', 'Hertz (HTTP)', 'React 19'] },
  { category: 'Infra', items: ['PostgreSQL', 'Redis', 'etcd', 'Docker'] },
  { category: 'Practice', items: ['Vibe Coding', 'Clean Arch', 'DDD'] },
]

const HIGHLIGHTS = [
  { label: 'Microservices', value: 'CloudWeGo', color: '#34d399' },
  { label: 'AI Architecture', value: 'Vibe Coding', color: '#60a5fa' },
  { label: 'Open Source', value: 'AGENTS.md 330+', color: '#fb923c' },
]

// ─── 配色 ─────────────────────────────────────────────────────
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

// ─── 背景网格 + 粒子 ─────────────────────────────────────────
const BackgroundGrid: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const gridSpacing = 60
  const cols = Math.ceil(1920 / gridSpacing) + 1
  const rows = Math.ceil(1080 / gridSpacing) + 1

  const driftX = interpolate(frame, [0, 15 * fps], [0, 30], {
    extrapolateRight: 'clamp',
  })
  const driftY = interpolate(frame, [0, 15 * fps], [0, -20], {
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
        cx={x} cy={y}
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
            <line key={`v${i}`} x1={i * gridSpacing} y1={0} x2={i * gridSpacing} y2={1080}
              stroke={C.gridLine} strokeWidth={1} />
          ))}
          {Array.from({ length: rows }, (_, i) => (
            <line key={`h${i}`} x1={0} y1={i * gridSpacing} x2={1920} y2={i * gridSpacing}
              stroke={C.gridLine} strokeWidth={1} />
          ))}
        </g>
        {particles}
      </svg>
    </AbsoluteFill>
  )
}

// ─── 阶段 1：入场 + 角色头衔 (0–4s) ─────────────────────────
const NameEntrance: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  // 名字入场
  const nameSpring = spring({
    frame, fps,
    config: { damping: 200 },
    durationInFrames: Math.round(1.2 * fps),
  })

  // 金色菱形装饰（名字上方）
  const diamondSpring = spring({
    frame, fps,
    config: { damping: 15, stiffness: 100 },
    delay: Math.round(0.3 * fps),
  })
  const diamondScale = interpolate(diamondSpring, [0, 1], [0, 1])
  const diamondRotate = interpolate(diamondSpring, [0, 1], [180, 45])

  // 分隔线
  const dividerSpring = spring({
    frame, fps,
    config: { damping: 200 },
    delay: Math.round(0.6 * fps),
    durationInFrames: Math.round(0.8 * fps),
  })
  const dividerWidth = interpolate(dividerSpring, [0, 1], [0, 200])

  // 英文名
  const enSpring = spring({
    frame, fps,
    config: { damping: 200 },
    delay: Math.round(0.9 * fps),
    durationInFrames: Math.round(0.8 * fps),
  })

  // 角色头衔（延迟入场）
  const roleSpring = spring({
    frame, fps,
    config: { damping: 200 },
    delay: Math.round(1.5 * fps),
    durationInFrames: Math.round(1 * fps),
  })
  const roleY = interpolate(roleSpring, [0, 1], [15, 0])

  // 副标题
  const subSpring = spring({
    frame, fps,
    config: { damping: 200 },
    delay: Math.round(2 * fps),
    durationInFrames: Math.round(0.8 * fps),
  })

  // 圆形微光扩散
  const glowRadius = interpolate(frame, [0, 2.5 * fps], [0, 500], {
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.quad),
  })
  const glowOpacity = interpolate(frame, [0, 1 * fps, 2.5 * fps], [0, 0.25, 0], {
    extrapolateRight: 'clamp',
  })

  // 左右装饰线
  const sideLineSpring = spring({
    frame, fps,
    config: { damping: 200 },
    delay: Math.round(2.5 * fps),
    durationInFrames: Math.round(1 * fps),
  })
  const sideLineW = interpolate(sideLineSpring, [0, 1], [0, 160])

  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
      {/* 圆形微光 */}
      <svg viewBox="0 0 1920 1080" style={{ position: 'absolute', width: '100%', height: '100%' }}>
        <defs>
          <radialGradient id="centerGlow">
            <stop offset="0%" style={{ stopColor: C.gold, stopOpacity: 0.12 }} />
            <stop offset="100%" style={{ stopColor: C.gold, stopOpacity: 0 }} />
          </radialGradient>
        </defs>
        <circle cx={960} cy={440} r={glowRadius} fill="url(#centerGlow)" opacity={glowOpacity * 3} />
        <circle cx={960} cy={440} r={glowRadius} fill="none" stroke={C.gold}
          strokeWidth={1.5} opacity={glowOpacity} />
        <circle cx={960} cy={440} r={glowRadius * 0.6} fill="none" stroke={C.gold}
          strokeWidth={1} opacity={glowOpacity * 0.4} />
      </svg>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
        {/* 金色菱形装饰 */}
        <div style={{
          width: 16, height: 16,
          backgroundColor: C.gold,
          transform: `rotate(${diamondRotate}deg) scale(${diamondScale})`,
          opacity: interpolate(diamondSpring, [0, 1], [0, 0.7]),
          marginBottom: 12,
        }} />

        {/* 中文名 */}
        <div style={{
          fontSize: 78,
          fontWeight: 300,
          color: C.text,
          fontFamily: "'Noto Sans SC', sans-serif",
          letterSpacing: 14,
          opacity: interpolate(nameSpring, [0, 1], [0, 1]),
          transform: `translateY(${interpolate(nameSpring, [0, 1], [25, 0])}px)`,
        }}>
          {NAME_CN}
        </div>

        {/* 金色分隔线 */}
        <div style={{ width: dividerWidth, height: 1, backgroundColor: C.gold, opacity: 0.5 }} />

        {/* 英文名 */}
        <div style={{
          fontSize: 30,
          fontWeight: 400,
          color: C.gold,
          fontFamily: "'Playfair Display', serif",
          letterSpacing: 8,
          opacity: interpolate(enSpring, [0, 1], [0, 1]),
        }}>
          {NAME_EN}
        </div>

        {/* 间距 */}
        <div style={{ height: 20 }} />

        {/* 角色头衔 */}
        <div style={{
          opacity: interpolate(roleSpring, [0, 1], [0, 1]),
          transform: `translateY(${roleY}px)`,
          display: 'flex', alignItems: 'center', gap: 16,
        }}>
          <div style={{ width: sideLineW, height: 1, backgroundColor: C.gold, opacity: 0.25 }} />
          <span style={{
            fontSize: 22,
            fontWeight: 500,
            color: C.text,
            fontFamily: "'JetBrains Mono', monospace",
            letterSpacing: 3,
          }}>
            {ROLE}
          </span>
          <div style={{ width: sideLineW, height: 1, backgroundColor: C.gold, opacity: 0.25 }} />
        </div>

        {/* 副标题 */}
        <div style={{
          fontSize: 17,
          color: C.muted,
          fontFamily: "'JetBrains Mono', monospace",
          letterSpacing: 2,
          opacity: interpolate(subSpring, [0, 1], [0, 0.7]),
        }}>
          {SUBTITLE}
        </div>
      </div>
    </AbsoluteFill>
  )
}

// ─── 阶段 2：技术栈展示 (4–9s) ──────────────────────────────
const TechStackShowcase: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  // 标题入场
  const headerSpring = spring({
    frame, fps,
    config: { damping: 200 },
    durationInFrames: Math.round(0.8 * fps),
  })

  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
      {/* 标题 */}
      <div style={{
        position: 'absolute',
        top: 140,
        width: '100%',
        textAlign: 'center',
        opacity: interpolate(headerSpring, [0, 1], [0, 1]),
        transform: `translateY(${interpolate(headerSpring, [0, 1], [15, 0])}px)`,
      }}>
        <span style={{
          fontSize: 20,
          color: C.gold,
          fontFamily: "'JetBrains Mono', monospace",
          letterSpacing: 4,
          fontWeight: 500,
        }}>
          TECH STACK
        </span>
      </div>

      {/* 4 行技术栈 */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 32,
        paddingTop: 40,
      }}>
        {TECH_STACKS.map((row, ri) => {
          const rowDelay = Math.round(0.4 * fps) + ri * Math.round(0.35 * fps)
          const rowSpring = spring({
            frame, fps,
            config: { damping: 20, stiffness: 200 },
            delay: rowDelay,
          })
          const rowX = interpolate(rowSpring, [0, 1], [ri % 2 === 0 ? -80 : 80, 0])
          const rowOpacity = interpolate(rowSpring, [0, 1], [0, 1])

          return (
            <div
              key={ri}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 20,
                opacity: rowOpacity,
                transform: `translateX(${rowX}px)`,
              }}
            >
              {/* 分类标签 */}
              <div style={{
                width: 130,
                textAlign: 'right',
                fontSize: 14,
                color: C.gold,
                fontFamily: "'JetBrains Mono', monospace",
                fontWeight: 600,
                letterSpacing: 1,
                opacity: 0.8,
              }}>
                {row.category}
              </div>

              {/* 竖线分隔 */}
              <div style={{ width: 1, height: 36, backgroundColor: C.gold, opacity: 0.2 }} />

              {/* 技术标签 pills */}
              <div style={{ display: 'flex', gap: 10 }}>
                {row.items.map((item, ii) => {
                  const pillDelay = rowDelay + Math.round(0.1 * fps) + ii * Math.round(0.08 * fps)
                  const pillSpring = spring({
                    frame, fps,
                    config: { damping: 20, stiffness: 200 },
                    delay: pillDelay,
                  })
                  const pillScale = interpolate(pillSpring, [0, 1], [0.8, 1])

                  return (
                    <div
                      key={ii}
                      style={{
                        padding: '10px 22px',
                        borderRadius: 8,
                        backgroundColor: C.surface,
                        border: `1px solid ${C.goldDim}`,
                        opacity: interpolate(pillSpring, [0, 1], [0, 1]),
                        transform: `scale(${pillScale})`,
                      }}
                    >
                      <span style={{
                        fontSize: 17,
                        color: C.text,
                        fontFamily: "'JetBrains Mono', monospace",
                        fontWeight: 400,
                        letterSpacing: 0.5,
                      }}>
                        {item}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </AbsoluteFill>
  )
}

// ─── 阶段 3：核心亮点 (9–12s) ────────────────────────────────
const CoreHighlights: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ display: 'flex', gap: 60 }}>
        {HIGHLIGHTS.map((h, i) => {
          const delay = i * Math.round(0.4 * fps)
          const cardSpring = spring({
            frame, fps,
            config: { damping: 15, stiffness: 100 },
            delay,
          })
          const cardScale = interpolate(cardSpring, [0, 1], [0.7, 1])
          const cardOpacity = interpolate(cardSpring, [0, 1], [0, 1])

          // 顶部进度条动画
          const barDelay = delay + Math.round(0.5 * fps)
          const barProgress = interpolate(
            frame,
            [barDelay, barDelay + Math.round(1.5 * fps)],
            [0, 1],
            { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.quad) },
          )

          // 脉动
          const pulse = interpolate(
            (frame + i * 20) % (2 * fps),
            [0, fps, 2 * fps],
            [0.3, 0.7, 0.3],
            { easing: Easing.inOut(Easing.sin) },
          )

          return (
            <div
              key={i}
              style={{
                width: 280,
                opacity: cardOpacity,
                transform: `scale(${cardScale})`,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 18,
                padding: '36px 28px',
                backgroundColor: C.surface,
                border: `1px solid ${C.goldDim}`,
                borderRadius: 14,
              }}
            >
              {/* 顶部进度条 */}
              <div style={{ width: '100%', height: 3, backgroundColor: `${h.color}15`, borderRadius: 2, overflow: 'hidden' }}>
                <div style={{
                  width: `${barProgress * 100}%`,
                  height: '100%',
                  backgroundColor: h.color,
                  borderRadius: 2,
                  boxShadow: `0 0 ${12 * pulse}px ${h.color}`,
                }} />
              </div>

              {/* 值 */}
              <div style={{
                fontSize: 30,
                fontWeight: 700,
                color: C.text,
                fontFamily: "'JetBrains Mono', monospace",
                textShadow: `0 0 ${15 * pulse}px ${C.goldGlow}`,
              }}>
                {h.value}
              </div>

              {/* 标签 */}
              <div style={{
                fontSize: 14,
                color: C.muted,
                fontFamily: "'JetBrains Mono', monospace",
                letterSpacing: 2,
              }}>
                {h.label}
              </div>

              {/* 底部装饰点 */}
              <div style={{
                width: 6, height: 6, borderRadius: '50%',
                backgroundColor: h.color,
                opacity: 0.5 + pulse * 0.5,
              }} />
            </div>
          )
        })}
      </div>
    </AbsoluteFill>
  )
}

// ─── 阶段 4：收尾 (12–15s) ──────────────────────────────────
const Outro: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  // 整体缩入
  const shrinkSpring = spring({
    frame, fps,
    config: { damping: 200 },
    durationInFrames: Math.round(1 * fps),
  })
  const scale = interpolate(shrinkSpring, [0, 1], [1.05, 1])

  // 名字
  const nameSpring = spring({
    frame, fps,
    config: { damping: 200 },
    durationInFrames: Math.round(1 * fps),
  })

  // 金色分隔线
  const lineSpring = spring({
    frame, fps,
    config: { damping: 200 },
    delay: Math.round(0.5 * fps),
    durationInFrames: Math.round(0.8 * fps),
  })
  const lineWidth = interpolate(lineSpring, [0, 1], [0, 350])

  // Slogan
  const sloganSpring = spring({
    frame, fps,
    config: { damping: 200 },
    delay: Math.round(1 * fps),
    durationInFrames: Math.round(1 * fps),
  })

  // 域名
  const domainSpring = spring({
    frame, fps,
    config: { damping: 200 },
    delay: Math.round(1.5 * fps),
    durationInFrames: Math.round(0.8 * fps),
  })

  // 底部小方块装饰
  const decoSpring = spring({
    frame, fps,
    config: { damping: 200 },
    delay: Math.round(2 * fps),
  })

  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', transform: `scale(${scale})` }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
        {/* 名字 */}
        <div style={{
          fontSize: 56,
          fontWeight: 300,
          color: C.text,
          fontFamily: "'Noto Sans SC', sans-serif",
          letterSpacing: 10,
          opacity: interpolate(nameSpring, [0, 1], [0, 1]),
          transform: `translateY(${interpolate(nameSpring, [0, 1], [20, 0])}px)`,
        }}>
          {NAME_CN}
        </div>

        {/* 金色分隔线 */}
        <div style={{ width: lineWidth, height: 1, backgroundColor: C.gold, opacity: 0.5 }} />

        {/* Slogan */}
        <div style={{
          fontSize: 22,
          fontWeight: 400,
          color: C.gold,
          fontFamily: "'Playfair Display', serif",
          fontStyle: 'italic',
          letterSpacing: 1.5,
          textAlign: 'center',
          maxWidth: 800,
          opacity: interpolate(sloganSpring, [0, 1], [0, 1]),
          transform: `translateY(${interpolate(sloganSpring, [0, 1], [12, 0])}px)`,
        }}>
          &ldquo;{SLOGAN}&rdquo;
        </div>

        {/* 间距 */}
        <div style={{ height: 12 }} />

        {/* 域名 */}
        <div style={{
          fontSize: 18,
          fontWeight: 400,
          color: C.muted,
          fontFamily: "'JetBrains Mono', monospace",
          letterSpacing: 3,
          opacity: interpolate(domainSpring, [0, 1], [0, 0.7]),
        }}>
          {DOMAIN}
        </div>

        {/* 底部装饰菱形 */}
        <div style={{
          width: 10, height: 10,
          backgroundColor: C.gold,
          transform: `rotate(45deg) scale(${interpolate(decoSpring, [0, 1], [0, 1])})`,
          opacity: 0.5,
          marginTop: 8,
        }} />
      </div>
    </AbsoluteFill>
  )
}

// ─── 主组合 (15s / 450 帧 / 30fps) ─────────────────────────
export const TechCardVideo: React.FC = () => {
  const { fps } = useVideoConfig()

  return (
    <AbsoluteFill style={{ backgroundColor: C.bg }}>
      <BackgroundGrid />

      {/* 阶段 1：入场 + 角色头衔 (0–4s) */}
      <Sequence durationInFrames={Math.round(4 * fps)} premountFor={fps}>
        <NameEntrance />
      </Sequence>

      {/* 阶段 2：技术栈展示 (4–9s) */}
      <Sequence
        from={Math.round(4 * fps)}
        durationInFrames={Math.round(5 * fps)}
        premountFor={fps}
      >
        <TechStackShowcase />
      </Sequence>

      {/* 阶段 3：核心亮点 (9–12s) */}
      <Sequence
        from={Math.round(9 * fps)}
        durationInFrames={Math.round(3 * fps)}
        premountFor={fps}
      >
        <CoreHighlights />
      </Sequence>

      {/* 阶段 4：收尾 (12–15s) */}
      <Sequence
        from={Math.round(12 * fps)}
        durationInFrames={Math.round(3 * fps)}
        premountFor={fps}
      >
        <Outro />
      </Sequence>

      <div style={{ position: 'absolute', bottom: 24, right: 32, pointerEvents: 'none', opacity: 0.18 }}>
        <span style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: '#a1a1aa', fontWeight: 400, letterSpacing: 2 }}>Masons.Xu | 2026</span>
      </div>
    </AbsoluteFill>
  )
}
