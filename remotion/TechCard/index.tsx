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
 * 场景编排 (15s = 450帧):
 * 0-3s    名字 spring 入场
 * 3-4s    标语淡入
 * 4-8s    核心技术栈标签轮播
 * 8-10s   关键指标展示
 * 10-13s  域名收尾
 * 13-15s  淡出
 */

const TECH_STACKS = [
  { label: "Go 1.24+", color: THEME.gold },
  { label: "Kitex RPC", color: THEME.gold },
  { label: "Hertz HTTP", color: THEME.gold },
  { label: "Apache Iceberg", color: THEME.lake.iceberg },
  { label: "Airflow 3.1", color: THEME.lake.airflow },
  { label: "Trino", color: THEME.lake.trino },
  { label: "Polars", color: THEME.lake.polars },
  { label: "CloudWeGo", color: THEME.gold },
  { label: "OpenTelemetry", color: THEME.lake.primary },
  { label: "gRPC", color: THEME.gold },
];

const METRICS = [
  { value: "10+", label: "Microservices" },
  { value: "99.9%", label: "Availability" },
  { value: "50%", label: "Latency ↓" },
  { value: "87%", label: "Deploy Faster" },
];

export const TechCard: React.FC = () => {
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

      {/* 名字入场 */}
      <NameSection frame={frame} fps={fps} />

      {/* 标语 */}
      <Tagline frame={frame} fps={fps} />

      {/* 技术栈标签轮播 */}
      <TechStackCarousel frame={frame} fps={fps} />

      {/* 关键指标 */}
      <MetricsRow frame={frame} fps={fps} />

      {/* 域名收尾 */}
      <DomainFooter frame={frame} fps={fps} />
    </AbsoluteFill>
  );
};

/* ──── 背景氛围 ──── */
const BackgroundGlow: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const breathe = interpolate(frame % (8 * fps), [0, 4 * fps, 8 * fps], [0.025, 0.05, 0.025]);

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          top: "20%",
          left: "30%",
          width: 500,
          height: 500,
          borderRadius: "50%",
          background: `radial-gradient(circle, rgba(212,175,55,${breathe}) 0%, transparent 70%)`,
          filter: "blur(100px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `linear-gradient(rgba(212,175,55,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(212,175,55,0.02) 1px, transparent 1px)`,
          backgroundSize: "80px 80px",
        }}
      />
    </AbsoluteFill>
  );
};

const VignetteOverlay: React.FC = () => (
  <AbsoluteFill
    style={{
      pointerEvents: "none",
      background: "radial-gradient(ellipse at center, transparent 50%, rgba(12,12,14,0.6) 100%)",
    }}
  />
);

/* ──── 名字入场 ──── */
const NameSection: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const nameProgress = spring({ frame, fps, config: { damping: 200 }, durationInFrames: 30 });
  const nameOpacity = interpolate(nameProgress, [0, 1], [0, 1]);
  const nameY = interpolate(nameProgress, [0, 1], [40, 0]);

  // 淡出
  const fadeOut = safeInterpolate(frame, [sec(12), sec(14.5)], [1, 0]);

  return (
    <div
      style={{
        position: "absolute",
        top: 180,
        left: 0,
        right: 0,
        textAlign: "center",
        opacity: nameOpacity * fadeOut,
        transform: `translateY(${nameY}px)`,
      }}
    >
      {/* 中文名 */}
      <h1
        style={{
          fontSize: 64,
          fontWeight: 700,
          margin: 0,
          background: THEME.goldGradient,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          letterSpacing: "-0.02em",
        }}
      >
        徐俊飞
      </h1>

      {/* 英文名 + 装饰线 */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16, marginTop: 16 }}>
        <div style={{ height: 1, width: 60, background: THEME.goldDivider }} />
        <span style={{ fontSize: 20, color: THEME.muted, letterSpacing: "0.2em", fontFamily: THEME.fontMono }}>
          Masons Xu
        </span>
        <div style={{ height: 1, width: 60, background: THEME.goldDivider }} />
      </div>
    </div>
  );
};

/* ──── 标语 ──── */
const Tagline: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const p = spring({ frame, fps, config: { damping: 200 }, delay: sec(2.5), durationInFrames: 25 });
  const fadeOut = safeInterpolate(frame, [sec(12), sec(14.5)], [1, 0]);

  return (
    <div
      style={{
        position: "absolute",
        top: 340,
        left: 0,
        right: 0,
        textAlign: "center",
        opacity: interpolate(p, [0, 1], [0, 1]) * fadeOut,
        transform: `translateY(${interpolate(p, [0, 1], [20, 0])}px)`,
      }}
    >
      <p style={{ fontSize: 18, color: THEME.muted, fontWeight: 300, letterSpacing: "0.15em", margin: 0 }}>
        Go 后端工程师 · 分布式系统 · 云原生基础设施
      </p>
    </div>
  );
};

/* ──── 技术栈标签轮播 ──── */
const TechStackCarousel: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const fadeIn = safeInterpolate(frame, [sec(3.5), sec(4.5)], [0, 1]);
  const fadeOut = safeInterpolate(frame, [sec(8), sec(9)], [1, 0]);
  const opacity = fadeIn * fadeOut;

  // 每个标签显示 0.5s，交错入场
  return (
    <div
      style={{
        position: "absolute",
        top: 440,
        left: 0,
        right: 0,
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: 10,
        padding: "0 200px",
        opacity,
      }}
    >
      {TECH_STACKS.map((tech, i) => {
        const tagDelay = sec(3.5) + i * 2; // 每个标签错 2 帧
        const tagP = spring({ frame, fps, config: { damping: 200 }, delay: tagDelay, durationInFrames: 15 });
        const tagScale = interpolate(tagP, [0, 1], [0.7, 1]);

        return (
          <div
            key={tech.label}
            style={{
              opacity: tagP,
              transform: `scale(${tagScale})`,
              padding: "8px 18px",
              borderRadius: 20,
              background: `${tech.color}10`,
              border: `1px solid ${tech.color}25`,
              fontSize: 14,
              fontFamily: THEME.fontMono,
              color: tech.color,
            }}
          >
            {tech.label}
          </div>
        );
      })}
    </div>
  );
};

/* ──── 关键指标 ──── */
const MetricsRow: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const fadeIn = safeInterpolate(frame, [sec(9), sec(10)], [0, 1]);
  const fadeOut = safeInterpolate(frame, [sec(12), sec(14.5)], [1, 0]);
  const opacity = fadeIn * fadeOut;

  return (
    <div
      style={{
        position: "absolute",
        top: 600,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        gap: 80,
        opacity,
      }}
    >
      {METRICS.map((m, i) => {
        const mp = spring({ frame, fps, config: { damping: 200 }, delay: sec(9.2) + i * 4, durationInFrames: 20 });
        return (
          <div
            key={m.label}
            style={{
              opacity: mp,
              transform: `translateY(${interpolate(mp, [0, 1], [20, 0])}px)`,
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: 36,
                fontWeight: 700,
                fontFamily: THEME.fontMono,
                background: THEME.goldGradient,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {m.value}
            </div>
            <div style={{ fontSize: 12, color: THEME.muted, marginTop: 4, letterSpacing: "0.1em" }}>
              {m.label}
            </div>
          </div>
        );
      })}
    </div>
  );
};

/* ──── 域名收尾 ──── */
const DomainFooter: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const p = spring({ frame, fps, config: { damping: 200 }, delay: sec(11), durationInFrames: 25 });
  const fadeOut = safeInterpolate(frame, [sec(14), sec(15)], [1, 0]);

  return (
    <div
      style={{
        position: "absolute",
        bottom: 100,
        left: 0,
        right: 0,
        textAlign: "center",
        opacity: interpolate(p, [0, 1], [0, 1]) * fadeOut,
        transform: `translateY(${interpolate(p, [0, 1], [20, 0])}px)`,
      }}
    >
      <div style={{ height: 1, width: 100, margin: "0 auto 16px", background: THEME.goldDivider }} />
      <span
        style={{
          fontSize: 16,
          fontFamily: THEME.fontMono,
          color: THEME.gold,
          letterSpacing: "0.1em",
        }}
      >
        masonsxu-github-io.pages.dev
      </span>
      <div style={{ height: 1, width: 100, margin: "16px auto 0", background: THEME.goldDivider }} />
    </div>
  );
};
