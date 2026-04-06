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
 * 0-3s    终端打字机入场
 * 3-7s    指标数字滚动
 * 7-12s   环形进度条
 * 12-18s  微服务拓扑图
 * 18-20s  收尾淡出
 */

// 终端打字机文本
const TERMINAL_LINES = [
  { text: "$ git log --oneline | wc -l", color: THEME.lake.secondary },
  { text: "4000+", color: THEME.gold },
  { text: "$ gh pr list --state merged", color: THEME.lake.secondary },
  { text: "3 merged PRs to CloudWeGo", color: THEME.lake.primary },
];

// 指标数据
const OSS_METRICS = [
  { value: 3, suffix: "", label: "Merged PRs", color: THEME.lake.secondary },
  { value: 10, suffix: "+", label: "Microservices", color: THEME.gold },
  { value: 99.9, suffix: "%", label: "Availability", color: THEME.lake.primary },
  { value: 50, suffix: "%", label: "Latency Reduced", color: THEME.lake.accent },
];

// 环形进度条数据
const RINGS = [
  { label: "Go", progress: 0.85, color: THEME.gold },
  { label: "Python", progress: 0.6, color: THEME.lake.secondary },
  { label: "SQL", progress: 0.7, color: THEME.lake.primary },
];

// 微服务拓扑节点
const TOPO_NODES = [
  { id: "gateway", label: "API Gateway", x: 860, y: 160, color: THEME.gold },
  { id: "user", label: "User Service", x: 600, y: 340, color: THEME.lake.primary },
  { id: "data", label: "Data Service", x: 860, y: 340, color: THEME.lake.primary },
  { id: "auth", label: "Auth Service", x: 1120, y: 340, color: THEME.lake.primary },
  { id: "rpc1", label: "RPC Core", x: 700, y: 520, color: THEME.lake.polars },
  { id: "rpc2", label: "RPC Ingest", x: 1020, y: 520, color: THEME.lake.polars },
  { id: "etcd", label: "etcd", x: 860, y: 680, color: THEME.lake.trino },
];

const TOPO_EDGES = [
  ["gateway", "user"],
  ["gateway", "data"],
  ["gateway", "auth"],
  ["user", "rpc1"],
  ["data", "rpc1"],
  ["data", "rpc2"],
  ["auth", "rpc2"],
  ["rpc1", "etcd"],
  ["rpc2", "etcd"],
];

const NODE_MAP = Object.fromEntries(TOPO_NODES.map((n) => [n.id, n]));

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
      <BackgroundGlow />
      <VignetteOverlay />

      {/* 终端打字机 */}
      <TerminalTypewriter frame={frame} fps={fps} />

      {/* 指标数字 */}
      <MetricsSection frame={frame} fps={fps} />

      {/* 环形进度条 */}
      <RingCharts frame={frame} fps={fps} />

      {/* 微服务拓扑 */}
      <TopologyGraph frame={frame} fps={fps} />

      {/* 标题 */}
      <SceneHeader frame={frame} fps={fps} />
    </AbsoluteFill>
  );
};

/* ──── 背景 + 暗角 ──── */
const BackgroundGlow: React.FC = () => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    <div
      style={{
        position: "absolute",
        top: "30%",
        right: "15%",
        width: 400,
        height: 400,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(212,175,55,0.04) 0%, transparent 70%)",
        filter: "blur(100px)",
      }}
    />
  </AbsoluteFill>
);

const VignetteOverlay: React.FC = () => (
  <AbsoluteFill
    style={{
      pointerEvents: "none",
      background: "radial-gradient(ellipse at center, transparent 50%, rgba(12,12,14,0.6) 100%)",
    }}
  />
);

/* ──── 终端打字机 ──── */
const TerminalTypewriter: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const fadeIn = safeInterpolate(frame, [0, sec(0.3)], [0, 1]);
  const fadeOut = safeInterpolate(frame, [sec(2.5), sec(3.5)], [1, 0]);

  return (
    <div
      style={{
        position: "absolute",
        top: 220,
        left: 140,
        opacity: fadeIn * fadeOut,
      }}
    >
      {/* 终端窗口 */}
      <div
        style={{
          width: 600,
          padding: "16px 20px",
          borderRadius: 12,
          background: `${THEME.surfaceElevated}EE`,
          border: `1px solid ${THEME.gold}15`,
        }}
      >
        {/* 终端标题栏 */}
        <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
          {[THEME.lake.accent, THEME.gold, THEME.lake.secondary].map((c, i) => (
            <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: c }} />
          ))}
        </div>

        {/* 终端行 */}
        {TERMINAL_LINES.map((line, i) => {
          // 每行延迟入场
          const lineStart = sec(0.3) + i * sec(0.5);
          const lineProgress = safeInterpolate(frame, [lineStart, lineStart + sec(0.4)], [0, 1]);
          const visibleChars = Math.floor(lineProgress * line.text.length);

          return (
            <div
              key={i}
              style={{
                fontSize: 13,
                fontFamily: THEME.fontMono,
                color: line.color,
                lineHeight: 1.8,
                opacity: lineProgress > 0 ? 1 : 0,
              }}
            >
              {line.text.slice(0, visibleChars)}
              {/* 光标闪烁 */}
              {lineProgress > 0 && lineProgress < 1 && (
                <span style={{ opacity: frame % 20 < 10 ? 1 : 0 }}>▊</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ──── 指标数字滚动 ──── */
const MetricsSection: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const sectionFadeIn = safeInterpolate(frame, [sec(2.5), sec(3.5)], [0, 1]);
  const sectionFadeOut = safeInterpolate(frame, [sec(6.5), sec(7.5)], [1, 0]);

  return (
    <div
      style={{
        position: "absolute",
        top: 220,
        right: 140,
        display: "flex",
        gap: 40,
        opacity: sectionFadeIn * sectionFadeOut,
      }}
    >
      {OSS_METRICS.map((m, i) => {
        const cardP = spring({ frame, fps, config: { damping: 200 }, delay: sec(3) + i * 4, durationInFrames: 20 });

        // 数字滚动
        const numProgress = safeInterpolate(frame, [sec(3.2) + i * 4, sec(4.5) + i * 4], [0, 1]);
        const displayValue = m.suffix === "%"
          ? (m.value * numProgress).toFixed(1)
          : Math.round(m.value * numProgress).toString();

        return (
          <div
            key={m.label}
            style={{
              opacity: cardP,
              transform: `translateY(${interpolate(cardP, [0, 1], [15, 0])}px)`,
              textAlign: "center",
              padding: "16px 20px",
              borderRadius: 12,
              background: `${THEME.surfaceElevated}BB`,
              border: `1px solid ${m.color}20`,
              minWidth: 140,
            }}
          >
            <div style={{ fontSize: 32, fontWeight: 700, fontFamily: THEME.fontMono, color: m.color }}>
              {displayValue}{m.suffix}
            </div>
            <div style={{ fontSize: 10, color: THEME.muted, marginTop: 4, letterSpacing: "0.1em" }}>
              {m.label}
            </div>
          </div>
        );
      })}
    </div>
  );
};

/* ──── 环形进度条 ──── */
const RingCharts: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const fadeIn = safeInterpolate(frame, [sec(7), sec(8)], [0, 1]);
  const fadeOut = safeInterpolate(frame, [sec(11.5), sec(12.5)], [1, 0]);

  return (
    <div
      style={{
        position: "absolute",
        top: 360,
        left: 120,
        display: "flex",
        gap: 40,
        opacity: fadeIn * fadeOut,
      }}
    >
      {RINGS.map((ring, i) => {
        const ringP = spring({ frame, fps, config: { damping: 200 }, delay: sec(7.3) + i * 5, durationInFrames: 20 });
        const radius = 50;
        const strokeWidth = 8;
        const circumference = 2 * Math.PI * radius;
        const progress = safeInterpolate(frame, [sec(7.5) + i * 5, sec(10)], [0, ring.progress]);
        const segmentLength = progress * circumference;
        const offset = circumference - segmentLength;
        const center = radius + strokeWidth;

        return (
          <div
            key={ring.label}
            style={{
              opacity: ringP,
              transform: `scale(${interpolate(ringP, [0, 1], [0.7, 1])})`,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 8,
            }}
          >
            <svg width={center * 2} height={center * 2}>
              {/* 背景圆 */}
              <circle cx={center} cy={center} r={radius} fill="none" stroke={`${ring.color}15`} strokeWidth={strokeWidth} />
              {/* 进度圆 */}
              <circle
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke={ring.color}
                strokeWidth={strokeWidth}
                strokeDasharray={`${segmentLength} ${circumference}`}
                strokeDashoffset={0}
                transform={`rotate(-90 ${center} ${center})`}
                strokeLinecap="round"
                opacity={0.8}
              />
              {/* 百分比 */}
              <text
                x={center}
                y={center}
                textAnchor="middle"
                dominantBaseline="central"
                fill={ring.color}
                fontSize={18}
                fontFamily={THEME.fontMono}
                fontWeight={600}
              >
                {Math.round(progress * 100)}%
              </text>
            </svg>
            <span style={{ fontSize: 12, color: THEME.muted, fontFamily: THEME.fontMono }}>{ring.label}</span>
          </div>
        );
      })}
    </div>
  );
};

/* ──── 微服务拓扑图 ──── */
const TopologyGraph: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const fadeIn = safeInterpolate(frame, [sec(12), sec(13)], [0, 1]);
  const fadeOut = safeInterpolate(frame, [sec(19), sec(20)], [1, 0]);

  return (
    <AbsoluteFill style={{ opacity: fadeIn * fadeOut }}>
      {/* 边 */}
      <svg width="1920" height="1080" style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none" }}>
        {TOPO_EDGES.map(([from, to], i) => {
          const edgeP = safeInterpolate(frame, [sec(12.5) + i * 2, sec(13.5) + i * 2], [0, 1]);
          const fromNode = NODE_MAP[from];
          const toNode = NODE_MAP[to];
          const len = Math.hypot(toNode.x - fromNode.x, toNode.y - fromNode.y);
          const offset = interpolate(edgeP, [0, 1], [len, 0]);

          return (
            <line
              key={`${from}-${to}`}
              x1={fromNode.x}
              y1={fromNode.y}
              x2={toNode.x}
              y2={toNode.y}
              stroke={`${THEME.gold}30`}
              strokeWidth={1}
              strokeDasharray={len}
              strokeDashoffset={offset}
            />
          );
        })}
      </svg>

      {/* 节点 */}
      {TOPO_NODES.map((node, i) => {
        const nodeP = spring({
          frame,
          fps,
          config: { damping: 200 },
          delay: sec(13) + i * 4,
          durationInFrames: 20,
        });

        return (
          <div
            key={node.id}
            style={{
              position: "absolute",
              left: node.x - 70,
              top: node.y - 22,
              width: 140,
              padding: "10px 12px",
              borderRadius: 10,
              background: `${THEME.surfaceElevated}DD`,
              border: `1px solid ${node.color}30`,
              textAlign: "center",
              opacity: nodeP,
              transform: `scale(${interpolate(nodeP, [0, 1], [0.6, 1])})`,
            }}
          >
            <div style={{ fontSize: 12, fontFamily: THEME.fontMono, color: node.color, fontWeight: 500 }}>
              {node.label}
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

/* ──── 场景标题 ──── */
const SceneHeader: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const p = spring({ frame, fps, config: { damping: 200 }, durationInFrames: 20 });

  return (
    <div style={{ position: "absolute", top: 80, left: 80, opacity: p }}>
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
        开源项目看板
      </h2>
      <span style={{ fontSize: 13, color: THEME.muted, fontFamily: THEME.fontMono, letterSpacing: "0.1em" }}>
        Open Source Dashboard
      </span>
    </div>
  );
};
