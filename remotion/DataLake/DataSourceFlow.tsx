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
 * 数据源图标定义
 */
const DATA_SOURCES = [
  {
    id: "mysql",
    label: "MySQL",
    color: THEME.lake.mysql,
    icon: "M4 6h16v12H4V6zm1 1v10h14V7H5zm2 2h2v1H7v-1zm0 3h2v1H7v-1zm4-3h6v1h-6v-1zm0 3h6v1h-6v-1z",
  },
  {
    id: "mongodb",
    label: "MongoDB",
    color: THEME.lake.mongodb,
    icon: "M12 2C8 2 8 6 8 8c0 2 1 3 2 4s1 2 1 4h2c0-2 0-3 1-4s2-2 2-4c0-2 0-6-4-6zm0 2c1 0 2 .5 2 2s-1 2.5-2 3c-1-.5-2-1.5-2-3s1-2 2-2zm-1 16h2v1h-2v-1zm0-2h2v1h-2v-1z",
  },
  {
    id: "api",
    label: "REST API",
    color: THEME.lake.api,
    icon: "M3 7l6-4 6 4v10l-6 4-6-4V7zm12 0l6-4 6 4v10l-6 4-6-4V7z",
  },
];

const ICEBERG = {
  id: "iceberg",
  label: "Apache Iceberg",
  color: THEME.lake.iceberg,
  subtitle: "Parquet Files",
};

/**
 * 场景 2: 数据源流动画 (3-8s)
 * 三个数据源 → 数据流粒子 → Iceberg 湖
 */
export const DataSourceFlow: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 场景整体淡入淡出
  const sceneFadeIn = safeInterpolate(frame, [0, sec(0.5)], [0, 1]);
  const sceneFadeOut = safeInterpolate(frame, [sec(4.8), sec(5.5)], [1, 0]);
  const sceneOpacity = sceneFadeIn * sceneFadeOut;

  return (
    <AbsoluteFill style={{ opacity: sceneOpacity }}>
      {/* 场景标题 */}
      <SceneHeader title="多源异构数据统一入湖" subtitle="Unified Data Ingestion" frame={frame} fps={fps} />

      {/* 三列数据源 */}
      <div
        style={{
          position: "absolute",
          top: 220,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          gap: 240,
        }}
      >
        {DATA_SOURCES.map((src, i) => (
          <DataSourceCard key={src.id} source={src} index={i} />
        ))}
      </div>

      {/* 数据流粒子 */}
      <DataFlowParticles />

      {/* Iceberg 湖 */}
      <IcebergLake />
    </AbsoluteFill>
  );
};

/**
 * 数据源卡片
 */
const DataSourceCard: React.FC<{
  source: typeof DATA_SOURCES[number];
  index: number;
}> = ({ source, index }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame,
    fps,
    config: { damping: 200 },
    delay: sec(0.3) + index * 6,
    durationInFrames: 25,
  });

  const opacity = interpolate(progress, [0, 1], [0, 1]);
  const scale = interpolate(progress, [0, 1], [0.85, 1]);
  const translateY = interpolate(progress, [0, 1], [20, 0]);

  return (
    <div
      style={{
        opacity,
        transform: `translateY(${translateY}px) scale(${scale})`,
        width: 200,
        padding: "24px 20px",
        borderRadius: 16,
        background: `${THEME.surfaceElevated}CC`,
        border: `1px solid ${source.color}25`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 12,
      }}
    >
      {/* SVG 图标 */}
      <svg width="40" height="40" viewBox="0 0 24 24" fill={source.color} opacity={0.8}>
        <path d={source.icon} />
      </svg>
      <span style={{ fontSize: 16, fontWeight: 600, color: source.color }}>{source.label}</span>
      <span style={{ fontSize: 11, color: THEME.muted, fontFamily: THEME.fontMono }}>
        {source.id === "mysql" ? "SSDictCursor" : source.id === "mongodb" ? "Raw Document" : "JSON Config"}
      </span>
    </div>
  );
};

/**
 * 数据流粒子 - 从数据源流向 Iceberg
 */
const DataFlowParticles: React.FC = () => {
  const frame = useCurrentFrame();

  // 3 组粒子，每组从不同起点流向中心底部
  const particleGroups = DATA_SOURCES.map((src, i) => {
    const baseX = 660 + i * 240;
    const startY = 340;
    const endX = 960;
    const endY = 650;

    // 创建 5 个粒子，交错时间
    return Array.from({ length: 5 }, (_, pi) => {
      const delay = sec(1.0) + i * 6 + pi * 4;
      const duration = sec(1.2);
      const progress = safeInterpolate(frame, [delay, delay + duration], [0, 1], Easing.inOut(Easing.quad));

      if (progress <= 0) return null;

      const x = interpolate(progress, [0, 1], [baseX, endX]);
      const y = interpolate(progress, [0, 1], [startY, endY]);

      // 粒子大小从大到小
      const size = interpolate(progress, [0, 1], [6, 3]);
      const particleOpacity = interpolate(progress, [0, 0.3, 0.8, 1], [0, 0.8, 0.6, 0]);

      return (
        <div
          key={`${src.id}-p-${pi}`}
          style={{
            position: "absolute",
            left: x - size / 2,
            top: y - size / 2,
            width: size,
            height: size,
            borderRadius: "50%",
            background: src.color,
            opacity: particleOpacity,
            boxShadow: `0 0 8px ${src.color}60`,
          }}
        />
      );
    });
  });

  return <AbsoluteFill style={{ pointerEvents: "none" }}>{particleGroups}</AbsoluteFill>;
};

/**
 * Iceberg 湖 - 底部汇聚点
 */
const IcebergLake: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame,
    fps,
    config: { damping: 200 },
    delay: sec(1.8),
    durationInFrames: 30,
  });

  const opacity = interpolate(progress, [0, 1], [0, 1]);
  const scale = interpolate(progress, [0, 1], [0.9, 1]);

  // 数据量计数动画
  const dataCount = safeInterpolate(frame, [sec(2.0), sec(3.5)], [0, 3]);

  return (
    <div
      style={{
        position: "absolute",
        bottom: 180,
        left: "50%",
        transform: `translateX(-50%) scale(${scale})`,
        opacity,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 12,
      }}
    >
      {/* Iceberg 主节点 */}
      <div
        style={{
          width: 280,
          padding: "20px 24px",
          borderRadius: 20,
          background: `linear-gradient(135deg, ${THEME.lake.iceberg}15, ${THEME.lake.iceberg}05)`,
          border: `1.5px solid ${THEME.lake.iceberg}40`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 8,
        }}
      >
        {/* 菱形图标 */}
        <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
          <path
            d="M18 4L32 18L18 32L4 18L18 4Z"
            fill={THEME.lake.iceberg}
            opacity={0.2}
            stroke={THEME.lake.iceberg}
            strokeWidth={1.5}
          />
          <path
            d="M18 10L26 18L18 26L10 18L18 10Z"
            fill={THEME.lake.iceberg}
            opacity={0.4}
          />
        </svg>
        <span style={{ fontSize: 18, fontWeight: 600, color: THEME.lake.iceberg }}>
          {ICEBERG.label}
        </span>
        <span style={{ fontSize: 12, color: THEME.muted, fontFamily: THEME.fontMono }}>
          {ICEBERG.subtitle}
        </span>
      </div>

      {/* 数据统计 */}
      <div style={{ display: "flex", gap: 20, marginTop: 8 }}>
        {[
          { value: `${Math.round(dataCount)}`, label: "数据源" },
          { value: "4", label: "ETL 阶段" },
          { value: "Parquet", label: "存储格式" },
        ].map((stat, i) => {
          const statProgress = spring({
            frame,
            fps,
            config: { damping: 200 },
            delay: sec(2.2) + i * 4,
            durationInFrames: 20,
          });
          return (
            <div
              key={stat.label}
              style={{
                opacity: statProgress,
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: 20,
                  fontWeight: 600,
                  fontFamily: THEME.fontMono,
                  color: THEME.gold,
                }}
              >
                {stat.value}
              </div>
              <div style={{ fontSize: 10, color: THEME.muted, marginTop: 2 }}>{stat.label}</div>
            </div>
          );
        })}
      </div>
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
}> = ({ title, subtitle, frame, fps }) => {
  const titleProgress = spring({
    frame,
    fps,
    config: { damping: 200 },
    durationInFrames: 20,
  });
  const titleOpacity = interpolate(titleProgress, [0, 1], [0, 1]);
  const titleY = interpolate(titleProgress, [0, 1], [-15, 0]);

  return (
    <div
      style={{
        position: "absolute",
        top: 80,
        left: 80,
        opacity: titleOpacity,
        transform: `translateY(${titleY}px)`,
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
