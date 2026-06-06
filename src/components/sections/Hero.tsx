import { useTranslation } from "../../i18n";
import { useInView, useAnimatedCounter } from "../../hooks";
import { ChipFrame } from "../chip/ChipFrame";
import { Terminal } from "../terminal/Terminal";

interface DipPin {
  idx: string;
  num: number;
  suffix: string;
  label: string;
}

function MetricPin({ pin, delay }: { pin: DipPin; delay: number }) {
  const { ref, inView } = useInView();
  const display = useAnimatedCounter(Math.round(pin.num * 10), inView, 1600);
  const formatted = (display / 10).toFixed(pin.num % 1 === 0 ? 0 : 1);

  return (
    <div
      ref={ref}
      className="relative flex flex-col gap-1.5 px-4 py-3"
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(8px)",
        transition: `opacity 0.55s ${delay}ms ease, transform 0.55s ${delay}ms ease`,
      }}
    >
      <div className="font-mono text-[10px] tracking-[0.18em] text-blue/60">
        PIN {pin.idx}
      </div>
      <div className="flex items-baseline gap-0.5">
        <span className="font-display text-3xl md:text-4xl font-medium text-gold tabular-nums tracking-tight">
          {formatted}
        </span>
        <span className="font-display text-lg text-gold/80">{pin.suffix}</span>
      </div>
      <div className="font-mono text-[10px] tracking-[0.16em] uppercase text-foreground/45">
        {pin.label}
      </div>
    </div>
  );
}

export function Hero() {
  const { t } = useTranslation();
  const pins: DipPin[] = t.hero.stats.map((s, i) => ({
    idx: String(i + 1).padStart(2, "0"),
    num: s.num,
    suffix: s.suffix,
    label: s.label,
  }));

  return (
    <section className="relative min-h-[88vh] flex items-center justify-center px-6 md:px-10">
      <div className="w-full max-w-5xl mx-auto">
        <ChipFrame partNo="MX-CORE-01" subLabel="Distributed Systems" addr="0x0000.HERO" pins={10}>
          {/* Address eyebrow */}
          <div className="silicon-eyebrow mb-8">0x0001 · MX_ARCHITECT.die</div>

          {/* Die marking — name + role */}
          <h1 className="font-display font-medium leading-[0.92] tracking-[-0.04em] text-[clamp(48px,9vw,108px)] text-foreground">
            MASONS<span className="text-gold">.</span>XU
          </h1>

          <div className="mt-5 font-mono text-[12px] tracking-[0.22em] uppercase text-foreground/55">
            {t.hero.tagline}
          </div>

          <p className="mt-6 max-w-2xl text-foreground/65 text-[15px] leading-[1.7]">
            {t.hero.description}
          </p>

          {/* DIP pin block — metrics */}
          <div
            className="mt-12 grid grid-cols-2 md:grid-cols-4 rounded-md overflow-hidden"
            style={{
              boxShadow: "inset 0 0 0 1px rgba(0, 153, 255, 0.14)",
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.012), rgba(255,255,255,0.005))",
            }}
          >
            {pins.map((p, i) => (
              <div
                key={p.idx}
                className="border-r border-b md:border-b-0 last:border-r-0 border-blue/8"
              >
                <MetricPin pin={p} delay={200 + i * 110} />
              </div>
            ))}
          </div>

          {/* Live console — inline terminal */}
          <div className="mt-10">
            <div className="silicon-eyebrow mb-3">0x0002 · LIVE_CONSOLE.tty</div>
            <Terminal variant="inline" autoFocus={false} bodyMaxHeight={200} />
          </div>

          {/* Footer status line */}
          <div className="mt-8 flex flex-wrap items-center gap-4 font-mono text-[11px] text-foreground/40 uppercase tracking-[0.2em]">
            <span className="inline-flex items-center gap-2">
              <span
                className="w-1.5 h-1.5 rounded-full bg-gold"
                style={{ animation: "clkBlink 2.4s steps(1) infinite" }}
              />
              status: ready
            </span>
            <span className="text-foreground/20">·</span>
            <span>{t.hero.scroll}</span>
            <span className="text-foreground/20">·</span>
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent("mx:palette:open"))}
              className="uppercase tracking-[0.2em] text-gold/70 transition-colors hover:text-gold"
            >
              {t.palette.hint}
            </button>
          </div>
        </ChipFrame>
      </div>
    </section>
  );
}
