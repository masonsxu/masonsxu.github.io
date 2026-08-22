import { useEffect, useState } from "react";
import { ArrowDown } from "lucide-react";
import { useTranslation } from "../../../i18n";
import { useClock } from "../bits";

const TICKER = {
  zh: ["Go 后端工程师", "分布式系统架构", "数据平台构建者", "CloudWeGo 贡献者"],
  en: ["Go Backend Engineer", "Distributed Systems", "Data Platform Builder", "CloudWeGo Contributor"],
};

export function Hero() {
  const { t, locale } = useTranslation();
  const clock = useClock();
  const [booted, setBooted] = useState(false);
  useEffect(() => {
    const id = setTimeout(() => setBooted(true), 80);
    return () => clearTimeout(id);
  }, []);
  const ticker = [...TICKER[locale], TICKER[locale][0]];

  return (
    <header className="w5-hero" id="hero" data-booted={booted}>
      <div className="w5-container">
        <div className="w5-hero-meta">
          <span>Portfolio — 2026</span>
          <span>Go / Distributed / Cloud Native</span>
          <span>Xiamen, CN — {clock}</span>
        </div>

        <h1 className="w5-hero-name">
          <span className="w5-mask"><span style={{ "--d": "80ms" } as React.CSSProperties}>徐俊飞</span></span>
        </h1>
        <div className="w5-hero-latin">
          <span className="w5-mask"><span style={{ "--d": "200ms" } as React.CSSProperties}><em>Masons</em>.Xu<b> —</b> Systems</span></span>
        </div>

        <div className="w5-hero-bottom">
          <div>
            <div className="w5-ticker" aria-hidden="true">
              <div className="w5-ticker-track">
                {ticker.map((s, i) => <span key={i}>{s}</span>)}
              </div>
            </div>
            <p className="w5-hero-desc">{t.hero.description}</p>
          </div>
          <div className="w5-hero-stats">
            {t.hero.stats.map(s => (
              <div key={s.label}>
                <span className="w5-hstat-v">{s.num}<i>{s.suffix}</i></span>
                <span className="w5-hstat-l">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="w5-scroll-cue" aria-hidden="true">
        <ArrowDown size={13} strokeWidth={1.5} />
        {t.hero.scroll}
      </div>
    </header>
  );
}
