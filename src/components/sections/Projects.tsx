import { projects, type Project } from "../../data/site-content";
import { useTranslation } from "../../i18n";
import { ScrollReveal, SectionLabel } from "../ScrollReveal";

function ProjectCard({ project, index }: { project: Project; index: number }) {
  const { t } = useTranslation();
  const tr = t.projects.items[index];

  return (
    <ScrollReveal delay={index * 150}>
      <article className="rounded-2xl border border-white/[0.04] bg-surface-elevated/40 p-6 md:p-10 transition-all duration-500 gold-border-glow hover:bg-surface-elevated/60 group">
        {/* Header */}
        <div className="flex flex-wrap items-start gap-4 mb-6">
          <span className="text-4xl md:text-5xl font-mono font-bold gold-text opacity-25 leading-none select-none">
            {project.num}
          </span>
          <div className="flex-1 min-w-0">
            <h3 className="text-xl md:text-2xl font-semibold text-foreground leading-tight">
              {tr.title}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">{tr.subtitle}</p>
          </div>
          <span className="text-[11px] font-mono text-gold/70 border border-gold/15 rounded-full px-3 py-1.5 whitespace-nowrap">
            {project.time}
          </span>
        </div>

        {/* Summary */}
        <p className="text-sm text-foreground/60 leading-relaxed mb-8">{tr.summary}</p>

        {/* Highlights grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
          {tr.highlights.map((h, i) => (
            <div
              key={i}
              className="rounded-xl bg-white/[0.02] border border-white/[0.03] p-4 transition-colors duration-300 hover:border-gold/10"
            >
              <h4 className="text-sm font-medium text-foreground mb-1.5">{h.title}</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">{h.desc}</p>
            </div>
          ))}
        </div>

        {/* Tech stack */}
        <div className="flex flex-wrap gap-2 mb-6">
          {project.techs.map((t) => (
            <span
              key={t}
              className="text-[11px] font-mono px-3 py-1 rounded-full bg-gold/[0.06] text-gold-light/80 border border-gold/[0.08]"
            >
              {t}
            </span>
          ))}
        </div>

        {/* Bottom row: metrics + extras */}
        <div className="flex flex-wrap items-end justify-between gap-6 pt-6 border-t border-white/[0.04]">
          <div className="flex gap-8">
            {tr.metrics.map((m) => (
              <div key={m.label}>
                <div className="text-lg font-mono font-semibold text-gold">{m.value}</div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">
                  {m.label}
                </div>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {tr.extras.map((e) => (
              <span
                key={e}
                className="text-[10px] text-muted-foreground/70 border border-white/[0.04] rounded-full px-2.5 py-1"
              >
                {e}
              </span>
            ))}
          </div>
        </div>
      </article>
    </ScrollReveal>
  );
}

export function Projects() {
  const { t } = useTranslation();

  return (
    <section className="section-padding relative">
      <div className="section-container">
        <ScrollReveal>
          <SectionLabel>{t.projects.label}</SectionLabel>
          <h2 className="text-3xl md:text-4xl font-semibold mt-1">
            {t.projects.title}<span className="gold-text">{t.projects.accent}</span>
          </h2>
          <p className="text-muted-foreground mt-3 max-w-xl text-sm leading-relaxed">
            {t.projects.description}
          </p>
        </ScrollReveal>

        <div className="mt-14 space-y-8">
          {projects.map((p, i) => (
            <ProjectCard key={p.num} project={p} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
