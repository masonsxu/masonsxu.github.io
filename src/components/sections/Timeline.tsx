import { awards, career } from "../../data/site-content";
import { useTranslation } from "../../i18n";
import { ScrollReveal } from "../ScrollReveal";
import { SmdTag } from "../chip/SmdTag";

export function Timeline() {
  const { t } = useTranslation();
  const tl = t.timeline;

  return (
    <section className="section-padding relative">
      <div className="section-container">
        {/* Career */}
        <ScrollReveal>
          <div className="silicon-eyebrow mb-3">0x00E0 · {tl.careerLabel}</div>
          <h2 className="font-display font-medium text-3xl md:text-5xl tracking-[-0.035em] leading-[0.95]">
            {tl.careerTitle}
            <span className="text-gold">{tl.careerAccent}</span>
          </h2>
        </ScrollReveal>

        {/* Bus rail */}
        <div className="mt-14 relative">
          {/* The data bus — vertical PCB rail */}
          <div
            className="absolute left-[10px] top-2 bottom-2 w-px hidden md:block"
            style={{
              background:
                "linear-gradient(180deg, rgba(212, 175, 55, 0.5), rgba(0, 153, 255, 0.4) 40%, rgba(0, 153, 255, 0.15))",
            }}
          />

          <div className="space-y-12">
            {career.map((comp, ci) => (
              <ScrollReveal key={ci} delay={ci * 130}>
                <div className="md:pl-10 relative">
                  {/* Bus tap */}
                  <div className="absolute left-0 top-1.5 hidden md:flex items-center pointer-events-none">
                    <span
                      className="block w-[21px] h-[21px] rounded-full border border-gold/45 flex items-center justify-center"
                      style={{ background: "#000000" }}
                    >
                      <span
                        className="block w-2 h-2 rounded-full bg-gold/90"
                        style={{ boxShadow: "0 0 8px rgba(212, 175, 55, 0.7)" }}
                      />
                    </span>
                    <span className="ml-3 font-mono text-[10px] tracking-[0.2em] text-blue/50 uppercase">
                      TAP {String(ci).padStart(2, "0")}
                    </span>
                  </div>

                  {/* Company header */}
                  <div className="mb-6 mt-1">
                    <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                      <h3 className="font-display text-xl md:text-2xl font-medium text-foreground tracking-[-0.02em]">
                        {tl.careerItems[ci].company}
                      </h3>
                      <span className="ml-auto font-mono text-[11px] text-foreground/50 tracking-[0.14em]">
                        {comp.time}
                      </span>
                    </div>
                    {tl.careerItems[ci].subtitle && (
                      <p className="mt-1.5 text-[13.5px] text-gold/75">
                        {tl.careerItems[ci].subtitle}
                      </p>
                    )}
                  </div>

                  {/* Role nodes — sub bus segment */}
                  <div
                    className="ml-3 pl-6 space-y-9"
                    style={{
                      boxShadow: "inset 2px 0 0 rgba(0, 153, 255, 0.18)",
                    }}
                  >
                    {tl.careerItems[ci].roles.map((role, ri) => (
                      <div key={ri}>
                        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 mb-2">
                          <h4 className="text-[15px] font-medium text-foreground">
                            {role.role}
                          </h4>
                          <span className="font-mono text-[10.5px] text-foreground/50 tracking-[0.14em]">
                            {comp.roles[ri].time}
                          </span>
                        </div>
                        {role.context && (
                          <p className="mt-1 mb-3 text-[13px] text-foreground/45 italic">
                            {role.context}
                          </p>
                        )}
                        <ul className="space-y-2">
                          {role.points.map((p, j) => (
                            <li
                              key={j}
                              className="flex gap-2.5 items-start text-[13.5px] leading-[1.65] text-foreground/65"
                            >
                              <span className="text-blue/65 mt-1 shrink-0 font-mono text-[10px]">
                                ›
                              </span>
                              <span>{p}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>

        {/* Career keywords as SMD strip */}
        <ScrollReveal delay={120}>
          <div className="mt-12 flex flex-wrap gap-1.5">
            {tl.careerKeywords.map((kw) => (
              <SmdTag key={kw}>{kw}</SmdTag>
            ))}
          </div>
        </ScrollReveal>

        {/* Education */}
        <div className="mt-24">
          <ScrollReveal>
            <div className="silicon-eyebrow mb-6">0x00E8 · {tl.educationLabel}</div>
          </ScrollReveal>
          <ScrollReveal delay={100}>
            <div
              className="grid grid-cols-1 md:grid-cols-[5fr_7fr] gap-8 md:gap-12 p-7 md:p-9 rounded-md"
              style={{
                boxShadow: "inset 0 0 0 1px rgba(0, 153, 255, 0.14)",
                background:
                  "linear-gradient(180deg, rgba(255,255,255,0.012), rgba(255,255,255,0.003))",
              }}
            >
              <div>
                <div className="font-mono text-[10px] tracking-[0.18em] uppercase text-blue/55 mb-3">
                  EDU · BANK 01
                </div>
                <h3 className="font-display text-xl font-medium tracking-[-0.02em]">
                  {tl.school}
                </h3>
                <p className="mt-1.5 text-[13.5px] text-foreground/55">
                  {tl.major}
                </p>
                <p className="mt-1 font-mono text-[10.5px] text-gold/70 tracking-[0.16em]">
                  2017 — 2021
                </p>
              </div>
              <div>
                <div className="font-mono text-[10px] tracking-[0.18em] uppercase text-blue/55 mb-3">
                  AWARDS · 0x{(0x100).toString(16).toUpperCase()}
                </div>
                <div className="flex flex-col gap-2.5">
                  {awards.map((a, i) => (
                    <div
                      key={i}
                      className="flex items-baseline gap-3 text-[13px] text-foreground/80"
                    >
                      <span className="text-gold text-sm shrink-0">{a.icon}</span>
                      <span>{tl.awards[i].text}</span>
                      {a.year && (
                        <span className="font-mono text-[10.5px] text-foreground/35 ml-auto">
                          {a.year}
                        </span>
                      )}
                      {tl.awards[i].detail && (
                        <span className="font-mono text-[10.5px] text-gold/60 border-l border-gold/20 pl-2.5">
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
