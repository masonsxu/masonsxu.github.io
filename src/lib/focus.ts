import { useEffect, type RefObject } from "react";

const FOCUSABLE =
  'a[href],button:not([disabled]),input:not([disabled]),textarea:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])';

/**
 * Trap Tab/Shift+Tab focus within `ref` while `active`. Keeps keyboard users
 * inside an open overlay so focus can't wander into the inert background.
 * Focus *restoration* on close is handled by each overlay (it captures the
 * trigger element at open-time, which is more reliable than an effect).
 */
export function useFocusTrap(active: boolean, ref: RefObject<HTMLElement | null>): void {
  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const container = ref.current;
      if (!container) return;
      const items = Array.from(
        container.querySelectorAll<HTMLElement>(FOCUSABLE),
      ).filter((el) => el.offsetParent !== null);
      const first = items[0];
      const last = items[items.length - 1];
      if (!first || !last) return;
      const a = document.activeElement;
      if (e.shiftKey) {
        if (a === first || !container.contains(a)) {
          e.preventDefault();
          last.focus();
        }
      } else if (a === last || !container.contains(a)) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey, true);
    return () => document.removeEventListener("keydown", onKey, true);
  }, [active, ref]);
}
