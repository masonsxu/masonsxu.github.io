import { awards, career, careerKeywords } from "../../data/site-content";
import { useTranslation } from "../../i18n";
import { ScrollReveal, SectionLabel } from "../ScrollReveal";

export function Timeline() {
  const { t } = useTranslation();
  const tl = t.timeline;

  return (
    <section className="section-padding relative">
      <div className="section-container">
        {/* Career */}
        <ScrollReveal>
          <SectionLabel>{tl.careerLabel}</SectionLabel>
          <h2 className="text-3xl md:text-4xl font-semibold mt-1">
            {tl.careerTitle}<span className="gold-text">{tl.careerAccent}</span>
          </h2>
        </ScrollReveal>

        <div className="mt-12 relative">
          {/* Timeline gold line */}
          <div className="absolute left-[11px] top-2 bottom-2 w-px bg-gradient-to-b from-gold/30 via-gold/15 to-transparent hidden md:block" />

          <div className="space-y-10">
            {career.map((job, i) => (
              <ScrollReveal key={i} delay={i * 150}>
                <div className="md:pl-10 relative">
                  {/* Timeline dot */}
                  <div className="absolute left-0 top-1.5 w-[23px] h-[23px] rounded-full border-2 border-gold/40 bg-obsidian hidden md:flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-gold/70" />
                  </div>

                  <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 mb-4">
                    <h3 className="text-lg md:text-xl font-semibold">{tl.careerItems[i].role}</h3>
                    <span className="text-sm text-gold/70 font-mono">{job.company}</span>
                    <span className="text-xs text-muted-foreground font-mono ml-auto">{job.time}</span>
                  </div>

                  <ul className="space-y-2.5">
                    {tl.careerItems[i].points.map((p, j) => (
                      <li key={j} className="flex gap-2.5 items-start text-sm text-foreground/60 leading-relaxed">
                        <span className="text-gold/40 mt-1 shrink-0">›</span>
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>

        {/* Career keywords */}
        <ScrollReveal delay={100}>
          <div className="mt-10 flex flex-wrap gap-2">
            {tl.careerKeywords.map((kw) => (
              <span key={kw} className="text-[11px] font-mono text-muted-foreground/60 border border-white/[0.04] rounded-full px-3 py-1">
                {kw}
              </span>
            ))}
          </div>
        </ScrollReveal>

        {/* ── Education ── */}
        <div className="mt-24">
          <ScrollReveal>
            <SectionLabel>{tl.educationLabel}</SectionLabel>
          </ScrollReveal>

          <ScrollReveal delay={100}>
            <div className="mt-6 flex flex-col md:flex-row md:items-start gap-8 md:gap-16">
              {/* School info */}
              <div className="shrink-0">
                <h3 className="text-lg font-semibold">{tl.school}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {tl.major}
                </p>
                <p className="text-xs font-mono text-muted-foreground/60 mt-1">2017 — 2021</p>
              </div>

              {/* Awards: HORIZONTAL flowing badges */}
              <div className="flex-1">
                <p className="text-xs text-muted-foreground/60 uppercase tracking-wider mb-3 font-mono">
                  {tl.honorsLabel}
                </p>
                <div className="flex flex-wrap gap-2.5">
                  {awards.map((a, i) => (
                    <div
                      key={i}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gold/[0.12] bg-gold/[0.03] hover:border-gold/25 hover:bg-gold/[0.06] transition-all duration-300 group"
                    >
                      <span className="text-gold text-sm">{a.icon}</span>
                      <span className="text-sm text-foreground/80 whitespace-nowrap">{tl.awards[i].text}</span>
                      {a.year && (
                        <span className="text-[10px] font-mono text-muted-foreground/60">{a.year}</span>
                      )}
                      {tl.awards[i].detail && (
                        <span className="text-[10px] font-mono text-gold/50 border-l border-gold/10 pl-2">
                          {tl.awards[i].detail}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
