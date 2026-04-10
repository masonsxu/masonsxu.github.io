import { useTranslation } from "../../i18n";

export function Hero() {
  const { t } = useTranslation();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Atmospheric orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[20%] left-[12%] w-[500px] h-[500px] rounded-full bg-gold/[0.035] blur-[120px] animate-[pulseGlow_8s_ease-in-out_infinite]" />
        <div className="absolute bottom-[20%] right-[8%] w-[420px] h-[420px] rounded-full bg-gold-deep/[0.05] blur-[100px] animate-[pulseGlow_11s_ease-in-out_3s_infinite]" />
        <div className="absolute top-[55%] left-[45%] w-[300px] h-[300px] rounded-full bg-gold-light/[0.015] blur-[90px] animate-[pulseGlow_14s_ease-in-out_6s_infinite]" />
        {/* Subtle grid */}
        <div className="absolute inset-0 atmos-grid" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
        {/* Primary Brand Logo */}
        <div className="opacity-0 animate-[fadeIn_1.5s_0.2s_cubic-bezier(0.16,1,0.3,1)_forwards]">
          <img
            src="/logo-dark.svg"
            alt="MASONS.XU — Distributed Systems"
            className="h-12 sm:h-14 md:h-16 lg:h-[72px] mx-auto w-auto"
          />
        </div>

        {/* Gold accent divider */}
        <div className="mt-10 mb-10 flex items-center justify-center gap-3 opacity-0 animate-[fadeIn_1s_0.8s_forwards]">
          <div className="h-px w-12 md:w-20 bg-gradient-to-r from-transparent to-gold/40" />
          <div className="w-1.5 h-1.5 rounded-full bg-gold/80" />
          <div className="h-px w-12 md:w-20 bg-gradient-to-l from-transparent to-gold/40" />
        </div>

        {/* Tagline */}
        <p className="text-muted-foreground text-sm md:text-base tracking-[0.18em] uppercase font-light opacity-0 animate-[fadeInUp_1s_1.1s_forwards]">
          {t.hero.tagline}
        </p>

        {/* Hero description */}
        <p className="text-foreground/60 text-sm md:text-base max-w-2xl mx-auto mt-6 leading-relaxed opacity-0 animate-[fadeInUp_1s_1.3s_forwards]">
          {t.hero.description}
        </p>

        {/* Key metrics */}
        <div className="flex flex-wrap gap-8 md:gap-14 justify-center mt-14 opacity-0 animate-[fadeInUp_1s_1.6s_forwards]">
          {t.hero.stats.map((stat) => (
            <div key={stat.label} className="text-center group">
              <div className="text-2xl md:text-3xl font-semibold font-mono gold-text transition-transform duration-300 group-hover:scale-110">
                {stat.value}
              </div>
              <div className="text-[10px] md:text-xs text-muted-foreground mt-1.5 tracking-[0.15em] uppercase">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 animate-[scrollHint_2.5s_ease-in-out_infinite] flex flex-col items-center gap-2">
        <span className="text-[10px] text-muted-foreground/40 tracking-[0.3em] uppercase">
          {t.hero.scroll}
        </span>
        <svg width="14" height="20" viewBox="0 0 14 20" fill="none" className="text-gold/30">
          <path d="M7 2V18M7 18L1 12M7 18L13 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      {/* Top edge glow */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
    </section>
  );
}
