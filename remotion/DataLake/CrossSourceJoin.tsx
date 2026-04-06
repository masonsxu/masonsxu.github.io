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

/* ──────────────────────────────────────────
 * 统一坐标系 — 所有节点和连线的锚点
 * 布局: 水平分 4 列
 *   Col1 (x=160):  数据源节点
 *   Col2 (x=680):  Polars Hub
 *   Col3 (x=1060): Result 节点
 *   Col4 (x=1380): Normalize 节点
 * 所有 x/y 指节点左上角，anchorX/anchorY 指连线的目标中心点
 * ────────────────────────────────────────── */

const NODE_W = 160;
const NODE_PAD_X = 16;
const NODE_PAD_Y = 18;
const NODE_TOTAL_W = NODE_W + NODE_PAD_X * 2; // 192
const NODE_H = 90; // 实际渲染约 90px

const DATA_NODES = [
  {
    label: "MySQL\n小表 A",
    color: THEME.lake.mysql,
    x: 280,
    y: 200,
    tech: "SSDictCursor",
  },
  {
    label: "MySQL\n小表 B",
    color: THEME.lake.mysql,
    x: 280,
    y: 370,
    tech: "SSDictCursor",
  },
  {
    label: "MongoDB\nRaw Doc",
    color: THEME.lake.mongodb,
    x: 280,
    y: 540,
    tech: "Raw Document",
  },
];

// Polars Hub 圆心锚点
const POLARS = {
  cx: 700,  // 圆心 X
  cy: 370,  // 圆心 Y
  radius: 50,
};

const RESULT = {
  label: "5 表 LEFT JOIN\n结果集",
  color: THEME.gold,
  x: 920,
  y: 310,
  w: 180,
  padX: 16,
  padY: 20,
};

const NORMALIZE = {
  label: "FieldCommon0\n归一聚合",
  color: THEME.lake.secondary,
  x: 1260,
  y: 310,
  w: 180,
  padX: 16,
  padY: 20,
};

// 计算锚点辅助
const nodeCenterY = (y: number) => y + NODE_H / 2;
const nodeRightX = (x: number) => x + NODE_TOTAL_W;
const nodeBoxCenterY = (y: number, padY: number) => y + 55; // 估算居中
const nodeBoxLeftX = (x: number) => x;
const nodeBoxRightX = (x: number, w: number, padX: number) => x + w + padX * 2;

/**
 * 场景 4: 跨源 JOIN 与字典抽取 (14-19s)
 */
export const CrossSourceJoin: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const sceneFadeIn = safeInterpolate(frame, [0, sec(0.5)], [0, 1]);
  const sceneFadeOut = safeInterpolate(frame, [sec(5.3), sec(6)], [1, 0]);
  const sceneOpacity = sceneFadeIn * sceneFadeOut;

  return (
    <AbsoluteFill style={{ opacity: sceneOpacity }}>
      <TechBadges frame={frame} fps={fps} />

      <SceneHeader
        title="跨源 JOIN 与字典抽取"
        subtitle="Trino + Polars Cross-Source Join"
        frame={frame}
        fps={fps}
        delay={sec(0.2)}
      />

      {/* 数据源节点 */}
      {DATA_NODES.map((node, i) => (
        <DataNode key={i} node={node} index={i} />
      ))}

      {/* Polars Hub */}
      <PolarsHub frame={frame} fps={fps} />

      {/* 结果节点 */}
      <ResultBox frame={frame} fps={fps} />

      {/* 归一节点 */}
      <NormalizeBox frame={frame} fps={fps} />

      {/* 全部连线 - 用 SVG 覆盖在节点上方 */}
      <ConnectionLines frame={frame} fps={fps} />
    </AbsoluteFill>
  );
};

/* ──── 数据源节点 ──── */
const DataNode: React.FC<{
  node: typeof DATA_NODES[number];
  index: number;
}> = ({ node, index }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const p = spring({
    frame,
    fps,
    config: { damping: 200 },
    delay: sec(0.5) + index * 5,
    durationInFrames: 25,
  });

  return (
    <div
      style={{
        position: "absolute",
        left: node.x,
        top: node.y,
        width: NODE_W,
        padding: `${NODE_PAD_Y}px ${NODE_PAD_X}px`,
        borderRadius: 12,
        background: `${THEME.surfaceElevated}DD`,
        border: `1px solid ${node.color}30`,
        textAlign: "center",
        opacity: p,
        transform: `translateY(${interpolate(p, [0, 1], [20, 0])}px) scale(${interpolate(p, [0, 1], [0.9, 1])})`,
      }}
    >
      <div
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: node.color,
          margin: "0 auto 10px",
          boxShadow: `0 0 6px ${node.color}60`,
        }}
      />
      <p
        style={{
          fontSize: 13,
          color: node.color,
          fontWeight: 500,
          margin: 0,
          whiteSpace: "pre-line",
          lineHeight: 1.5,
        }}
      >
        {node.label}
      </p>
      <span style={{ fontSize: 10, color: THEME.muted, fontFamily: THEME.fontMono, marginTop: 6, display: "block" }}>
        {node.tech}
      </span>
    </div>
  );
};

/* ──── Polars Hub ──── */
const PolarsHub: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const p = spring({
    frame,
    fps,
    config: { damping: 200 },
    delay: sec(1.5),
    durationInFrames: 25,
  });

  const rotation = safeInterpolate(frame, [sec(1.5), sec(5)], [0, 360]);

  return (
    <div
      style={{
        position: "absolute",
        left: POLARS.cx - POLARS.radius,
        top: POLARS.cy - POLARS.radius,
        width: POLARS.radius * 2,
        height: POLARS.radius * 2,
        opacity: p,
        transform: `scale(${interpolate(p, [0, 1], [0.5, 1])})`,
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          borderRadius: "50%",
          background: `linear-gradient(135deg, ${THEME.lake.polars}25, ${THEME.lake.polars}10)`,
          border: `2px solid ${THEME.lake.polars}50`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        <svg
          width={POLARS.radius * 2 + 16}
          height={POLARS.radius * 2 + 16}
          viewBox={`0 0 ${POLARS.radius * 2 + 16} ${POLARS.radius * 2 + 16}`}
          style={{ position: "absolute", transform: `rotate(${rotation}deg)` }}
        >
          <circle
            cx={POLARS.radius + 8}
            cy={POLARS.radius + 8}
            r={POLARS.radius + 5}
            fill="none"
            stroke={`${THEME.lake.polars}30`}
            strokeWidth={1}
            strokeDasharray="8 4"
          />
        </svg>
        <span style={{ fontSize: 12, fontFamily: THEME.fontMono, color: THEME.lake.polars, fontWeight: 600 }}>
          Polars
        </span>
      </div>
      <div style={{ textAlign: "center", marginTop: 10 }}>
        <span style={{ fontSize: 11, color: THEME.muted }}>内存 JOIN</span>
      </div>
    </div>
  );
};

/* ──── Result 节点 ──── */
const ResultBox: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const p = spring({
    frame,
    fps,
    config: { damping: 200 },
    delay: sec(2.5),
    durationInFrames: 25,
  });

  return (
    <div
      style={{
        position: "absolute",
        left: RESULT.x,
        top: RESULT.y,
        width: RESULT.w,
        padding: `${RESULT.padY}px ${RESULT.padX}px`,
        borderRadius: 14,
        background: `${THEME.surfaceElevated}DD`,
        border: `1.5px solid ${RESULT.color}40`,
        textAlign: "center",
        boxShadow: `0 0 20px ${RESULT.color}15`,
        opacity: p,
        transform: `translateY(${interpolate(p, [0, 1], [20, 0])}px) scale(${interpolate(p, [0, 1], [0.85, 1])})`,
      }}
    >
      <p style={{ fontSize: 14, color: RESULT.color, fontWeight: 600, margin: 0, lineHeight: 1.5, whiteSpace: "pre-line" }}>
        {RESULT.label}
      </p>
    </div>
  );
};

/* ──── Normalize 节点 ──── */
const NormalizeBox: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const p = spring({
    frame,
    fps,
    config: { damping: 200 },
    delay: sec(3.2),
    durationInFrames: 25,
  });

  return (
    <div
      style={{
        position: "absolute",
        left: NORMALIZE.x,
        top: NORMALIZE.y,
        width: NORMALIZE.w,
        padding: `${NORMALIZE.padY}px ${NORMALIZE.padX}px`,
        borderRadius: 14,
        background: `${THEME.surfaceElevated}DD`,
        border: `1.5px solid ${NORMALIZE.color}40`,
        textAlign: "center",
        opacity: p,
        transform: `translateX(${interpolate(p, [0, 1], [30, 0])}px) scale(${interpolate(p, [0, 1], [0.85, 1])})`,
      }}
    >
      <p style={{ fontSize: 13, color: NORMALIZE.color, fontWeight: 600, margin: 0, lineHeight: 1.5, whiteSpace: "pre-line" }}>
        {NORMALIZE.label}
      </p>
      <span style={{ fontSize: 10, color: THEME.muted, marginTop: 8, display: "block" }}>
        患者维度数据归一
      </span>
    </div>
  );
};

/* ──── 连线 - 使用统一锚点坐标 ──── */
const ConnectionLines: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  // 3 个阶段的绘制进度
  const p1 = safeInterpolate(frame, [sec(0.8), sec(2.0)], [0, 1], Easing.out(Easing.quad));
  const p2 = safeInterpolate(frame, [sec(2.5), sec(3.2)], [0, 1], Easing.out(Easing.quad));
  const p3 = safeInterpolate(frame, [sec(3.2), sec(3.8)], [0, 1], Easing.out(Easing.quad));

  if (p1 <= 0) return null;

  // 阶段 1: 数据源 → Polars Hub 圆心
  const sourceLines = DATA_NODES.map((n) => ({
    x1: nodeRightX(n.x),
    y1: nodeCenterY(n.y),
    x2: POLARS.cx - POLARS.radius, // 连到圆的左边缘
    y2: POLARS.cy,
    len: 0, // 将计算
  })).map((l) => {
    l.len = Math.hypot(l.x2 - l.x1, l.y2 - l.y1);
    return l;
  });

  // 阶段 2: Polars 右边缘 → Result 左边缘
  const hubToResult = {
    x1: POLARS.cx + POLARS.radius,
    y1: POLARS.cy,
    x2: RESULT.x,
    y2: RESULT.y + 55,
    get len() { return Math.hypot(this.x2 - this.x1, this.y2 - this.y1); },
  };

  // 阶段 3: Result 右边缘 → Normalize 左边缘
  const resultToNorm = {
    x1: nodeBoxRightX(RESULT.x, RESULT.w, RESULT.padX),
    y1: RESULT.y + 55,
    x2: NORMALIZE.x,
    y2: NORMALIZE.y + 55,
    get len() { return Math.hypot(this.x2 - this.x1, this.y2 - this.y1); },
  };

  return (
    <svg
      width="1920"
      height="1080"
      style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none" }}
    >
      {/* 阶段 1 */}
      {sourceLines.map((l, i) => {
        const offset = interpolate(p1, [0, 1], [l.len, 0]);
        return (
          <line
            key={`s${i}`}
            x1={l.x1}
            y1={l.y1}
            x2={l.x2}
            y2={l.y2}
            stroke={THEME.gold}
            strokeWidth={1.5}
            strokeDasharray={l.len}
            strokeDashoffset={offset}
            opacity={0.4}
          />
        );
      })}

      {/* 阶段 2 */}
      {p2 > 0 && (
        <line
          x1={hubToResult.x1}
          y1={hubToResult.y1}
          x2={hubToResult.x2}
          y2={hubToResult.y2}
          stroke={THEME.gold}
          strokeWidth={1.5}
          strokeDasharray={hubToResult.len}
          strokeDashoffset={interpolate(p2, [0, 1], [hubToResult.len, 0])}
          opacity={0.4}
        />
      )}

      {/* 阶段 3 */}
      {p3 > 0 && (
        <line
          x1={resultToNorm.x1}
          y1={resultToNorm.y1}
          x2={resultToNorm.x2}
          y2={resultToNorm.y2}
          stroke={THEME.lake.secondary}
          strokeWidth={1.5}
          strokeDasharray={resultToNorm.len}
          strokeDashoffset={interpolate(p3, [0, 1], [resultToNorm.len, 0])}
          opacity={0.35}
        />
      )}
    </svg>
  );
};

/* ──── 技术徽章 ──── */
const TechBadges: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const badges = [
    { label: "Trino", color: THEME.lake.trino, delay: sec(0.1) },
    { label: "Polars", color: THEME.lake.polars, delay: sec(0.2) },
  ];

  return (
    <div style={{ position: "absolute", top: 80, right: 80, display: "flex", gap: 10 }}>
      {badges.map((b) => {
        const p = spring({ frame, fps, config: { damping: 200 }, delay: b.delay, durationInFrames: 20 });
        return (
          <div
            key={b.label}
            style={{
              opacity: p,
              transform: `scale(${interpolate(p, [0, 1], [0.8, 1])})`,
              padding: "6px 14px",
              borderRadius: 16,
              background: `${b.color}15`,
              border: `1px solid ${b.color}30`,
              fontSize: 12,
              fontFamily: THEME.fontMono,
              color: b.color,
            }}
          >
            {b.label}
          </div>
        );
      })}
    </div>
  );
};

/* ──── 场景头部 ──── */
const SceneHeader: React.FC<{
  title: string;
  subtitle: string;
  frame: number;
  fps: number;
  delay?: number;
}> = ({ title, subtitle, frame, fps, delay = 0 }) => {
  const progress = spring({
    frame,
    fps,
    config: { damping: 200 },
    delay,
    durationInFrames: 20,
  });

  return (
    <div
      style={{
        position: "absolute",
        top: 80,
        left: 80,
        opacity: progress,
        transform: `translateY(${interpolate(progress, [0, 1], [-15, 0])}px)`,
      }}
    >
      <h2
        style={{
          fontSize: 36,
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
          fontSize: 14,
          color: THEME.muted,
          fontFamily: THEME.fontMono,
          letterSpacing: "0.1em",
        }}
      >
        {subtitle}
      </span>
    </div>
  );
};
