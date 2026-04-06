import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";
import { THEME } from "./theme";

/* ──── 暗角效果 - 电影感 ──── */
export const VignetteOverlay: React.FC<{
  strength?: number;
}> = ({ strength = 0.6 }) => (
  <AbsoluteFill
    style={{
      pointerEvents: "none",
      background: `radial-gradient(ellipse at center, transparent 50%, rgba(12,12,14,${strength}) 100%)`,
    }}
  />
);

/* ──── 呼吸发光背景 ──── */
export const BackgroundGlow: React.FC<{
  color?: string;
  top?: string;
  left?: string;
  right?: string;
  bottom?: string;
  size?: number;
}> = ({
  color = "rgba(212,175,55,0.04)",
  top,
  left,
  right,
  bottom,
  size = 500,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const breathe = interpolate(frame % (8 * fps), [0, 4 * fps, 8 * fps], [0.025, 0.05, 0.025]);

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          top,
          left,
          right,
          bottom,
          width: size,
          height: size,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
          filter: "blur(100px)",
          opacity: breathe,
        }}
      />
    </AbsoluteFill>
  );
};

/* ──── 网格背景 ──── */
export const GridOverlay: React.FC<{
  size?: number;
  color?: string;
}> = ({
  size = 80,
  color = "rgba(212,175,55,0.02)",
}) => (
  <AbsoluteFill
    style={{
      pointerEvents: "none",
      backgroundImage: `linear-gradient(${color} 1px, transparent 1px), linear-gradient(90deg, ${color} 1px, transparent 1px)`,
      backgroundSize: `${size}px ${size}px`,
    }}
  />
);

/* ──── 场景标题 - 通用组件 ──── */
export const SceneHeader: React.FC<{
  title: string;
  subtitle?: string;
  delay?: number;
}> = ({ title, subtitle, delay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

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
      {subtitle && (
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
      )}
    </div>
  );
};

/* ──── 底部品牌标识 ──── */
export const BrandFooter: React.FC<{
  text: string;
  delay?: number;
}> = ({ text, delay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const p = spring({
    frame,
    fps,
    config: { damping: 200 },
    delay,
    durationInFrames: 30,
  });

  return (
    <div
      style={{
        position: "absolute",
        bottom: 80,
        left: 0,
        right: 0,
        textAlign: "center",
        opacity: interpolate(p, [0, 1], [0, 1]),
      }}
    >
      <div style={{ height: 1, width: 80, margin: "0 auto 12px", background: THEME.goldDivider }} />
      <span style={{ fontSize: 13, color: THEME.muted, fontFamily: THEME.fontMono, letterSpacing: "0.1em" }}>
        {text}
      </span>
      <div style={{ height: 1, width: 80, margin: "12px auto 0", background: THEME.goldDivider }} />
    </div>
  );
};

/* ──── 指标卡片 - 带数字滚动 ──── */
export const MetricCard: React.FC<{
  value: string;
  label: string;
  color?: string;
  delay?: number;
  index?: number;
}> = ({ value, label, color = THEME.gold, delay = 0, index = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const p = spring({
    frame,
    fps,
    config: { damping: 200 },
    delay: delay + index * 4,
    durationInFrames: 25,
  });

  return (
    <div
      style={{
        opacity: p,
        transform: `translateY(${interpolate(p, [0, 1], [20, 0])}px)`,
        textAlign: "center",
      }}
    >
      <div
        style={{
          fontSize: 36,
          fontWeight: 700,
          fontFamily: THEME.fontMono,
          color,
        }}
      >
        {value}
      </div>
      <div style={{ fontSize: 12, color: THEME.muted, marginTop: 4, letterSpacing: "0.1em" }}>
        {label}
      </div>
    </div>
  );
};
