import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
} from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { THEME } from "../shared/theme";
import { safeInterpolate, sec } from "../shared/utils";
import { VignetteOverlay } from "../shared/components";
import { TechCard } from "../TechCard";
import { ArchEvolution } from "../ArchEvolution";
import { DataLake } from "../DataLake";
import { ContributionHeatmap } from "../ContributionHeatmap";
import { OSSDashboard } from "../OSSDashboard";

/**
 * 作品集预告片 (60s)
 * 使用 TransitionSeries + fade() 实现场景间平滑交叉溶解
 *
 * 时间分配:
 * TechCard:            0-12s
 * ArchEvolution:       12-24s
 * DataLake:            24-36s
 * ContributionHeatmap: 36-48s
 * OSSDashboard:        48-58s
 * 收尾:                58-60s
 *
 * TransitionSeries 会自动处理场景间重叠
 */

const TRANSITION_DURATION = 15; // 15 帧交叉淡入淡出

const SCENES = [
  { Component: TechCard, duration: 12 },
  { Component: ArchEvolution, duration: 12 },
  { Component: DataLake, duration: 12 },
  { Component: ContributionHeatmap, duration: 12 },
  { Component: OSSDashboard, duration: 12 },
];

// 计算每个场景帧数
const SCENE_FRAMES = SCENES.map((s) => s.duration * 30);

// 5 个场景 + 4 个过渡 = (12+12+12+12+10)*30 - 4*15 = 1740 帧
const TOTAL_SCENE_FRAMES = SCENE_FRAMES.reduce((a, b) => a + b, 0) - (SCENES.length - 1) * TRANSITION_DURATION;
const CLOSING_START = TOTAL_SCENE_FRAMES;
const TOTAL_DURATION = CLOSING_START + 2 * 30; // 58s 场景 + 2s 收尾

export const Trailer: React.FC = () => {
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
      <TransitionSeries style={{}}>
        <TransitionSeries.Sequence durationInFrames={SCENE_FRAMES[0]}>
          <TechCard />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: TRANSITION_DURATION })}
        />
        <TransitionSeries.Sequence durationInFrames={SCENE_FRAMES[1]}>
          <ArchEvolution />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: TRANSITION_DURATION })}
        />
        <TransitionSeries.Sequence durationInFrames={SCENE_FRAMES[2]}>
          <DataLake />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: TRANSITION_DURATION })}
        />
        <TransitionSeries.Sequence durationInFrames={SCENE_FRAMES[3]}>
          <ContributionHeatmap />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: TRANSITION_DURATION })}
        />
        <TransitionSeries.Sequence durationInFrames={SCENE_FRAMES[4]}>
          <OSSDashboard />
        </TransitionSeries.Sequence>
      </TransitionSeries>

      {/* 收尾定格 (从场景结束后开始) */}
      {frame >= CLOSING_START && (
        <ClosingFrame frame={frame} fps={fps} />
      )}

      {/* 全局暗角 */}
      <VignetteOverlay strength={0.7} />

      {/* 胶片噪点 */}
      <FilmGrain frame={frame} />

      {/* 底部进度条 */}
      <ProgressBar frame={frame} fps={fps} totalDuration={TOTAL_DURATION} />
    </AbsoluteFill>
  );
};

/* ──── 胶片噪点 ──── */
const FilmGrain: React.FC<{ frame: number }> = ({ frame }) => {
  const grainOpacity = 0.03 + (frame % 7) * 0.003;

  return (
    <AbsoluteFill
      style={{
        pointerEvents: "none",
        opacity: grainOpacity,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        backgroundSize: "256px 256px",
        mixBlendMode: "overlay",
      }}
    />
  );
};

/* ──── 底部进度条 ──── */
const ProgressBar: React.FC<{ frame: number; fps: number; totalDuration: number }> = ({ frame, fps, totalDuration }) => {
  const progress = Math.min(frame / (totalDuration), 1);

  return (
    <div
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: 2,
        background: `${THEME.gold}10`,
      }}
    >
      <div
        style={{
          width: `${progress * 100}%`,
          height: "100%",
          background: THEME.gold,
          opacity: 0.5,
        }}
      />
    </div>
  );
};

/* ──── 收尾定格 ──── */
const ClosingFrame: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const localFrame = frame - CLOSING_START;
  const fadeIn = safeInterpolate(localFrame, [0, sec(0.5)], [0, 1]);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: THEME.obsidian,
        justifyContent: "center",
        alignItems: "center",
        opacity: fadeIn,
        zIndex: 100,
      }}
    >
      <span
        style={{
          fontSize: 20,
          fontFamily: THEME.fontMono,
          color: THEME.gold,
          letterSpacing: "0.15em",
        }}
      >
        MASONS.XU
      </span>
      <div style={{ height: 1, width: 100, margin: "16px 0", background: `linear-gradient(90deg, transparent, ${THEME.gold}40, transparent)` }} />
      <span style={{ fontSize: 12, color: THEME.muted, letterSpacing: "0.2em" }}>
        Distributed Systems · Cloud Native
      </span>
    </AbsoluteFill>
  );
};
