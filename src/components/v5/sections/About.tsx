import { ArrowUpRight } from "lucide-react";
import { useTranslation } from "../../../i18n";
import { Reveal } from "../bits";

export function About() {
  const { t } = useTranslation();

  return (
    <section className="w5-section" id="about">
      <div className="w5-container">
        <Reveal>
          <div className="w5-eyebrow">{t.about.label} — 01</div>
          <h2 className="w5-h2">Profile<em>·档案</em></h2>
        </Reveal>
        <div className="w5-about-grid">
          <div>
            <Reveal delay={80}>
              <p className="w5-statement">
                {t.about.paragraph.map((seg, i) => (
                  <span key={i} style={seg.highlight ? { color: "var(--bone)", fontWeight: 500 } : undefined}>
                    {seg.text}
                  </span>
                ))}
              </p>
            </Reveal>
            <Reveal delay={160}>
              <ul className="w5-hl-list">
                {t.about.highlights.map(h => (
                  <li key={h}>
                    <span>{h}</span>
                    <ArrowUpRight size={15} strokeWidth={1.5} />
                  </li>
                ))}
              </ul>
            </Reveal>
            <Reveal delay={220}>
              <blockquote className="w5-quote">
                {t.about.quote}
                <cite>{t.about.cite}</cite>
              </blockquote>
            </Reveal>
          </div>
          <Reveal delay={140}>
            <div className="w5-kw-cloud">
              {t.timeline.careerKeywords.map(k => <span key={k} className="w5-kw">{k}</span>)}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
