import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { THEME } from "../shared/theme";
import { safeInterpolate, sec } from "../shared/utils";

const CAPABILITY_DOMAINS = [
  {
    title: "Service Architecture",
    color: THEME.gold,
    keywords: ["Go", "Hertz", "Kitex", "CloudWeGo"],
    note: "服务边界、协议入口与 RPC 路径",
  },
  {
    title: "Observability",
    color: THEME.lake.primary,
    keywords: ["OpenTelemetry", "Request Path", "Trace Visibility"],
    note: "把请求链路重新拼成可解释的系统视图",
  },
  {
    title: "Data Platform",
    color: THEME.lake.polars,
    keywords: ["Iceberg", "Airflow 3.1", "Trino", "Polars"],
    note: "把数据流转、编排与计算路径讲清楚",
  },
] as const;

const BOUNDARY_STATEMENTS = [
  {
    title: "Boundary Split",
    detail: "把服务边界拆清楚，让职责不再堆在同一层。",
    color: THEME.gold,
  },
  {
    title: "Observable Path",
    detail: "让一次请求的链路可追踪、可诊断、可解释。",
    color: THEME.lake.primary,
  },
  {
    title: "Data Flow Clarity",
    detail: "把数据流转与计算路径讲明白，再把结果送回业务。",
    color: THEME.lake.secondary,
  },
] as const;

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

      <IdentityHero frame={frame} fps={fps} />
      <CapabilityDomains frame={frame} fps={fps} />
      <BoundaryStatements frame={frame} fps={fps} />
      <ClosingSignature frame={frame} fps={fps} />
    </AbsoluteFill>
  );
};

const BackgroundGlow: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const breathe = interpolate(frame % (8 * fps), [0, 4 * fps, 8 * fps], [0.025, 0.05, 0.025]);

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          top: "18%",
          left: "28%",
          width: 520,
          height: 520,
          borderRadius: "50%",
          background: `radial-gradient(circle, rgba(212,175,55,${breathe}) 0%, transparent 70%)`,
          filter: "blur(110px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          right: 180,
          bottom: 140,
          width: 360,
          height: 360,
          borderRadius: "50%",
          background: `radial-gradient(circle, rgba(79,195,247,${breathe * 0.45}) 0%, transparent 72%)`,
          filter: "blur(90px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `linear-gradient(rgba(212,175,55,0.018) 1px, transparent 1px), linear-gradient(90deg, rgba(212,175,55,0.018) 1px, transparent 1px)`,
          backgroundSize: "84px 84px",
        }}
      />
    </AbsoluteFill>
  );
};

const VignetteOverlay: React.FC = () => (
  <AbsoluteFill
    style={{
      pointerEvents: "none",
      background: "radial-gradient(ellipse at center, transparent 50%, rgba(12,12,14,0.68) 100%)",
    }}
  />
);

const IdentityHero: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const progress = spring({ frame, fps, config: { damping: 200 }, durationInFrames: 28 });
  const fadeOut = safeInterpolate(frame, [sec(3.1), sec(4.2)], [1, 0]);

  return (
    <div
      style={{
        position: "absolute",
        top: 160,
        left: 0,
        right: 0,
        textAlign: "center",
        opacity: progress * fadeOut,
        transform: `translateY(${interpolate(progress, [0, 1], [28, 0])}px)`,
      }}
    >
      <div style={{ fontSize: 13, color: THEME.muted, fontFamily: THEME.fontMono, letterSpacing: "0.16em", textTransform: "uppercase" }}>
        Technical Identity / Masons Xu
      </div>
      <h1
        style={{
          fontSize: 66,
          fontWeight: 700,
          margin: "18px 0 0",
          background: THEME.goldGradient,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          letterSpacing: "-0.03em",
        }}
      >
        徐俊飞
      </h1>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16, marginTop: 16 }}>
        <div style={{ height: 1, width: 70, background: THEME.goldDivider }} />
        <span style={{ fontSize: 19, color: THEME.muted, letterSpacing: "0.18em", fontFamily: THEME.fontMono }}>
          Masons Xu
        </span>
        <div style={{ height: 1, width: 70, background: THEME.goldDivider }} />
      </div>
      <div style={{ marginTop: 22, fontSize: 17, color: THEME.pearl, fontWeight: 500, letterSpacing: "0.04em" }}>
        Go Backend · Distributed Systems · Cloud Native · Data Platform
      </div>
      <div style={{ marginTop: 12, fontSize: 12, color: THEME.muted, lineHeight: 1.7 }}>
        面向复杂服务协作、可观测诊断闭环与数据平台机制设计的工程实践。
      </div>
    </div>
  );
};

const CapabilityDomains: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const fadeIn = safeInterpolate(frame, [sec(3.5), sec(4.4)], [0, 1]);
  const fadeOut = safeInterpolate(frame, [sec(7.8), sec(8.8)], [1, 0]);

  return (
    <div
      style={{
        position: "absolute",
        left: 170,
        right: 170,
        top: 320,
        display: "grid",
        gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
        gap: 18,
        opacity: fadeIn * fadeOut,
      }}
    >
      {CAPABILITY_DOMAINS.map((domain, index) => {
        const p = spring({
          frame,
          fps,
          config: { damping: 200 },
          delay: sec(3.7) + index * 4,
          durationInFrames: 20,
        });

        return (
          <div
            key={domain.title}
            style={{
              opacity: p,
              transform: `translateY(${interpolate(p, [0, 1], [18, 0])}px) scale(${interpolate(p, [0, 1], [0.9, 1])})`,
              padding: "18px 18px 16px",
              borderRadius: 16,
              background: `${THEME.surfaceElevated}E8`,
              border: `1px solid ${domain.color}28`,
              boxShadow: `0 0 22px ${domain.color}12`,
            }}
          >
            <div style={{ fontSize: 12, color: domain.color, fontFamily: THEME.fontMono, fontWeight: 600, letterSpacing: "0.08em" }}>
              {domain.title}
            </div>
            <div style={{ marginTop: 12, display: "flex", flexWrap: "wrap", gap: 8 }}>
              {domain.keywords.map((keyword) => (
                <div
                  key={keyword}
                  style={{
                    padding: "6px 10px",
                    borderRadius: 999,
                    background: `${domain.color}10`,
                    border: `1px solid ${domain.color}22`,
                    fontSize: 11,
                    color: domain.color,
                    fontFamily: THEME.fontMono,
                  }}
                >
                  {keyword}
                </div>
              ))}
            </div>
            <div style={{ marginTop: 14, fontSize: 11, color: THEME.muted, lineHeight: 1.7 }}>
              {domain.note}
            </div>
          </div>
        );
      })}
    </div>
  );
};

const BoundaryStatements: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const fadeIn = safeInterpolate(frame, [sec(8.1), sec(9)], [0, 1]);
  const fadeOut = safeInterpolate(frame, [sec(11.7), sec(12.8)], [1, 0]);

  return (
    <div
      style={{
        position: "absolute",
        left: 250,
        right: 250,
        top: 330,
        opacity: fadeIn * fadeOut,
      }}
    >
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <div style={{ fontSize: 13, color: THEME.muted, fontFamily: THEME.fontMono, letterSpacing: "0.14em", textTransform: "uppercase" }}>
          problem framing over vanity metrics
        </div>
        <div style={{ marginTop: 10, fontSize: 26, color: THEME.pearl, fontWeight: 600 }}>
          关注的不是口号式指标，而是系统机制是否被讲清楚。
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 16 }}>
        {BOUNDARY_STATEMENTS.map((item, index) => {
          const p = spring({
            frame,
            fps,
            config: { damping: 200 },
            delay: sec(8.3) + index * 5,
            durationInFrames: 18,
          });

          return (
            <div
              key={item.title}
              style={{
                opacity: p,
                transform: `translateY(${interpolate(p, [0, 1], [18, 0])}px)`,
                padding: "18px 18px 16px",
                borderRadius: 16,
                background: `${THEME.surface}EA`,
                border: `1px solid ${item.color}2A`,
              }}
            >
              <div style={{ fontSize: 13, color: item.color, fontFamily: THEME.fontMono, fontWeight: 600 }}>
                {item.title}
              </div>
              <div style={{ marginTop: 12, fontSize: 12, color: THEME.muted, lineHeight: 1.75 }}>
                {item.detail}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const ClosingSignature: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const p = spring({ frame, fps, config: { damping: 200 }, delay: sec(12), durationInFrames: 24 });
  const fadeOut = safeInterpolate(frame, [sec(14.1), sec(15)], [1, 0]);

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 108,
        textAlign: "center",
        opacity: p * fadeOut,
        transform: `translateY(${interpolate(p, [0, 1], [18, 0])}px)`,
      }}
    >
      <div style={{ fontSize: 18, color: THEME.pearl, fontWeight: 500, letterSpacing: "0.02em" }}>
        用清晰边界、可观测链路与真实系统经验构建后端能力。
      </div>
      <div style={{ height: 1, width: 120, margin: "18px auto 14px", background: THEME.goldDivider }} />
      <div style={{ fontSize: 15, color: THEME.gold, fontFamily: THEME.fontMono, letterSpacing: "0.1em" }}>
        masonsxu-github-io.pages.dev
      </div>
    </div>
  );
};
