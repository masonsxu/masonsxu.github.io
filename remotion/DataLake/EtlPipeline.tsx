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
 * ETL 4 阶段定义
 */
const ETL_STEPS = [
  {
    id: "config",
    label: "配置同步",
    labelEn: "Config Sync",
    desc: "JSON mapping_rules\ninterface_code 解析",
    color: THEME.gold,
    icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
  },
  {
    id: "ingest",
    label: "数据入湖",
    labelEn: "Data Ingestion",
    desc: "MySQL 游标读取\nMongoDB Raw Doc\n统一 Parquet 写入",
    color: THEME.lake.primary,
    icon: "M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12",
  },
  {
    id: "extract",
    label: "字典抽取",
    labelEn: "Dict Extraction",
    desc: "两阶段抽取\n基础 → 癌种专属\nFieldCommon0 归一",
    color: THEME.lake.secondary,
    icon: "M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4",
  },
  {
    id: "callback",
    label: "业务回传",
    labelEn: "API Callback",
    desc: "api_payload JSON\n分批 REST API\n结果验证",
    color: THEME.lake.accent,
    icon: "M4 4h16v16H4V4zm4 4h8M8 12h8m-8 4h4",
  },
];

/**
 * 场景 3: ETL 流水线 (8-14s)
 * 展示 Airflow 编排下的 4 阶段数据流水线
 */
export const EtlPipeline: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 场景整体淡入淡出
  const sceneFadeIn = safeInterpolate(frame, [0, sec(0.5)], [0, 1]);
  const sceneFadeOut = safeInterpolate(frame, [sec(5.8), sec(6.5)], [1, 0]);
  const sceneOpacity = sceneFadeIn * sceneFadeOut;

  return (
    <AbsoluteFill style={{ opacity: sceneOpacity }}>
      {/* Airflow 编排标记 */}
      <AirflowBadge frame={frame} fps={fps} />

      {/* 场景标题 */}
      <SceneHeader
        title="配置驱动 ETL 流水线"
        subtitle="Airflow 3.1 Orchestrated Pipeline"
        frame={frame}
        fps={fps}
        delay={sec(0.2)}
      />

      {/* ETL 阶段卡片 */}
      <div
        style={{
          position: "absolute",
          top: 300,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 0,
        }}
      >
        {ETL_STEPS.map((step, i) => (
          <React.Fragment key={step.id}>
            <EtlStepCard step={step} index={i} />
            {i < ETL_STEPS.length - 1 && <FlowArrow fromIndex={i} />}
          </React.Fragment>
        ))}
      </div>

      {/* 底部 BFS 图搜索说明 */}
      <BfsNote frame={frame} fps={fps} />
    </AbsoluteFill>
  );
};

/**
 * Airflow 徽章
 */
const AirflowBadge: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const progress = spring({
    frame,
    fps,
    config: { damping: 200 },
    delay: sec(0.1),
    durationInFrames: 20,
  });

  return (
    <div
      style={{
        position: "absolute",
        top: 80,
        right: 80,
        opacity: progress,
        transform: `scale(${interpolate(progress, [0, 1], [0.8, 1])})`,
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "8px 16px",
        borderRadius: 20,
        background: `${THEME.lake.airflow}15`,
        border: `1px solid ${THEME.lake.airflow}30`,
      }}
    >
      <div
        style={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          background: THEME.lake.airflow,
          boxShadow: `0 0 8px ${THEME.lake.airflow}80`,
        }}
      />
      <span style={{ fontSize: 12, fontFamily: THEME.fontMono, color: THEME.lake.airflow }}>
        Airflow 3.1 DAG
      </span>
    </div>
  );
};

/**
 * ETL 步骤卡片
 */
const EtlStepCard: React.FC<{
  step: typeof ETL_STEPS[number];
  index: number;
}> = ({ step, index }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 卡片交错入场
  const cardProgress = spring({
    frame,
    fps,
    config: { damping: 200 },
    delay: sec(0.5) + index * 10,
    durationInFrames: 25,
  });

  const opacity = interpolate(cardProgress, [0, 1], [0, 1]);
  const translateY = interpolate(cardProgress, [0, 1], [30, 0]);
  const scale = interpolate(cardProgress, [0, 1], [0.9, 1]);

  // 当前激活状态 - 按时间轮转高亮
  const activeStart = sec(1.2) + index * sec(1.0);
  const activeEnd = activeStart + sec(0.8);
  const isActive = safeInterpolate(frame, [activeStart, activeStart + 5, activeEnd, activeEnd + 5], [0, 1, 1, 0]);

  const borderColor = interpolate(
    isActive,
    [0, 1],
    [0x25, 0x80], // 透明度变化
  );
  const glowSize = interpolate(isActive, [0, 1], [0, 15]);

  return (
    <div
      style={{
        opacity,
        transform: `translateY(${translateY}px) scale(${scale})`,
        width: 280,
        padding: "24px 20px",
        borderRadius: 16,
        background: `${THEME.surfaceElevated}DD`,
        border: `1.5px solid ${step.color}${Math.round(interpolate(isActive, [0, 1], [37, 128])).toString(16).padStart(2, "0")}`,
        boxShadow: `0 0 ${glowSize}px ${step.color}30`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 10,
        transition: "none",
      }}
    >
      {/* 步骤序号 */}
      <div
        style={{
          fontSize: 11,
          fontFamily: THEME.fontMono,
          color: THEME.muted,
          background: `${THEME.surface}`,
          padding: "2px 10px",
          borderRadius: 10,
        }}
      >
        Step {index + 1}
      </div>

      {/* 图标 */}
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke={step.color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d={step.icon} />
      </svg>

      {/* 标题 */}
      <span style={{ fontSize: 16, fontWeight: 600, color: step.color }}>{step.label}</span>
      <span style={{ fontSize: 11, color: THEME.muted, fontFamily: THEME.fontMono }}>
        {step.labelEn}
      </span>

      {/* 描述 */}
      <p
        style={{
          fontSize: 11,
          color: THEME.muted,
          lineHeight: 1.6,
          textAlign: "center",
          margin: 0,
          whiteSpace: "pre-line",
        }}
      >
        {step.desc}
      </p>
    </div>
  );
};

/**
 * 流向箭头
 */
const FlowArrow: React.FC<{ fromIndex: number }> = ({ fromIndex }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame,
    fps,
    config: { damping: 200 },
    delay: sec(0.8) + fromIndex * 10,
    durationInFrames: 20,
  });

  // 箭头脉冲动画
  const pulse = safeInterpolate(
    frame % (fps * 2),
    [0, fps, fps * 2],
    [0.3, 0.8, 0.3],
  );

  return (
    <div
      style={{
        opacity: progress,
        transform: `scale(${interpolate(progress, [0, 1], [0.5, 1])})`,
        width: 60,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: 40,
          height: 2,
          background: `${THEME.gold}${Math.round(pulse * 128).toString(16).padStart(2, "0")}`,
        }}
      />
      <svg width="12" height="12" viewBox="0 0 12 12" fill={THEME.gold} style={{ opacity: pulse }}>
        <path d="M0 2L8 6L0 10V2Z" />
      </svg>
    </div>
  );
};

/**
 * BFS 图搜索说明
 */
const BfsNote: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const progress = spring({
    frame,
    fps,
    config: { damping: 200 },
    delay: sec(4.0),
    durationInFrames: 20,
  });

  return (
    <div
      style={{
        position: "absolute",
        bottom: 120,
        left: "50%",
        transform: `translateX(-50%) translateY(${interpolate(progress, [0, 1], [20, 0])}px)`,
        opacity: progress,
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "12px 24px",
        borderRadius: 12,
        background: `${THEME.surface}CC`,
        border: `1px solid ${THEME.gold}20`,
      }}
    >
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="10" r="8" stroke={THEME.gold} strokeWidth={1.5} strokeDasharray="3 3" />
        <circle cx="10" cy="10" r="3" fill={THEME.gold} opacity={0.5} />
      </svg>
      <span style={{ fontSize: 13, color: THEME.muted }}>
        BFS 图搜索最优 <span style={{ color: THEME.gold, fontFamily: THEME.fontMono }}>JOIN</span> 路径
      </span>
    </div>
  );
};

/**
 * 场景头部标题（复用版）
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
