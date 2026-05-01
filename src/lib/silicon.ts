import { useEffect, useRef, useState } from "react";

/* ============================================================
   Silicon — shared utilities for chip/PCB visual system
   ============================================================ */

/**
 * Format an integer to a 4-hex address like 0xCAFE.
 * Used for cursor probe HUD and section addressing.
 */
export function hexAddr(n: number, width = 4): string {
  const hex = Math.max(0, Math.floor(Math.abs(n)))
    .toString(16)
    .toUpperCase()
    .padStart(width, "0");
  return `0x${hex.slice(-width)}`;
}

/**
 * `prefers-reduced-motion: reduce` listener.
 * Returns true when user has requested reduced motion.
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return reduced;
}

/**
 * Track mouse position in viewport coordinates.
 * `ref.current` always holds the latest pos; subscribers can rAF-read.
 */
export function useMousePosRef() {
  const ref = useRef({ x: 0, y: 0 });
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      ref.current.x = e.clientX;
      ref.current.y = e.clientY;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);
  return ref;
}

/**
 * Scroll-driven clock pulse:
 *  - rate (Hz) ramps from 1Hz idle to ~30Hz at fast scroll
 *  - phase advances each rAF; subscribers read at their own cadence
 *  - returns getter to read latest pulse state without re-rendering
 */
export function useScrollPulseRef() {
  const stateRef = useRef({
    progress: 0,
    rate: 1,
    phase: 0,
    lastScrollY: 0,
    lastScrollT: 0,
  });
  const rafRef = useRef(0);

  useEffect(() => {
    let alive = true;
    let lastTick = performance.now();

    const tick = (now: number) => {
      if (!alive) return;
      const dt = (now - lastTick) / 1000;
      lastTick = now;
      // Decay rate toward idle 1Hz
      stateRef.current.rate += (1 - stateRef.current.rate) * Math.min(dt * 1.4, 1);
      stateRef.current.phase = (stateRef.current.phase + dt * stateRef.current.rate) % 1;
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    const onScroll = () => {
      const h = document.documentElement;
      const sh = h.scrollHeight - h.clientHeight;
      const sy = h.scrollTop;
      const now = performance.now();
      const s = stateRef.current;
      const dy = Math.abs(sy - s.lastScrollY);
      const dt = Math.max(now - s.lastScrollT, 1);
      const speed = dy / dt; // px per ms
      s.lastScrollY = sy;
      s.lastScrollT = now;
      s.progress = sh > 0 ? Math.min(1, Math.max(0, sy / sh)) : 0;
      // Accelerate clock proportional to scroll speed (cap ~30Hz)
      s.rate = Math.min(30, 1 + speed * 8);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      alive = false;
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return stateRef;
}
