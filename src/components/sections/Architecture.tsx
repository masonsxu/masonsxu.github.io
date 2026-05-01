import { useTranslation } from "../../i18n";
import { ScrollReveal } from "../ScrollReveal";
import { useInView, useAnimatedCounter } from "../../hooks";
import { SmdTag } from "../chip/SmdTag";

const competencyTechs = [
  ["Kitex", "Hertz", "etcd", "OpenTelemetry"],
  ["Iceberg", "Airflow", "Trino", "Polars"],
  ["CloudWeGo", "Docker", "Wire DI", "OpenTelemetry"],
];

const blockCodes = ["ALU", "DMA", "NOC"];

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

function MetricCell({
  value,
  suffix,
  label,
  idx,
}: {
  value: number;
  suffix: string;
  label: string;
  idx: number;
}) {
  const { ref, inView } = useInView();
  const count = useAnimatedCounter(value, inView, 1700);

  return (
    <div
      ref={ref}
      className="relative px-5 py-6 transition-colors hover:bg-white/[0.025]"
    >
      <div className="absolute top-3 right-4 font-mono text-[9px] tracking-[0.16em] text-blue/55">
        REG {String(idx).padStart(2, "0")}
      </div>
      <div className="font-display font-medium text-3xl md:text-4xl text-gold leading-none tabular-nums tracking-tight">
        {count}
        <span className="text-lg ml-0.5 font-display">{suffix}</span>
      </div>
      <div className="mt-3 font-mono text-[10px] tracking-[0.18em] uppercase text-foreground/45">
        {label}
      </div>
    </div>
  );
}

function FunctionalBlock({
  num,
  code,
  title,
  desc,
  techs,
}: {
  num: string;
  code: string;
  title: string;
  desc: string;
  techs: string[];
}) {
  return (
    <div
      className="relative h-full flex flex-col p-6 md:p-7 rounded-md transition-all duration-500 hover:bg-white/[0.02]"
      style={{ boxShadow: "inset 0 0 0 1px rgba(0, 153, 255, 0.16)" }}
    >
      {/* Top silkscreen — block code */}
      <div className="flex items-center justify-between mb-5">
        <div className="font-mono text-[10px] tracking-[0.2em] text-gold/85">
          BLOCK {num} · {code}
        </div>
        {/* Power LED */}
        <span
          className="inline-block w-1.5 h-1.5 rounded-full bg-gold/40"
          style={{
            boxShadow: "0 0 6px rgba(212, 175, 55, 0.45)",
            animation: "clkBlink 3.2s steps(1) infinite",
          }}
          aria-hidden
        />
      </div>

      <h3 className="font-display text-xl md:text-[22px] font-medium tracking-[-0.015em] mb-3 text-foreground">
        {title}
      </h3>
      <p className="text-[13.5px] leading-[1.65] text-foreground/60 mb-5 flex-1">
        {desc}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {techs.map((tech) => (
          <SmdTag key={tech}>{tech}</SmdTag>
        ))}
      </div>
    </div>
  );
}

export function Architecture() {
  const { t } = useTranslation();
  const a = t.architecture;

  return (
    <section className="section-padding relative">
      <div className="section-container">
        <ScrollReveal>
          <div className="silicon-eyebrow mb-3">0x00B0 · {a.label}</div>
          <h2 className="font-display font-medium text-3xl md:text-5xl tracking-[-0.035em] leading-[0.95]">
            {a.title}
            <span className="text-gold">{a.accent}</span>
          </h2>
        </ScrollReveal>

        {/* Functional blocks */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-14 items-stretch">
          {a.competencies.map((c, i) => (
            <ScrollReveal key={c.title} delay={i * 110} className="h-full">
              <FunctionalBlock
                num={String(i + 1).padStart(2, "0")}
                code={blockCodes[i]}
                title={c.title}
                desc={c.desc}
                techs={competencyTechs[i]}
              />
            </ScrollReveal>
          ))}
        </div>

        {/* Performance register file */}
        <div className="mt-20">
          <ScrollReveal>
            <div className="font-mono text-[10px] tracking-[0.18em] uppercase text-blue/55 mb-3">
              perf · register output
            </div>
            <h3 className="font-display text-xl md:text-2xl tracking-[-0.02em] mb-8">
              <span className="text-foreground/55">{a.performanceBefore}</span>{" "}
              <span className="text-foreground">{a.performanceAfter}</span>
            </h3>
          </ScrollReveal>
          <div
            className="grid grid-cols-2 md:grid-cols-4 rounded-md overflow-hidden"
            style={{ boxShadow: "inset 0 0 0 1px rgba(0, 153, 255, 0.14)" }}
          >
            {metricData.map((m, i) => (
              <div
                key={i}
                className="border-r border-b md:border-b-0 last:border-r-0 border-blue/8"
              >
                <MetricCell
                  value={m.value}
                  suffix={m.suffix}
                  label={a.metrics[i]}
                  idx={i + 1}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Domain banks */}
        <div className="mt-20">
          <ScrollReveal>
            <div className="silicon-eyebrow mb-6">{a.domainsLabel}</div>
          </ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
            {a.domains.map((title, i) => (
              <ScrollReveal key={title} delay={i * 90} className="h-full">
                <div
                  className="h-full flex flex-col p-5 rounded-md"
                  style={{
                    boxShadow: "inset 0 0 0 1px rgba(255, 255, 255, 0.04)",
                  }}
                >
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="font-mono text-[10px] text-blue/65 tracking-[0.18em]">
                      BANK {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <h4 className="font-display text-base font-medium text-foreground mb-4 tracking-[-0.01em]">
                    {title}
                  </h4>
                  <div className="flex flex-wrap gap-1.5 mt-auto">
                    {domainTags[i].map((tag) => (
                      <SmdTag key={tag}>{tag}</SmdTag>
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
