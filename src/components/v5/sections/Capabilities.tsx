import { ArrowUpRight, Boxes, Database, Network } from "lucide-react";
import { useTranslation } from "../../../i18n";
import { CountUp, Reveal } from "../bits";

const ICONS = { distributed: Network, "data-lake": Database, "cloud-native": Boxes } as const;

const PERF: Record<string, { target: number; decimals: number; suffix: string }> = {
  availability: { target: 99.9, decimals: 1, suffix: "%" },
  latency: { target: 50, decimals: 0, suffix: "%" },
  modules: { target: 10, decimals: 0, suffix: "+" },
  deploy: { target: 87.5, decimals: 1, suffix: "%" },
};

export function Capabilities() {
  const { t } = useTranslation();

  return (
    <section className="w5-section" id="capabilities">
      <div className="w5-container">
        <Reveal>
          <div className="w5-eyebrow">{t.architecture.label} — 03</div>
          <div className="w5-sec-head">
            <h2 className="w5-h2">Core<em>{t.architecture.accent === "竞争力" ? "·竞争力" : "Edge"}</em></h2>
          </div>
        </Reveal>
        <div className="w5-comp-rows">
          {t.architecture.competencies.map((c, i) => {
            const Icon = ICONS[c.id as keyof typeof ICONS] ?? Boxes;
            return (
              <Reveal key={c.id} delay={i * 70}>
                <div className="w5-comp-row">
                  <span className="w5-comp-n">0{i + 1}</span>
                  <div className="w5-comp-body">
                    <h3><Icon size={22} strokeWidth={1.5} />{c.title}</h3>
                    <p>{c.desc}</p>
                  </div>
                  <ArrowUpRight className="w5-comp-arrow" size={22} strokeWidth={1.5} />
                </div>
              </Reveal>
            );
          })}
        </div>
        <Reveal>
          <div className="w5-perf">
            {t.architecture.metrics.map(m => {
              const p = PERF[m.id];
              return (
                <div key={m.id}>
                  <div className="w5-perf-label">{m.label}</div>
                  {p ? <CountUp target={p.target} decimals={p.decimals} suffix={p.suffix} /> : null}
                </div>
              );
            })}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
