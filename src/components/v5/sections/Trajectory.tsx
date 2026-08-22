import { Award, GraduationCap, TrendingUp } from "lucide-react";
import { useTranslation } from "../../../i18n";
import { Reveal } from "../bits";

export function Trajectory() {
  const { t } = useTranslation();

  return (
    <section className="w5-section" id="timeline">
      <div className="w5-container">
        <Reveal>
          <div className="w5-eyebrow">{t.timeline.careerLabel} — 04</div>
          <div className="w5-sec-head">
            <h2 className="w5-h2">{t.timeline.careerTitle}<em>·{t.timeline.careerAccent}</em></h2>
          </div>
        </Reveal>
        {t.timeline.careerItems.map(c => (
          <div key={c.company}>
            <Reveal>
              <div className="w5-tl-head">
                <h3 className="w5-tl-company">{c.company}</h3>
                {c.subtitle && <p className="w5-tl-sub">{c.subtitle}</p>}
              </div>
            </Reveal>
            <div className="w5-roles">
              {c.roles.map((r, ri) => (
                <Reveal key={r.role} delay={ri * 80}>
                  <div className="w5-role">
                    {ri === 0 && (
                      <span className="w5-role-promo">
                        <TrendingUp size={12} strokeWidth={1.5} />
                        promoted — tech lead
                      </span>
                    )}
                    <h3>{r.role}</h3>
                    {r.context && <p className="w5-role-context">{r.context}</p>}
                    <ul className="w5-role-points">
                      {r.points.map(pt => <li key={pt}>{pt}</li>)}
                    </ul>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        ))}
        <Reveal delay={120}>
          <div className="w5-edu">
            <div>
              <div className="w5-edu-label"><GraduationCap size={15} strokeWidth={1.5} />{t.timeline.educationLabel}</div>
              <p className="w5-edu-school">{t.timeline.school}</p>
              <p className="w5-edu-major">{t.timeline.major}</p>
            </div>
            <div>
              <div className="w5-edu-label"><Award size={15} strokeWidth={1.5} />{t.timeline.honorsLabel}</div>
              <ul className="w5-awards">
                {t.timeline.awards.map(a => (
                  <li key={a.text}>
                    <span>
                      <b>{a.text}</b>
                      {a.detail && <small>{a.detail}</small>}
                    </span>
                    {a.year && <i>{a.year}</i>}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
