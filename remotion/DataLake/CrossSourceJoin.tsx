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

const SOURCE_TABLES = [
  { id: "mysql-a", label: "MySQL\npatient_base", color: THEME.lake.mysql, x: 180, y: 380 },
  { id: "mysql-b", label: "MySQL\ndict_small", color: THEME.lake.mysql, x: 180, y: 570 },
  { id: "mongo", label: "MongoDB\nraw_document", color: THEME.lake.mongodb, x: 180, y: 760 },
] as const;

const PATH_NODES = [
  { label: "interface_code", x: 760, y: 420, color: THEME.gold },
  { label: "BFS path", x: 760, y: 570, color: THEME.gold },
  { label: "Trino", x: 1020, y: 420, color: THEME.lake.trino },
  { label: "Polars", x: 1020, y: 720, color: THEME.lake.polars },
  { label: "5-table LEFT JOIN", x: 1290, y: 570, color: THEME.gold },
  { label: "FieldCommon0", x: 1590, y: 570, color: THEME.lake.secondary },
] as const;

const PATH_EDGES = [
  [SOURCE_TABLES[0], PATH_NODES[1]],
  [SOURCE_TABLES[1], PATH_NODES[1]],
  [SOURCE_TABLES[2], PATH_NODES[1]],
  [PATH_NODES[0], PATH_NODES[1]],
  [PATH_NODES[1], PATH_NODES[2]],
  [PATH_NODES[1], PATH_NODES[3]],
  [PATH_NODES[2], PATH_NODES[4]],
  [PATH_NODES[3], PATH_NODES[4]],
  [PATH_NODES[4], PATH_NODES[5]],
] as const;

const ENGINE_FACTS = [
  { label: "Trino", detail: "小表查询 / SQL side", color: THEME.lake.trino },
  { label: "Polars", detail: "JSON parse / in-memory join", color: THEME.lake.polars },
] as const;

export const CrossSourceJoin: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const sceneFadeIn = safeInterpolate(frame, [0, sec(0.45)], [0, 1]);
  const sceneFadeOut = safeInterpolate(frame, [sec(5.3), sec(6)], [1, 0]);

  return (
    <AbsoluteFill style={{ opacity: sceneFadeIn * sceneFadeOut }}>
      <SceneHeader title="跨源 JOIN 路径求解" subtitle="BFS Path → Trino + Polars → FieldCommon0" frame={frame} fps={fps} delay={sec(0.1)} />
      <SourceTables frame={frame} fps={fps} />
      <GraphLayer frame={frame} fps={fps} />
      <EngineFacts frame={frame} fps={fps} />
      <JoinSummary frame={frame} fps={fps} />
    </AbsoluteFill>
  );
};

const SourceTables: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => (
  <>
    {SOURCE_TABLES.map((node, index) => {
      const progress = spring({
        frame,
        fps,
        config: { damping: 200 },
        delay: sec(0.45) + index * 6,
        durationInFrames: 18,
      });

      return (
        <div
          key={node.id}
          style={{
            position: "absolute",
            left: node.x,
            top: node.y,
            width: 210,
            padding: "18px 18px",
            borderRadius: 16,
            background: `${THEME.surfaceElevated}E2`,
            border: `1px solid ${node.color}28`,
            opacity: progress,
            transform: `translateY(${interpolate(progress, [0, 1], [16, 0])}px) scale(${interpolate(progress, [0, 1], [0.94, 1])})`,
          }}
        >
          <div style={{ fontSize: 15, color: node.color, fontWeight: 600, whiteSpace: "pre-line", lineHeight: 1.5 }}>{node.label}</div>
          <div style={{ marginTop: 8, fontSize: 11, color: THEME.muted, fontFamily: THEME.fontMono }}>
            {index < 2 ? "Trino small table side" : "JSON field extraction side"}
          </div>
        </div>
      );
    })}
  </>
);

const GraphLayer: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  return (
    <AbsoluteFill>
      <svg width="1920" height="1080" style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        {PATH_EDGES.map(([from, to], index) => {
          const startAt = sec(1.2) + index * 4;
          const progress = safeInterpolate(frame, [startAt, startAt + sec(0.55)], [0, 1], Easing.out(Easing.quad));
          const isSourceTable = "id" in (from as any);
          const x1 = (from as any).x + (isSourceTable ? 210 : 90);
          const y1 = (from as any).y + 40;
          const x2 = (to as any).x + 90;
          const y2 = (to as any).y + 40;
          const length = Math.hypot(x2 - x1, y2 - y1);
          const color = (to as any).color ?? THEME.gold;

          return (
            <React.Fragment key={`${index}-${x1}-${y1}-${x2}-${y2}`}>
              <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={`${THEME.gold}14`} strokeWidth={1} />
              <line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={color}
                strokeWidth={2}
                strokeDasharray={length}
                strokeDashoffset={interpolate(progress, [0, 1], [length, 0])}
                opacity={0.88}
              />
            </React.Fragment>
          );
        })}
      </svg>

      {PATH_NODES.map((node, index) => {
        const startAt = sec(1.0) + index * 6;
        const progress = spring({
          frame: frame - startAt,
          fps,
          config: { damping: 200 },
          durationInFrames: 18,
        });

        return (
          <div
            key={node.label}
            style={{
              position: "absolute",
              left: node.x,
              top: node.y,
              width: node.label === "5-table LEFT JOIN" || node.label === "FieldCommon0" ? 220 : 180,
              padding: "16px 18px",
              borderRadius: 16,
              background: `${THEME.surfaceElevated}E8`,
              border: `1px solid ${node.color}28`,
              opacity: progress,
              transform: `scale(${interpolate(progress, [0, 1], [0.92, 1])})`,
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 14, color: node.color, fontWeight: 600, fontFamily: THEME.fontMono }}>{node.label}</div>
            {node.label === "BFS path" && (
              <div style={{ marginTop: 8, fontSize: 11, color: THEME.muted }}>表关联图中搜索最优 JOIN 路径</div>
            )}
            {node.label === "5-table LEFT JOIN" && (
              <div style={{ marginTop: 8, fontSize: 11, color: THEME.muted }}>跨源字段汇总为统一结果集</div>
            )}
            {node.label === "FieldCommon0" && (
              <div style={{ marginTop: 8, fontSize: 11, color: THEME.muted }}>患者维度数据归一</div>
            )}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

const EngineFacts: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => (
  <div style={{ position: "absolute", right: 120, top: 310, display: "flex", flexDirection: "column", gap: 16, width: 300 }}>
    {ENGINE_FACTS.map((fact, index) => {
      const progress = spring({
        frame,
        fps,
        config: { damping: 200 },
        delay: sec(3.2) + index * 6,
        durationInFrames: 18,
      });

      return (
        <div
          key={fact.label}
          style={{
            opacity: progress,
            transform: `translateX(${interpolate(progress, [0, 1], [18, 0])}px)`,
            padding: "16px 18px",
            borderRadius: 16,
            background: `${THEME.surface}D8`,
            border: `1px solid ${fact.color}24`,
          }}
        >
          <div style={{ fontSize: 14, color: fact.color, fontWeight: 600, fontFamily: THEME.fontMono }}>{fact.label}</div>
          <div style={{ marginTop: 8, fontSize: 12, color: THEME.muted, lineHeight: 1.6 }}>{fact.detail}</div>
        </div>
      );
    })}
  </div>
);

const JoinSummary: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const progress = spring({
    frame,
    fps,
    config: { damping: 200 },
    delay: sec(4.4),
    durationInFrames: 18,
  });

  return (
    <div
      style={{
        position: "absolute",
        left: 1140,
        bottom: 70,
        opacity: progress,
        transform: `translateY(${interpolate(progress, [0, 1], [14, 0])}px)`,
        padding: "14px 18px",
        borderRadius: 14,
        background: `${THEME.surface}CC`,
        border: `1px solid ${THEME.gold}16`,
      }}
    >
      <div style={{ fontSize: 11, color: THEME.muted, fontFamily: THEME.fontMono, letterSpacing: "0.14em", textTransform: "uppercase" }}>
        join summary
      </div>
      <div style={{ marginTop: 10, fontSize: 13, color: THEME.pearl, lineHeight: 1.75 }}>
        BFS 负责找路径，Trino 负责取小表，Polars 负责解析 raw_document 并在内存中完成 5 表链式 LEFT JOIN。
      </div>
    </div>
  );
};

const SceneHeader: React.FC<{
  title: string;
  subtitle: string;
  frame: number;
  fps: number;
  delay?: number;
}> = ({ title, subtitle, frame, fps, delay = 0 }) => {
  const progress = spring({ frame, fps, config: { damping: 200 }, delay, durationInFrames: 20 });

  return (
    <div
      style={{
        position: "absolute",
        top: 120,
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
    </div>
  );
};