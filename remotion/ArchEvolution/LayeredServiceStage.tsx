import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { THEME } from "../shared/theme";
import { safeInterpolate, sec } from "../shared/utils";

const LAYERS = [
  { label: "Handler", note: "HTTP / RPC entry", color: THEME.gold },
  { label: "Logic", note: "use-case orchestration", color: THEME.lake.primary },
  { label: "DAL", note: "repository / query boundary", color: THEME.lake.secondary },
  { label: "Model / IDL", note: "contract + domain shape", color: THEME.lake.polars },
] as const;

export const LayeredServiceStage: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const fadeIn = safeInterpolate(frame, [0, sec(0.8)], [0, 1]);
  const fadeOut = safeInterpolate(frame, [sec(4.3), sec(5.5)], [1, 0]);
  const requestProgress = safeInterpolate(frame, [sec(1.2), sec(4.2)], [0, 1]);

  return (
    <AbsoluteFill style={{ opacity: fadeIn * fadeOut, pointerEvents: "none" }}>
      <div style={{ position: "absolute", top: 180, left: 0, right: 0, textAlign: "center" }}>
        <div style={{ fontSize: 13, color: THEME.muted, fontFamily: THEME.fontMono, letterSpacing: "0.12em", textTransform: "uppercase" }}>
          service internals stay ordered after the split
        </div>
        <div style={{ marginTop: 10, fontSize: 26, fontWeight: 600, color: THEME.pearl }}>
          拆成多个服务之后，内部仍要继续守住 Handler 到 DAL 的层次边界。
        </div>
      </div>

      <div style={{ position: "absolute", left: 420, right: 420, top: 330, display: "flex", flexDirection: "column", gap: 18 }}>
        {LAYERS.map((layer, index) => {
          const progress = spring({ frame, fps, config: { damping: 200 }, delay: sec(0.5) + index * 5, durationInFrames: 18 });
          const active = safeInterpolate(requestProgress, [index * 0.22, index * 0.22 + 0.18], [0, 1]);
          return (
            <React.Fragment key={layer.label}>
              <div
                style={{
                  opacity: progress,
                  transform: `translateY(${interpolate(progress, [0, 1], [18, 0])}px)`,
                  padding: "20px 26px",
                  borderRadius: 18,
                  background: `${THEME.surfaceElevated}EA`,
                  border: `1.5px solid ${layer.color}${Math.round(interpolate(active, [0, 1], [24, 120])).toString(16).padStart(2, "0")}`,
                  boxShadow: `0 0 ${interpolate(active, [0, 1], [0, 18])}px ${layer.color}18`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div style={{ fontSize: 18, fontWeight: 600, color: layer.color, fontFamily: THEME.fontMono }}>{layer.label}</div>
                <div style={{ fontSize: 12, color: THEME.muted }}>{layer.note}</div>
              </div>
              {index < LAYERS.length - 1 && (
                <div style={{ display: "flex", justifyContent: "center", color: `${THEME.gold}55`, fontSize: 16 }}>▼</div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      <div
        style={{
          position: "absolute",
          left: 300,
          top: interpolate(requestProgress, [0, 1], [370, 760]),
          opacity: safeInterpolate(frame, [sec(0.9), sec(4.4)], [0, 1]),
          padding: "8px 14px",
          borderRadius: 999,
          background: `${THEME.gold}12`,
          border: `1px solid ${THEME.gold}24`,
          color: THEME.goldLight,
          fontSize: 12,
          fontFamily: THEME.fontMono,
        }}
      >
        request sinks through service layers
      </div>
    </AbsoluteFill>
  );
};
