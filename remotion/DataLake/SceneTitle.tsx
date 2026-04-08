import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";
import { THEME } from "../shared/theme";
import { safeInterpolate, sec } from "../shared/utils";

const TECH_BADGES = [
  { label: "Apache Iceberg", color: THEME.lake.iceberg },
  { label: "Airflow 3.1", color: THEME.lake.airflow },
  { label: "Trino", color: THEME.lake.trino },
  { label: "Polars", color: THEME.lake.polars },
  { label: "PyIceberg", color: THEME.gold },
] as const;

const GHOST_LAYERS = [
  { label: "Sources", x: 280, y: 560, color: THEME.lake.primary },
  { label: "Orchestration", x: 620, y: 560, color: THEME.lake.airflow },
  { label: "Compute & Query", x: 990, y: 560, color: THEME.lake.polars },
  { label: "Delivery", x: 1370, y: 560, color: THEME.lake.accent },
] as const;

export const SceneTitle: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleProgress = spring({ frame, fps, config: { damping: 200 }, durationInFrames: 24 });
  const subtitleProgress = spring({ frame, fps, config: { damping: 200 }, delay: sec(0.25), durationInFrames: 22 });
  const framingProgress = spring({ frame, fps, config: { damping: 200 }, delay: sec(0.55), durationInFrames: 22 });
  const fadeOut = safeInterpolate(frame, [sec(2.8), sec(3.5)], [1, 0]);

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", opacity: fadeOut }}>
      <GhostSystemOutline />

      <div
        style={{
          opacity: interpolate(titleProgress, [0, 1], [0, 1]),
          transform: `translateY(${interpolate(titleProgress, [0, 1], [28, 0])}px)`,
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: 18,
            color: THEME.muted,
            fontFamily: THEME.fontMono,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            marginBottom: 16,
          }}
        >
          Config-Driven Data Lake Pipeline
        </div>
        <h1
          style={{
            fontSize: 70,
            fontWeight: 700,
            background: THEME.goldGradient,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            letterSpacing: "-0.03em",
            margin: 0,
          }}
        >
          Data Lake Platform
        </h1>
      </div>

      <div
        style={{
          marginTop: 22,
          width: interpolate(subtitleProgress, [0, 1], [0, 260]),
          height: 1,
          background: THEME.goldDivider,
        }}
      />

      <div
        style={{
          marginTop: 22,
          opacity: interpolate(subtitleProgress, [0, 1], [0, 1]),
          transform: `translateY(${interpolate(subtitleProgress, [0, 1], [18, 0])}px)`,
          textAlign: "center",
        }}
      >
        <p
          style={{
            fontSize: 24,
            color: THEME.muted,
            fontWeight: 300,
            letterSpacing: "0.08em",
            margin: 0,
          }}
        >
          不是把数据搬进湖里，而是把规则变成流水线
        </p>
      </div>

      <div
        style={{
          marginTop: 40,
          display: "flex",
          gap: 12,
          flexWrap: "wrap",
          justifyContent: "center",
          maxWidth: 1100,
        }}
      >
        {TECH_BADGES.map((badge, index) => {
          const progress = spring({
            frame,
            fps,
            config: { damping: 200 },
            delay: sec(0.9) + index * 4,
            durationInFrames: 18,
          });

          return (
            <div
              key={badge.label}
              style={{
                opacity: progress,
                transform: `scale(${interpolate(progress, [0, 1], [0.82, 1])})`,
                fontSize: 13,
                fontFamily: THEME.fontMono,
                color: badge.color,
                background: `${badge.color}12`,
                border: `1px solid ${badge.color}30`,
                padding: "7px 16px",
                borderRadius: 20,
              }}
            >
              {badge.label}
            </div>
          );
        })}
      </div>

      <div
        style={{
          marginTop: 26,
          opacity: interpolate(framingProgress, [0, 1], [0, 1]),
          transform: `translateY(${interpolate(framingProgress, [0, 1], [16, 0])}px)`,
          fontSize: 13,
          color: THEME.muted,
          fontFamily: THEME.fontMono,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
        }}
      >
        Sources → Orchestration → Compute → Delivery
      </div>
    </AbsoluteFill>
  );
};

const GhostSystemOutline: React.FC = () => (
  <AbsoluteFill style={{ pointerEvents: "none", opacity: 0.22 }}>
    {GHOST_LAYERS.map((layer) => (
      <div
        key={layer.label}
        style={{
          position: "absolute",
          left: layer.x,
          top: layer.y,
          width: 220,
          padding: "14px 18px",
          borderRadius: 14,
          border: `1px solid ${layer.color}22`,
          background: `${THEME.surfaceElevated}88`,
          textAlign: "center",
        }}
      >
        <div style={{ color: layer.color, fontFamily: THEME.fontMono, fontSize: 12, letterSpacing: "0.1em" }}>
          {layer.label}
        </div>
      </div>
    ))}
  </AbsoluteFill>
);