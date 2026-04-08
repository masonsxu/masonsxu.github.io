import React, { useState, useCallback } from "react";
import { Player } from "@remotion/player";
import { ScrollReveal, SectionLabel } from "../ScrollReveal";
import { TechCard } from "../../../remotion/TechCard";
import { OSSDashboard } from "../../../remotion/OSSDashboard";
import { ArchEvolution } from "../../../remotion/ArchEvolution";
import { ContributionHeatmap } from "../../../remotion/ContributionHeatmap";
import { DataLake } from "../../../remotion/DataLake";
import { Trailer } from "../../../remotion/Trailer";
import { VIDEO } from "../../../remotion/shared/theme";

type VideoConfig = {
  title: string;
  titleEn: string;
  desc: string;
  duration: string;
  techs: string[];
  preview: string;
  component: React.FC;
  durationInFrames: number;
};

const videos: VideoConfig[] = [
  {
    title: "技术身份短片",
    titleEn: "Tech Card",
    desc: "围绕真实技术身份与能力边界重构的 15 秒短叙事片。以 Go、CloudWeGo、OpenTelemetry 与数据平台栈为线索，呈现技术定位、能力域和问题边界，而非虚构 KPI。",
    duration: "15s",
    techs: ["Go Backend", "CloudWeGo", "Observability", "Data Platform"],
    preview: "/previews/tech-card-preview.png",
    component: TechCard,
    durationInFrames: 15 * VIDEO.fps,
  },
  {
    title: "开源项目看板",
    titleEn: "Open Source Dashboard",
    desc: "围绕真实 CloudWeGo 贡献重构的技术叙事片。通过终端上下文、贡献事实卡与作用域拓扑，展示 jwt 修复、可观测性稳定性与 Go 1.25+ 兼容性问题。",
    duration: "20s",
    techs: ["CloudWeGo PRs", "Contribution Facts", "Scope Topology"],
    preview: "/previews/oss-dashboard-preview.png",
    component: OSSDashboard,
    durationInFrames: 20 * VIDEO.fps,
  },
  {
    title: "架构演进历程",
    titleEn: "Architecture Evolution",
    desc: "围绕真实请求路径的架构演进叙事。展示单体职责拆分、Hertz/Kitex 调用链显式化、服务内分层组织，以及 trace 驱动的诊断闭环。",
    duration: "25s",
    techs: ["Boundary Split", "Hertz + Kitex", "Service Layering", "Trace Visibility"],
    preview: "/previews/arch-evolution-preview.png",
    component: ArchEvolution,
    durationInFrames: 25 * VIDEO.fps,
  },
  {
    title: "数据湖平台",
    titleEn: "Data Lake Platform",
    desc: "围绕真实配置驱动 ETL 重构的机制叙事片。展示多源异构入湖、mapping_rules 到 DAG 的转换、BFS 最优 JOIN 路径，以及两阶段抽取后的 api_payload 回传闭环。",
    duration: "25s",
    techs: ["Config-Driven ETL", "BFS Join Path", "Delivery Loop"],
    preview: "/previews/arch-evolution-preview.png",
    component: DataLake,
    durationInFrames: 25 * VIDEO.fps,
  },
  {
    title: "GitHub 贡献热力图",
    titleEn: "Contribution Heatmap",
    desc: "围绕真实 52 周 GitHub contribution matrix 重构的贡献轨迹叙事片。展示年度贡献墙生长、高峰格子对应的关键事件，以及总贡献数与连续贡献窗口等事实卡。",
    duration: "20s",
    techs: ["52-Week Timeline", "Contribution Facts", "Milestone Mapping"],
    preview: "/previews/github-heatmap-preview.png",
    component: ContributionHeatmap,
    durationInFrames: 20 * VIDEO.fps,
  },
  {
    title: "作品集总叙事片",
    titleEn: "Portfolio Trailer",
    desc: "围绕真实技术身份、系统机制、开源证据与长期贡献轨迹重组的 60 秒总叙事片。通过跨视频 excerpt 与全局桥接层，把作品集从片段轮播升级为完整技术画像。",
    duration: "60s",
    techs: ["Narrative Excerpts", "System Proof", "Contribution Track", "Closing Statement"],
    preview: "/previews/portfolio-trailer-preview.png",
    component: Trailer,
    durationInFrames: 60 * VIDEO.fps,
  },
];

export function Showreel() {
  const [activeVideo, setActiveVideo] = useState<VideoConfig | null>(null);

  const openVideo = useCallback((video: VideoConfig) => {
    setActiveVideo(video);
    document.body.style.overflow = "hidden";
  }, []);

  const closeVideo = useCallback(() => {
    setActiveVideo(null);
    document.body.style.overflow = "";
  }, []);

  return (
    <section className="section-padding relative">
      <div className="section-container">
        <ScrollReveal>
          <SectionLabel>技术演示影集 / Technical Showreel</SectionLabel>
          <h2 className="text-3xl md:text-4xl font-semibold mt-1">
            让技术作品集<span className="gold-text">可见</span>
          </h2>
          <p className="text-muted-foreground mt-3 max-w-xl text-sm leading-relaxed">
            通过可视化视频演示展示 Go 微服务架构、分布式系统演进、GitHub 开源贡献与数据平台实践
          </p>
        </ScrollReveal>

        {/* Video grid */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {videos.map((v, i) => (
            <ScrollReveal key={v.titleEn} delay={i * 100}>
              <VideoCard video={v} onPlay={() => openVideo(v)} />
            </ScrollReveal>
          ))}
        </div>
      </div>

      {/* Full-screen video modal */}
      {activeVideo && (
        <VideoModal video={activeVideo} onClose={closeVideo} />
      )}
    </section>
  );
}

/* ──── 视频卡片 ──── */
function VideoCard({
  video,
  onPlay,
}: {
  video: VideoConfig;
  onPlay: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onPlay}
      className="group rounded-2xl border border-white/[0.04] bg-surface-elevated/30 overflow-hidden transition-all duration-500 gold-border-glow h-full flex flex-col text-left w-full cursor-pointer"
    >
      {/* Preview area */}
      <div className="relative aspect-video bg-surface overflow-hidden">
        <img
          src={video.preview}
          alt={video.title}
          className="w-full h-full object-cover opacity-60 group-hover:opacity-80 group-hover:scale-105 transition-all duration-700"
          loading="lazy"
        />
        {/* Duration badge */}
        <div className="absolute top-3 right-3 text-[10px] font-mono text-gold/90 bg-obsidian/80 backdrop-blur-sm px-2.5 py-1 rounded-full border border-gold/15">
          {video.duration}
        </div>
        {/* Play overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-14 h-14 rounded-full bg-gold/20 backdrop-blur-sm flex items-center justify-center border border-gold/30 scale-90 group-hover:scale-100 transition-transform duration-300">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M6 4L16 10L6 16V4Z" fill="#D4AF37" />
            </svg>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex items-baseline gap-2 mb-2">
          <h3 className="text-sm font-semibold">{video.title}</h3>
          <span className="text-[10px] text-muted-foreground/50 font-mono">
            {video.titleEn}
          </span>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed flex-1">
          {video.desc}
        </p>
        <div className="flex flex-wrap gap-1.5 mt-3">
          {video.techs.map((t) => (
            <span
              key={t}
              className="text-[10px] font-mono text-gold/50 bg-gold/[0.04] px-2 py-0.5 rounded-full"
            >
              {t}
            </span>
          ))}
        </div>
      </div>
    </button>
  );
}

/* ──── 全屏视频模态框 ──── */
function VideoModal({
  video,
  onClose,
}: {
  video: VideoConfig;
  onClose: () => void;
}) {
  const [isPlaying, setIsPlaying] = useState(true);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label={`播放 ${video.title}`}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-obsidian/95 backdrop-blur-md"
        onClick={onClose}
        onKeyDown={(e) => e.key === "Escape" && onClose()}
      />

      {/* Content */}
      <div className="relative z-10 w-full max-w-6xl mx-4 animate-[fadeInUp_0.4s_cubic-bezier(0.16,1,0.3,1)_forwards]">
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute -top-12 right-0 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="关闭"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        {/* Video title */}
        <div className="flex items-baseline gap-3 mb-4">
          <h3 className="text-lg font-semibold gold-text">{video.title}</h3>
          <span className="text-xs text-muted-foreground/60 font-mono tracking-wider">
            {video.titleEn}
          </span>
          <span className="text-[10px] font-mono text-gold/50 bg-gold/[0.06] px-2 py-0.5 rounded-full ml-auto">
            {video.duration}
          </span>
        </div>

        {/* Player container */}
        <div
          className="relative rounded-xl overflow-hidden border border-white/[0.06]"
          style={{ aspectRatio: `${VIDEO.width} / ${VIDEO.height}` }}
        >
          <Player
            component={video.component}
            durationInFrames={video.durationInFrames}
            fps={VIDEO.fps}
            compositionWidth={VIDEO.width}
            compositionHeight={VIDEO.height}
            autoPlay={isPlaying}
            controls
            style={{
              width: "100%",
              height: "100%",
              backgroundColor: "#0C0C0E",
            }}
          />
        </div>

        {/* Tech tags */}
        <div className="flex flex-wrap gap-2 mt-4">
          {video.techs.map((t) => (
            <span
              key={t}
              className="text-[10px] font-mono text-gold/40 bg-gold/[0.03] px-2.5 py-1 rounded-full border border-gold/[0.06]"
            >
              {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
