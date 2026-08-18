import { useEffect, useRef, useState } from "react";
import { Terminal } from "./Terminal";
import { useScrollLock } from "../../lib/scrollLock";
import { useTranslation } from "../../i18n";

const OPEN_EVENT = "mx:terminal:open";

function isTypingTarget(el: EventTarget | null): boolean {
  const node = el as HTMLElement | null;
  if (!node) return false;
  const tag = node.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || node.isContentEditable;
}

/**
 * TerminalLauncher — mounts once in App. Summons the overlay terminal via the
 * backtick/tilde key (Quake-style) or a `mx:terminal:open` window event (which
 * may carry `detail.run` from the palette). ESC closes; focus returns to the
 * trigger on close. No Tab trap here — the terminal input uses Tab for
 * command completion.
 */
export function TerminalLauncher() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [initialCommand, setInitialCommand] = useState<string | undefined>(undefined);
  const openRef = useRef(false);
  const restoreRef = useRef<HTMLElement | null>(null);

  useScrollLock(open);

  useEffect(() => {
    openRef.current = open;
    if (!open && restoreRef.current) {
      restoreRef.current.focus?.();
      restoreRef.current = null;
    }
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === "`" || e.key === "~") && !isTypingTarget(e.target)) {
        e.preventDefault();
        if (openRef.current) {
          setOpen(false);
        } else {
          restoreRef.current = document.activeElement as HTMLElement | null;
          setInitialCommand(undefined);
          setOpen(true);
        }
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    };
    const onOpen = (e: Event) => {
      const detail = (e as CustomEvent<{ run?: string }>).detail;
      restoreRef.current = document.activeElement as HTMLElement | null;
      setInitialCommand(typeof detail?.run === "string" ? detail.run : undefined);
      setOpen(true);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener(OPEN_EVENT, onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener(OPEN_EVENT, onOpen);
    };
  }, []);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-start justify-center px-4 pt-[6vh] sm:pt-[9vh]"
      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(7px)", animation: "fadeIn 0.18s ease" }}
      onClick={() => setOpen(false)}
      role="dialog"
      aria-modal="true"
      aria-label={t.terminal.title}
    >
      <div className="w-full max-w-[860px]" onClick={(e) => e.stopPropagation()}>
        <Terminal variant="overlay" onClose={() => setOpen(false)} initialCommand={initialCommand} />
      </div>
    </div>
  );
}
