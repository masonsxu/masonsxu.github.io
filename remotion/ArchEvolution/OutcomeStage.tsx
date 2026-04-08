import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { BrandFooter } from "../shared/components";
import { THEME } from "../shared/theme";
import { safeInterpolate, sec } from "../shared/utils";

const OUTCOMES = [
  {
    title: "Boundary Split",
    detail: "入口、认证、领域、数据访问不再挤在同一块部署边界里。",
    color: THEME.gold,
  },
  {
    title: "Request Path",
    detail: "Hertz 到 Kitex 的跨服务调用链变得显式、可讲述、可追踪。",
    color: THEME.lake.primary,
  },
  {
    title: "Layered Service",
    detail: "服务内部仍按 Handler / Logic / DAL / Model 维持秩序。",
    color: THEME.lake.secondary,
  },
  {
    title: "Trace Visibility",
    detail: "一次请求的延迟落点可以被 trace 直接暴露出来。",
    color: THEME.lake.polars,
  },
] as const;

export const OutcomeStage: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const fadeIn = safeInterpolate(frame, [0, sec(0.8)], [0, 1]);
  const fadeOut = safeInterpolate(frame, [sec(5), sec(6)], [1, 0]);

  return (
    <AbsoluteFill style={{ opacity: fadeIn * fadeOut, pointerEvents: "none" }}>
      <div style={{ position: "absolute", top: 170, left: 0, right: 0, textAlign: "center" }}>
        <div style={{ fontSize: 28, fontWeight: 600, background: THEME.goldGradient, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          演进结果不是概念升级，而是机制闭环
        </div>
        <div style={{ marginTop: 10, fontSize: 13, color: THEME.muted, fontFamily: THEME.fontMono, letterSpacing: "0.12em", textTransform: "uppercase" }}>
          boundary / path / layering / traceability
        </div>
      </div>

      <div style={{ position: "absolute", left: 220, right: 220, top: 410, display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 22 }}>
        {OUTCOMES.map((item, index) => {
          const progress = spring({ frame, fps, config: { damping: 200 }, delay: sec(0.4) + index * 4, durationInFrames: 18 });
          return (
            <div
              key={item.title}
              style={{
                opacity: progress,
                transform: `translateY(${interpolate(progress, [0, 1], [20, 0])}px) scale(${interpolate(progress, [0, 1], [0.94, 1])})`,
                padding: "22px 24px",
                borderRadius: 18,
                background: `${THEME.surfaceElevated}E8`,
                border: `1px solid ${item.color}24`,
              }}
            >
              <div style={{ fontSize: 15, color: item.color, fontWeight: 600, fontFamily: THEME.fontMono }}>{item.title}</div>
              <div style={{ marginTop: 12, fontSize: 13, color: THEME.muted, lineHeight: 1.75 }}>{item.detail}</div>
            </div>
          );
        })}
      </div>

      <BrandFooter text="MASONS.XU — Architecture Evolution" delay={sec(3)} />
    </AbsoluteFill>
  );
};
