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
 * 场景编排 (20s = 600帧):
 * 0-3s    星空粒子漂浮
 * 3-6s    热力图方格逐列生长
 * 6-10s   流星击中涟漪扩散
 * 10-14s  成就标签叠加
 * 14-18s  全景贡献墙
 * 18-20s  收尾淡出
 *
 * 数据来源: gh api graphql — masonsxu 真实贡献数据 (2025-04 ~ 2026-04)
 */

// ── 真实贡献数据 (2025-04-06 ~ 2026-04-06, 共 52 周) ──
// 每周 7 天 (Sun=0..Sat=6)，值为 contributionCount
const REAL_HEATMAP: number[][] = [
  // 2025 W15-W22 (大部分为 0)
  [0,0,0,0,0,0,0], [0,0,0,0,0,0,0], [0,0,0,0,0,0,0], [0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0], [0,0,0,0,0,0,0], [0,0,0,0,0,2,0],
  // W22-W30
  [0,0,0,0,0,0,0], [0,0,0,0,0,0,0], [0,0,0,0,0,0,0], [0,0,0,0,0,0,0],
  [12,0,0,5,13,0,0], [0,0,0,0,0,0,0], [0,0,0,0,0,0,0],
  // W31-W34 (2025-08 burst)
  [0,0,0,0,0,26,9], [1,1,0,0,0,0,1], [0,0,0,0,0,0,0], [0,0,0,0,0,0,0],
  // W35-W39 (2025-09 abcoder PR)
  [0,0,0,0,0,0,0], [0,0,0,3,0,1,0], [0,0,0,0,1,0,1], [1,0,0,0,0,0,0],
  [0,0,0,0,0,0,0],
  // W40-W48
  [0,0,0,0,0,0,0], [0,0,0,0,0,0,0], [0,0,0,0,0,0,0], [0,0,1,0,0,0,0],
  [0,0,0,0,0,0,0], [0,0,0,0,0,0,0], [0,0,0,0,0,0,0], [0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0],
  // W49-W52 (2025-12 jwt PRs burst)
  [0,0,0,0,2,0,3], [0,4,0,0,4,4,0], [6,2,6,8,4,0,0], [3,3,4,0,0,0,0],
  // 2026 W1-W4
  [0,0,0,0,0,0,0], [1,1,0,1,0,0,0], [0,3,0,0,0,3,1], [0,0,0,0,0,0,0],
  // 2026 W5-W8
  [0,0,10,0,1,0,1], [1,1,2,12,0,1,0], [0,0,0,0,0,0,0], [0,0,0,0,0,0,2],
  // 2026 W9-W12 (大爆发)
  [15,10,4,10,6,3,1], [0,8,0,5,8,0,11], [2,7,19,6,7,3,0],
  [10,3,0,5,0,3,25],
  // 2026 W13-W15
  [22,18,27,3,2,17,5], [6,9,17,22,5,11,1], [12,0,0,0,0,0,0],
];

const COLS = REAL_HEATMAP.length; // 52
const ROWS = 7;
const CELL_SIZE = 25;
const CELL_GAP = 3;
const GRID_LEFT = 280;
const GRID_TOP = 400;

// 热力图颜色梯度
const HEAT_COLORS = [
  THEME.surface,
  `${THEME.gold}18`,
  `${THEME.gold}35`,
  `${THEME.gold}60`,
  THEME.gold,
];

function getHeatLevel(count: number): number {
  if (count === 0) return 0;
  if (count <= 2) return 1;
  if (count <= 5) return 2;
  if (count <= 10) return 3;
  return 4;
}

// 统计数据
const TOTAL_CONTRIBUTIONS = REAL_HEATMAP.flat().reduce((a, b) => a + b, 0);
const STREAK_DAYS = (() => {
  const all = REAL_HEATMAP.flat();
  let max = 0, cur = 0;
  for (const c of all) { if (c > 0) { cur++; max = Math.max(max, cur); } else { cur = 0; } }
  return max;
})();

// 流星击中点 — 选取贡献高峰日并绑定语义事件
const METEOR_HITS = [
  {
    col: 14,
    row: 5,
    time: sec(6),
    title: "2025-08 高峰提交",
    note: "一波集中提交把贡献墙首次点亮。",
    color: THEME.gold,
  },
  {
    col: 35,
    row: 3,
    time: sec(7),
    title: "CloudWeGo 合并窗口",
    note: "开源贡献进入可见的 merged PR 节奏。",
    color: THEME.lake.primary,
  },
  {
    col: 42,
    row: 2,
    time: sec(8),
    title: "2026-03 密集活跃",
    note: "高频提交把年度热力图推到峰值区间。",
    color: THEME.lake.secondary,
  },
  {
    col: 44,
    row: 6,
    time: sec(9),
    title: "项目里程碑推进",
    note: "贡献高峰与个人项目沉淀同步出现。",
    color: THEME.lake.accent,
  },
] as const;

// 事实卡 — 区分数据事实与项目事实
const ACHIEVEMENTS = [
  {
    title: `${TOTAL_CONTRIBUTIONS}`,
    label: "Total Contributions",
    detail: "基于真实 52 周 contribution matrix 统计",
    color: THEME.gold,
    delay: sec(10),
  },
  {
    title: `${STREAK_DAYS} 天`,
    label: "Longest Streak",
    detail: "连续贡献轨迹形成稳定投入窗口",
    color: THEME.lake.secondary,
    delay: sec(10.5),
  },
  {
    title: "CloudWeGo",
    label: "Merged PR Context",
    detail: "热力图中的高峰窗口与开源贡献叙事互相印证",
    color: THEME.lake.primary,
    delay: sec(11),
  },
  {
    title: "Demo Repo",
    label: "Project Track",
    detail: "个人项目与开源贡献共同构成长期技术轨迹",
    color: THEME.lake.accent,
    delay: sec(11.5),
  },
] as const;

export const ContributionHeatmap: React.FC = () => {
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
      <StarField frame={frame} fps={fps} />
      <VignetteOverlay />

      <SceneHeader frame={frame} fps={fps} />
      <HeatmapGrid frame={frame} fps={fps} />
      <MeteorRipples frame={frame} fps={fps} />
      <AchievementLabels frame={frame} fps={fps} />
      <BrandFooter frame={frame} fps={fps} />
    </AbsoluteFill>
  );
};

/* ──── 星空粒子 ──── */
const StarField: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const stars = React.useMemo(() =>
    Array.from({ length: 50 }, (_, i) => ({
      x: (i * 37.7) % 1920,
      y: (i * 53.3) % 1080,
      size: 1 + (i % 3),
      speed: 0.3 + (i % 5) * 0.1,
    })),
    []);

  const fadeOut = safeInterpolate(frame, [sec(4), sec(5.5)], [1, 0]);

  return (
    <AbsoluteFill style={{ opacity: fadeOut, pointerEvents: "none" }}>
      {stars.map((star, i) => {
        const twinkle = interpolate(
          frame % (fps * 2 * star.speed),
          [0, fps * star.speed, fps * 2 * star.speed],
          [0.2, 0.7, 0.2],
        );
        const floatY = interpolate(frame % (fps * 4), [0, fps * 4], [0, -20]);

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: star.x,
              top: star.y + floatY,
              width: star.size,
              height: star.size,
              borderRadius: "50%",
              background: THEME.gold,
              opacity: twinkle * 0.5,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

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
  const fadeOut = safeInterpolate(frame, [sec(14), sec(15)], [1, 0]);

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
          fontSize: 32,
          fontWeight: 600,
          margin: 0,
          background: THEME.goldGradient,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        GitHub 贡献热力图
      </h2>
      <span style={{ fontSize: 13, color: THEME.muted, fontFamily: THEME.fontMono, letterSpacing: "0.1em" }}>
        Real 52-Week Contribution Timeline · masonsxu
      </span>
      <div style={{ marginTop: 10, fontSize: 12, color: THEME.muted, lineHeight: 1.6 }}>
        基于真实 GitHub contribution matrix，展示 2025-04 至 2026-04 的持续贡献轨迹与里程碑高峰。
      </div>
    </div>
  );
};

/* ──── 热力图网格 ── ─*/
const HeatmapGrid: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const fadeIn = safeInterpolate(frame, [sec(2.5), sec(3.5)], [0, 1]);
  const growthEnd = safeInterpolate(frame, [sec(3), sec(6)], [0, COLS]);

  return (
    <div style={{ position: "absolute", left: GRID_LEFT, top: GRID_TOP, opacity: fadeIn }}>
      {/* 月份标签 */}
      <div style={{ display: "flex", marginBottom: 8, paddingLeft: 20 }}>
        {["Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar"].map((m) => (
          <span
            key={m}
            style={{
              width: (CELL_SIZE + CELL_GAP) * (COLS / 12),
              fontSize: 9,
              color: THEME.muted,
              fontFamily: THEME.fontMono,
            }}
          >
            {m}
          </span>
        ))}
      </div>

      {/* 网格 */}
      <div style={{ display: "flex", gap: CELL_GAP }}>
        {REAL_HEATMAP.map((col, c) => {
          const colOpacity = interpolate(growthEnd, [c - 1, c], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });

          return (
            <div key={c} style={{ display: "flex", flexDirection: "column", gap: CELL_GAP, opacity: colOpacity }}>
              {col.map((count, r) => {
                const level = getHeatLevel(count);

                // 贡献日发光效果
                const isHigh = count >= 10;
                const glowOpacity = isHigh ? interpolate(
                  frame % (fps * 3),
                  [0, fps * 1.5, fps * 3],
                  [0, 0.3, 0],
                ) : 0;

                return (
                  <div
                    key={r}
                    style={{
                      width: CELL_SIZE,
                      height: CELL_SIZE,
                      borderRadius: 2,
                      background: HEAT_COLORS[level],
                      boxShadow: isHigh ? `0 0 6px ${THEME.gold}${Math.round(glowOpacity * 255).toString(16).padStart(2, "0")}` : "none",
                    }}
                  />
                );
              })}
            </div>
          );
        })}
      </div>

      {/* 图例 */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 12, marginLeft: 20 }}>
        <span style={{ fontSize: 9, color: THEME.muted, fontFamily: THEME.fontMono }}>Less</span>
        {HEAT_COLORS.map((c, i) => (
          <div key={i} style={{ width: CELL_SIZE, height: CELL_SIZE, borderRadius: 2, background: c }} />
        ))}
        <span style={{ fontSize: 9, color: THEME.muted, fontFamily: THEME.fontMono }}>More</span>
      </div>

      <div
        style={{
          marginTop: 16,
          marginLeft: 20,
          display: "flex",
          alignItems: "center",
          gap: 10,
          color: THEME.muted,
          fontSize: 11,
          fontFamily: THEME.fontMono,
        }}
      >
        <span>52 weeks</span>
        <div style={{ width: 1, height: 10, background: `${THEME.gold}22` }} />
        <span>{TOTAL_CONTRIBUTIONS} total</span>
        <div style={{ width: 1, height: 10, background: `${THEME.gold}22` }} />
        <span>{STREAK_DAYS}d streak</span>
      </div>
    </div>
  );
};

/* ──── 流星涟漪 ──── */
const MeteorRipples: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const activeHits = METEOR_HITS.filter((hit) => hit.col < COLS && hit.row < ROWS).map((hit) => {
    const elapsed = frame - hit.time;
    if (elapsed < 0) return null;

    const progress = safeInterpolate(elapsed, [0, sec(1.5)], [0, 1]);
    const x = GRID_LEFT + hit.col * (CELL_SIZE + CELL_GAP) + CELL_SIZE / 2;
    const y = GRID_TOP + 28 + hit.row * (CELL_SIZE + CELL_GAP) + CELL_SIZE / 2;
    const radius = progress * 40;
    const opacity = interpolate(progress, [0, 0.3, 1], [0.8, 0.6, 0]);

    return { ...hit, x, y, radius, opacity, elapsed, key: `${hit.col}-${hit.row}` };
  }).filter(Boolean) as (typeof METEOR_HITS[number] & { x: number; y: number; radius: number; opacity: number; elapsed: number; key: string })[];

  return (
    <>
      <svg width="1920" height="1080" style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none" }}>
        {activeHits.map((r) => (
          <circle
            key={r.key}
            cx={r.x}
            cy={r.y}
            r={r.radius}
            fill="none"
            stroke={r.color}
            strokeWidth={1.5}
            opacity={r.opacity}
          />
        ))}
      </svg>

      {activeHits.map((hit) => {
        const cardProgress = safeInterpolate(hit.elapsed, [sec(0.2), sec(0.8)], [0, 1]);
        if (cardProgress <= 0) return null;

        const isRightSide = hit.col > COLS / 2;
        return (
          <div
            key={`${hit.key}-card`}
            style={{
              position: "absolute",
              left: isRightSide ? hit.x - 320 : hit.x + 26,
              top: hit.y - 28,
              width: 280,
              padding: "12px 14px",
              borderRadius: 12,
              background: `${THEME.surfaceElevated}EE`,
              border: `1px solid ${hit.color}28`,
              opacity: cardProgress,
              transform: `translateY(${interpolate(cardProgress, [0, 1], [8, 0])}px)`,
              pointerEvents: "none",
            }}
          >
            <div style={{ fontSize: 12, color: hit.color, fontFamily: THEME.fontMono, fontWeight: 600 }}>{hit.title}</div>
            <div style={{ marginTop: 6, fontSize: 12, color: THEME.muted, lineHeight: 1.65 }}>{hit.note}</div>
          </div>
        );
      })}
    </>
  );
};

/* ──── 成就标签 ──── */
const AchievementLabels: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const fadeIn = safeInterpolate(frame, [sec(10), sec(11)], [0, 1]);
  const fadeOut = safeInterpolate(frame, [sec(17), sec(18)], [1, 0]);

  return (
    <div
      style={{
        position: "absolute",
        left: 150,
        right: 150,
        bottom: 155,
        display: "grid",
        gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
        gap: 14,
        opacity: fadeIn * fadeOut,
      }}
    >
      {ACHIEVEMENTS.map((a) => {
        const ap = spring({
          frame,
          fps,
          config: { damping: 200 },
          delay: a.delay,
          durationInFrames: 20,
        });

        return (
          <div
            key={a.label}
            style={{
              opacity: ap,
              transform: `translateY(${interpolate(ap, [0, 1], [15, 0])}px) scale(${interpolate(ap, [0, 1], [0.86, 1])})`,
              padding: "16px 16px 14px",
              borderRadius: 14,
              background: `${THEME.surfaceElevated}E8`,
              border: `1px solid ${a.color}25`,
            }}
          >
            <div style={{ fontSize: 20, fontFamily: THEME.fontMono, color: a.color, fontWeight: 700 }}>{a.title}</div>
            <div style={{ marginTop: 6, fontSize: 11, color: THEME.muted, fontFamily: THEME.fontMono, letterSpacing: "0.08em" }}>{a.label}</div>
            <div style={{ marginTop: 10, fontSize: 11, color: THEME.muted, lineHeight: 1.6 }}>{a.detail}</div>
          </div>
        );
      })}
    </div>
  );
};

/* ──── 底部品牌 ──── */
const BrandFooter: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const p = spring({ frame, fps, config: { damping: 200 }, delay: sec(16), durationInFrames: 20 });
  const fadeOut = safeInterpolate(frame, [sec(19), sec(20)], [1, 0]);

  return (
    <div
      style={{
        position: "absolute",
        bottom: 80,
        left: 0,
        right: 0,
        textAlign: "center",
        opacity: interpolate(p, [0, 1], [0, 1]) * fadeOut,
      }}
    >
      <div style={{ height: 1, width: 80, margin: "0 auto 12px", background: THEME.goldDivider }} />
      <span style={{ fontSize: 13, color: THEME.muted, fontFamily: THEME.fontMono, letterSpacing: "0.1em" }}>
        MASONS.XU — GitHub Contributions
      </span>
    </div>
  );
};
