import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion'

const stars = [
  { cx: 100, cy: 120, r: 2, twinklePeriod: 3 },
  { cx: 180, cy: 180, r: 3, twinklePeriod: 4 },
  { cx: 220, cy: 160, r: 2, twinklePeriod: 3.5 },
  { cx: 280, cy: 140, r: 1.5, twinklePeriod: 5 },
  { cx: 160, cy: 250, r: 2, twinklePeriod: 4 },
  { cx: 200, cy: 320, r: 2.5, twinklePeriod: 3 },
  { cx: 250, cy: 220, r: 1.5, twinklePeriod: 4.5 },
  { cx: 320, cy: 240, r: 2, twinklePeriod: 3.5 },
]

const lines = [
  'M100,120 L180,180 L220,160 L280,140',
  'M180,180 L160,250 L200,320',
  'M180,180 L250,220 L320,240',
]

export const ConstellationAnimation: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps, durationInFrames } = useVideoConfig()

  // Floating motion: 6-second cycle using eased interpolation
  const floatCycle = 6 * fps
  const floatY = interpolate(
    frame % floatCycle,
    [0, floatCycle / 2, floatCycle],
    [0, -10, 0],
    { easing: Easing.inOut(Easing.sin) },
  )

  return (
    <AbsoluteFill style={{ backgroundColor: 'transparent' }}>
      <svg
        viewBox="0 0 400 400"
        style={{ width: '100%', height: '100%', transform: `translateY(${floatY}px)` }}
      >
        <defs>
          <linearGradient id="remotionLineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#D4AF37', stopOpacity: 0 }} />
            <stop offset="50%" style={{ stopColor: '#D4AF37', stopOpacity: 0.8 }} />
            <stop offset="100%" style={{ stopColor: '#D4AF37', stopOpacity: 0 }} />
          </linearGradient>
        </defs>

        {/* Lines with spring-driven draw-in */}
        {lines.map((d, i) => {
          const lineSpring = spring({
            frame: frame - i * Math.round(0.8 * fps),
            fps,
            config: { damping: 200 },
            durationInFrames: Math.round(2.5 * fps),
          })
          const dashOffset = interpolate(lineSpring, [0, 1], [1000, 0])

          // Subtle pulse after drawn in
          const pulsePhase = (i * 0.7 * fps)
          const pulseOpacity = interpolate(
            (frame + pulsePhase) % durationInFrames,
            [0, durationInFrames / 2, durationInFrames],
            [0.6, 1, 0.6],
            { easing: Easing.inOut(Easing.sin) },
          )

          return (
            <path
              key={i}
              d={d}
              fill="none"
              stroke="url(#remotionLineGrad)"
              strokeWidth={1.5}
              strokeDasharray={1000}
              strokeDashoffset={dashOffset}
              opacity={pulseOpacity}
            />
          )
        })}

        {/* Stars with spring entrance + cyclic twinkle */}
        {stars.map((star, i) => {
          // Spring entrance: staggered by 0.3s each
          const entrance = spring({
            frame: frame - i * Math.round(0.3 * fps),
            fps,
            config: { damping: 15, stiffness: 80 },
          })

          // Cyclic twinkle based on each star's unique period
          const twinkleCycle = Math.round(star.twinklePeriod * fps)
          const twinkle = interpolate(
            (frame + i * Math.round(0.5 * fps)) % twinkleCycle,
            [0, twinkleCycle / 2, twinkleCycle],
            [0.3, 1, 0.3],
            { easing: Easing.inOut(Easing.sin) },
          )

          // Scale pop on entrance
          const scale = interpolate(entrance, [0, 1], [0, 1])

          return (
            <circle
              key={i}
              cx={star.cx}
              cy={star.cy}
              r={star.r * scale}
              fill="#D4AF37"
              opacity={entrance * twinkle}
            />
          )
        })}
      </svg>
    </AbsoluteFill>
  )
}
