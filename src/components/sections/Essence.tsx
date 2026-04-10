import { useTranslation } from "../../i18n";
import { ScrollReveal, SectionLabel } from "../ScrollReveal";

const pillarConfig = [
  {
    color: "#0C0C0E",
    border: "border-white/[0.08]",
    name: "Obsidian",
    borderColor: "#1E1E21",
  },
  {
    color: "#FCFCFC",
    border: "border-white/[0.15]",
    name: "Pearl",
    borderColor: "#FCFCFC",
  },
  {
    color: "#D4AF37",
    border: "border-gold/30",
    name: "Gold",
    borderColor: "#D4AF37",
    shadow: true,
  },
];

export function Essence() {
  const { t } = useTranslation();
  const e = t.essence;

  return (
    <section className="section-padding relative overflow-hidden">
      {/* Rich atmospheric background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[10%] left-[20%] w-[600px] h-[600px] rounded-full bg-gold/[0.025] blur-[140px] animate-[pulseGlow_12s_ease-in-out_infinite]" />
        <div className="absolute bottom-[10%] right-[15%] w-[500px] h-[500px] rounded-full bg-gold-deep/[0.035] blur-[120px] animate-[pulseGlow_15s_ease-in-out_5s_infinite]" />
        <div className="absolute inset-0 bg-gradient-to-b from-obsidian via-transparent to-obsidian opacity-60" />
      </div>

      <div className="section-container relative z-10">
        <ScrollReveal>
          <SectionLabel>{e.label}</SectionLabel>
          <h2 className="text-3xl md:text-5xl font-semibold mt-1 leading-tight">
            {e.titleBefore}<br />
            <span className="gold-shimmer">{e.titleAccent}</span>
          </h2>
        </ScrollReveal>

        <ScrollReveal delay={200}>
          <p className="text-foreground/50 text-[15px] leading-[1.9] mt-8 max-w-2xl">
            {e.description}
          </p>
        </ScrollReveal>

        {/* Design Principles — Three Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
          {pillarConfig.map((pillar, i) => (
            <ScrollReveal key={pillar.name} delay={i * 120 + 300}>
              <div className={`rounded-2xl border ${pillar.border} bg-white/[0.015] p-8 text-center transition-all duration-500 hover:bg-white/[0.03]`}>
                <div
                  className="w-12 h-12 rounded-full mx-auto mb-5 border-2"
                  style={{
                    backgroundColor: pillar.color,
                    borderColor: pillar.borderColor,
                    boxShadow: pillar.shadow ? "0 0 30px rgba(212,175,55,0.2)" : "none",
                  }}
                />
                <h3 className="text-lg font-semibold mb-1">{pillar.name}</h3>
                <p className="text-xs font-mono text-gold/60 tracking-wider mb-3">{e.pillars[i].meaning}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{e.pillars[i].desc}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* Taurus Constellation */}
        <ScrollReveal delay={200}>
          <div className="mt-16 flex flex-col md:flex-row items-center gap-8 rounded-2xl border border-gold/[0.08] bg-gold/[0.015] p-8 md:p-10">
            {/* Taurus symbol */}
            <div className="shrink-0 text-center">
              <div className="text-5xl md:text-6xl gold-text font-light select-none">♉</div>
              <p className="text-xs font-mono text-gold/60 mt-2 tracking-wider">TAURUS</p>
              <p className="text-[10px] text-muted-foreground/50 mt-0.5">4.20 — 5.20</p>
            </div>
            <div className="h-px md:h-16 md:w-px w-full bg-gold/10 shrink-0" />
            <div>
              <blockquote className="text-foreground/60 italic text-sm leading-relaxed">
                {e.taurusQuote}
              </blockquote>
              <div className="flex gap-3 mt-4">
                {e.taurusTraits.map((trait) => (
                  <span key={trait} className="text-xs font-mono text-gold/70 bg-gold/[0.06] px-3 py-1 rounded-full">
                    {trait}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
