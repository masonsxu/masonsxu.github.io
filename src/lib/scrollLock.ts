import { useEffect } from "react";

/**
 * Ref-counted body scroll lock. Multiple overlays (terminal, palette, video
 * modal) can request a lock concurrently without racing each other's
 * `body.style.overflow` writes — the body only unlocks when the last holder
 * releases.
 */
let lockCount = 0;
let previousOverflow = "";

function acquire() {
  if (lockCount === 0) {
    previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
  }
  lockCount += 1;
}

function release() {
  lockCount = Math.max(0, lockCount - 1);
  if (lockCount === 0) {
    document.body.style.overflow = previousOverflow;
  }
}

/** Lock body scroll while `active` is true; auto-releases on cleanup. */
export function useScrollLock(active: boolean): void {
  useEffect(() => {
    if (!active) return;
    acquire();
    return release;
  }, [active]);
}
