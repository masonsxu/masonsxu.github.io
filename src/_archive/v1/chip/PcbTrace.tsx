interface PcbTraceProps {
  /** Variant determines path shape */
  variant?: "straight" | "elbow-r" | "elbow-l" | "double";
  /** Height in px */
  height?: number;
  className?: string;
}

/**
 * PcbTrace — inter-section SVG trace with continuous gold pulse animation.
 * Renders a horizontal flex wrapper containing a single SVG; placed between
 * sections to imply a signal traveling between IC packages.
 *
 * Pulse uses pure SVG `strokeDasharray` + `<animate>` for stroke-dashoffset —
 * survives prefers-reduced-motion via global CSS pause.
 */
export function PcbTrace({
  variant = "straight",
  height = 80,
  className = "",
}: PcbTraceProps) {
  // Path with single 90° turn (right) or branching (double)
  const path = paths[variant];

  return (
    <div
      className={`relative w-full pointer-events-none ${className}`}
      style={{ height }}
      aria-hidden
    >
      <svg
        width="100%"
        height={height}
        viewBox={`0 0 800 ${height}`}
        preserveAspectRatio="none"
        className="absolute inset-0"
      >
        <defs>
          <linearGradient id="pcb-trace-grad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="rgba(212, 175, 55, 0)" />
            <stop offset="50%" stopColor="rgba(212, 175, 55, 0.85)" />
            <stop offset="100%" stopColor="rgba(212, 175, 55, 0)" />
          </linearGradient>
        </defs>
        {/* Baseline trace */}
        <path
          d={path}
          stroke="rgba(0, 153, 255, 0.14)"
          strokeWidth="1"
          fill="none"
        />
        {/* Pulse overlay */}
        <path
          d={path}
          stroke="rgba(212, 175, 55, 0.55)"
          strokeWidth="1.2"
          fill="none"
          strokeDasharray="32 280"
          strokeLinecap="round"
        >
          <animate
            attributeName="stroke-dashoffset"
            from="312"
            to="0"
            dur="4.6s"
            repeatCount="indefinite"
          />
        </path>
        {/* Junction dots */}
        {junctions[variant].map((j, i) => (
          <circle
            key={i}
            cx={j[0]}
            cy={j[1]}
            r="1.6"
            fill="rgba(212, 175, 55, 0.55)"
          />
        ))}
      </svg>
    </div>
  );
}

const paths: Record<NonNullable<PcbTraceProps["variant"]>, string> = {
  straight: "M 60 40 L 740 40",
  "elbow-r": "M 60 20 L 380 20 L 380 60 L 740 60",
  "elbow-l": "M 60 60 L 380 60 L 380 20 L 740 20",
  double: "M 60 40 L 380 40 L 380 12 M 380 68 L 380 40 L 740 40",
};

const junctions: Record<NonNullable<PcbTraceProps["variant"]>, [number, number][]> = {
  straight: [
    [60, 40],
    [740, 40],
  ],
  "elbow-r": [
    [60, 20],
    [380, 20],
    [380, 60],
    [740, 60],
  ],
  "elbow-l": [
    [60, 60],
    [380, 60],
    [380, 20],
    [740, 20],
  ],
  double: [
    [60, 40],
    [380, 40],
    [380, 12],
    [380, 68],
    [740, 40],
  ],
};
