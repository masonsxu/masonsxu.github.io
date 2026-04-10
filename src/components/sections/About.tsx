import { useTranslation } from "../../i18n";
import { ScrollReveal, SectionLabel } from "../ScrollReveal";

export function About() {
  const { t } = useTranslation();

  const parts = t.about.paragraph.split(/\{(\d)\}/);

  return (
    <section className="section-padding relative">
      <div className="section-container">
        <ScrollReveal>
          <SectionLabel>{t.about.label}</SectionLabel>
        </ScrollReveal>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-12 lg:gap-20 mt-4">
          {/* Left: highlights */}
          <ScrollReveal delay={100}>
            <div className="space-y-6">
              {t.about.highlights.map((item, i) => (
                <div key={i} className="flex gap-3 items-start group">
                  <div className="w-1 h-1 rounded-full bg-gold mt-2.5 shrink-0 group-hover:scale-150 transition-transform" />
                  <p className="text-foreground/80 text-sm leading-relaxed">{item}</p>
                </div>
              ))}
            </div>
          </ScrollReveal>

          {/* Right: paragraph + quote */}
          <ScrollReveal delay={250}>
            <div>
              <p className="text-muted-foreground leading-[1.8] text-[15px]">
                {parts.map((part, i) => {
                  const idx = Number(part);
                  if (i % 2 === 1 && idx % 2 === 0) {
                    return <span key={i} className="text-foreground font-medium">{parts[i + 1]}</span>;
                  }
                  if (i % 2 === 1) return null;
                  return <span key={i}>{part}</span>;
                })}
              </p>

              {/* Pull quote */}
              <blockquote className="mt-10 pl-5 border-l-2 border-gold/40 relative">
                <div className="absolute -left-[7px] top-0 w-3 h-3 rounded-full bg-obsidian border-2 border-gold/60" />
                <p className="text-foreground/70 italic text-[15px] leading-relaxed">
                  "{t.about.quote}"
                </p>
                <cite className="text-xs text-muted-foreground mt-2 block not-italic font-mono tracking-wider">
                  {t.about.cite}
                </cite>
              </blockquote>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
