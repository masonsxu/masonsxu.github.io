import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { THEME } from "../shared/theme";
import { safeInterpolate, sec } from "../shared/utils";

const TRACE_SPANS = [
  { label: "HTTP ingress", start: 0, duration: 35, color: THEME.gold },
  { label: "Auth guard", start: 20, duration: 38, color: THEME.lake.primary },
  { label: "Kitex RPC", start: 54, duration: 72, color: THEME.gold },
  { label: "Domain service", start: 84, duration: 58, color: THEME.lake.secondary },
  { label: "DAL query", start: 118, duration: 92, color: THEME.lake.polars },
] as const;

export const TraceStage: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const fadeIn = safeInterpolate(frame, [0, sec(0.8)], [0, 1]);
  const fadeOut = safeInterpolate(frame, [sec(4.3), sec(5.5)], [1, 0]);

  return (
    <AbsoluteFill style={{ opacity: fadeIn * fadeOut, pointerEvents: "none" }}>
      <div style={{ position: "absolute", top: 170, left: 0, right: 0, textAlign: "center" }}>
        <div style={{ fontSize: 13, color: THEME.muted, fontFamily: THEME.fontMono, letterSpacing: "0.12em", textTransform: "uppercase" }}>
          trace rebuilds visibility across service hops
        </div>
        <div style={{ marginTop: 10, fontSize: 26, fontWeight: 600, color: THEME.pearl }}>
          架构拆开之后，要靠 trace 把一次请求重新拼回完整路径。
        </div>
      </div>

      <div style={{ position: "absolute", top: 300, left: 250, width: 1420 }}>
        <div style={{ position: "relative", height: 1, background: `${THEME.gold}20`, marginBottom: 34 }}>
          {[0, 50, 100, 150, 200, 250].map((ms) => (
            <div
              key={ms}
              style={{ position: "absolute", left: `${(ms / 250) * 100}%`, top: -10, fontSize: 20, color: THEME.muted, fontFamily: THEME.fontMono }}
            >
              {ms}ms
            </div>
          ))}
        </div>

        {TRACE_SPANS.map((span, index) => {
          const progress = spring({ frame, fps, config: { damping: 200 }, delay: sec(1) + index * 4, durationInFrames: 18 });
          const widthProgress = safeInterpolate(frame, [sec(1.2) + index * 4, sec(2.1) + index * 4], [0, 1]);
          const isSlowPoint = span.label === "DAL query";
          return (
            <div
              key={span.label}
              style={{
                opacity: progress,
                transform: `translateX(${interpolate(progress, [0, 1], [-16, 0])}px)`,
                display: "flex",
                alignItems: "center",
                gap: 14,
                marginBottom: 18,
              }}
            >
              <div style={{ width: 170, textAlign: "right", fontSize: 21, color: THEME.muted, fontFamily: THEME.fontMono }}>{span.label}</div>
              <div
                style={{
                  marginLeft: `${(span.start / 250) * 100}%`,
                  width: `${(span.duration / 250) * 100 * widthProgress}%`,
                  height: 56,
                  minWidth: widthProgress > 0 ? 44 : 0,
                  borderRadius: 6,
                  background: `${span.color}${isSlowPoint ? "30" : "24"}`,
                  border: `1px solid ${span.color}${isSlowPoint ? "55" : "38"}`,
                  boxShadow: isSlowPoint ? `0 0 16px ${span.color}24` : undefined,
                }}
              />
              <div style={{ fontSize: 20, color: span.color, fontFamily: THEME.fontMono }}>{Math.round(span.duration * widthProgress)}ms</div>
            </div>
          );
        })}

        <div
          style={{
            marginTop: 24,
            opacity: safeInterpolate(frame, [sec(2.8), sec(3.8)], [0, 1]),
            padding: "12px 16px",
            borderRadius: 12,
            background: `${THEME.lake.accent}10`,
            border: `1px solid ${THEME.lake.accent}24`,
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <div style={{ width: 16, height: 16, borderRadius: "50%", background: THEME.lake.accent }} />
          <div style={{ fontSize: 16, color: THEME.muted }}>
            trace reveals latency concentration at <span style={{ color: THEME.lake.accent, fontFamily: THEME.fontMono }}>DAL query</span>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
