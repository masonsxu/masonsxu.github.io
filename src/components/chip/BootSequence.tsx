import { useEffect, useState } from "react";
import { useReducedMotion } from "../../lib/silicon";

const LINES: { tag: string; key: string; value: string }[] = [
  { tag: "OK", key: "CPU.identify", value: "MX-Architect rev2026" },
  { tag: "OK", key: "MEM.scan", value: "5 yrs experience mapped" },
  { tag: "OK", key: "LINK.cloudwego", value: "3 PRs merged" },
  { tag: "OK", key: "BUS.kitex", value: "10+ microservices online" },
  { tag: "OK", key: "FABRIC.online", value: "rendering chip plane" },
];

const TYPE_PER_LINE_MS = 220;
const TAIL_FADE_MS = 320;

/**
 * BootSequence — first-load 1.2s POST-style terminal log overlay.
 * Plays once per session (sessionStorage gate). Skipped under reduced motion.
 *
 * Mounts unconditionally; opts out by rendering nothing if it shouldn't run.
 * Calls `onDone` after the fade completes so the App can flip <main> to
 * its final fade-in state.
 */
export function BootSequence({ onDone }: { onDone?: () => void }) {
  const reduced = useReducedMotion();
  const shouldSkip =
    reduced ||
    (typeof window !== "undefined" && sessionStorage.getItem("boot_seen") === "1");

  const [revealed, setRevealed] = useState(0);
  const [fadingOut, setFadingOut] = useState(false);
  const [hidden, setHidden] = useState(shouldSkip);

  useEffect(() => {
    if (shouldSkip) {
      onDone?.();
      return;
    }
    const timers: number[] = [];
    LINES.forEach((_, i) => {
      timers.push(
        window.setTimeout(() => setRevealed(i + 1), (i + 1) * TYPE_PER_LINE_MS),
      );
    });
    const fadeAt = LINES.length * TYPE_PER_LINE_MS + 280;
    timers.push(
      window.setTimeout(() => setFadingOut(true), fadeAt),
    );
    timers.push(
      window.setTimeout(() => {
        setHidden(true);
        sessionStorage.setItem("boot_seen", "1");
        onDone?.();
      }, fadeAt + TAIL_FADE_MS),
    );
    return () => timers.forEach(window.clearTimeout);
  }, [shouldSkip, onDone]);

  if (hidden) return null;

  return (
    <div
      aria-hidden
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black"
      style={{
        opacity: fadingOut ? 0 : 1,
        transition: `opacity ${TAIL_FADE_MS}ms ease`,
      }}
    >
      <div className="font-mono text-[12px] md:text-[13px] leading-[1.7] text-foreground/80 tracking-[0.06em]">
        <div className="mb-3 text-gold/80 uppercase text-[10px] tracking-[0.32em]">
          MX-Silicon · POST · {new Date().getFullYear()}
        </div>
        {LINES.map((line, i) => {
          const visible = i < revealed;
          return (
            <div
              key={line.key}
              className="flex gap-3 items-baseline whitespace-nowrap"
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? "translateX(0)" : "translateX(-6px)",
                transition: "opacity 0.18s ease, transform 0.18s ease",
              }}
            >
              <span className="text-blue/80">[</span>
              <span className="text-gold/95">{line.tag}</span>
              <span className="text-blue/80">]</span>
              <span className="text-foreground/85 w-[180px]">{line.key}</span>
              <span className="text-foreground/30">………</span>
              <span className="text-foreground/65">{line.value}</span>
            </div>
          );
        })}
        <div
          className="mt-3 text-foreground/40"
          style={{
            opacity: revealed >= LINES.length ? 1 : 0,
            transition: "opacity 0.3s ease",
          }}
        >
          ready · entering fabric_
          <span
            className="inline-block w-2 h-3 ml-1 bg-gold/80 align-middle"
            style={{ animation: "clkBlink 0.7s steps(1) infinite" }}
          />
        </div>
      </div>
    </div>
  );
}
