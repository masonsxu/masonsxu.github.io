import { useTranslation } from "../../../i18n";
import { Reveal } from "../bits";

export function Works() {
  const { t } = useTranslation();
  const items = t.projects.items;
  const pad = (i: number) => String(i + 1).padStart(2, "0");

  return (
    <div id="projects">
      <div className="w5-works-intro">
        <div className="w5-container">
          <Reveal>
            <div className="w5-eyebrow">{t.projects.label} — 02</div>
            <div className="w5-sec-head">
              <h2 className="w5-h2">{t.projects.title}<b>{t.projects.accent}</b></h2>
              <span className="w5-sec-count">{pad(items.length - 1)} works / 2021 — 2026</span>
            </div>
            <p className="w5-lede">{t.projects.description}</p>
          </Reveal>
        </div>
      </div>
      <div className="w5-stack">
        {items.map((p, i) => (
          <article key={p.title} className="w5-panel">
            <div className="w5-panel-numeral" aria-hidden="true">{pad(i)}</div>
            <div className="w5-container w5-panel-inner">
              <div>
                <div className="w5-panel-idx">P.{pad(i)} — {p.time}</div>
                <h3 className="w5-panel-title">{p.title}</h3>
                <div className="w5-panel-sub">{p.subtitle}</div>
                <p className="w5-panel-summary">{p.summary}</p>
                <div className="w5-panel-metrics">
                  {p.metrics.map(m => (
                    <div key={m.label}>
                      <span className="w5-pm-v">{m.value}</span>
                      <span className="w5-pm-l">{m.label}</span>
                    </div>
                  ))}
                </div>
                <div className="w5-tags">
                  {p.extras.map(e => <span key={e} className="w5-tag">{e}</span>)}
                </div>
              </div>
              <div className="w5-panel-hls">
                {p.highlights.map((h, hi) => (
                  <div key={h.title} className="w5-phl">
                    <span className="w5-phl-n">{pad(hi)}</span>
                    <div>
                      <h4>{h.title}</h4>
                      <p>{h.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
