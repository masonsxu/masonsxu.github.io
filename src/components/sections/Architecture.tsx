import { useTranslation } from "../../i18n";
import { ScrollReveal, SectionLabel } from "../ScrollReveal";
import { useInView, useAnimatedCounter } from "../../hooks";

function AnimatedMetric({ value, suffix, label }: { value: number; suffix: string; label: string }) {
  const { ref, inView } = useInView();
  const count = useAnimatedCounter(value, inView);

  return (
    <div ref={ref} className="text-center p-6 rounded-2xl border border-white/[0.04] bg-white/[0.015] transition-all duration-300 hover:border-gold/15 hover:bg-white/[0.025]">
      <div className="text-3xl md:text-4xl font-mono font-bold gold-text">
        {count}
        <span className="text-lg md:text-xl">{suffix}</span>
      </div>
      <div className="text-xs text-muted-foreground mt-2 tracking-wider uppercase">{label}</div>
    </div>
  );
}

const competencyTechs = [
  ["Kitex", "Hertz", "etcd", "OpenTelemetry"],
  ["Iceberg", "Airflow", "Trino", "Polars"],
  ["CloudWeGo", "Docker", "Wire DI", "OpenTelemetry"],
];

const domainTags = [
  ["Go 1.24+", "Kitex RPC", "Hertz HTTP", "gRPC", "GORM", "Google Wire", "Thrift IDL", "Casbin RBAC"],
  ["Apache Iceberg", "Airflow 3.1", "Trino", "Polars", "PyIceberg", "PyArrow", "Schema Evolution"],
  ["Docker", "Podman", "Kubernetes", "etcd", "OpenTelemetry", "Jaeger", "PostgreSQL", "Redis"],
];

const metricData = [
  { value: 99, suffix: ".9%" },
  { value: 50, suffix: "%" },
  { value: 10, suffix: "+" },
  { value: 87, suffix: "%" },
];

export function Architecture() {
  const { t } = useTranslation();
  const a = t.architecture;

  return (
    <section className="section-padding relative">
      {/* Subtle atmospheric bg */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[30%] right-[5%] w-[400px] h-[400px] rounded-full bg-gold/[0.02] blur-[100px]" />
      </div>

      <div className="section-container relative z-10">
        <ScrollReveal>
          <SectionLabel>{a.label}</SectionLabel>
          <h2 className="text-3xl md:text-4xl font-semibold mt-1">
            {a.title}<span className="gold-text">{a.accent}</span>
          </h2>
        </ScrollReveal>

        {/* Competencies */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-12">
          {a.competencies.map((c, i) => (
            <ScrollReveal key={c.title} delay={i * 120}>
              <div className="h-full rounded-2xl border border-white/[0.04] bg-surface-elevated/30 p-6 md:p-8 transition-all duration-500 gold-border-glow group">
                <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center mb-5">
                  <div className="w-2.5 h-2.5 rounded-full bg-gold/60" />
                </div>
                <h3 className="text-lg font-semibold mb-3">{c.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-5">{c.desc}</p>
                <div className="flex flex-wrap gap-1.5">
                  {competencyTechs[i].map((tech) => (
                    <span key={tech} className="text-[10px] font-mono text-gold/70 bg-gold/[0.05] px-2 py-0.5 rounded-full">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* Performance Metrics */}
        <div className="mt-16">
          <ScrollReveal>
            <h3 className="text-lg font-medium text-center mb-8">
              <span className="text-muted-foreground">{a.performanceBefore}</span> {a.performanceAfter}
            </h3>
          </ScrollReveal>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {metricData.map((m, i) => (
              <AnimatedMetric key={i} value={m.value} suffix={m.suffix} label={a.metrics[i]} />
            ))}
          </div>
        </div>

        {/* Tech Domains */}
        <div className="mt-20">
          <ScrollReveal>
            <SectionLabel>{a.domainsLabel}</SectionLabel>
          </ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-6">
            {a.domains.map((title, i) => (
              <ScrollReveal key={title} delay={i * 100}>
                <div className="rounded-xl border border-white/[0.04] p-5 bg-white/[0.01]">
                  <h4 className="text-sm font-semibold mb-4 text-foreground/90">{title}</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {domainTags[i].map((tag) => (
                      <span
                        key={tag}
                        className="text-[11px] font-mono px-2.5 py-1 rounded-full border border-gold/[0.08] text-muted-foreground hover:text-gold-light hover:border-gold/20 transition-colors duration-200"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
