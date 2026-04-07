import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";
import { THEME } from "../shared/theme";
import { safeInterpolate, sec } from "../shared/utils";

const ARCH_LAYERS = [
  {
    id: "source",
    label: "Sources",
    title: "多源输入",
    items: ["REST API", "MySQL", "MongoDB raw_document"],
    color: THEME.lake.primary,
    y: 260,
  },
  {
    id: "orchestrate",
    label: "Orchestration",
    title: "编排与规则",
    items: ["Airflow 3.1 DAG", "mapping_rules", "DictConfigParser"],
    color: THEME.lake.airflow,
    y: 390,
  },
  {
    id: "compute",
    label: "Compute & Query",
    title: "查询与计算",
    items: ["Iceberg", "Trino", "Polars", "BFS JOIN path"],
    color: THEME.lake.polars,
    y: 520,
  },
  {
    id: "delivery",
    label: "Delivery",
    title: "抽取与回传",
    items: ["two-stage extraction", "FieldCommon0 isolation", "api_payload callback"],
    color: THEME.lake.accent,
    y: 650,
  },
] as const;

const METRICS = [
  { value: "3", label: "数据源", color: THEME.gold },
  { value: "4", label: "ETL 阶段", color: THEME.gold },
  { value: "2", label: "抽取阶段", color: THEME.gold },
] as const;

export const LakeArchitecture: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const sceneFadeIn = safeInterpolate(frame, [0, sec(0.5)], [0, 1]);
  const sceneFadeOut = safeInterpolate(frame, [sec(5.3), sec(6)], [1, 0]);

  return (
    <AbsoluteFill style={{ opacity: sceneFadeIn * sceneFadeOut }}>
      <SceneHeader title="回传闭环与架构全景" subtitle="Delivery Loop & System Overview" frame={frame} fps={fps} delay={sec(0.1)} />
      <ArchitectureStack frame={frame} fps={fps} />
      <DeliveryLoop frame={frame} fps={fps} />
      <ClosingSummary frame={frame} fps={fps} />
    </AbsoluteFill>
  );
};

const ArchitectureStack: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => (
  <div style={{ position: "absolute", left: 100, top: 430, width: 940, display: "flex", flexDirection: "column", gap: 18 }}>
    {ARCH_LAYERS.map((layer, index) => {
      const progress = spring({
        frame,
        fps,
        config: { damping: 200 },
        delay: sec(0.45) + index * 6,
        durationInFrames: 18,
      });

      return (
        <div
          key={layer.id}
          style={{
            opacity: progress,
            transform: `translateX(${interpolate(progress, [0, 1], [-18, 0])}px)`,
            display: "grid",
            gridTemplateColumns: "180px 1fr",
            gap: 18,
            alignItems: "center",
          }}
        >
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 12, color: layer.color, fontFamily: THEME.fontMono, letterSpacing: "0.12em", textTransform: "uppercase" }}>{layer.label}</div>
            <div style={{ marginTop: 6, fontSize: 18, color: THEME.pearl, fontWeight: 600 }}>{layer.title}</div>
          </div>

          <div
            style={{
              padding: "14px 18px",
              borderRadius: 16,
              background: `${THEME.surfaceElevated}E4`,
              border: `1px solid ${layer.color}22`,
              display: "flex",
              gap: 10,
              flexWrap: "wrap",
            }}
          >
            {layer.items.map((item) => (
              <div
                key={item}
                style={{
                  padding: "8px 14px",
                  borderRadius: 16,
                  background: `${layer.color}12`,
                  border: `1px solid ${layer.color}22`,
                  fontSize: 12,
                  color: layer.color,
                  fontFamily: THEME.fontMono,
                }}
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      );
    })}
  </div>
);

const DeliveryLoop: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const progress = spring({
    frame,
    fps,
    config: { damping: 200 },
    delay: sec(2.1),
    durationInFrames: 18,
  });

  const loopLine = safeInterpolate(frame, [sec(2.5), sec(4.2)], [0, 1]);

  return (
    <div
      style={{
        position: "absolute",
        right: 110,
        top: 430,
        width: 640,
        height: 420,
        opacity: progress,
        transform: `translateX(${interpolate(progress, [0, 1], [18, 0])}px)`,
      }}
    >
      <div
        style={{
          padding: "20px 22px",
          borderRadius: 18,
          background: `${THEME.surfaceElevated}E8`,
          border: `1px solid ${THEME.lake.accent}22`,
        }}
      >
        <div style={{ fontSize: 11, color: THEME.muted, fontFamily: THEME.fontMono, letterSpacing: "0.14em", textTransform: "uppercase" }}>
          delivery loop
        </div>
        <div style={{ marginTop: 12, fontSize: 22, fontWeight: 600, color: THEME.pearl, lineHeight: 1.5 }}>
          数据湖不是终点，回到业务系统才形成完整闭环。
        </div>

        <div style={{ marginTop: 22, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {[
            { title: "基础字典", note: "first extraction stage" },
            { title: "癌种专属", note: "second extraction stage" },
            { title: "api_payload JSON", note: "batched REST callback" },
          ].map((item, index) => (
            <div
              key={item.title}
              style={{
                width: 168,
                padding: "16px 14px",
                borderRadius: 16,
                background: `${THEME.surface}CC`,
                border: `1px solid ${THEME.gold}14`,
              }}
            >
              <div style={{ fontSize: 15, color: index === 2 ? THEME.lake.accent : THEME.gold, fontWeight: 600 }}>{item.title}</div>
              <div style={{ marginTop: 8, fontSize: 11, color: THEME.muted, fontFamily: THEME.fontMono, lineHeight: 1.6 }}>{item.note}</div>
            </div>
          ))}
        </div>
      </div>

      <svg width="640" height="160" style={{ position: "absolute", left: 0, bottom: -10, pointerEvents: "none" }}>
        <path d="M90 60 C180 120, 280 120, 350 78 C420 38, 500 38, 570 84" stroke={`${THEME.gold}18`} strokeWidth={2} fill="none" />
        <path
          d="M90 60 C180 120, 280 120, 350 78 C420 38, 500 38, 570 84"
          stroke={THEME.gold}
          strokeWidth={2.5}
          fill="none"
          strokeDasharray={520}
          strokeDashoffset={interpolate(loopLine, [0, 1], [520, 0])}
          opacity={0.85}
        />
      </svg>
    </div>
  );
};

const ClosingSummary: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const progress = spring({
    frame,
    fps,
    config: { damping: 200 },
    delay: sec(4.2),
    durationInFrames: 18,
  });

  return (
    <div
      style={{
        position: "absolute",
        left: 110,
        right: 110,
        bottom: 48,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        opacity: progress,
        transform: `translateY(${interpolate(progress, [0, 1], [16, 0])}px)`,
      }}
    >
      <div>
        <div style={{ fontSize: 30, fontWeight: 600, background: THEME.goldGradient, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          从配置到回传，系统价值在闭环中成立
        </div>
        <div style={{ marginTop: 10, fontSize: 13, color: THEME.muted, fontFamily: THEME.fontMono, letterSpacing: "0.14em", textTransform: "uppercase" }}>
          config-driven / cross-source / delivery-oriented
        </div>
      </div>

      <div style={{ display: "flex", gap: 14 }}>
        {METRICS.map((metric) => (
          <div
            key={metric.label}
            style={{
              minWidth: 110,
              padding: "12px 14px",
              borderRadius: 14,
              background: `${THEME.surface}D2`,
              border: `1px solid ${THEME.gold}12`,
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 22, color: metric.color, fontWeight: 700, fontFamily: THEME.fontMono }}>{metric.value}</div>
            <div style={{ marginTop: 4, fontSize: 10, color: THEME.muted }}>{metric.label}</div>
          </div>
        ))}
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