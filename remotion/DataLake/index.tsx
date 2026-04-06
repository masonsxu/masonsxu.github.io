import React from "react";
import {
  AbsoluteFill,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Easing,
} from "remotion";
import { THEME, VIDEO } from "../shared/theme";
import { safeInterpolate, sec } from "../shared/utils";
import { SceneTitle } from "./SceneTitle";
import { DataSourceFlow } from "./DataSourceFlow";
import { EtlPipeline } from "./EtlPipeline";
import { CrossSourceJoin } from "./CrossSourceJoin";
import { LakeArchitecture } from "./LakeArchitecture";

/**
 * 数据湖技术演示视频 - 主组件
 * 25 秒 = 750 帧 @ 30fps
 *
 * 场景编排：
 * 0-3s   SceneTitle         标题入场 "Data Lake Platform"
 * 3-8s   DataSourceFlow     多源数据流动画 (MySQL/MongoDB/API → Iceberg)
 * 8-14s  EtlPipeline        ETL 4 阶段流水线 (Airflow 编排)
 * 14-19s CrossSourceJoin    跨源 JOIN 与字典抽取 (Trino + Polars)
 * 19-25s LakeArchitecture   架构全景 + 核心指标 + 收尾
 */
export const DataLake: React.FC = () => {
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
      {/* 背景大气氛围 - 持续全片 */}
      <BackgroundAtmosphere />

      {/* 全局暗角 - 持续全片 */}
      <VignetteOverlay />

      {/* 场景序列 */}
      <Sequence from={0} durationInFrames={sec(3)} premountFor={sec(0.5)}>
        <SceneTitle />
      </Sequence>

      <Sequence from={sec(2.5)} durationInFrames={sec(5.5)} premountFor={sec(0.5)}>
        <DataSourceFlow />
      </Sequence>

      <Sequence from={sec(7.5)} durationInFrames={sec(6.5)} premountFor={sec(0.5)}>
        <EtlPipeline />
      </Sequence>

      <Sequence from={sec(13.5)} durationInFrames={sec(6)} premountFor={sec(0.5)}>
        <CrossSourceJoin />
      </Sequence>

      <Sequence from={sec(19)} durationInFrames={sec(6)} premountFor={sec(0.5)}>
        <LakeArchitecture />
      </Sequence>
    </AbsoluteFill>
  );
};

/**
 * 背景大气氛围 - 微妙的发光球体 + 网格
 */
const BackgroundAtmosphere: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 缓慢呼吸
  const breathe = interpolate(
    frame % (8 * fps),
    [0, 4 * fps, 8 * fps],
    [0.025, 0.05, 0.025],
    { extrapolateRight: "clamp" },
  );

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {/* 左上金色光球 */}
      <div
        style={{
          position: "absolute",
          top: "15%",
          left: "10%",
          width: 500,
          height: 500,
          borderRadius: "50%",
          background: `radial-gradient(circle, rgba(212,175,55,${breathe}) 0%, transparent 70%)`,
          filter: "blur(80px)",
        }}
      />
      {/* 右下蓝色光球 - 数据湖色彩 */}
      <div
        style={{
          position: "absolute",
          bottom: "10%",
          right: "8%",
          width: 400,
          height: 400,
          borderRadius: "50%",
          background: `radial-gradient(circle, rgba(79,195,247,${breathe * 0.6}) 0%, transparent 70%)`,
          filter: "blur(90px)",
        }}
      />
      {/* 网格 */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(212,175,55,0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(212,175,55,0.02) 1px, transparent 1px)
          `,
          backgroundSize: "80px 80px",
        }}
      />
    </AbsoluteFill>
  );
};

/**
 * 暗角效果 - 电影感
 */
const VignetteOverlay: React.FC = () => (
  <AbsoluteFill
    style={{
      pointerEvents: "none",
      background:
        "radial-gradient(ellipse at center, transparent 50%, rgba(12,12,14,0.6) 100%)",
    }}
  />
);
