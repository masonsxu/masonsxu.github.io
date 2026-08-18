import { useTranslation } from "../../i18n";
import { contactLinks } from "../../data/site-content";
import { CLUSTERS } from "./clusters";
import type { ClusterDef } from "../../v2/scene";

const rgb = (c: [number, number, number]) =>
  `rgb(${Math.round(c[0] * 255)},${Math.round(c[1] * 255)},${Math.round(c[2] * 255)})`;

/** CLUSTERS is a fixed 10-entry table indexed by section number. */
const clusterAt = (i: number): ClusterDef => CLUSTERS[i] ?? CLUSTERS[CLUSTERS.length - 1]!;

function ClusterChip({ i }: { i: number }) {
  const c = clusterAt(i);
  return (
    <span className="syn-cluster-chip" style={{ "--c": rgb(c.color) } as React.CSSProperties}>
      {c.index} · {c.label} CLUSTER
    </span>
  );
}

function Keywords({ i }: { i: number }) {
  return (
    <div className="flex flex-wrap gap-2">
      {clusterAt(i).keywords.map(k => (
        <span key={k} className="syn-kw">{k}</span>
      ))}
    </div>
  );
}

export interface OverlayProps {
  active: number;
}

export function Overlay({ active }: OverlayProps) {
  const { t } = useTranslation();

  const panelProps = (i: number, side: "left" | "right" | "center" | "bottom") => ({
    className: "syn-panel-wrap",
    "data-side": side,
    "data-active": active === i,
  });

  return (
    <div className="syn-overlay">
      {/* 00 — HERO / CORE */}
      <div {...panelProps(0, "center")}>
        <div className="flex flex-col items-center gap-5 max-w-4xl">
          <ClusterChip i={0} />
          <h1 className="syn-hero-name">
            MASONS<span style={{ color: rgb(clusterAt(0).color) }}>.</span>XU
          </h1>
          <div className="syn-mono text-[12px] tracking-[0.3em] uppercase" style={{ color: "var(--syn-dim)" }}>
            {t.hero.tagline}
          </div>
          <p className="syn-body max-w-xl">{t.hero.description}</p>
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-x-10 gap-y-6">
            {t.hero.stats.map(s => (
              <div key={s.label} className="syn-metric items-center text-center">
                <span className="syn-metric-value">
                  {s.num}
                  <span style={{ color: "var(--syn-cyan)" }}>{s.suffix}</span>
                </span>
                <span className="syn-metric-label">{s.label}</span>
              </div>
            ))}
          </div>
          <div className="syn-mono text-[10.5px] tracking-[0.24em] uppercase mt-6" style={{ color: "var(--syn-faint)" }}>
            scroll to travel the neural spine <span className="syn-blink">↓</span>
          </div>
        </div>
      </div>

      {/* 01 — ABOUT / IDENTITY */}
      <div {...panelProps(1, "left")}>
        <div className="syn-panel">
          <ClusterChip i={1} />
          <div className="syn-eyebrow mt-4">0x01 · IDENTITY</div>
          <h2 className="syn-title mt-2">{t.about.label}</h2>
          <p className="syn-body mt-4">
            {t.about.paragraph.map((seg, i) => (
              <span key={i} style={seg.highlight ? { color: "var(--syn-fg)", fontWeight: 500 } : undefined}>
                {seg.text}
              </span>
            ))}
          </p>
          <ul className="mt-5 flex flex-col gap-2.5">
            {t.about.highlights.map(h => (
              <li key={h} className="flex gap-3 text-[13.5px] leading-relaxed" style={{ color: "var(--syn-dim)" }}>
                <span style={{ color: rgb(clusterAt(1).color) }}>▸</span>
                {h}
              </li>
            ))}
          </ul>
          <p className="syn-quote mt-6">
            “{t.about.quote}” <span style={{ color: "var(--syn-faint)" }}>{t.about.cite}</span>
          </p>
        </div>
      </div>

      {/* 02..05 — PROJECT CLUSTERS */}
      {t.projects.items.map((p, pi) => (
        <div key={p.title} {...panelProps(2 + pi, pi % 2 === 0 ? "left" : "right")}>
          <div className="syn-panel">
            <div className="flex items-center justify-between gap-3">
              <ClusterChip i={2 + pi} />
              <span className="syn-mono text-[10.5px] tracking-[0.14em]" style={{ color: "var(--syn-faint)" }}>
                {p.time}
              </span>
            </div>
            <h2 className="syn-title mt-4">{p.title}</h2>
            <div
              className="syn-mono text-[11.5px] tracking-[0.12em] uppercase mt-2"
              style={{ color: rgb(clusterAt(2 + pi).color) }}
            >
              {p.subtitle}
            </div>
            <p className="syn-body mt-4 text-[13.5px]">{p.summary}</p>

            <div className="mt-5 flex flex-col gap-3">
              {p.highlights.slice(0, 3).map(h => (
                <div key={h.title} className="flex gap-3">
                  <span
                    className="syn-mono text-[10px] mt-1 shrink-0"
                    style={{ color: rgb(clusterAt(2 + pi).color) }}
                  >
                    ◆
                  </span>
                  <div>
                    <div className="text-[13.5px] font-medium">{h.title}</div>
                    <div className="text-[12.5px] leading-relaxed" style={{ color: "var(--syn-faint)" }}>
                      {h.desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 flex items-center gap-8">
              {p.metrics.map(m => (
                <div key={m.label} className="syn-metric">
                  <span className="syn-metric-value" style={{ color: rgb(clusterAt(2 + pi).color) }}>
                    {m.value}
                  </span>
                  <span className="syn-metric-label">{m.label}</span>
                </div>
              ))}
            </div>
            <div className="mt-5"><Keywords i={2 + pi} /></div>
          </div>
        </div>
      ))}

      {/* 06 — SKILLS / CAPABILITY */}
      <div {...panelProps(6, "center")}>
        <div className="syn-panel syn-panel-wide">
          <ClusterChip i={6} />
          <div className="syn-eyebrow mt-4">0x06 · CAPABILITY MATRIX</div>
          <h2 className="syn-title mt-2">
            {t.architecture.title}
            <span style={{ color: rgb(clusterAt(6).color) }}>{t.architecture.accent}</span>
          </h2>
          <div className="mt-6 grid md:grid-cols-3 gap-4">
            {t.architecture.competencies.map((c, i) => (
              <div
                key={c.id}
                className="rounded-2xl p-5"
                style={{
                  background: "rgba(150,180,255,0.04)",
                  border: "1px solid rgba(150,180,255,0.12)",
                }}
              >
                <div className="syn-mono text-[10px] tracking-[0.2em]" style={{ color: "var(--syn-faint)" }}>
                  BLOCK 0{i + 1}
                </div>
                <div className="mt-2 font-semibold text-[15px]">{c.title}</div>
                <p className="mt-2 text-[12.5px] leading-relaxed" style={{ color: "var(--syn-dim)" }}>
                  {c.desc}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap justify-center gap-x-10 gap-y-4">
            {t.architecture.metrics.map((m, i) => (
              <div key={m.id} className="syn-metric items-center">
                <span className="syn-metric-value" style={{ color: rgb(clusterAt(6).color) }}>
                  {["99.9", "-50", "10+", "-87"][i]}
                  {["%", "%", "", "%"][i]}
                </span>
                <span className="syn-metric-label">{m.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 07 — CAREER / TRAJECTORY */}
      <div {...panelProps(7, "left")}>
        <div className="syn-panel syn-panel-wide">
          <ClusterChip i={7} />
          <div className="syn-eyebrow mt-4">0x07 · TRAJECTORY</div>
          <h2 className="syn-title mt-2">
            {t.timeline.careerTitle}
            <span style={{ color: rgb(clusterAt(7).color) }}>{t.timeline.careerAccent}</span>
          </h2>
          <div className="mt-3 text-[13px]" style={{ color: "var(--syn-faint)" }}>
            {t.timeline.careerItems[0]?.company}
          </div>
          <div className="mt-5 flex flex-col gap-6">
            {(t.timeline.careerItems[0]?.roles ?? []).map(r => (
              <div key={r.role}>
                <div className="flex items-center gap-3">
                  <span className="syn-mono text-[10px]" style={{ color: rgb(clusterAt(7).color) }}>◆</span>
                  <span className="font-semibold text-[14.5px]">{r.role}</span>
                </div>
                <ul className="mt-2 flex flex-col gap-1.5 pl-6">
                  {r.points.slice(0, 3).map(pt => (
                    <li key={pt} className="text-[12.5px] leading-relaxed" style={{ color: "var(--syn-dim)" }}>
                      · {pt}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-5 text-[12px]" style={{ color: "var(--syn-faint)" }}>
            {t.timeline.educationLabel} — {t.timeline.school} · {t.timeline.major}
          </div>
          <div className="mt-4"><Keywords i={7} /></div>
        </div>
      </div>

      {/* 08 — OSS / COMMUNITY */}
      <div {...panelProps(8, "right")}>
        <div className="syn-panel">
          <ClusterChip i={8} />
          <div className="syn-eyebrow mt-4">0x08 · OPEN SIGNALS</div>
          <h2 className="syn-title mt-2">
            {t.community.title}
            <span style={{ color: rgb(clusterAt(8).color) }}>{t.community.accent}</span>
          </h2>
          <p className="syn-body mt-4 text-[13.5px]">{t.community.featuredDesc}</p>
          <div className="mt-5 flex gap-6">
            {t.community.featuredStats.map(s => (
              <div key={s.label} className="syn-metric">
                <span className="syn-metric-value" style={{ color: rgb(clusterAt(8).color) }}>
                  {s.value}
                  <span className="text-[13px]">{s.unit}</span>
                </span>
                <span className="syn-metric-label">{s.label}</span>
              </div>
            ))}
          </div>
          <div className="mt-5 flex flex-col gap-2.5">
            {t.community.prs.map((pr, i) => (
              <div key={pr.id} className="flex gap-3 text-[12.5px] leading-relaxed">
                <span
                  className="syn-mono text-[9.5px] tracking-[0.1em] px-2 py-0.5 rounded-full h-fit shrink-0"
                  style={{ border: `1px solid ${rgb(clusterAt(8).color)}55`, color: rgb(clusterAt(8).color) }}
                >
                  MERGED
                </span>
                <span style={{ color: "var(--syn-dim)" }}>{pr.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 09 — CONTACT / SINGULARITY */}
      <div {...panelProps(9, "center")}>
        <div className="flex flex-col items-center gap-6 max-w-2xl">
          <ClusterChip i={9} />
          <h2 className="syn-hero-name" style={{ fontSize: "clamp(44px, 8vw, 110px)" }}>
            {t.contact.title}
            <span style={{ color: rgb(clusterAt(9).color) }}>{t.contact.accent}</span>
          </h2>
          <div className="flex flex-wrap justify-center gap-3">
            {contactLinks.map(l => (
              <a
                key={l.label}
                href={l.href}
                target={l.href.startsWith("http") ? "_blank" : undefined}
                rel="noreferrer"
                className="syn-hud-btn"
                style={{ pointerEvents: "auto", fontSize: "11px", padding: "10px 20px" }}
              >
                {l.label} ↗
              </a>
            ))}
          </div>
          <div className="syn-mono text-[10px] tracking-[0.2em] uppercase" style={{ color: "var(--syn-faint)" }}>
            {t.contact.copyright}
          </div>
        </div>
      </div>
    </div>
  );
}
