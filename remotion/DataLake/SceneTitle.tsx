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
 * 场景 1: 标题入场 (0-3s)
 * "Data Lake Platform" + 副标题 + 技术标签
 */
export const SceneTitle: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 主标题 - 平滑 spring 入场
  const titleProgress = spring({
    frame,
    fps,
    config: { damping: 200 },
    durationInFrames: 25,
  });

  const titleOpacity = interpolate(titleProgress, [0, 1], [0, 1]);
  const titleY = interpolate(titleProgress, [0, 1], [30, 0]);

  // 副标题 - 延迟入场
  const subtitleProgress = spring({
    frame,
    fps,
    config: { damping: 200 },
    delay: sec(0.4),
    durationInFrames: 25,
  });

  const subtitleOpacity = interpolate(subtitleProgress, [0, 1], [0, 1]);
  const subtitleY = interpolate(subtitleProgress, [0, 1], [20, 0]);

  // 分隔线 - 从中间展开
  const lineProgress = spring({
    frame,
    fps,
    config: { damping: 200 },
    delay: sec(0.6),
    durationInFrames: 20,
  });
  const lineWidth = interpolate(lineProgress, [0, 1], [0, 200]);

  // 技术标签 - 交错入场
  const techs = ["Apache Iceberg", "Airflow 3.1", "Trino", "Polars", "PyIceberg"];
  const techColors = [THEME.lake.iceberg, THEME.lake.airflow, THEME.lake.trino, THEME.lake.polars, THEME.lake.parquet];

  // 整体淡出
  const fadeOut = safeInterpolate(frame, [sec(2.4), sec(3)], [1, 0]);

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        opacity: fadeOut,
      }}
    >
      {/* 主标题 */}
      <div
        style={{
          opacity: titleOpacity,
          transform: `translateY(${titleY}px)`,
        }}
      >
        <h1
          style={{
            fontSize: 72,
            fontWeight: 700,
            fontFamily: THEME.fontSans,
            background: THEME.goldGradient,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            letterSpacing: "-0.02em",
            margin: 0,
          }}
        >
          Data Lake Platform
        </h1>
      </div>

      {/* 分隔线 */}
      <div
        style={{
          width: lineWidth,
          height: 1,
          background: THEME.goldDivider,
          margin: "20px 0",
        }}
      />

      {/* 副标题 */}
      <div
        style={{
          opacity: subtitleOpacity,
          transform: `translateY(${subtitleY}px)`,
        }}
      >
        <p
          style={{
            fontSize: 24,
            color: THEME.muted,
            fontFamily: THEME.fontSans,
            fontWeight: 300,
            letterSpacing: "0.1em",
            margin: 0,
          }}
        >
          Apache Iceberg + Airflow + Trino + Polars
        </p>
      </div>

      {/* 技术标签 */}
      <div style={{ display: "flex", gap: 12, marginTop: 40 }}>
        {techs.map((tech, i) => {
          const tagProgress = spring({
            frame,
            fps,
            config: { damping: 200 },
            delay: sec(0.8) + i * 4,
            durationInFrames: 20,
          });
          const tagOpacity = interpolate(tagProgress, [0, 1], [0, 1]);
          const tagScale = interpolate(tagProgress, [0, 1], [0.8, 1]);

          return (
            <div
              key={tech}
              style={{
                opacity: tagOpacity,
                transform: `scale(${tagScale})`,
                fontSize: 13,
                fontFamily: THEME.fontMono,
                color: techColors[i],
                background: `${techColors[i]}10`,
                border: `1px solid ${techColors[i]}30`,
                padding: "6px 16px",
                borderRadius: 20,
              }}
            >
              {tech}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
