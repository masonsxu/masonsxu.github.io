import { useCallback, useState } from "react";
import { Player } from "@remotion/player";
import { VIDEO } from "../../../remotion/shared/theme";
import { showreelVideos, type ShowreelVideo } from "../../data/showreel-registry";
import { ScrollReveal, SectionLabel } from "../ScrollReveal";

export function Showreel() {
  const [activeVideo, setActiveVideo] = useState<ShowreelVideo | null>(null);

  const openVideo = useCallback((video: ShowreelVideo) => {
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
          {showreelVideos.map((v, i) => (
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
  video: ShowreelVideo;
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
  video: ShowreelVideo;
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
