import { useEffect, useState } from "react";
import { Terminal } from "./Terminal";

const OPEN_EVENT = "mx:terminal:open";

function isTypingTarget(el: EventTarget | null): boolean {
  const node = el as HTMLElement | null;
  if (!node) return false;
  const tag = node.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || node.isContentEditable;
}

/**
 * TerminalLauncher — mounts once in App. Summons the overlay terminal via the
 * backtick/tilde key (Quake-style) or a `mx:terminal:open` window event. The
 * event may carry `detail.run` (from the command palette) to auto-run a command.
 * ESC closes.
 */
export function TerminalLauncher() {
  const [open, setOpen] = useState(false);
  const [initialCommand, setInitialCommand] = useState<string | undefined>(undefined);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === "`" || e.key === "~") && !isTypingTarget(e.target)) {
        e.preventDefault();
        setInitialCommand(undefined);
        setOpen((v) => !v);
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    };
    const onOpen = (e: Event) => {
      const detail = (e as CustomEvent<{ run?: string }>).detail;
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

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-start justify-center px-4 pt-[8vh] sm:pt-[12vh]"
      style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)", animation: "fadeIn 0.18s ease" }}
      onClick={() => setOpen(false)}
    >
      <div className="w-full max-w-2xl" onClick={(e) => e.stopPropagation()}>
        <Terminal variant="overlay" onClose={() => setOpen(false)} initialCommand={initialCommand} />
      </div>
    </div>
  );
}
