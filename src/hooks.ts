import { useRef, useState, useEffect } from "react";

export function useInView(options?: { threshold?: number; rootMargin?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: options?.threshold ?? 0.12, rootMargin: options?.rootMargin },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, inView };
}

export function useAnimatedCounter(target: number, inView: boolean, duration = 1800) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - (1 - progress) ** 3;
      setValue(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [inView, target, duration]);

  return value;
}

/**
 * Returns a ref whose `.current` always holds the latest scroll progress [0..1].
 * Uses a ref instead of state to avoid re-rendering the entire tree on every
 * scroll frame. The caller should read `.current` inside a rAF or event handler,
 * or pair it with a dedicated progress-bar component that subscribes independently.
 */
export function useScrollProgressRef() {
  const ref = useRef(0);
  const rafRef = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        const h = document.documentElement;
        const scrollHeight = h.scrollHeight - h.clientHeight;
        ref.current = scrollHeight > 0 ? h.scrollTop / scrollHeight : 0;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return ref;
}
