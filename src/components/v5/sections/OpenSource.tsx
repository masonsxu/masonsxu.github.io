import { FileCode2, GitPullRequest } from "lucide-react";
import { useTranslation } from "../../../i18n";
import { Reveal } from "../bits";

export function OpenSource() {
  const { t } = useTranslation();

  return (
    <section className="w5-section" id="oss">
      <div className="w5-container">
        <Reveal>
          <div className="w5-eyebrow">{t.community.label} — 05</div>
          <div className="w5-sec-head">
            <h2 className="w5-h2">Open<em>Source</em></h2>
            <span className="w5-sec-count">CloudWeGo / hertz-contrib</span>
          </div>
        </Reveal>
        <Reveal delay={80}>
          <div className="w5-oss-featured">
            <h3>
              <FileCode2 size={26} strokeWidth={1.5} />
              {t.community.featuredTitle}
              <span>{t.community.featuredSubtitle}</span>
            </h3>
            <p>{t.community.featuredDesc}</p>
            <div className="w5-oss-stats">
              {t.community.featuredStats.map(s => (
                <div key={s.label}>
                  <span className="w5-pm-v">{s.value}<span style={{ fontSize: 13, color: "var(--faint)" }}>{s.unit}</span></span>
                  <span className="w5-pm-l">{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
        <Reveal delay={140}>
          <div className="w5-pr-rows">
            {t.community.prs.map(pr => (
              <div key={pr.id} className="w5-pr">
                <span className="w5-pr-icon">
                  <GitPullRequest size={15} strokeWidth={1.5} />
                </span>
                <span className="w5-pr-id">#{pr.id}</span>
                <p>{pr.desc}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
