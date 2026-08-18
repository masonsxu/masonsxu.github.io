import { useTranslation } from "../../i18n";
import { ScrollReveal } from "../ScrollReveal";
import { SmdTag } from "../chip/SmdTag";

const pillarConfig = [
  {
    color: "#000000",
    border: "rgba(255, 255, 255, 0.18)",
    name: "Obsidian",
    code: "BASE",
  },
  {
    color: "#FCFCFC",
    border: "rgba(252, 252, 252, 0.45)",
    name: "Pearl",
    code: "LOGIC",
  },
  {
    color: "#D4AF37",
    border: "#D4AF37",
    name: "Gold",
    code: "CRITICAL",
    glow: true,
  },
];

export function Essence() {
  const { t } = useTranslation();
  const e = t.essence;

  return (
    <section className="section-padding relative">
      <div className="section-container relative">
        <ScrollReveal>
          <div className="silicon-eyebrow mb-3">0x00D0 · {e.label}</div>
          <h2 className="font-display font-medium text-3xl md:text-5xl tracking-[-0.035em] leading-[1.05] max-w-3xl">
            {e.titleBefore}
            <br />
            <span className="text-gold">{e.titleAccent}</span>
          </h2>
        </ScrollReveal>

        <ScrollReveal delay={180}>
          <p className="mt-8 max-w-2xl text-[15.5px] leading-[1.85] text-foreground/60">
            {e.description}
          </p>
        </ScrollReveal>

        {/* Three pillars as soldered material samples */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-14 items-stretch">
          {pillarConfig.map((p, i) => (
            <ScrollReveal key={p.name} delay={i * 130 + 200} className="h-full">
              <div
                className="relative h-full flex flex-col p-7 rounded-md transition-colors duration-500 hover:bg-white/[0.02]"
                style={{
                  boxShadow: "inset 0 0 0 1px rgba(0, 153, 255, 0.14)",
                }}
              >
                <div className="font-mono text-[10px] tracking-[0.2em] text-gold/85 mb-5">
                  ELEMENT {String(i + 1).padStart(2, "0")} · {p.code}
                </div>
                {/* Material sample dot */}
                <div
                  className="w-12 h-12 rounded-full mb-5"
                  style={{
                    background: p.color,
                    boxShadow: `0 0 0 1.5px ${p.border}${
                      p.glow ? ", 0 0 30px rgba(212, 175, 55, 0.28)" : ""
                    }`,
                  }}
                  aria-hidden
                />
                <h3 className="font-display text-lg font-medium tracking-[-0.015em] mb-2">
                  {p.name}
                </h3>
                <p className="font-mono text-[10.5px] tracking-[0.14em] uppercase text-gold/65 mb-3">
                  {e.pillars[i].meaning}
                </p>
                <p className="text-[13px] leading-[1.6] text-foreground/55">
                  {e.pillars[i].desc}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* Taurus die marking */}
        <ScrollReveal delay={250}>
          <div
            className="mt-14 p-7 md:p-10 rounded-md flex flex-col md:flex-row items-center gap-7"
            style={{
              boxShadow: "inset 0 0 0 1px rgba(212, 175, 55, 0.18)",
              background:
                "linear-gradient(135deg, rgba(212, 175, 55, 0.025), transparent)",
            }}
          >
            <div className="shrink-0 text-center">
              <div className="font-display text-5xl md:text-6xl text-gold leading-none select-none">
                ♉
              </div>
              <p className="mt-3 font-mono text-[10.5px] tracking-[0.22em] text-gold/85">
                TAURUS
              </p>
              <p className="mt-1 font-mono text-[10px] text-foreground/40 tracking-[0.14em]">
                4.20 — 5.20
              </p>
            </div>
            <div
              className="hidden md:block w-px h-20 shrink-0"
              style={{
                background:
                  "linear-gradient(180deg, transparent, rgba(212, 175, 55, 0.3), transparent)",
              }}
            />
            <div className="flex-1">
              <blockquote className="text-[14px] leading-[1.7] text-foreground/65 italic">
                {e.taurusQuote}
              </blockquote>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {e.taurusTraits.map((trait) => (
                  <SmdTag key={trait} variant="gold">
                    {trait}
                  </SmdTag>
                ))}
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
