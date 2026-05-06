import { useCallback, useState } from "react";
import { Player } from "@remotion/player";
import { VIDEO } from "../../../remotion/shared/theme";
import { showreelVideos, type ShowreelVideo } from "../../data/showreel-registry";
import { useTranslation } from "../../i18n";
import { ScrollReveal } from "../ScrollReveal";
import { SmdTag } from "../chip/SmdTag";

export function Showreel() {
  const { t } = useTranslation();
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
          <div className="silicon-eyebrow mb-3">0x00F0 · {t.showreel.label}</div>
          <h2 className="font-display font-medium text-3xl md:text-5xl tracking-[-0.035em] leading-[0.95]">
            {t.showreel.title}
            <span className="text-gold">{t.showreel.accent}</span>
          </h2>
          <p className="mt-4 max-w-xl text-foreground/55 text-[14.5px] leading-relaxed">
            {t.showreel.description}
          </p>
        </ScrollReveal>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {showreelVideos.map((v, i) => (
            <ScrollReveal key={v.titleEn} delay={i * 90}>
              <VideoCard video={v} index={i} onPlay={() => openVideo(v)} />
            </ScrollReveal>
          ))}
        </div>
      </div>

      {activeVideo && (
        <VideoModal
          video={activeVideo}
          onClose={closeVideo}
        />
      )}
    </section>
  );
}

/* ──── IC-package video card ──── */
function VideoCard({
  video,
  index,
  onPlay,
}: {
  video: ShowreelVideo;
  index: number;
  onPlay: () => void;
}) {
  const { t } = useTranslation();
  const vt = t.showreel.videos[video.id];
  const partNo = `MX-S${String(index + 1).padStart(2, "0")}-${video.durationSeconds}S`;

  return (
    <button
      type="button"
      onClick={onPlay}
      className="group text-left w-full cursor-pointer rounded-md overflow-hidden transition-all duration-500 hover:bg-white/[0.02]"
      style={{ boxShadow: "inset 0 0 0 1px rgba(0, 153, 255, 0.16)" }}
    >
      {/* Preview as die area */}
      <div
        className="relative aspect-video overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #001324, #000)",
        }}
      >
        <img
          src={video.preview}
          alt={vt.title}
          className="w-full h-full object-cover opacity-50 group-hover:opacity-75 group-hover:scale-105 transition-all duration-700"
          loading="lazy"
        />
        {/* Atmos grid overlay */}
        <div
          className="absolute inset-0 atmos-grid pointer-events-none"
          style={{ opacity: 0.4 }}
        />
        {/* Top-left silk: part number */}
        <div className="absolute top-3 left-3 font-mono text-[10px] tracking-[0.18em] uppercase text-gold/85">
          {partNo}
        </div>
        {/* Top-right silk: duration */}
        <div className="absolute top-3 right-3 font-mono text-[10px] tracking-[0.16em] text-gold/80 bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded-sm">
          {video.durationSeconds}s
        </div>
        {/* Side pins (SOIC look) */}
        <div className="absolute -top-0.5 left-12 right-16 flex justify-evenly pointer-events-none">
          {Array.from({ length: 8 }).map((_, i) => (
            <span
              key={i}
              className="block w-0.5 h-1.5 bg-blue/45"
              style={{ boxShadow: "0 0 4px rgba(0, 153, 255, 0.4)" }}
            />
          ))}
        </div>
        <div className="absolute -bottom-0.5 left-12 right-16 flex justify-evenly pointer-events-none">
          {Array.from({ length: 8 }).map((_, i) => (
            <span key={i} className="block w-0.5 h-1.5 bg-blue/45" />
          ))}
        </div>

        {/* Play overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center scale-90 group-hover:scale-100 transition-transform duration-300"
            style={{
              background: "rgba(212, 175, 55, 0.18)",
              boxShadow:
                "0 0 0 1px rgba(212, 175, 55, 0.45), 0 0 24px rgba(212, 175, 55, 0.18)",
              backdropFilter: "blur(8px)",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
              <path d="M6 4L16 10L6 16V4Z" fill="#D4AF37" />
            </svg>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 space-y-2.5">
        <div className="flex items-baseline gap-2">
          <h3 className="font-display text-[15px] font-medium tracking-[-0.01em] text-foreground">
            {vt.title}
          </h3>
          <span className="font-mono text-[10px] text-foreground/35">
            {video.titleEn}
          </span>
        </div>
        <p className="text-[12.5px] leading-[1.55] text-foreground/55 line-clamp-2">
          {vt.desc}
        </p>
        <div className="flex flex-wrap gap-1">
          {video.techs.slice(0, 4).map((tag) => (
            <SmdTag key={tag}>{tag}</SmdTag>
          ))}
        </div>
      </div>
    </button>
  );
}

/* ──── Logic-analyzer modal ──── */
function VideoModal({
  video,
  onClose,
}: {
  video: ShowreelVideo;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const vt = t.showreel.videos[video.id];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label={`Play ${vt.title}`}
    >
      <div
        className="absolute inset-0 bg-black/95 backdrop-blur-md"
        onClick={onClose}
        onKeyDown={(e) => e.key === "Escape" && onClose()}
      />

      <div className="relative z-10 w-full max-w-6xl mx-4 animate-[fadeInUp_0.4s_cubic-bezier(0.16,1,0.3,1)_forwards]">
        {/* Header bar — analyzer style */}
        <div
          className="flex items-center gap-4 px-4 py-2.5 rounded-t-md font-mono text-[10.5px] tracking-[0.16em] uppercase text-foreground/65"
          style={{
            background: "rgba(255, 255, 255, 0.025)",
            boxShadow: "inset 0 0 0 1px rgba(0, 153, 255, 0.16)",
          }}
        >
          <span
            className="inline-block w-1.5 h-1.5 rounded-full bg-gold/90 shrink-0"
            style={{
              boxShadow: "0 0 6px rgba(212, 175, 55, 0.6)",
              animation: "clkBlink 1.2s steps(1) infinite",
            }}
          />
          <span className="text-gold">CH1 · ANALYZER</span>
          <span className="text-foreground/35">·</span>
          <span className="text-blue">{video.titleEn}</span>
          <span className="ml-auto text-foreground/40">T:{video.durationSeconds}s</span>
          <button
            type="button"
            onClick={onClose}
            className="ml-3 text-foreground/55 hover:text-gold transition-colors"
            aria-label="Close"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Title row */}
        <div className="flex items-baseline gap-3 px-1 mt-3 mb-3">
          <h3 className="font-display text-lg font-medium gold-text">{vt.title}</h3>
          <span className="font-mono text-[10.5px] text-foreground/35 tracking-[0.16em]">
            {video.titleEn}
          </span>
        </div>

        {/* Player frame */}
        <div
          className="relative rounded-md overflow-hidden"
          style={{
            aspectRatio: `${VIDEO.width} / ${VIDEO.height}`,
            boxShadow:
              "inset 0 0 0 1px rgba(0, 153, 255, 0.22), 0 0 60px rgba(0, 153, 255, 0.06)",
          }}
        >
          <Player
            component={video.component}
            durationInFrames={video.durationInFrames}
            fps={VIDEO.fps}
            compositionWidth={VIDEO.width}
            compositionHeight={VIDEO.height}
            autoPlay
            controls
            style={{
              width: "100%",
              height: "100%",
              backgroundColor: "#000000",
            }}
          />
        </div>

        {/* Footer tags */}
        <div className="mt-4 flex flex-wrap gap-1.5">
          {video.techs.map((tag) => (
            <SmdTag key={tag}>{tag}</SmdTag>
          ))}
        </div>
      </div>
    </div>
  );
}
