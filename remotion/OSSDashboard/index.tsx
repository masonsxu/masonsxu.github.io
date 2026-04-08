import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Easing,
} from "remotion";
import { THEME } from "../shared/theme";
import { safeInterpolate, sec } from "../shared/utils";

/**
 * 场景编排 (20s = 600帧):
 * 0-2.5s   Opening / 定位开场
 * 2.5-7s   Terminal Context / 终端上下文
 * 7-11s    Fact Cards / 贡献与机制信息卡
 * 11-17s   Contribution Topology / 贡献作用域拓扑
 * 17-20s   Closing Summary / 收尾总结
 */

const TERMINAL_BLOCKS = [
  {
    prompt: "$ gh pr list --author masonsxu --state merged",
    lines: ["3 merged PRs", "cloudwego / hertz-contrib / observability"],
    accent: THEME.gold,
  },
  {
    prompt: "$ inspect contribution-focus",
    lines: ["jwt refresh window bug", "otel trace stability", "go 1.25 build compatibility"],
    accent: THEME.lake.primary,
  },
  {
    prompt: "$ summarize impact",
    lines: ["auth correctness", "trace reliability", "toolchain compatibility"],
    accent: THEME.lake.secondary,
  },
] as const;

const FACT_CARDS = [
  {
    value: "3",
    label: "Merged PRs",
    detail: "CloudWeGo ecosystem",
    color: THEME.gold,
  },
  {
    value: "JWT",
    label: "Auth Bug Fix",
    detail: "MaxRefresh window correctness",
    color: THEME.lake.accent,
  },
  {
    value: "OTel",
    label: "Trace Stability",
    detail: "observability component refinement",
    color: THEME.lake.primary,
  },
  {
    value: "Go 1.25+",
    label: "Build Compatibility",
    detail: "dependency / toolchain alignment",
    color: THEME.lake.secondary,
  },
] as const;

type TopologyNode = {
  id: string;
  label: string;
  x: number;
  y: number;
  color: string;
};

const TOPOLOGY_NODES: TopologyNode[] = [
  { id: "gateway", label: "HTTP Gateway", x: 320, y: 410, color: THEME.gold },
  { id: "jwt", label: "JWT Middleware", x: 620, y: 410, color: THEME.lake.accent },
  { id: "rpc", label: "RPC Service", x: 940, y: 410, color: THEME.gold },
  { id: "otel", label: "OpenTelemetry", x: 780, y: 670, color: THEME.lake.primary },
  { id: "trace", label: "Trace Pipeline", x: 1120, y: 670, color: THEME.lake.primary },
  { id: "generator", label: "Code Generator", x: 1320, y: 410, color: THEME.lake.secondary },
  { id: "deps", label: "Dependency Graph", x: 1500, y: 670, color: THEME.lake.secondary },
  { id: "toolchain", label: "Go Toolchain", x: 1680, y: 410, color: THEME.lake.secondary },
];

const NODE_MAP = Object.fromEntries(TOPOLOGY_NODES.map((node) => [node.id, node]));

const PATHS = [
  {
    id: "auth",
    label: "Auth correctness",
    color: THEME.lake.accent,
    startAt: sec(11.6),
    noteY: 730,
    edges: [
      ["gateway", "jwt"],
      ["jwt", "rpc"],
    ] as const,
  },
  {
    id: "trace",
    label: "Trace reliability",
    color: THEME.lake.primary,
    startAt: sec(13.2),
    noteY: 790,
    edges: [
      ["rpc", "otel"],
      ["otel", "trace"],
    ] as const,
  },
  {
    id: "toolchain",
    label: "Build compatibility",
    color: THEME.lake.secondary,
    startAt: sec(14.8),
    noteY: 850,
    edges: [
      ["generator", "deps"],
      ["deps", "toolchain"],
    ] as const,
  },
] as const;

export const OSSDashboard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill
      style={{
        backgroundColor: THEME.obsidian,
        fontFamily: THEME.fontSans,
        color: THEME.pearl,
        overflow: "hidden",
      }}
    >
      <BackgroundGlow frame={frame} fps={fps} />
      <GridOverlay />
      <VignetteOverlay />

      <OpeningFrame frame={frame} fps={fps} />
      <TerminalContext frame={frame} fps={fps} />
      <FactCards frame={frame} fps={fps} />
      <ContributionTopology frame={frame} fps={fps} />
      <ClosingSummary frame={frame} fps={fps} />
    </AbsoluteFill>
  );
};

const BackgroundGlow: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const breathe = interpolate(frame % (8 * fps), [0, 4 * fps, 8 * fps], [0.035, 0.07, 0.035]);

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          top: 120,
          left: 180,
          width: 520,
          height: 520,
          borderRadius: "50%",
          background: `radial-gradient(circle, rgba(212,175,55,${breathe}) 0%, transparent 72%)`,
          filter: "blur(120px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          right: 120,
          bottom: 100,
          width: 420,
          height: 420,
          borderRadius: "50%",
          background: `radial-gradient(circle, rgba(79,195,247,${breathe * 0.45}) 0%, transparent 72%)`,
          filter: "blur(120px)",
        }}
      />
    </AbsoluteFill>
  );
};

const GridOverlay: React.FC = () => (
  <AbsoluteFill
    style={{
      pointerEvents: "none",
      backgroundImage:
        "linear-gradient(rgba(212,175,55,0.018) 1px, transparent 1px), linear-gradient(90deg, rgba(212,175,55,0.018) 1px, transparent 1px)",
      backgroundSize: "80px 80px",
      maskImage: "radial-gradient(circle at center, rgba(0,0,0,1) 45%, rgba(0,0,0,0.15) 100%)",
    }}
  />
);

const VignetteOverlay: React.FC = () => (
  <AbsoluteFill
    style={{
      pointerEvents: "none",
      background: "radial-gradient(ellipse at center, transparent 48%, rgba(12,12,14,0.72) 100%)",
    }}
  />
);

const SectionTitle: React.FC<{
  title: string;
  subtitle: string;
  frame: number;
  fps: number;
  startAt?: number;
  fadeOutAt?: number;
}> = ({ title, subtitle, frame, fps, startAt = 0, fadeOutAt = sec(19) }) => {
  const progress = spring({
    frame: frame - startAt,
    fps,
    config: { damping: 200 },
    durationInFrames: 24,
  });
  const fadeOut = safeInterpolate(frame, [fadeOutAt, fadeOutAt + sec(0.8)], [1, 0], Easing.in(Easing.quad));

  return (
    <div
      style={{
        position: "absolute",
        top: 74,
        left: 88,
        opacity: interpolate(progress, [0, 1], [0, 1]) * fadeOut,
        transform: `translateY(${interpolate(progress, [0, 1], [18, 0])}px)`,
      }}
    >
      <h2
        style={{
          fontSize: 28,
          fontWeight: 600,
          margin: 0,
          background: THEME.goldGradient,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        {title}
      </h2>
      <span
        style={{
          fontSize: 12,
          color: THEME.muted,
          fontFamily: THEME.fontMono,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
        }}
      >
        {subtitle}
      </span>
    </div>
  );
};

const OpeningFrame: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const fadeIn = safeInterpolate(frame, [0, sec(0.7)], [0, 1]);
  const fadeOut = safeInterpolate(frame, [sec(2), sec(2.7)], [1, 0], Easing.in(Easing.quad));
  const titleProgress = spring({ frame, fps, config: { damping: 200 }, durationInFrames: 26 });

  return (
    <AbsoluteFill style={{ opacity: fadeIn * fadeOut }}>
      <SectionTitle
        title="开源贡献与系统语义"
        subtitle="Open Source Contribution Context"
        frame={frame}
        fps={fps}
        fadeOutAt={sec(2)}
      />

      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          opacity: interpolate(titleProgress, [0, 1], [0, 1]),
          transform: `translateY(${interpolate(titleProgress, [0, 1], [24, 0])}px)`,
        }}
      >
        <div
          style={{
            fontSize: 18,
            color: THEME.muted,
            letterSpacing: "0.18em",
            fontFamily: THEME.fontMono,
            textTransform: "uppercase",
          }}
        >
          From PR to Architecture Meaning
        </div>
        <div
          style={{
            marginTop: 18,
            fontSize: 42,
            fontWeight: 600,
            background: THEME.goldGradient,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          贡献不只是 merged
        </div>
        <div
          style={{
            marginTop: 10,
            fontSize: 18,
            color: THEME.pearl,
            opacity: 0.82,
            letterSpacing: "0.08em",
          }}
        >
          更是对系统边界的理解
        </div>
      </div>

      <GhostTopology opacity={0.2} />
    </AbsoluteFill>
  );
};

const GhostTopology: React.FC<{ opacity: number }> = ({ opacity }) => (
  <AbsoluteFill style={{ opacity, pointerEvents: "none" }}>
    <svg width="1920" height="1080" style={{ position: "absolute", inset: 0 }}>
      {PATHS.flatMap((path) =>
        path.edges.map(([from, to]) => {
          const fromNode = NODE_MAP[from];
          const toNode = NODE_MAP[to];
          return (
            <line
              key={`${path.id}-${from}-${to}`}
              x1={fromNode.x}
              y1={fromNode.y}
              x2={toNode.x}
              y2={toNode.y}
              stroke={`${path.color}30`}
              strokeWidth={1}
            />
          );
        }),
      )}
    </svg>
    {TOPOLOGY_NODES.map((node) => (
      <div
        key={node.id}
        style={{
          position: "absolute",
          left: node.x - 82,
          top: node.y - 24,
          width: 164,
          padding: "10px 12px",
          borderRadius: 12,
          border: `1px solid ${node.color}22`,
          background: `${THEME.surfaceElevated}88`,
          color: node.color,
          fontSize: 12,
          textAlign: "center",
          fontFamily: THEME.fontMono,
        }}
      >
        {node.label}
      </div>
    ))}
  </AbsoluteFill>
);

const TerminalContext: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const fadeIn = safeInterpolate(frame, [sec(2.2), sec(2.9)], [0, 1]);
  const fadeOut = safeInterpolate(frame, [sec(6.6), sec(7.2)], [1, 0], Easing.in(Easing.quad));

  return (
    <AbsoluteFill style={{ opacity: fadeIn * fadeOut }}>
      <SectionTitle
        title="开源项目看板"
        subtitle="Open Source Dashboard"
        frame={frame}
        fps={fps}
        startAt={sec(2.3)}
        fadeOutAt={sec(6.5)}
      />

      <div
        style={{
          position: "absolute",
          left: 120,
          right: 120,
          top: 300,
          padding: "60px 30px",
          borderRadius: 18,
          background: `${THEME.surfaceElevated}E8`,
          border: `1px solid ${THEME.gold}18`,
          boxShadow: "0 24px 80px rgba(0,0,0,0.35)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
          <div style={{ display: "flex", gap: 8 }}>
            {[THEME.lake.accent, THEME.gold, THEME.lake.primary].map((color) => (
              <div key={color} style={{ width: 10, height: 10, borderRadius: "50%", background: color }} />
            ))}
          </div>
          <div
            style={{
              fontSize: 11,
              color: THEME.muted,
              fontFamily: THEME.fontMono,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
            }}
          >
            contribution session
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 26 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {TERMINAL_BLOCKS.map((block, index) => {
              const startAt = sec(2.8) + index * sec(1.1);
              const blockProgress = spring({
                frame: frame - startAt,
                fps,
                config: { damping: 200 },
                durationInFrames: 18,
              });

              return (
                <div
                  key={block.prompt}
                  style={{
                    opacity: interpolate(blockProgress, [0, 1], [0, 1]),
                    transform: `translateY(${interpolate(blockProgress, [0, 1], [14, 0])}px)`,
                  }}
                >
                  <div
                    style={{
                      fontSize: 13,
                      fontFamily: THEME.fontMono,
                      color: block.accent,
                      marginBottom: 8,
                    }}
                  >
                    {block.prompt}
                  </div>
                  {block.lines.map((line) => (
                    <div
                      key={line}
                      style={{
                        fontSize: 15,
                        color: THEME.pearl,
                        lineHeight: 1.65,
                        fontFamily: THEME.fontMono,
                      }}
                    >
                      {line}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>

          <div
            style={{
              borderRadius: 16,
              border: `1px solid ${THEME.gold}12`,
              background: `${THEME.card}DD`,
              padding: "22px 22px 18px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 11,
                  color: THEME.muted,
                  fontFamily: THEME.fontMono,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                }}
              >
                real contribution focus
              </div>
              <div
                style={{
                  marginTop: 14,
                  fontSize: 24,
                  fontWeight: 600,
                  color: THEME.pearl,
                  lineHeight: 1.5,
                }}
              >
                从具体问题切入，
                <br />
                映射到认证、可观测性与工具链稳定性。
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                "jwt refresh window correctness",
                "trace reliability in observability path",
                "go 1.25+ dependency compatibility",
              ].map((item, index) => (
                <div
                  key={item}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    color: THEME.muted,
                    fontSize: 12,
                    fontFamily: THEME.fontMono,
                    opacity: safeInterpolate(frame, [sec(3.4) + index * sec(0.55), sec(4.1) + index * sec(0.55)], [0.25, 1]),
                  }}
                >
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: index === 0 ? THEME.lake.accent : index === 1 ? THEME.lake.primary : THEME.lake.secondary }} />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const FactCards: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const fadeIn = safeInterpolate(frame, [sec(6.8), sec(7.4)], [0, 1]);
  const fadeOut = safeInterpolate(frame, [sec(10.6), sec(11.2)], [1, 0], Easing.in(Easing.quad));

  return (
    <AbsoluteFill style={{ opacity: fadeIn * fadeOut }}>
      <SectionTitle
        title="贡献与机制信息卡"
        subtitle="Contribution Facts"
        frame={frame}
        fps={fps}
        startAt={sec(7)}
        fadeOutAt={sec(10.5)}
      />

      <div
        style={{
          position: "absolute",
          left: 160,
          right: 160,
          top: 300,
          display: "grid",
          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
          gap: 24,
        }}
      >
        {FACT_CARDS.map((card, index) => {
          const startAt = sec(7.2) + index * sec(0.22);
          const progress = spring({
            frame: frame - startAt,
            fps,
            config: { damping: 200 },
            durationInFrames: 18,
          });

          return (
            <div
              key={card.label}
              style={{
                padding: "56px 28px",
                borderRadius: 20,
                background: `${THEME.surfaceElevated}DD`,
                border: `1px solid ${card.color}20`,
                boxShadow: `0 18px 60px ${card.color}10`,
                opacity: interpolate(progress, [0, 1], [0, 1]),
                transform: `translateY(${interpolate(progress, [0, 1], [20, 0])}px) scale(${interpolate(progress, [0, 1], [0.96, 1])})`,
              }}
            >
              <div
                style={{
                  fontSize: card.value.length > 6 ? 30 : 42,
                  fontWeight: 700,
                  fontFamily: THEME.fontMono,
                  color: card.color,
                  letterSpacing: card.value.length > 6 ? "0.01em" : undefined,
                }}
              >
                {card.value}
              </div>
              <div
                style={{
                  marginTop: 10,
                  fontSize: 14,
                  color: THEME.pearl,
                  fontWeight: 600,
                  letterSpacing: "0.04em",
                }}
              >
                {card.label}
              </div>
              <div
                style={{
                  marginTop: 8,
                  fontSize: 12,
                  color: THEME.muted,
                  fontFamily: THEME.fontMono,
                  letterSpacing: "0.06em",
                }}
              >
                {card.detail}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

const ContributionTopology: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const fadeIn = safeInterpolate(frame, [sec(10.8), sec(11.5)], [0, 1]);
  const fadeOut = safeInterpolate(frame, [sec(16.8), sec(17.4)], [1, 0], Easing.in(Easing.quad));

  return (
    <AbsoluteFill style={{ opacity: fadeIn * fadeOut }}>
      <SectionTitle
        title="贡献作用域拓扑"
        subtitle="Contribution Scope Topology"
        frame={frame}
        fps={fps}
        startAt={sec(11)}
        fadeOutAt={sec(16.7)}
      />

      <svg width="1920" height="1080" style={{ position: "absolute", inset: 0 }}>
        {PATHS.flatMap((path) =>
          path.edges.map(([from, to], edgeIndex) => {
            const fromNode = NODE_MAP[from];
            const toNode = NODE_MAP[to];
            const pathProgress = safeInterpolate(frame, [path.startAt + edgeIndex * sec(0.25), path.startAt + edgeIndex * sec(0.25) + sec(0.75)], [0, 1]);
            const length = Math.hypot(toNode.x - fromNode.x, toNode.y - fromNode.y);

            return (
              <React.Fragment key={`${path.id}-${from}-${to}`}>
                <line
                  x1={fromNode.x}
                  y1={fromNode.y}
                  x2={toNode.x}
                  y2={toNode.y}
                  stroke={`${THEME.gold}18`}
                  strokeWidth={1}
                />
                <line
                  x1={fromNode.x}
                  y1={fromNode.y}
                  x2={toNode.x}
                  y2={toNode.y}
                  stroke={path.color}
                  strokeWidth={2}
                  strokeDasharray={length}
                  strokeDashoffset={interpolate(pathProgress, [0, 1], [length, 0])}
                  opacity={0.92}
                />
              </React.Fragment>
            );
          }),
        )}
      </svg>

      {TOPOLOGY_NODES.map((node, index) => {
        const startAt = sec(11.2) + index * sec(0.12);
        const progress = spring({
          frame: frame - startAt,
          fps,
          config: { damping: 200 },
          durationInFrames: 18,
        });

        return (
          <div
            key={node.id}
            style={{
              position: "absolute",
              left: node.x - 88,
              top: node.y - 24,
              width: 176,
              padding: "12px 14px",
              borderRadius: 14,
              background: `${THEME.surfaceElevated}EE`,
              border: `1px solid ${node.color}28`,
              textAlign: "center",
              opacity: interpolate(progress, [0, 1], [0, 1]),
              transform: `scale(${interpolate(progress, [0, 1], [0.92, 1])})`,
              boxShadow: `0 0 0 1px ${node.color}06, 0 18px 48px rgba(0,0,0,0.25)`,
            }}
          >
            <div
              style={{
                fontSize: 12,
                fontFamily: THEME.fontMono,
                color: node.color,
                marginBottom: 6,
                letterSpacing: "0.06em",
              }}
            >
              {node.label}
            </div>
            <div
              style={{
                height: 1,
                background: `linear-gradient(90deg, transparent, ${node.color}30, transparent)`,
              }}
            />
          </div>
        );
      })}

      {PATHS.map((path) => {
        const noteProgress = spring({
          frame: frame - path.startAt,
          fps,
          config: { damping: 200 },
          durationInFrames: 18,
        });

        return (
          <div
            key={path.id}
            style={{
              position: "absolute",
              left: 1220,
              top: path.noteY,
              display: "flex",
              alignItems: "center",
              gap: 12,
              opacity: interpolate(noteProgress, [0, 1], [0, 1]),
              transform: `translateX(${interpolate(noteProgress, [0, 1], [18, 0])}px)`,
            }}
          >
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: path.color,
                boxShadow: `0 0 18px ${path.color}`,
              }}
            />
            <div
              style={{
                fontSize: 14,
                fontFamily: THEME.fontMono,
                color: THEME.pearl,
                letterSpacing: "0.08em",
              }}
            >
              {path.label}
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

const ClosingSummary: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const fadeIn = safeInterpolate(frame, [sec(16.9), sec(17.6)], [0, 1]);
  const fadeOut = safeInterpolate(frame, [sec(19.4), sec(20)], [1, 0], Easing.in(Easing.quad));
  const titleProgress = spring({ frame: frame - sec(17.1), fps, config: { damping: 200 }, durationInFrames: 20 });

  return (
    <AbsoluteFill style={{ opacity: fadeIn * fadeOut, justifyContent: "center", alignItems: "center" }}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          opacity: interpolate(titleProgress, [0, 1], [0, 1]),
          transform: `translateY(${interpolate(titleProgress, [0, 1], [20, 0])}px)`,
        }}
      >
        <div
          style={{
            fontSize: 34,
            fontWeight: 600,
            background: THEME.goldGradient,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          贡献，不只是合并
        </div>
        <div
          style={{
            marginTop: 14,
            fontSize: 18,
            color: THEME.pearl,
            opacity: 0.84,
            letterSpacing: "0.08em",
          }}
        >
          而是对系统边界的理解
        </div>
        <div
          style={{
            marginTop: 22,
            height: 1,
            width: 180,
            background: THEME.goldDivider,
          }}
        />
        <div
          style={{
            marginTop: 18,
            fontSize: 12,
            color: THEME.muted,
            fontFamily: THEME.fontMono,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
          }}
        >
          CloudWeGo / Observability / Toolchain
        </div>
      </div>
    </AbsoluteFill>
  );
};
