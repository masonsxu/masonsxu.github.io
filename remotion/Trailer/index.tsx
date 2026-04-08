import React from "react";
import {
  AbsoluteFill,
  Sequence,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { ArchEvolution } from "../ArchEvolution";
import { ContributionHeatmap } from "../ContributionHeatmap";
import { DataLake } from "../DataLake";
import { OSSDashboard } from "../OSSDashboard";
import { TechCard } from "../TechCard";
import { BackgroundGlow, BrandFooter, GridOverlay, VignetteOverlay } from "../shared/components";
import { THEME } from "../shared/theme";
import { safeInterpolate, sec } from "../shared/utils";

const TRANSITION_DURATION = 12;

const TRAILER_SECTIONS = [
  {
    id: "identity",
    chapter: "Identity",
    title: "先建立技术身份，而不是先播放作品列表。",
    subtitle: "Go Backend · Distributed Systems · Cloud Native · Data Platform",
    durationInFrames: sec(6),
    accent: THEME.gold,
    clipStart: 0,
    Component: TechCard,
  },
  {
    id: "request-path",
    chapter: "Request Path",
    title: "把服务边界拆清楚，再让请求路径显式可追踪。",
    subtitle: "Hertz / Kitex / layered service / trace visibility",
    durationInFrames: sec(12),
    accent: THEME.lake.primary,
    clipStart: sec(4),
    Component: ArchEvolution,
  },
  {
    id: "data-path",
    chapter: "Data Path",
    title: "把数据从多源异构带进平台，再把计算路径讲明白。",
    subtitle: "ingestion / ETL / JOIN path / delivery loop",
    durationInFrames: sec(13),
    accent: THEME.lake.polars,
    clipStart: sec(4.5),
    Component: DataLake,
  },
  {
    id: "verified-contrib",
    chapter: "Verified Contributions",
    title: "真实贡献不是数量展示，而是具体问题域的外部证据。",
    subtitle: "CloudWeGo · JWT correctness · trace stability · Go toolchain",
    durationInFrames: sec(12),
    accent: THEME.lake.accent,
    clipStart: sec(2.4),
    Component: OSSDashboard,
  },
  {
    id: "long-term-track",
    chapter: "Long-term Track",
    title: "长期轨迹证明这些能力不是一次性事件。",
    subtitle: "52-week contribution timeline · milestone mapping",
    durationInFrames: sec(10),
    accent: THEME.lake.secondary,
    clipStart: sec(3.2),
    Component: ContributionHeatmap,
  },
  {
    id: "closing",
    chapter: "Closing Statement",
    title: "真实身份、真实机制、真实轨迹，共同构成技术画像。",
    subtitle: "Masons Xu · backend systems with explicit boundaries and observable paths",
    durationInFrames: sec(9),
    accent: THEME.gold,
  },
] as const;

export const Trailer: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill
      style={{
        backgroundColor: THEME.obsidian,
        fontFamily: THEME.fontSans,
        color: THEME.pearl,
        overflow: "hidden",
      }}
    >
      <BackgroundGlow top="12%" left="10%" size={560} />
      <BackgroundGlow color="rgba(79,195,247,0.045)" right="8%" bottom="10%" size={420} />
      <GridOverlay size={88} color="rgba(212,175,55,0.016)" />

      <TransitionSeries>
        {TRAILER_SECTIONS.map((section, index) => (
          <React.Fragment key={section.id}>
            <TransitionSeries.Sequence durationInFrames={section.durationInFrames}>
              {"Component" in section ? (
                <NarrativeSection section={section} />
              ) : (
                <ClosingSection section={section} />
              )}
            </TransitionSeries.Sequence>
            {index < TRAILER_SECTIONS.length - 1 && (
              <TransitionSeries.Transition
                presentation={fade()}
                timing={linearTiming({ durationInFrames: TRANSITION_DURATION })}
              />
            )}
          </React.Fragment>
        ))}
      </TransitionSeries>

      <ChapterRail frame={frame} />
      <FilmGrain frame={frame} />
      <VignetteOverlay strength={0.66} />
    </AbsoluteFill>
  );
};

type NarrativeSectionProps = {
  section: Extract<(typeof TRAILER_SECTIONS)[number], { Component: React.FC }>;
};

const NarrativeSection: React.FC<NarrativeSectionProps> = ({ section }) => {
  return (
    <AbsoluteFill>
      <Sequence from={-section.clipStart}>
        <section.Component />
      </Sequence>
      <SectionBridge
        chapter={section.chapter}
        title={section.title}
        subtitle={section.subtitle}
        accent={section.accent}
      />
    </AbsoluteFill>
  );
};

const SectionBridge: React.FC<{
  chapter: string;
  title: string;
  subtitle: string;
  accent: string;
}> = ({ chapter, title, subtitle, accent }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const intro = spring({ frame, fps, config: { damping: 200 }, durationInFrames: 20 });
  const fadeOut = safeInterpolate(frame, [Math.max(0, sec(1.8)), sec(3.2)], [1, 0]);
  const opacity = intro * fadeOut;

  return (
    <>
      <div
        style={{
          position: "absolute",
          top: 58,
          left: 74,
          padding: "10px 14px",
          borderRadius: 999,
          background: `${THEME.surfaceElevated}E6`,
          border: `1px solid ${accent}26`,
          opacity,
          transform: `translateY(${interpolate(intro, [0, 1], [14, 0])}px)`,
        }}
      >
        <span
          style={{
            fontSize: 11,
            color: accent,
            fontFamily: THEME.fontMono,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
          }}
        >
          {chapter}
        </span>
      </div>

      <div
        style={{
          position: "absolute",
          left: 74,
          bottom: 108,
          width: 760,
          padding: "18px 20px 16px",
          borderRadius: 18,
          background: "linear-gradient(135deg, rgba(17,17,19,0.9) 0%, rgba(22,22,24,0.74) 100%)",
          border: `1px solid ${accent}20`,
          boxShadow: `0 0 32px ${accent}10`,
          opacity,
          transform: `translateY(${interpolate(intro, [0, 1], [20, 0])}px)`,
        }}
      >
        <div style={{ fontSize: 26, color: THEME.pearl, fontWeight: 600, lineHeight: 1.35 }}>{title}</div>
        <div
          style={{
            marginTop: 10,
            fontSize: 12,
            color: THEME.muted,
            fontFamily: THEME.fontMono,
            letterSpacing: "0.08em",
            lineHeight: 1.7,
          }}
        >
          {subtitle}
        </div>
      </div>
    </>
  );
};

const ClosingSection: React.FC<{
  section: Extract<(typeof TRAILER_SECTIONS)[number], { id: "closing" }>;
}> = ({ section }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const intro = spring({ frame, fps, config: { damping: 200 }, durationInFrames: 24 });
  const summaryFade = safeInterpolate(frame, [0, sec(0.7)], [0, 1]);
  const statementFade = safeInterpolate(frame, [sec(1.6), sec(2.4)], [0, 1]);
  const footerFade = safeInterpolate(frame, [sec(3.2), sec(4.2)], [0, 1]);
  const finalFade = safeInterpolate(frame, [sec(7.6), sec(9)], [1, 0]);

  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(circle at center, rgba(212,175,55,0.12) 0%, rgba(12,12,14,0.92) 58%, rgba(12,12,14,1) 100%)",
        }}
      />

      <div
        style={{
          position: "absolute",
          top: 138,
          left: 0,
          right: 0,
          textAlign: "center",
          opacity: summaryFade * finalFade,
          transform: `translateY(${interpolate(intro, [0, 1], [20, 0])}px)`,
        }}
      >
        <div style={{ fontSize: 13, color: section.accent, fontFamily: THEME.fontMono, letterSpacing: "0.16em", textTransform: "uppercase" }}>
          {section.chapter}
        </div>
        <div style={{ marginTop: 20, fontSize: 34, fontWeight: 600, color: THEME.pearl, lineHeight: 1.4 }}>
          {section.title}
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          top: 410,
          left: 260,
          right: 260,
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
          gap: 16,
          opacity: statementFade * finalFade,
        }}
      >
        {[
          { title: "Identity", detail: "Go 后端、分布式系统、云原生与数据平台定位。", color: THEME.gold },
          { title: "Mechanism", detail: "围绕边界、路径与可解释性组织技术表达。", color: THEME.lake.primary },
          { title: "Evidence", detail: "用开源贡献与长期轨迹证明工程持续投入。", color: THEME.lake.secondary },
        ].map((item, index) => {
          const p = spring({
            frame,
            fps,
            config: { damping: 200 },
            delay: sec(1.8) + index * 5,
            durationInFrames: 18,
          });

          return (
            <div
              key={item.title}
              style={{
                opacity: p,
                transform: `translateY(${interpolate(p, [0, 1], [18, 0])}px)`,
                padding: "18px 18px 16px",
                borderRadius: 16,
                background: `${THEME.surfaceElevated}DE`,
                border: `1px solid ${item.color}26`,
              }}
            >
              <div style={{ fontSize: 12, color: item.color, fontFamily: THEME.fontMono, fontWeight: 600, letterSpacing: "0.08em" }}>
                {item.title}
              </div>
              <div style={{ marginTop: 12, fontSize: 12, color: THEME.muted, lineHeight: 1.72 }}>{item.detail}</div>
            </div>
          );
        })}
      </div>

      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 110,
          opacity: footerFade * finalFade,
        }}
      >
        <BrandFooter text="MASONS.XU · Explicit Boundaries / Observable Paths / Long-term Track" />
      </div>
    </AbsoluteFill>
  );
};

const ChapterRail: React.FC<{ frame: number }> = ({ frame }) => {
  let cursor = 0;

  return (
    <div
      style={{
        position: "absolute",
        top: 54,
        right: 70,
        display: "flex",
        gap: 8,
        alignItems: "center",
      }}
    >
      {TRAILER_SECTIONS.map((section) => {
        const start = cursor;
        const end = cursor + section.durationInFrames - 1;
        cursor += section.durationInFrames - TRANSITION_DURATION;
        const active = frame >= start && frame <= end;

        return (
          <div
            key={section.id}
            style={{
              width: section.id === "closing" ? 58 : 44,
              height: 6,
              borderRadius: 999,
              background: active ? section.accent : `${THEME.gold}18`,
              boxShadow: active ? `0 0 12px ${section.accent}35` : "none",
              transition: "none",
            }}
          />
        );
      })}
    </div>
  );
};

const FilmGrain: React.FC<{ frame: number }> = ({ frame }) => {
  const grainOpacity = 0.022 + (frame % 7) * 0.0025;

  return (
    <AbsoluteFill
      style={{
        pointerEvents: "none",
        opacity: grainOpacity,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        backgroundSize: "256px 256px",
        mixBlendMode: "overlay",
      }}
    />
  );
};
