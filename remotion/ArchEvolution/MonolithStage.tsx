import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { THEME } from "../shared/theme";
import { safeInterpolate, sec } from "../shared/utils";

const RESPONSIBILITY_BLOCKS = [
  { label: "HTTP Entry", dx: -290, dy: -140, color: THEME.gold },
  { label: "Auth Check", dx: 270, dy: -110, color: THEME.lake.primary },
  { label: "Business Logic", dx: -260, dy: 110, color: THEME.lake.secondary },
  { label: "DB Query", dx: 250, dy: 120, color: THEME.lake.polars },
  { label: "Async Job", dx: 0, dy: 220, color: THEME.lake.accent },
] as const;

export const MonolithStage: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const fadeIn = safeInterpolate(frame, [0, sec(0.5)], [0, 1]);
  const fadeOut = safeInterpolate(frame, [sec(3.5), sec(4.5)], [1, 0]);
  const splitProgress = safeInterpolate(frame, [sec(1.1), sec(3.2)], [0, 1]);
  const noteProgress = spring({
    frame,
    fps,
    config: { damping: 200 },
    delay: sec(0.25),
    durationInFrames: 18,
  });

  return (
    <AbsoluteFill style={{ opacity: fadeIn * fadeOut, pointerEvents: "none" }}>
      <div style={{ position: "absolute", top: 180, left: 0, right: 0, textAlign: "center", opacity: noteProgress }}>
        <div style={{ fontSize: 13, color: THEME.muted, fontFamily: THEME.fontMono, letterSpacing: "0.12em", textTransform: "uppercase" }}>
          responsibilities coupled in one deployable
        </div>
        <div style={{ marginTop: 10, fontSize: 26, fontWeight: 600, color: THEME.pearl }}>
          演进起点不是换语言，而是先拆清职责边界。
        </div>
      </div>

      <div style={{ position: "absolute", top: "56%", left: "50%", transform: "translate(-50%, -50%)" }}>
        <div
          style={{
            width: 400,
            height: 300,
            borderRadius: 20,
            background: `${THEME.surfaceElevated}E8`,
            border: `1.5px solid ${THEME.gold}28`,
            boxShadow: `0 0 40px ${THEME.gold}10`,
            opacity: interpolate(splitProgress, [0, 0.35, 0.6], [1, 1, 0.18]),
            transform: `scale(${interpolate(splitProgress, [0, 0.25], [1, 1.04])})`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
          }}
        >
          <div style={{ fontSize: 36, fontFamily: THEME.fontMono, color: THEME.gold, fontWeight: 700 }}>Python Monolith</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center", width: 220 }}>
            {["entry", "auth", "logic", "storage", "job"].map((item) => (
              <div
                key={item}
                style={{
                  padding: "5px 10px",
                  borderRadius: 999,
                  background: `${THEME.gold}10`,
                  border: `1px solid ${THEME.gold}18`,
                  fontSize: 17,
                  color: THEME.muted,
                  fontFamily: THEME.fontMono,
                }}
              >
                {item}
              </div>
            ))}
          </div>
        </div>

        {RESPONSIBILITY_BLOCKS.map((block, index) => {
          const progress = safeInterpolate(splitProgress, [0.18 + index * 0.08, 0.72 + index * 0.04], [0, 1]);
          return (
            <div
              key={block.label}
              style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                transform: `translate(calc(-50% + ${block.dx * progress}px), calc(-50% + ${block.dy * progress}px)) scale(${interpolate(progress, [0, 1], [0.7, 1])})`,
                opacity: interpolate(progress, [0, 0.2, 1], [0, 0.75, 1]),
                padding: "12px 18px",
                borderRadius: 12,
                background: `${THEME.surface}E6`,
                border: `1px solid ${block.color}28`,
                color: block.color,
                fontFamily: THEME.fontMono,
                fontSize: 24,
                whiteSpace: "nowrap",
              }}
            >
              {block.label}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
