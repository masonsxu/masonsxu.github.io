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

const ETL_STEPS = [
  {
    id: "config",
    label: "配置同步",
    labelEn: "Config Sync",
    desc: "mapping_rules 下发\ninterface_code = source@table@field",
    color: THEME.gold,
  },
  {
    id: "parser",
    label: "规则解析",
    labelEn: "DictConfigParser",
    desc: "字段映射拆解\n生成 UNION ALL / JOIN 语义",
    color: THEME.lake.airflow,
  },
  {
    id: "dag",
    label: "执行编排",
    labelEn: "Airflow 3.1 DAG",
    desc: "按阶段调度\n串起入湖 / 抽取 / 回传",
    color: THEME.lake.primary,
  },
  {
    id: "delivery",
    label: "结果交付",
    labelEn: "Delivery",
    desc: "两阶段抽取\napi_payload JSON callback",
    color: THEME.lake.accent,
  },
] as const;

const CONFIG_LINES = [
  "mapping_rules[]",
  "interface_code: mysql@patient@id",
  "interface_code: mongo@raw_document@diagnosis",
  "interface_code: api@payload@field_common_0",
] as const;

const SQL_TOKENS = ["UNION ALL", "JOIN", "SELECT", "DAG", "api_payload"] as const;

export const EtlPipeline: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const sceneFadeIn = safeInterpolate(frame, [0, sec(0.45)], [0, 1]);
  const sceneFadeOut = safeInterpolate(frame, [sec(5.8), sec(6.5)], [1, 0]);

  return (
    <AbsoluteFill style={{ opacity: sceneFadeIn * sceneFadeOut }}>
      <SceneHeader title="配置驱动 ETL 流水线" subtitle="Config → Parse → DAG → Delivery" frame={frame} fps={fps} delay={sec(0.1)} />
      <AirflowBadge frame={frame} fps={fps} />
      <ConfigBoard frame={frame} fps={fps} />
      <PipelineRail frame={frame} fps={fps} />
      <ExecutionTokens frame={frame} fps={fps} />
    </AbsoluteFill>
  );
};

const AirflowBadge: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const progress = spring({
    frame,
    fps,
    config: { damping: 200 },
    delay: sec(0.15),
    durationInFrames: 18,
  });

  return (
    <div
      style={{
        position: "absolute",
        top: 130,
        right: 88,
        opacity: progress,
        transform: `scale(${interpolate(progress, [0, 1], [0.84, 1])})`,
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "8px 16px",
        borderRadius: 18,
        background: `${THEME.lake.airflow}16`,
        border: `1px solid ${THEME.lake.airflow}32`,
      }}
    >
      <div style={{ width: 8, height: 8, borderRadius: "50%", background: THEME.lake.airflow, boxShadow: `0 0 10px ${THEME.lake.airflow}90` }} />
      <span style={{ fontSize: 12, color: THEME.lake.airflow, fontFamily: THEME.fontMono }}>Airflow 3.1 DAG</span>
    </div>
  );
};

const ConfigBoard: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const progress = spring({
    frame,
    fps,
    config: { damping: 200 },
    delay: sec(0.45),
    durationInFrames: 22,
  });

  return (
    <div
      style={{
        position: "absolute",
        left: 110,
        top: 380,
        width: 460,
        padding: "20px 22px",
        borderRadius: 18,
        background: `${THEME.surfaceElevated}E8`,
        border: `1px solid ${THEME.gold}18`,
        opacity: progress,
        transform: `translateY(${interpolate(progress, [0, 1], [18, 0])}px)`,
      }}
    >
      <div style={{ fontSize: 11, color: THEME.muted, fontFamily: THEME.fontMono, letterSpacing: "0.14em", textTransform: "uppercase" }}>
        config payload
      </div>
      <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 8 }}>
        {CONFIG_LINES.map((line, index) => {
          const lineProgress = spring({
            frame,
            fps,
            config: { damping: 200 },
            delay: sec(0.65) + index * 4,
            durationInFrames: 18,
          });

          return (
            <div
              key={line}
              style={{
                opacity: lineProgress,
                transform: `translateX(${interpolate(lineProgress, [0, 1], [-10, 0])}px)`,
                fontSize: 14,
                color: index === 0 ? THEME.gold : THEME.pearl,
                fontFamily: THEME.fontMono,
                lineHeight: 1.6,
              }}
            >
              {line}
            </div>
          );
        })}
      </div>
      <div style={{ marginTop: 16, fontSize: 12, color: THEME.muted, lineHeight: 1.7 }}>
        配置不是静态标签，而是后续 SQL 语义、字段映射与 DAG 编排的输入源。
      </div>
    </div>
  );
};

const PipelineRail: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  return (
    <div
      style={{
        position: "absolute",
        left: 620,
        right: 110,
        top: 440,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      {ETL_STEPS.map((step, index) => {
        const startAt = sec(1.2) + index * sec(0.65);
        const progress = spring({
          frame: frame - startAt,
          fps,
          config: { damping: 200 },
          durationInFrames: 18,
        });
        const active = safeInterpolate(frame, [startAt, startAt + sec(0.4), startAt + sec(0.95), startAt + sec(1.2)], [0.2, 1, 1, 0.25]);

        return (
          <React.Fragment key={step.id}>
            <div
              style={{
                width: 220,
                minHeight: 220,
                padding: "22px 18px",
                borderRadius: 18,
                background: `${THEME.surfaceElevated}E6`,
                border: `1.5px solid ${step.color}${Math.round(interpolate(active, [0, 1], [40, 140])).toString(16).padStart(2, "0")}`,
                boxShadow: `0 0 ${interpolate(active, [0, 1], [0, 16])}px ${step.color}22`,
                opacity: progress,
                transform: `translateY(${interpolate(progress, [0, 1], [16, 0])}px) scale(${interpolate(progress, [0, 1], [0.95, 1])})`,
              }}
            >
              <div style={{ fontSize: 11, color: THEME.muted, fontFamily: THEME.fontMono }}>Step {index + 1}</div>
              <div style={{ marginTop: 12, fontSize: 18, fontWeight: 600, color: step.color }}>{step.label}</div>
              <div style={{ marginTop: 6, fontSize: 11, color: THEME.muted, fontFamily: THEME.fontMono }}>{step.labelEn}</div>
              <div style={{ marginTop: 14, fontSize: 12, color: THEME.pearl, lineHeight: 1.7, whiteSpace: "pre-line" }}>{step.desc}</div>
            </div>

            {index < ETL_STEPS.length - 1 && (
              <div style={{ width: 60, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ width: 34, height: 2, background: `${THEME.gold}${Math.round(interpolate(active, [0, 1], [60, 180])).toString(16).padStart(2, "0")}` }} />
                <svg width="12" height="12" viewBox="0 0 12 12" fill={THEME.gold} style={{ opacity: active }}>
                  <path d="M0 2L8 6L0 10V2Z" />
                </svg>
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

const ExecutionTokens: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  return (
    <div
      style={{
        position: "absolute",
        left: 720,
        bottom: 90,
        display: "flex",
        gap: 12,
        flexWrap: "wrap",
        maxWidth: 980,
      }}
    >
      {SQL_TOKENS.map((token, index) => {
        const progress = spring({
          frame,
          fps,
          config: { damping: 200 },
          delay: sec(3.8) + index * 4,
          durationInFrames: 16,
        });

        return (
          <div
            key={token}
            style={{
              opacity: progress,
              transform: `scale(${interpolate(progress, [0, 1], [0.84, 1])})`,
              padding: "8px 14px",
              borderRadius: 16,
              background: `${THEME.gold}10`,
              border: `1px solid ${THEME.gold}22`,
              color: THEME.goldLight,
              fontSize: 12,
              fontFamily: THEME.fontMono,
            }}
          >
            {token}
          </div>
        );
      })}
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