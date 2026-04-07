import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { THEME } from "../shared/theme";
import { safeInterpolate, sec } from "../shared/utils";

const SERVICE_NODES = [
  { label: "Hertz Edge", x: 380, y: 520, color: THEME.gold, note: "HTTP ingress" },
  { label: "Auth Service", x: 760, y: 420, color: THEME.lake.primary, note: "identity & guard" },
  { label: "Kitex RPC", x: 760, y: 620, color: THEME.gold, note: "service call" },
  { label: "Domain Service", x: 1180, y: 420, color: THEME.lake.secondary, note: "use-case orchestration" },
  { label: "Data Service", x: 1180, y: 620, color: THEME.lake.polars, note: "query / persistence" },
] as const;

const PATHS = [
  { from: { x: 240, y: 520 }, to: { x: 380, y: 520 } },
  { from: { x: 380, y: 520 }, to: { x: 760, y: 420 } },
  { from: { x: 760, y: 420 }, to: { x: 760, y: 620 } },
  { from: { x: 760, y: 620 }, to: { x: 1180, y: 420 } },
  { from: { x: 1180, y: 420 }, to: { x: 1180, y: 620 } },
] as const;

export const ServicePathStage: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const fadeIn = safeInterpolate(frame, [0, sec(0.8)], [0, 1]);
  const fadeOut = safeInterpolate(frame, [sec(4.3), sec(5.5)], [1, 0]);
  const requestProgress = safeInterpolate(frame, [sec(1.1), sec(4.1)], [0, 1]);
  const noteProgress = spring({ frame, fps, config: { damping: 200 }, delay: sec(0.2), durationInFrames: 18 });

  const route = [
    { start: 0, end: 0.14, from: PATHS[0].from, to: PATHS[0].to },
    { start: 0.14, end: 0.36, from: PATHS[1].from, to: PATHS[1].to },
    { start: 0.36, end: 0.5, from: PATHS[2].from, to: PATHS[2].to },
    { start: 0.5, end: 0.78, from: PATHS[3].from, to: PATHS[3].to },
    { start: 0.78, end: 1, from: PATHS[4].from, to: PATHS[4].to },
  ] as const;

  const activeSegment = route.find((segment) => requestProgress <= segment.end) ?? route[route.length - 1];
  const localProgress = safeInterpolate(requestProgress, [activeSegment.start, activeSegment.end], [0, 1]);
  const tokenX = interpolate(localProgress, [0, 1], [activeSegment.from.x, activeSegment.to.x]);
  const tokenY = interpolate(localProgress, [0, 1], [activeSegment.from.y, activeSegment.to.y]);

  return (
    <AbsoluteFill style={{ opacity: fadeIn * fadeOut, pointerEvents: "none" }}>
      <div style={{ position: "absolute", top: 180, left: 0, right: 0, textAlign: "center", opacity: noteProgress }}>
        <div style={{ fontSize: 13, color: THEME.muted, fontFamily: THEME.fontMono, letterSpacing: "0.12em", textTransform: "uppercase" }}>
          explicit request path after service split
        </div>
        <div style={{ marginTop: 10, fontSize: 26, fontWeight: 600, color: THEME.pearl }}>
          请求不再埋在单体里，而是沿着 Hertz / Kitex 路径显式穿行。
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          right: 150,
          top: 230,
          padding: "10px 16px",
          borderRadius: 999,
          background: `${THEME.surface}D8`,
          border: `1px solid ${THEME.gold}18`,
          color: THEME.muted,
          fontSize: 12,
          fontFamily: THEME.fontMono,
        }}
      >
        etcd · service discovery
      </div>

      <svg width="1920" height="1080" style={{ position: "absolute", inset: 0 }}>
        {PATHS.map((path, index) => {
          const progress = safeInterpolate(frame, [sec(0.9) + index * 6, sec(1.5) + index * 6], [0, 1]);
          const length = Math.hypot(path.to.x - path.from.x, path.to.y - path.from.y);
          return (
            <g key={index}>
              <line x1={path.from.x} y1={path.from.y} x2={path.to.x} y2={path.to.y} stroke={`${THEME.gold}12`} strokeWidth={2} />
              <line
                x1={path.from.x}
                y1={path.from.y}
                x2={path.to.x}
                y2={path.to.y}
                stroke={THEME.gold}
                strokeWidth={2.5}
                strokeDasharray={length}
                strokeDashoffset={interpolate(progress, [0, 1], [length, 0])}
                opacity={0.9}
              />
            </g>
          );
        })}
      </svg>

      <div
        style={{
          position: "absolute",
          left: tokenX - 9,
          top: tokenY - 9,
          width: 18,
          height: 18,
          borderRadius: "50%",
          background: THEME.goldLight,
          boxShadow: `0 0 20px ${THEME.gold}`,
        }}
      />

      {SERVICE_NODES.map((node, index) => {
        const progress = spring({ frame, fps, config: { damping: 200 }, delay: sec(0.9) + index * 4, durationInFrames: 18 });
        return (
          <div
            key={node.label}
            style={{
              position: "absolute",
              left: node.x - 95,
              top: node.y - 42,
              width: 190,
              padding: "14px 16px",
              borderRadius: 14,
              background: `${THEME.surfaceElevated}E8`,
              border: `1px solid ${node.color}28`,
              opacity: progress,
              transform: `scale(${interpolate(progress, [0, 1], [0.86, 1])})`,
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 14, color: node.color, fontWeight: 600, fontFamily: THEME.fontMono }}>{node.label}</div>
            <div style={{ marginTop: 6, fontSize: 11, color: THEME.muted }}>{node.note}</div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
