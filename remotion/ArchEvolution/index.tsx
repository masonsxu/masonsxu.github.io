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

/**
 * 场景编排 (25s = 750帧):
 * 0-4s    Python 单体 → 裂变动画
 * 4-9s    Go 微服务网格展开
 * 9-14s   DDD 四层架构
 * 14-19s  请求链路追踪
 * 19-25s  性能指标跳变 + 收尾
 */

export const ArchEvolution: React.FC = () => {
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

      <SceneHeader frame={frame} fps={fps} />

      {/* 阶段 1: 裂变 */}
      <MonolithFission frame={frame} fps={fps} />

      {/* 阶段 2: 微服务网格 */}
      <MicroserviceMesh frame={frame} fps={fps} />

      {/* 阶段 3: DDD 分层 */}
      <DDDLayers frame={frame} fps={fps} />

      {/* 阶段 4: 链路追踪 */}
      <RequestTracing frame={frame} fps={fps} />

      {/* 阶段 5: 性能指标 */}
      <PerformanceMetrics frame={frame} fps={fps} />
    </AbsoluteFill>
  );
};

/* ──── 背景 + 暗角 ──── */
const BackgroundGlow: React.FC = () => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    <div
      style={{
        position: "absolute",
        bottom: "20%",
        left: "20%",
        width: 500,
        height: 500,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(212,175,55,0.04) 0%, transparent 70%)",
        filter: "blur(100px)",
      }}
    />
  </AbsoluteFill>
);

const VignetteOverlay: React.FC = () => (
  <AbsoluteFill
    style={{
      pointerEvents: "none",
      background: "radial-gradient(ellipse at center, transparent 50%, rgba(12,12,14,0.6) 100%)",
    }}
  />
);

/* ──── 场景标题 ──── */
const SceneHeader: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const p = spring({ frame, fps, config: { damping: 200 }, durationInFrames: 20 });
  const fadeOut = safeInterpolate(frame, [sec(3), sec(4)], [1, 0]);

  return (
    <div
      style={{
        position: "absolute",
        top: 80,
        left: 80,
        opacity: p * fadeOut,
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
        架构演进历程
      </h2>
      <span style={{ fontSize: 14, color: THEME.muted, fontFamily: THEME.fontMono, letterSpacing: "0.1em" }}>
        Architecture Evolution: Python → Go Microservices
      </span>
    </div>
  );
};

/* ──── 阶段 1: Python 单体 → 裂变 ──── */
const MonolithFission: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const fadeIn = safeInterpolate(frame, [0, sec(0.5)], [0, 1]);
  const fadeOut = safeInterpolate(frame, [sec(3.5), sec(4.5)], [1, 0]);

  // 单体块 → 裂变进度
  const fissionProgress = safeInterpolate(frame, [sec(1.5), sec(3.5)], [0, 1]);

  // 裂变碎片位置
  const fragments = [
    { label: "Flask", dx: -280, dy: -150, color: THEME.lake.accent },
    { label: "MySQL", dx: -200, dy: 100, color: THEME.lake.mysql },
    { label: "MongoDB", dx: 100, dy: -200, color: THEME.lake.mongodb },
    { label: "Redis", dx: 250, dy: 50, color: THEME.lake.trino },
    { label: "Celery", dx: -50, dy: 180, color: THEME.lake.secondary },
  ];

  return (
    <AbsoluteFill style={{ opacity: fadeIn * fadeOut, pointerEvents: "none" }}>
      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}>
        {/* 中心单体块 */}
        <div
          style={{
            width: 200,
            height: 160,
            borderRadius: 16,
            background: `${THEME.surfaceElevated}DD`,
            border: `2px solid ${THEME.lake.accent}40`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            opacity: interpolate(fissionProgress, [0, 0.3, 0.6], [1, 1, 0]),
            transform: `scale(${interpolate(fissionProgress, [0, 0.3], [1, 1.1])})`,
          }}
        >
          <span style={{ fontSize: 24, fontFamily: THEME.fontMono, color: THEME.lake.accent, fontWeight: 700 }}>
            Python
          </span>
          <span style={{ fontSize: 12, color: THEME.muted }}>Monolith</span>
        </div>

        {/* 裂变碎片 */}
        {fragments.map((f, i) => {
          const fragP = safeInterpolate(fissionProgress, [0.2 + i * 0.08, 0.8 + i * 0.04], [0, 1]);
          const dx = f.dx * fragP;
          const dy = f.dy * fragP;
          const fragOpacity = interpolate(fragP, [0, 0.3, 1], [0, 0.8, 0.6]);
          const fragScale = interpolate(fragP, [0, 1], [0.5, 1]);

          return (
            <div
              key={f.label}
              style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(${fragScale})`,
                opacity: fragOpacity,
                padding: "12px 20px",
                borderRadius: 10,
                background: `${THEME.surfaceElevated}CC`,
                border: `1px solid ${f.color}30`,
                fontSize: 14,
                fontFamily: THEME.fontMono,
                color: f.color,
                fontWeight: 500,
                whiteSpace: "nowrap",
              }}
            >
              {f.label}
            </div>
          );
        })}

        {/* 箭头: Python → Go */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            opacity: interpolate(fissionProgress, [0.6, 0.8], [0, 1]),
          }}
        >
          <svg width="40" height="40" viewBox="0 0 40 40">
            <path d="M8 20H28M28 20L22 14M28 20L22 26" stroke={THEME.gold} strokeWidth="2" fill="none" />
          </svg>
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ──── 阶段 2: 微服务网格 ──── */
const MICRO_SERVICES = [
  { label: "Kitex RPC", x: 600, y: 300, color: THEME.gold },
  { label: "Hertz HTTP", x: 860, y: 300, color: THEME.gold },
  { label: "Auth", x: 1120, y: 300, color: THEME.lake.primary },
  { label: "User", x: 600, y: 460, color: THEME.lake.primary },
  { label: "Data", x: 860, y: 460, color: THEME.lake.primary },
  { label: "Workflow", x: 1120, y: 460, color: THEME.lake.primary },
  { label: "etcd", x: 860, y: 600, color: THEME.lake.trino },
];

const MICRO_EDGES: [number, number][] = [
  [0, 3], [0, 4], [1, 4], [1, 5], [2, 5], [3, 6], [4, 6], [5, 6],
];

const MicroserviceMesh: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const fadeIn = safeInterpolate(frame, [sec(4), sec(5)], [0, 1]);
  const fadeOut = safeInterpolate(frame, [sec(8.5), sec(9.5)], [1, 0]);

  return (
    <AbsoluteFill style={{ opacity: fadeIn * fadeOut, pointerEvents: "none" }}>
      {/* 标签 */}
      <div
        style={{
          position: "absolute",
          top: 200,
          left: 0,
          right: 0,
          textAlign: "center",
          opacity: fadeIn,
        }}
      >
        <span style={{ fontSize: 18, color: THEME.gold, fontFamily: THEME.fontMono, letterSpacing: "0.1em" }}>
          CloudWeGo Microservices
        </span>
      </div>

      {/* 边 */}
      <svg width="1920" height="1080" style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none" }}>
        {MICRO_EDGES.map(([fi, ti], i) => {
          const from = MICRO_SERVICES[fi];
          const to = MICRO_SERVICES[ti];
          const ep = safeInterpolate(frame, [sec(5) + i * 2, sec(6) + i * 2], [0, 1]);
          const len = Math.hypot(to.x - from.x, to.y - from.y);

          return (
            <line
              key={`e${i}`}
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              stroke={`${THEME.gold}20`}
              strokeWidth={1}
              strokeDasharray={len}
              strokeDashoffset={interpolate(ep, [0, 1], [len, 0])}
            />
          );
        })}
      </svg>

      {/* 节点 */}
      {MICRO_SERVICES.map((svc, i) => {
        const np = spring({
          frame,
          fps,
          config: { damping: 200 },
          delay: sec(5.5) + i * 4,
          durationInFrames: 20,
        });

        return (
          <div
            key={svc.label}
            style={{
              position: "absolute",
              left: svc.x - 55,
              top: svc.y - 20,
              width: 110,
              padding: "8px 10px",
              borderRadius: 8,
              background: `${THEME.surfaceElevated}DD`,
              border: `1px solid ${svc.color}30`,
              textAlign: "center",
              opacity: np,
              transform: `scale(${interpolate(np, [0, 1], [0.6, 1])})`,
            }}
          >
            <span style={{ fontSize: 12, fontFamily: THEME.fontMono, color: svc.color }}>{svc.label}</span>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

/* ──── 阶段 3: DDD 四层架构 ──── */
const DDD_LAYERS = [
  { label: "Handler", desc: "HTTP/RPC 入口", color: THEME.gold },
  { label: "Logic", desc: "业务逻辑层", color: THEME.lake.primary },
  { label: "DAL", desc: "数据访问层 · 仓储模式", color: THEME.lake.secondary },
  { label: "Model", desc: "领域模型 · Thrift IDL", color: THEME.lake.polars },
];

const DDDLayers: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const fadeIn = safeInterpolate(frame, [sec(9), sec(10)], [0, 1]);
  const fadeOut = safeInterpolate(frame, [sec(13.5), sec(14.5)], [1, 0]);

  return (
    <AbsoluteFill style={{ opacity: fadeIn * fadeOut }}>
      {/* 标题 */}
      <div
        style={{
          position: "absolute",
          top: 180,
          left: 0,
          right: 0,
          textAlign: "center",
        }}
      >
        <span style={{ fontSize: 22, color: THEME.gold, fontWeight: 600 }}>DDD 四层架构</span>
        <span style={{ display: "block", fontSize: 12, color: THEME.muted, fontFamily: THEME.fontMono, marginTop: 4 }}>
          Domain-Driven Design
        </span>
      </div>

      {/* 层级 */}
      <div
        style={{
          position: "absolute",
          top: 280,
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          flexDirection: "column",
          gap: 16,
          alignItems: "center",
        }}
      >
        {DDD_LAYERS.map((layer, i) => {
          const lp = spring({
            frame,
            fps,
            config: { damping: 200 },
            delay: sec(9.5) + i * 6,
            durationInFrames: 20,
          });

          const width = 500 - i * 40;

          return (
            <React.Fragment key={layer.label}>
              <div
                style={{
                  opacity: lp,
                  transform: `translateY(${interpolate(lp, [0, 1], [20, 0])}px)`,
                  width,
                  padding: "18px 24px",
                  borderRadius: 12,
                  background: `linear-gradient(135deg, ${layer.color}10, ${layer.color}05)`,
                  border: `1px solid ${layer.color}25`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span style={{ fontSize: 16, fontFamily: THEME.fontMono, color: layer.color, fontWeight: 600 }}>
                  {layer.label}
                </span>
                <span style={{ fontSize: 11, color: THEME.muted }}>{layer.desc}</span>
              </div>
              {/* 层间箭头 */}
              {i < DDD_LAYERS.length - 1 && (
                <div
                  style={{
                    opacity: lp,
                    color: `${THEME.gold}40`,
                    fontSize: 16,
                  }}
                >
                  ▼
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

/* ──── 阶段 4: 请求链路追踪 ──── */
const TRACE_SPANS = [
  { label: "HTTP /api/data", duration: 120, color: THEME.gold },
  { label: "Kitex RPC GetData", duration: 80, color: THEME.lake.primary },
  { label: "Auth Check", duration: 30, color: THEME.lake.secondary },
  { label: "DAL Query", duration: 60, color: THEME.lake.polars },
  { label: "Response", duration: 20, color: THEME.gold },
];

const RequestTracing: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const fadeIn = safeInterpolate(frame, [sec(14), sec(15)], [0, 1]);
  const fadeOut = safeInterpolate(frame, [sec(18.5), sec(19.5)], [1, 0]);

  return (
    <AbsoluteFill style={{ opacity: fadeIn * fadeOut }}>
      {/* 标题 */}
      <div style={{ position: "absolute", top: 160, left: 0, right: 0, textAlign: "center" }}>
        <span style={{ fontSize: 22, color: THEME.gold, fontWeight: 600 }}>分布式链路追踪</span>
        <span style={{ display: "block", fontSize: 12, color: THEME.muted, fontFamily: THEME.fontMono, marginTop: 4 }}>
          OpenTelemetry + Jaeger
        </span>
      </div>

      {/* 时间线 */}
      <div
        style={{
          position: "absolute",
          top: 280,
          left: 280,
          width: 1360,
        }}
      >
        {/* 时间轴标尺 */}
        <div
          style={{
            position: "relative",
            height: 1,
            background: `${THEME.gold}20`,
            marginBottom: 30,
          }}
        >
          {[0, 50, 100, 150, 200].map((ms) => (
            <div
              key={ms}
              style={{
                position: "absolute",
                left: `${(ms / 200) * 100}%`,
                top: -8,
                fontSize: 9,
                color: THEME.muted,
                fontFamily: THEME.fontMono,
              }}
            >
              {ms}ms
            </div>
          ))}
        </div>

        {/* Span 行 */}
        {TRACE_SPANS.map((span, i) => {
          const sp = spring({
            frame,
            fps,
            config: { damping: 200 },
            delay: sec(15) + i * 5,
            durationInFrames: 20,
          });

          // span bar 从左到右生长
          const barProgress = safeInterpolate(frame, [sec(15.2) + i * 5, sec(16.5) + i * 5], [0, 1]);
          const barWidth = (span.duration / 200) * 100;
          const barLeft = i === 0 ? 0 : (1 - span.duration / 200) * 50 * (i % 2 === 0 ? 1 : 0.5);

          return (
            <div
              key={span.label}
              style={{
                opacity: sp,
                transform: `translateX(${interpolate(sp, [0, 1], [-20, 0])}px)`,
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginBottom: 16,
              }}
            >
              <span style={{ width: 160, fontSize: 11, fontFamily: THEME.fontMono, color: THEME.muted, textAlign: "right" }}>
                {span.label}
              </span>
              <div
                style={{
                  width: `${barWidth * barProgress}%`,
                  height: 24,
                  borderRadius: 4,
                  background: `${span.color}25`,
                  border: `1px solid ${span.color}40`,
                  marginLeft: `${barLeft}%`,
                }}
              />
              <span style={{ fontSize: 10, fontFamily: THEME.fontMono, color: span.color }}>
                {Math.round(span.duration * barProgress)}ms
              </span>
            </div>
          );
        })}

        {/* 慢调用标记 */}
        <div
          style={{
            opacity: safeInterpolate(frame, [sec(17), sec(18)], [0, 1]),
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginTop: 20,
            padding: "8px 16px",
            borderRadius: 8,
            background: `${THEME.lake.accent}10`,
            border: `1px solid ${THEME.lake.accent}25`,
          }}
        >
          <span style={{ fontSize: 11, fontFamily: THEME.fontMono, color: THEME.lake.accent }}>
            {'>'} 100ms slow call → Warn level
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ──── 阶段 5: 性能指标 ──── */
const PERF_METRICS = [
  { before: "2.4s", after: "1.2s", label: "响应时间", improvement: "50%" },
  { before: "手动部署", after: "容器化", label: "部署方式", improvement: "87%" },
  { before: "单体", after: "10+ 微服务", label: "架构模式", improvement: "" },
  { before: "Python", after: "Go", label: "技术栈", improvement: "" },
];

const PerformanceMetrics: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const fadeIn = safeInterpolate(frame, [sec(19), sec(20)], [0, 1]);
  const fadeOut = safeInterpolate(frame, [sec(24), sec(25)], [1, 0]);

  return (
    <AbsoluteFill style={{ opacity: fadeIn * fadeOut }}>
      {/* 标题 */}
      <div style={{ position: "absolute", top: 160, left: 0, right: 0, textAlign: "center" }}>
        <span style={{ fontSize: 28, fontWeight: 600, background: THEME.goldGradient, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          性能跃迁
        </span>
      </div>

      {/* 指标卡片 */}
      <div
        style={{
          position: "absolute",
          top: 280,
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: 24,
        }}
      >
        {PERF_METRICS.map((m, i) => {
          const mp = spring({
            frame,
            fps,
            config: { damping: 200 },
            delay: sec(19.5) + i * 5,
            durationInFrames: 25,
          });

          return (
            <div
              key={m.label}
              style={{
                opacity: mp,
                transform: `translateY(${interpolate(mp, [0, 1], [30, 0])}px) scale(${interpolate(mp, [0, 1], [0.85, 1])})`,
                width: 200,
                padding: "24px 20px",
                borderRadius: 14,
                background: `${THEME.surfaceElevated}DD`,
                border: `1px solid ${THEME.gold}15`,
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: 12, color: THEME.muted, marginBottom: 12 }}>{m.label}</div>

              {/* Before → After */}
              <div style={{ fontSize: 13, color: THEME.muted, fontFamily: THEME.fontMono, textDecoration: "line-through", opacity: 0.6 }}>
                {m.before}
              </div>
              <div style={{ color: THEME.gold, margin: "6px 0", fontSize: 12 }}>↓</div>
              <div style={{ fontSize: 16, color: THEME.pearl, fontFamily: THEME.fontMono, fontWeight: 600 }}>
                {m.after}
              </div>

              {m.improvement && (
                <div
                  style={{
                    marginTop: 12,
                    fontSize: 22,
                    fontWeight: 700,
                    fontFamily: THEME.fontMono,
                    background: THEME.goldGradient,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  {m.improvement}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 底部品牌 */}
      <div
        style={{
          position: "absolute",
          bottom: 80,
          left: 0,
          right: 0,
          textAlign: "center",
          opacity: safeInterpolate(frame, [sec(22), sec(24)], [0, 1]),
        }}
      >
        <div style={{ height: 1, width: 80, margin: "0 auto 12px", background: THEME.goldDivider }} />
        <span style={{ fontSize: 13, color: THEME.muted, fontFamily: THEME.fontMono, letterSpacing: "0.1em" }}>
          MASONS.XU — Architecture Evolution
        </span>
        <div style={{ height: 1, width: 80, margin: "12px auto 0", background: THEME.goldDivider }} />
      </div>
    </AbsoluteFill>
  );
};
