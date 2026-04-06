import { useEffect, useRef } from "react";

/**
 * Self-contained scroll progress bar that updates via direct DOM mutation
 * rather than React state — zero re-renders on scroll.
 *
 * Rules applied:
 * - rerender-use-ref-transient-values: progress is transient, written to DOM directly
 * - client-passive-event-listeners: scroll listener is passive
 */
export function ScrollProgressBar() {
  const barRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef(0);

  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;

    const onScroll = () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        const h = document.documentElement;
        const scrollHeight = h.scrollHeight - h.clientHeight;
        const progress = scrollHeight > 0 ? h.scrollTop / scrollHeight : 0;
        bar.style.width = `${progress * 100}%`;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div
      ref={barRef}
      className="fixed top-0 left-0 h-px bg-gradient-to-r from-gold-deep via-gold to-gold-light z-50"
      style={{ width: "0%" }}
    />
  );
}
