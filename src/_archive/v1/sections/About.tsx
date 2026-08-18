import { useTranslation } from "../../i18n";
import { ScrollReveal } from "../ScrollReveal";

export function About() {
  const { t } = useTranslation();

  return (
    <section className="section-padding relative">
      <div className="section-container">
        {/* Section silk header */}
        <ScrollReveal>
          <div className="silicon-eyebrow mb-3">0x00A0 · {t.about.label}</div>
          <h2 className="font-display font-medium text-3xl md:text-5xl tracking-[-0.035em] leading-[0.95] max-w-3xl">
            {t.about.label}
            <span className="text-gold">.</span>
          </h2>
        </ScrollReveal>

        <div className="mt-14 grid grid-cols-1 lg:grid-cols-[5fr_7fr] gap-12 lg:gap-16">
          {/* Left — register file: R0..R3 */}
          <ScrollReveal delay={100}>
            <div className="font-mono text-[10px] tracking-[0.18em] uppercase text-blue/55 mb-5">
              register file · highlights
            </div>
            <div
              className="rounded-md overflow-hidden"
              style={{
                boxShadow: "inset 0 0 0 1px rgba(0, 153, 255, 0.14)",
              }}
            >
              {t.about.highlights.map((item, i) => (
                <div
                  key={i}
                  className="grid grid-cols-[64px_1fr] items-start gap-3 px-4 py-4 border-b last:border-b-0 border-blue/8 transition-colors hover:bg-white/[0.02]"
                >
                  <div className="font-mono text-[11px] tracking-[0.18em] text-gold pt-0.5">
                    R{i}
                  </div>
                  <p className="text-[14px] leading-[1.65] text-foreground/80">
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </ScrollReveal>

          {/* Right — datasheet body + quote */}
          <ScrollReveal delay={220}>
            <div className="font-mono text-[10px] tracking-[0.18em] uppercase text-blue/55 mb-5">
              datasheet · narrative
            </div>
            <p className="text-foreground/70 text-[15.5px] leading-[1.85]">
              {t.about.paragraph.map((seg, i) =>
                seg.highlight ? (
                  <span key={i} className="text-foreground font-medium">
                    {seg.text}
                  </span>
                ) : (
                  <span key={i}>{seg.text}</span>
                )
              )}
            </p>

            <blockquote
              className="mt-9 relative pl-6 py-5 pr-5"
              style={{
                background:
                  "linear-gradient(90deg, rgba(212, 175, 55, 0.04), transparent 70%)",
                boxShadow: "inset 2px 0 0 0 rgba(212, 175, 55, 0.6)",
              }}
            >
              <p className="text-foreground italic text-[15.5px] leading-[1.55] font-display tracking-[-0.005em]">
                "{t.about.quote}"
              </p>
              <cite className="block mt-3 font-mono text-[10.5px] tracking-[0.2em] uppercase text-gold/85 not-italic">
                {t.about.cite}
              </cite>
            </blockquote>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
