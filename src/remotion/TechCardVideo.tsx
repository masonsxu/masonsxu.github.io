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
const TAGS = [
  'Go 1.24+ Microservices',
  'CloudWeGo (Kitex / Hertz)',
  'AI-Driven Architecture (Vibe Coding)',
]
const DOMAIN = 'masonsxu-github-io.pages.dev'

// ─── 配色 ─────────────────────────────────────────────────────
const COLORS = {
  bg: '#0a0a0a',
  text: '#f5f5f5',
  gold: '#d4af37',
  goldDim: 'rgba(212, 175, 55, 0.15)',
  gridLine: 'rgba(212, 175, 55, 0.06)',
}

// ─── 背景网格 + 粒子 ─────────────────────────────────────────
const BackgroundGrid: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const gridSpacing = 60
  const cols = Math.ceil(1920 / gridSpacing) + 1
  const rows = Math.ceil(1080 / gridSpacing) + 1

  // 缓慢向右上方飘移
  const driftX = interpolate(frame, [0, 15 * fps], [0, 30], {
    extrapolateRight: 'clamp',
  })
  const driftY = interpolate(frame, [0, 15 * fps], [0, -20], {
    extrapolateRight: 'clamp',
  })

  // 网格淡入
  const gridOpacity = interpolate(frame, [0, 2 * fps], [0, 1], {
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.quad),
  })

  // 浮动粒子
  const particles = Array.from({ length: 12 }, (_, i) => {
    const seed = i * 137.5
    const baseX = ((seed * 7.3) % 1920)
    const baseY = ((seed * 3.7) % 1080)
    const speed = 0.3 + (i % 5) * 0.15
    const phase = i * 1.2

    const y = baseY + interpolate(
      (frame + phase * fps) % (8 * fps),
      [0, 4 * fps, 8 * fps],
      [0, -40 * speed, 0],
      { easing: Easing.inOut(Easing.sin) },
    )
    const x = baseX + interpolate(
      (frame + phase * fps) % (10 * fps),
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
        fill={COLORS.gold}
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
          {/* 竖线 */}
          {Array.from({ length: cols }, (_, i) => (
            <line
              key={`v${i}`}
              x1={i * gridSpacing}
              y1={0}
              x2={i * gridSpacing}
              y2={1080}
              stroke={COLORS.gridLine}
              strokeWidth={1}
            />
          ))}
          {/* 横线 */}
          {Array.from({ length: rows }, (_, i) => (
            <line
              key={`h${i}`}
              x1={0}
              y1={i * gridSpacing}
              x2={1920}
              y2={i * gridSpacing}
              stroke={COLORS.gridLine}
              strokeWidth={1}
            />
          ))}
        </g>
        {/* 粒子 */}
        {particles}
      </svg>
    </AbsoluteFill>
  )
}

// ─── 入场：名字 + 圆形微光 (0–3s) ──────────────────────────
const NameEntrance: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  // 名字淡入 + 上移
  const nameSpring = spring({
    frame,
    fps,
    config: { damping: 200 },
    durationInFrames: Math.round(1.5 * fps),
  })
  const nameOpacity = interpolate(nameSpring, [0, 1], [0, 1])
  const nameY = interpolate(nameSpring, [0, 1], [30, 0])

  // 分隔符延迟入场
  const dividerSpring = spring({
    frame,
    fps,
    config: { damping: 200 },
    delay: Math.round(0.5 * fps),
    durationInFrames: Math.round(1 * fps),
  })
  const dividerWidth = interpolate(dividerSpring, [0, 1], [0, 120])

  // 圆形微光扩散
  const glowRadius = interpolate(frame, [0, 2.5 * fps], [0, 400], {
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.quad),
  })
  const glowOpacity = interpolate(frame, [0, 1 * fps, 2.5 * fps], [0, 0.3, 0], {
    extrapolateRight: 'clamp',
  })

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {/* 圆形微光 */}
      <svg
        viewBox="0 0 1920 1080"
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
        }}
      >
        <circle
          cx={960}
          cy={480}
          r={glowRadius}
          fill="none"
          stroke={COLORS.gold}
          strokeWidth={2}
          opacity={glowOpacity}
        />
        <circle
          cx={960}
          cy={480}
          r={glowRadius * 0.6}
          fill="none"
          stroke={COLORS.gold}
          strokeWidth={1}
          opacity={glowOpacity * 0.5}
        />
      </svg>

      {/* 名字 */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 16,
          opacity: nameOpacity,
          transform: `translateY(${nameY}px)`,
        }}
      >
        <div
          style={{
            fontSize: 72,
            fontWeight: 300,
            color: COLORS.text,
            fontFamily: "'Noto Sans SC', sans-serif",
            letterSpacing: 12,
          }}
        >
          {NAME_CN}
        </div>
        {/* 金色分隔线 */}
        <div
          style={{
            width: dividerWidth,
            height: 1,
            backgroundColor: COLORS.gold,
            opacity: 0.6,
          }}
        />
        <div
          style={{
            fontSize: 28,
            fontWeight: 400,
            color: COLORS.gold,
            fontFamily: "'Playfair Display', serif",
            letterSpacing: 6,
            opacity: dividerSpring,
          }}
        >
          {NAME_EN}
        </div>
      </div>
    </AbsoluteFill>
  )
}

// ─── 核心标签滚动 (3–10s) ────────────────────────────────────
const TagCarousel: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  // 每个标签约 2.33 秒 (7s / 3)
  const tagDuration = Math.round(2.33 * fps)

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 140,
      }}
    >
      {TAGS.map((tag, i) => {
        const tagStart = i * tagDuration
        const localFrame = frame - tagStart

        // 淡入 + 上移
        const enterProgress = interpolate(
          localFrame,
          [0, Math.round(0.5 * fps)],
          [0, 1],
          {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
            easing: Easing.out(Easing.quad),
          },
        )
        // 停留后淡出
        const exitProgress = interpolate(
          localFrame,
          [tagDuration - Math.round(0.5 * fps), tagDuration],
          [1, 0],
          {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
            easing: Easing.in(Easing.quad),
          },
        )
        // 最后一个标签不需要淡出（自然过渡到 outro）
        const opacity = i === TAGS.length - 1
          ? enterProgress
          : Math.min(enterProgress, exitProgress)
        const y = interpolate(enterProgress, [0, 1], [20, 0])

        // 仅在当前标签的时间范围内显示
        if (localFrame < -10 || localFrame > tagDuration + 10) return null

        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              opacity,
              transform: `translateY(${y}px)`,
              display: 'flex',
              alignItems: 'center',
              gap: 16,
            }}
          >
            {/* 装饰点 */}
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                backgroundColor: COLORS.gold,
                opacity: 0.8,
              }}
            />
            <div
              style={{
                fontSize: 36,
                fontWeight: 300,
                color: COLORS.text,
                fontFamily: "'Noto Sans SC', 'JetBrains Mono', monospace",
                letterSpacing: 2,
              }}
            >
              {tag}
            </div>
          </div>
        )
      })}
    </AbsoluteFill>
  )
}

// ─── 收尾 (10–15s) ──────────────────────────────────────────
const Outro: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  // 整体缩入
  const shrinkSpring = spring({
    frame,
    fps,
    config: { damping: 200 },
    durationInFrames: Math.round(1.5 * fps),
  })
  const scale = interpolate(shrinkSpring, [0, 1], [1, 0.85])

  // 域名淡入
  const domainDelay = Math.round(1.5 * fps)
  const domainSpring = spring({
    frame,
    fps,
    config: { damping: 200 },
    delay: domainDelay,
    durationInFrames: Math.round(1.2 * fps),
  })
  const domainOpacity = interpolate(domainSpring, [0, 1], [0, 1])
  const domainY = interpolate(domainSpring, [0, 1], [15, 0])

  // 底部金色线条展开
  const lineSpring = spring({
    frame,
    fps,
    config: { damping: 200 },
    delay: Math.round(2 * fps),
    durationInFrames: Math.round(1 * fps),
  })
  const lineWidth = interpolate(lineSpring, [0, 1], [0, 200])

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        transform: `scale(${scale})`,
      }}
    >
      {/* 名字保持可见但略缩 */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 24,
        }}
      >
        <div
          style={{
            fontSize: 56,
            fontWeight: 300,
            color: COLORS.text,
            fontFamily: "'Noto Sans SC', sans-serif",
            letterSpacing: 10,
          }}
        >
          {NAME_CN}
        </div>

        {/* 金色分隔线 */}
        <div
          style={{
            width: lineWidth,
            height: 1,
            backgroundColor: COLORS.gold,
            opacity: 0.5,
          }}
        />

        {/* 域名 */}
        <div
          style={{
            opacity: domainOpacity,
            transform: `translateY(${domainY}px)`,
            fontSize: 24,
            fontWeight: 400,
            color: COLORS.gold,
            fontFamily: "'JetBrains Mono', monospace",
            letterSpacing: 3,
          }}
        >
          {DOMAIN}
        </div>
      </div>
    </AbsoluteFill>
  )
}

// ─── 主组合 ─────────────────────────────────────────────────
export const TechCardVideo: React.FC = () => {
  const { fps } = useVideoConfig()

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg }}>
      {/* 背景网格 + 粒子 (全时长) */}
      <BackgroundGrid />

      {/* 入场：名字 + 微光 (0–3s) */}
      <Sequence durationInFrames={Math.round(3 * fps)} premountFor={fps}>
        <NameEntrance />
      </Sequence>

      {/* 核心标签滚动 (3–10s) */}
      <Sequence
        from={Math.round(3 * fps)}
        durationInFrames={Math.round(7 * fps)}
        premountFor={fps}
      >
        <TagCarousel />
      </Sequence>

      {/* 收尾 (10–15s) */}
      <Sequence
        from={Math.round(10 * fps)}
        durationInFrames={Math.round(5 * fps)}
        premountFor={fps}
      >
        <Outro />
      </Sequence>
    </AbsoluteFill>
  )
}
