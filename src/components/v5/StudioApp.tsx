import { useEffect, useRef, useState } from "react";
import { FileDown } from "lucide-react";
import { useTranslation } from "../../i18n";
import { MeshBackground } from "./MeshBackground";
import { Hero } from "./sections/Hero";
import { About } from "./sections/About";
import { Works } from "./sections/Works";
import { Capabilities } from "./sections/Capabilities";
import { Trajectory } from "./sections/Trajectory";
import { OpenSource } from "./sections/OpenSource";
import { Connect } from "./sections/Connect";
import "../../../styles/v5.css";

const NAV = [
  { id: "about", zh: "档案", en: "profile" },
  { id: "projects", zh: "项目", en: "works" },
  { id: "capabilities", zh: "能力", en: "edge" },
  { id: "timeline", zh: "轨迹", en: "path" },
  { id: "oss", zh: "开源", en: "source" },
  { id: "contact", zh: "联系", en: "connect" },
];

export function StudioApp() {
  const { locale, setLocale } = useTranslation();
  const rootRef = useRef<HTMLDivElement>(null);
  const [solid, setSolid] = useState(false);

  useEffect(() => {
    let raf = 0;
    let queued = false;
    const root = rootRef.current;
    const run = () => {
      queued = false;
      const y = window.scrollY;
      setSolid(y > 32);
      if (!root) return;
      const panels = Array.from(root.querySelectorAll<HTMLElement>(".w5-panel"));
      const vh = window.innerHeight;
      for (let i = 0; i < panels.length - 1; i++) {
        const cur = panels[i];
        const next = panels[i + 1];
        if (!cur || !next) continue;
        const rect = next.getBoundingClientRect();
        const p = Math.max(0, Math.min(1, 1 - rect.top / vh));
        cur.style.setProperty("--p", p.toFixed(3));
      }
    };
    const onScroll = () => {
      if (!queued) {
        queued = true;
        raf = requestAnimationFrame(run);
      }
    };
    run();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div className="w5-root" ref={rootRef}>
      <MeshBackground />
      <div className="w5-grain" aria-hidden="true" />

      <nav className="w5-nav" data-solid={solid} aria-label="primary">
        <div className="w5-container w5-nav-inner">
          <a className="w5-logo" href="#hero">
            <span className="w5-logo-dot" />
            masonsxu<b>@go</b>
          </a>
          <div className="w5-nav-links">
            {NAV.map((n, i) => (
              <a key={n.id} href={`#${n.id}`}>
                <i>0{i + 1}</i>{locale === "zh" ? n.zh : n.en}
              </a>
            ))}
          </div>
          <div className="w5-nav-actions">
            <button className="w5-btn-line" onClick={() => setLocale(locale === "zh" ? "en" : "zh")}>
              {locale === "zh" ? "EN" : "中文"}
            </button>
            <a className="w5-btn-accent" href="/resume.pdf">
              <FileDown size={13} strokeWidth={1.5} />
              Resume
            </a>
          </div>
        </div>
      </nav>

      <main className="w5-main">
        <Hero />
        <About />
        <Works />
        <Capabilities />
        <Trajectory />
        <OpenSource />
        <Connect />
      </main>
    </div>
  );
}
