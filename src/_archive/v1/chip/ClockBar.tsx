import { useEffect, useRef, useState } from "react";
import { useTranslation } from "../../i18n";
import { hexAddr, useMousePosRef, useScrollPulseRef } from "../../lib/silicon";

const NAV_LINKS: { id: string; label: string; port: string }[] = [
  { id: "about", label: "About", port: "P0" },
  { id: "projects", label: "Projects", port: "P1" },
  { id: "architecture", label: "Architecture", port: "P2" },
  { id: "essence", label: "Essence", port: "P3" },
  { id: "showreel", label: "Showreel", port: "P4" },
  { id: "timeline", label: "Career", port: "P5" },
  { id: "community", label: "OSS", port: "P6" },
  { id: "contact", label: "Contact", port: "P7" },
];

/**
 * ClockBar — replaces the traditional Navbar with a chip-bus chrome that
 * displays a 1Hz CLK LED (faster while scrolling), section identifier
 * (`SEC: P3 / ESSENCE`), and a live mouse-position HUD in hex.
 *
 * Renders read-only DOM mutations driven by rAF rather than React state to
 * avoid re-renders on every scroll/pointer event.
 */
export function ClockBar() {
  const { locale, setLocale } = useTranslation();
  const ledRef = useRef<HTMLSpanElement>(null);
  const sectionRef = useRef<HTMLSpanElement>(null);
  const hudRef = useRef<HTMLSpanElement>(null);
  const rateRef = useRef<HTMLSpanElement>(null);
  const pulseRef = useScrollPulseRef();
  const mouseRef = useMousePosRef();
  const [activeId, setActiveId] = useState<string>("hero");

  // rAF tick for LED + HUD without re-render
  useEffect(() => {
    let raf = 0;
    let alive = true;
    const tick = () => {
      if (!alive) return;
      const { phase, rate } = pulseRef.current;
      if (ledRef.current) {
        ledRef.current.style.opacity = phase < 0.5 ? "1" : "0.18";
      }
      if (rateRef.current) {
        rateRef.current.textContent = `${rate.toFixed(1)}Hz`;
      }
      if (hudRef.current) {
        const { x, y } = mouseRef.current;
        hudRef.current.textContent = `${hexAddr(x)} ${hexAddr(y)}`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      alive = false;
      cancelAnimationFrame(raf);
    };
  }, [pulseRef, mouseRef]);

  // Section observation for `SEC: ...` HUD
  useEffect(() => {
    const ids = ["hero", ...NAV_LINKS.map((l) => l.id)];
    const els = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el != null);
    if (els.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setActiveId(e.target.id);
          }
        }
      },
      { rootMargin: "-40% 0px -50% 0px", threshold: 0 },
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const activeLink =
    NAV_LINKS.find((l) => l.id === activeId) ?? {
      id: "hero",
      label: "Hero",
      port: "P-",
    };

  useEffect(() => {
    if (sectionRef.current) {
      sectionRef.current.textContent = `SEC ${activeLink.port}/${activeLink.label.toUpperCase()}`;
    }
  }, [activeLink]);

  return (
    <header
      className="fixed top-0 left-0 right-0 z-40 h-12 flex items-stretch border-b border-blue/10 bg-black/65 backdrop-blur-md font-mono text-[11px] tracking-[0.18em] uppercase"
      aria-label="navigation"
    >
      {/* Brand chip */}
      <a
        href="#hero"
        className="flex items-center gap-3 px-5 border-r border-blue/10 hover:bg-white/[0.03] transition-colors"
      >
        <span
          className="inline-flex items-center justify-center w-6 h-6 rounded-sm border border-gold/60 text-gold text-[11px] font-display"
          style={{ fontWeight: 500, letterSpacing: 0 }}
        >
          M
        </span>
        <span className="hidden md:inline text-foreground/80">MX-CORE</span>
        <span className="hidden lg:inline text-foreground/30">v2026</span>
      </a>

      {/* CLK indicator */}
      <div className="hidden md:flex items-center gap-2 px-4 border-r border-blue/10 text-foreground/60">
        <span
          ref={ledRef}
          className="inline-block w-1.5 h-1.5 rounded-full bg-gold"
          style={{ boxShadow: "0 0 6px rgba(212, 175, 55, 0.7)" }}
        />
        <span>CLK</span>
        <span ref={rateRef} className="text-gold/80 text-[10px]">
          1.0Hz
        </span>
      </div>

      {/* Section ID HUD */}
      <div className="hidden md:flex items-center px-4 border-r border-blue/10 text-foreground/60">
        <span ref={sectionRef}>SEC P-/HERO</span>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Port-style links */}
      <nav className="hidden lg:flex items-center text-foreground/55">
        {NAV_LINKS.map((l) => (
          <a
            key={l.id}
            href={`#${l.id}`}
            className={`group relative px-3 h-full flex items-center gap-1.5 hover:text-gold transition-colors ${
              activeId === l.id ? "text-gold" : ""
            }`}
          >
            <span className="text-[9px] text-blue/60 group-hover:text-blue">
              {l.port}
            </span>
            <span>{l.label}</span>
            {activeId === l.id && (
              <span className="absolute bottom-0 left-2 right-2 h-px bg-gold" />
            )}
          </a>
        ))}
      </nav>

      {/* Mouse HUD */}
      <div className="hidden xl:flex items-center px-4 border-l border-blue/10 text-foreground/40">
        <span className="mr-2 text-foreground/30">XY</span>
        <span ref={hudRef} className="text-blue/80">
          0x0000 0x0000
        </span>
      </div>

      {/* Locale toggle */}
      <div className="flex items-center px-3 border-l border-blue/10">
        <button
          type="button"
          onClick={() => setLocale("zh")}
          className={`px-2 py-0.5 rounded-sm text-[10px] transition-colors ${
            locale === "zh" ? "text-gold" : "text-foreground/40 hover:text-foreground/70"
          }`}
          aria-label="切换到中文"
        >
          ZH
        </button>
        <span className="text-foreground/15 mx-1">/</span>
        <button
          type="button"
          onClick={() => setLocale("en")}
          className={`px-2 py-0.5 rounded-sm text-[10px] transition-colors ${
            locale === "en" ? "text-gold" : "text-foreground/40 hover:text-foreground/70"
          }`}
          aria-label="Switch to English"
        >
          EN
        </button>
      </div>
    </header>
  );
}
