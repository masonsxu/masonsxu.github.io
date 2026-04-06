import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Easing,
} from "remotion";
import { THEME, VIDEO } from "../shared/theme";
import { safeInterpolate, sec } from "../shared/utils";

/**
 * 架构层级定义
 */
const ARCH_LAYERS = [
  {
    id: "source",
    label: "数据源层",
    items: ["MySQL", "MongoDB", "REST API"],
    color: THEME.lake.primary,
    y: 240,
  },
  {
    id: "orchestrate",
    label: "编排层",
    items: ["Airflow 3.1 DAG", "Config Parser", "Scheduler"],
    color: THEME.lake.airflow,
    y: 370,
  },
  {
    id: "storage",
    label: "存储层",
    items: ["Iceberg", "Parquet", "Schema Evolution"],
    color: THEME.lake.iceberg,
    y: 500,
  },
  {
    id: "query",
    label: "查询与计算层",
    items: ["Trino SQL", "Polars", "BFS JOIN"],
    color: THEME.lake.polars,
    y: 630,
  },
  {
    id: "output",
    label: "输出层",
    items: ["API 回传", "字典抽取", "数据验证"],
    color: THEME.lake.accent,
    y: 760,
  },
];

const METRICS = [
  { value: "4", label: "ETL 阶段", icon: "M4 4h4v4H4V4zm6 0h4v4h-4V4zm6 0h4v4h-4V4zM4 10h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4zM4 16h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4z" },
  { value: "3", label: "数据源", icon: "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" },
  { value: "5", label: "链式 JOIN", icon: "M4 12h4m4 0h4m4 0h4" },
  { value: "BFS", label: "路径搜索", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" },
];

/**
 * 场景 5: 架构全景 + 核心指标 (19-25s)
 * 从上到下展示完整数据湖架构，最后定格指标
 */
export const LakeArchitecture: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const sceneFadeIn = safeInterpolate(frame, [0, sec(0.5)], [0, 1]);
  const sceneFadeOut = safeInterpolate(frame, [sec(5.3), sec(6)], [1, 0]);
  const sceneOpacity = sceneFadeIn * sceneFadeOut;

  return (
    <AbsoluteFill style={{ opacity: sceneOpacity }}>
      {/* 场景标题 */}
      <SceneHeader
        title="数据湖架构全景"
        subtitle="Data Lake Architecture Overview"
        frame={frame}
        fps={fps}
        delay={sec(0.1)}
      />

      {/* 架构层级 */}
      {ARCH_LAYERS.map((layer, i) => (
        <ArchLayer key={layer.id} layer={layer} index={i} />
      ))}

      {/* 层间连接线 */}
      <LayerConnections frame={frame} fps={fps} />

      {/* 右侧核心指标 */}
      <MetricsPanel frame={frame} fps={fps} />

      {/* 收尾品牌 */}
      <BrandFooter frame={frame} fps={fps} />
    </AbsoluteFill>
  );
};

/**
 * 架构层级
 */
const ArchLayer: React.FC<{
  layer: typeof ARCH_LAYERS[number];
  index: number;
}> = ({ layer, index }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const p = spring({
    frame,
    fps,
    config: { damping: 200 },
    delay: sec(0.4) + index * 8,
    durationInFrames: 25,
  });

  const opacity = interpolate(p, [0, 1], [0, 1]);
  const translateX = interpolate(p, [0, 1], [-40, 0]);

  return (
    <div
      style={{
        position: "absolute",
        left: 120,
        top: layer.y,
        opacity,
        transform: `translateX(${translateX}px)`,
        display: "flex",
        alignItems: "center",
        gap: 20,
      }}
    >
      {/* 层标签 */}
      <div
        style={{
          width: 140,
          textAlign: "right",
          fontSize: 14,
          fontWeight: 600,
          color: layer.color,
          fontFamily: THEME.fontSans,
        }}
      >
        {layer.label}
      </div>

      {/* 层内容条 */}
      <div
        style={{
          display: "flex",
          gap: 10,
          padding: "12px 20px",
          borderRadius: 10,
          background: `${THEME.surfaceElevated}CC`,
          border: `1px solid ${layer.color}20`,
          minWidth: 420,
        }}
      >
        {layer.items.map((item, i) => {
          const itemP = spring({
            frame,
            fps,
            config: { damping: 200 },
            delay: sec(0.6) + index * 8 + i * 3,
            durationInFrames: 20,
          });

          return (
            <div
              key={item}
              style={{
                opacity: itemP,
                transform: `scale(${interpolate(itemP, [0, 1], [0.8, 1])})`,
                padding: "6px 14px",
                borderRadius: 8,
                background: `${layer.color}12`,
                border: `1px solid ${layer.color}20`,
                fontSize: 12,
                fontFamily: THEME.fontMono,
                color: layer.color,
              }}
            >
              {item}
            </div>
          );
        })}
      </div>
    </div>
  );
};

/**
 * 层间连接线 - 垂直虚线
 */
const LayerConnections: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const progress = safeInterpolate(frame, [sec(0.8), sec(2.5)], [0, 1], Easing.out(Easing.quad));

  if (progress <= 0) return null;

  // 每层之间的垂直连线
  const connections = ARCH_LAYERS.slice(0, -1).map((layer, i) => {
    const nextLayer = ARCH_LAYERS[i + 1];
    const x = 400; // 层标签右侧
    const y1 = layer.y + 25;
    const y2 = nextLayer.y + 10;

    return { x, y1, y2 };
  });

  return (
    <svg
      width={VIDEO.width}
      height={VIDEO.height}
      style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none" }}
    >
      {connections.map((conn, i) => {
        const length = conn.y2 - conn.y1;
        const offset = interpolate(progress, [0, 1], [length, 0]);

        return (
          <line
            key={i}
            x1={conn.x}
            y1={conn.y1}
            x2={conn.x}
            y2={conn.y2}
            stroke={`${THEME.gold}30`}
            strokeWidth={1}
            strokeDasharray="4 4"
          />
        );
      })}
    </svg>
  );
};

/**
 * 右侧核心指标面板
 */
const MetricsPanel: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const panelP = spring({
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
        right: 100,
        top: 260,
        opacity: panelP,
        transform: `translateX(${interpolate(panelP, [0, 1], [40, 0])}px)`,
        display: "flex",
        flexDirection: "column",
        gap: 20,
        width: 280,
      }}
    >
      {/* 面板标题 */}
      <div
        style={{
          fontSize: 14,
          fontWeight: 600,
          color: THEME.gold,
          paddingBottom: 10,
          borderBottom: `1px solid ${THEME.gold}20`,
          fontFamily: THEME.fontMono,
        }}
      >
        Core Metrics
      </div>

      {/* 指标项 */}
      {METRICS.map((metric, i) => {
        const mP = spring({
          frame,
          fps,
          config: { damping: 200 },
          delay: sec(2.8) + i * 5,
          durationInFrames: 20,
        });

        return (
          <div
            key={metric.label}
            style={{
              opacity: mP,
              transform: `translateY(${interpolate(mP, [0, 1], [15, 0])}px)`,
              display: "flex",
              alignItems: "center",
              gap: 14,
              padding: "12px 16px",
              borderRadius: 10,
              background: `${THEME.surface}BB`,
              border: `1px solid ${THEME.gold}10`,
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={THEME.gold} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
              <path d={metric.icon} />
            </svg>
            <div>
              <div style={{ fontSize: 22, fontWeight: 700, fontFamily: THEME.fontMono, color: THEME.gold }}>
                {metric.value}
              </div>
              <div style={{ fontSize: 11, color: THEME.muted }}>{metric.label}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

/**
 * 收尾品牌
 */
const BrandFooter: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const p = spring({
    frame,
    fps,
    config: { damping: 200 },
    delay: sec(4.0),
    durationInFrames: 30,
  });

  return (
    <div
      style={{
        position: "absolute",
        bottom: 60,
        left: "50%",
        transform: `translateX(-50%) translateY(${interpolate(p, [0, 1], [20, 0])}px)`,
        opacity: p,
        display: "flex",
        alignItems: "center",
        gap: 16,
      }}
    >
      <div style={{ height: 1, width: 60, background: THEME.goldDivider }} />
      <span style={{ fontSize: 13, color: THEME.muted, letterSpacing: "0.15em", fontFamily: THEME.fontMono }}>
        MASONS.XU — Data Lake Platform
      </span>
      <div style={{ height: 1, width: 60, background: THEME.goldDivider }} />
    </div>
  );
};

/**
 * 场景头部标题
 */
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
