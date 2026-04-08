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
// 1. 定义布局常量（放在组件外或 DataSourceFlow 开始处）
const START_TOP = 350; // 你刚才调整后的卡片容器顶部位置
const CARD_GAP = 26;   // 你的容器 gap
const CARD_HEIGHT = 142; // DataSourceCard 的大概高度（含 padding 和 margin）

// 计算卡片中心点： (第N个卡片的顶部 + 半个卡片高度)
const anchors = [
  START_TOP + CARD_HEIGHT / 2,
  START_TOP + CARD_HEIGHT + CARD_GAP + CARD_HEIGHT / 2,
  START_TOP + 2 * (CARD_HEIGHT + CARD_GAP) + CARD_HEIGHT / 2,
];
const DATA_SOURCES = [
  {
    id: "mysql",
    label: "MySQL",
    color: THEME.lake.mysql,
    icon: "M4 6h16v12H4V6zm1 1v10h14V7H5zm2 2h2v1H7v-1zm0 3h2v1H7v-1zm4-3h6v1h-6v-1zm0 3h6v1h-6v-1z",
    detail: "SSDictCursor streaming batches",
    note: "逐批读取，避免全量内存占用",
  },
  {
    id: "mongodb",
    label: "MongoDB",
    color: THEME.lake.mongodb,
    icon: "M12 2C8 2 8 6 8 8c0 2 1 3 2 4s1 2 1 4h2c0-2 0-3 1-4s2-2 2-4c0-2 0-6-4-6zm0 2c1 0 2 .5 2 2s-1 2.5-2 3c-1-.5-2-1.5-2-3s1-2 2-2zm-1 16h2v1h-2v-1zm0-2h2v1h-2v-1z",
    detail: "raw_document JSON schema-safe mode",
    note: "保留原始结构，规避 schema 推断风险",
  },
  {
    id: "api",
    label: "REST API",
    color: THEME.lake.api,
    icon: "M3 7l6-4 6 4v10l-6 4-6-4V7zm12 0l6-4 6 4v10l-6 4-6-4V7z",
    detail: "mapping_rules / business payload",
    note: "配置与业务语义共同进入流水线",
  },
] as const;

const LAKE_TARGETS = [
  { label: "PyIceberg Writer", color: THEME.gold },
  { label: "Iceberg Tables", color: THEME.lake.iceberg },
  { label: "Parquet + Schema Evolution", color: THEME.lake.parquet },
] as const;

export const DataSourceFlow: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const sceneFadeIn = safeInterpolate(frame, [0, sec(0.45)], [0, 1]);
  const sceneFadeOut = safeInterpolate(frame, [sec(4.8), sec(5.5)], [1, 0]);

  return (
    <AbsoluteFill style={{ opacity: sceneFadeIn * sceneFadeOut }}>
      <SceneHeader title="多源异构数据统一入湖" subtitle="Unified Multi-Source Ingestion" frame={frame} fps={fps} />

      <div
        style={{
          position: "absolute",
          top: 350,
          left: 90,
          display: "flex",
          flexDirection: "column",
          gap: 26,
        }}
      >
        {DATA_SOURCES.map((source, index) => (
          <DataSourceCard key={source.id} source={source} index={index} />
        ))}
      </div>

      <FlowLanes frame={frame} />
      <LakeCore frame={frame} fps={fps} />
      <TargetNotes frame={frame} fps={fps} />
    </AbsoluteFill>
  );
};

const DataSourceCard: React.FC<{
  source: typeof DATA_SOURCES[number];
  index: number;
}> = ({ source, index }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame,
    fps,
    config: { damping: 200 },
    delay: sec(0.25) + index * 8,
    durationInFrames: 22,
  });

  return (
    <div
      style={{
        width: 360,
        padding: "20px 22px",
        borderRadius: 18,
        background: `${THEME.surfaceElevated}DD`,
        border: `1px solid ${source.color}28`,
        opacity: progress,
        transform: `translateX(${interpolate(progress, [0, 1], [-18, 0])}px) scale(${interpolate(progress, [0, 1], [0.94, 1])})`,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: `${source.color}16`,
            border: `1px solid ${source.color}24`,
          }}
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill={source.color} opacity={0.85}>
            <path d={source.icon} />
          </svg>
        </div>
        <div>
          <div style={{ fontSize: 18, fontWeight: 600, color: source.color }}>{source.label}</div>
          <div style={{ fontSize: 12, color: THEME.muted, fontFamily: THEME.fontMono }}>{source.detail}</div>
        </div>
      </div>
      <div
        style={{
          marginTop: 14,
          fontSize: 12,
          color: THEME.muted,
          lineHeight: 1.7,
        }}
      >
        {source.note}
      </div>
    </div>
  );
};

const FlowLanes: React.FC<{ frame: number }> = ({ frame }) => {
  const anchors = [410, 555, 710];

  const startX = 450; // 卡片右边缘 (90 + 360)
  const targetX = 1070;
  const targetY = 555; // 对应右侧卡片中心

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <svg width="1920" height="1080" style={{ position: "absolute", inset: 0 }}>
        {DATA_SOURCES.map((source, index) => {
          const startY = anchors[index];
          const endX = targetX;
          const endY = targetY;
          const progress = safeInterpolate(frame, [sec(1.1) + index * sec(0.28), sec(2.9) + index * sec(0.28)], [0, 1], Easing.inOut(Easing.quad));
          const length = Math.hypot(endX - startX, endY - startY);

          return (
            <React.Fragment key={source.id}>
              <line x1={startX} y1={startY} x2={endX} y2={endY} stroke={`${source.color}18`} strokeWidth={2} />
              <line
                x1={startX}
                y1={startY}
                x2={endX}
                y2={endY}
                stroke={source.color}
                strokeWidth={3}
                strokeDasharray={length}
                strokeDashoffset={interpolate(progress, [0, 1], [length, 0])}
                opacity={0.85}
              />
            </React.Fragment>
          );
        })}
      </svg>

      {DATA_SOURCES.flatMap((source, sourceIndex) =>
        Array.from({ length: 5 }, (_, particleIndex) => {
          const delay = sec(1.05) + sourceIndex * sec(0.3) + particleIndex * 5;
          const progress = safeInterpolate(frame, [delay, delay + sec(1.05)], [0, 1], Easing.inOut(Easing.quad));
          if (progress <= 0 || progress >= 1) return null;

          const x = interpolate(progress, [0, 1], [startX + 20, targetX]); // 从右边缘开始
          const y = interpolate(progress, [0, 1], [anchors[sourceIndex], targetY]);
          const size = interpolate(progress, [0, 1], [7, 3]);

          return (
            <div
              key={`${source.id}-${particleIndex}`}
              style={{
                position: "absolute",
                left: x,
                top: y,
                width: size,
                height: size,
                borderRadius: "50%",
                background: source.color,
                opacity: interpolate(progress, [0, 0.2, 0.85, 1], [0, 0.85, 0.65, 0]),
                boxShadow: `0 0 10px ${source.color}AA`,
              }}
            />
          );
        }),
      )}
    </AbsoluteFill>
  );
};

const LakeCore: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const progress = spring({
    frame,
    fps,
    config: { damping: 200 },
    delay: sec(1.9),
    durationInFrames: 24,
  });

  return (
    <div
      style={{
        position: "absolute",
        left: 1070,
        top: 410,
        width: 520,
        padding: "28px 30px",
        borderRadius: 24,
        background: `linear-gradient(135deg, ${THEME.lake.iceberg}14, ${THEME.surfaceElevated}EE 50%, ${THEME.gold}08)`,
        border: `1.5px solid ${THEME.lake.iceberg}36`,
        opacity: progress,
        transform: `translateY(${interpolate(progress, [0, 1], [24, 0])}px) scale(${interpolate(progress, [0, 1], [0.95, 1])})`,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div
          style={{
            width: 62,
            height: 62,
            borderRadius: 18,
            background: `${THEME.lake.iceberg}18`,
            border: `1px solid ${THEME.lake.iceberg}30`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg width="34" height="34" viewBox="0 0 36 36" fill="none">
            <path d="M18 4L32 18L18 32L4 18L18 4Z" fill={THEME.lake.iceberg} opacity={0.18} stroke={THEME.lake.iceberg} strokeWidth={1.5} />
            <path d="M18 10L26 18L18 26L10 18L18 10Z" fill={THEME.lake.iceberg} opacity={0.45} />
          </svg>
        </div>
        <div>
          <div style={{ fontSize: 24, fontWeight: 600, color: THEME.lake.iceberg }}>Apache Iceberg</div>
          <div style={{ fontSize: 12, color: THEME.muted, fontFamily: THEME.fontMono }}>
            PyIceberg Writer / Parquet / Schema Evolution
          </div>
        </div>
      </div>

      <div style={{ marginTop: 18, display: "flex", gap: 12, flexWrap: "wrap" }}>
        {LAKE_TARGETS.map((target, index) => {
          const badgeProgress = spring({
            frame,
            fps,
            config: { damping: 200 },
            delay: sec(2.15) + index * 4,
            durationInFrames: 18,
          });

          return (
            <div
              key={target.label}
              style={{
                opacity: badgeProgress,
                transform: `scale(${interpolate(badgeProgress, [0, 1], [0.84, 1])})`,
                fontSize: 12,
                color: target.color,
                fontFamily: THEME.fontMono,
                padding: "8px 14px",
                borderRadius: 16,
                background: `${target.color}12`,
                border: `1px solid ${target.color}24`,
              }}
            >
              {target.label}
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: 18, display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 14 }}>
        {[
          { value: "3", label: "数据源" },
          { value: "Raw JSON", label: "Mongo mode" },
          { value: "Auto Add", label: "schema evolution" },
        ].map((stat) => (
          <div
            key={stat.label}
            style={{
              padding: "12px 10px",
              borderRadius: 14,
              background: `${THEME.surface}C8`,
              border: `1px solid ${THEME.gold}12`,
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 18, fontWeight: 700, fontFamily: THEME.fontMono, color: THEME.gold }}>{stat.value}</div>
            <div style={{ marginTop: 4, fontSize: 10, color: THEME.muted }}>{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

const TargetNotes: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const progress = spring({
    frame,
    fps,
    config: { damping: 200 },
    delay: sec(2.7),
    durationInFrames: 20,
  });

  return (
    <div
      style={{
        position: "absolute",
        left: 1110,
        bottom: 110,
        display: "flex",
        alignItems: "center",
        gap: 12,
        opacity: progress,
        transform: `translateY(${interpolate(progress, [0, 1], [16, 0])}px)`,
        padding: "14px 18px",
        borderRadius: 14,
        background: `${THEME.surface}CC`,
        border: `1px solid ${THEME.gold}16`,
      }}
    >
      <div style={{ width: 8, height: 8, borderRadius: "50%", background: THEME.gold, boxShadow: `0 0 10px ${THEME.gold}` }} />
      <span style={{ fontSize: 12, color: THEME.muted }}>
        多源异构输入被统一收束到 Iceberg 表，不在入湖阶段丢失业务语义。
      </span>
    </div>
  );
};

const SceneHeader: React.FC<{
  title: string;
  subtitle: string;
  frame: number;
  fps: number;
}> = ({ title, subtitle, frame, fps }) => {
  const titleProgress = spring({ frame, fps, config: { damping: 200 }, durationInFrames: 20 });

  return (
    <div
      style={{
        position: "absolute",
        top: 120,
        left: 80,
        opacity: titleProgress,
        transform: `translateY(${interpolate(titleProgress, [0, 1], [-15, 0])}px)`,
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