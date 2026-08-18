import { projects, type Project } from "../../data/site-content";
import { useTranslation } from "../../i18n";
import { ScrollReveal } from "../ScrollReveal";
import { SmdTag } from "../chip/SmdTag";
import { ProjectDiagram } from "../diagrams/ProjectDiagram";

function ProjectCard({ project, index }: { project: Project; index: number }) {
  const { t } = useTranslation();
  const tr = t.projects.items[index];
  const reverse = index % 2 === 1;

  return (
    <ScrollReveal delay={index * 120}>
      <article
        className="grid grid-cols-1 lg:grid-cols-[5fr_7fr] rounded-md overflow-hidden transition-all duration-500 hover:bg-white/[0.02]"
        style={{
          boxShadow: "inset 0 0 0 1px rgba(0, 153, 255, 0.16)",
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.012), rgba(255,255,255,0.003))",
        }}
      >
        {/* INFO column */}
        <div
          className={`relative p-7 md:p-9 lg:p-11 ${reverse ? "lg:order-2" : ""}`}
        >
          {/* Vertical separator (desktop only) */}
          <div
            className={`hidden lg:block absolute top-10 bottom-10 w-px ${
              reverse ? "left-0" : "right-0"
            }`}
            style={{
              background:
                "linear-gradient(180deg, transparent, rgba(0, 153, 255, 0.18), transparent)",
            }}
          />

          {/* Top silk row */}
          <div className="flex items-baseline justify-between gap-3 flex-wrap mb-6">
            <div className="font-mono text-[10px] tracking-[0.22em] text-gold uppercase">
              PART · {project.num}
            </div>
            <div className="font-mono text-[10px] tracking-[0.16em] text-foreground/35">
              {project.time}
            </div>
          </div>

          <h3 className="font-display font-medium text-2xl md:text-[28px] tracking-[-0.025em] leading-[1.1] text-foreground">
            {tr.title}
          </h3>
          <p className="mt-2 text-[13.5px] text-foreground/55 leading-relaxed">
            {tr.subtitle}
          </p>

          <p className="mt-5 text-[14px] leading-[1.7] text-foreground/65">
            {tr.summary}
          </p>

          {/* Highlights — bullet list w/ blue diodes */}
          <ul className="mt-6 space-y-3">
            {tr.highlights.map((h, i) => (
              <li key={i} className="flex gap-3 items-start">
                <span
                  className="mt-2 inline-block w-1.5 h-1.5 rounded-full bg-blue shrink-0"
                  style={{ boxShadow: "0 0 6px rgba(0, 153, 255, 0.5)" }}
                  aria-hidden
                />
                <span className="text-[13px] leading-[1.55] text-foreground/75">
                  <b className="text-foreground font-medium">{h.title}</b>
                  <span className="text-foreground/40 mx-1.5">·</span>
                  {h.desc}
                </span>
              </li>
            ))}
          </ul>

          {/* Tech stack */}
          <div className="mt-6 flex flex-wrap gap-1.5">
            {project.techs.map((t) => (
              <SmdTag key={t} variant="gold">
                {t}
              </SmdTag>
            ))}
          </div>

          {/* Bottom — metrics + extras */}
          <div
            className="mt-6 pt-5 grid grid-cols-3 gap-3"
            style={{
              boxShadow: "inset 0 1px 0 0 rgba(255, 255, 255, 0.04)",
            }}
          >
            {tr.metrics.map((m) => (
              <div key={m.label}>
                <div className="font-display font-medium text-[22px] text-gold leading-none tabular-nums tracking-tight">
                  {m.value}
                </div>
                <div className="mt-1.5 font-mono text-[9.5px] tracking-[0.16em] uppercase text-foreground/40">
                  {m.label}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {tr.extras.map((e) => (
              <SmdTag key={e}>{e}</SmdTag>
            ))}
          </div>
        </div>

        {/* DIAGRAM column */}
        <div
          className={`relative min-h-[380px] lg:min-h-[520px] flex items-center justify-center p-6 ${
            reverse ? "lg:order-1" : ""
          }`}
          style={{
            background:
              "linear-gradient(135deg, rgba(0, 153, 255, 0.04), rgba(212, 175, 55, 0.018))",
          }}
        >
          {/* Grid backdrop */}
          <div
            className="absolute inset-0 pointer-events-none atmos-grid"
            style={{ opacity: 0.6 }}
          />
          <ProjectDiagram variant={index} />
          <div className="absolute bottom-3 left-5 right-5 flex justify-between font-mono text-[9.5px] tracking-[0.18em] uppercase text-foreground/35 pointer-events-none">
            <span className="text-blue/70">SCOPE · BOARD-{project.num}</span>
            <span>0x{(0xc000 + index * 0x10).toString(16).toUpperCase()}</span>
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
          <div className="silicon-eyebrow mb-3">0x00C0 · {t.projects.label}</div>
          <h2 className="font-display font-medium text-3xl md:text-5xl tracking-[-0.035em] leading-[0.95]">
            {t.projects.title}
            <span className="text-gold">{t.projects.accent}</span>
          </h2>
          <p className="mt-4 max-w-xl text-foreground/55 text-[14.5px] leading-relaxed">
            {t.projects.description}
          </p>
        </ScrollReveal>

        <div className="mt-12 space-y-6">
          {projects.map((p, i) => (
            <ProjectCard key={p.num} project={p} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
