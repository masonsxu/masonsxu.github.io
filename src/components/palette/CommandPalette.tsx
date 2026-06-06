import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "../../i18n";
import { useReducedMotion } from "../../lib/silicon";
import { findCommand } from "../terminal/commands";
import { showreelContent, type ShowreelId } from "../../data/showreel-content";
import { requestPlay } from "../../data/showreelBus";

const OPEN_EVENT = "mx:palette:open";

/** Curated terminal commands worth surfacing in the palette (run → open terminal). */
const RUN_COMMANDS = [
  "whoami",
  "neofetch",
  "metrics",
  "about",
  "contact",
  "sudo hire-me",
  "kubectl get masons",
  "git log",
  "help",
];

type NavItem = { kind: "nav"; label: string; sectionId: string };
type RunItem = { kind: "run"; label: string; cmd: string; hint: string };
type PlayItem = { kind: "play"; label: string; id: ShowreelId; hint: string };
type Item = NavItem | RunItem | PlayItem;

/** substring (high) → subsequence (low) → null (no match). */
function fuzzy(query: string, text: string): number | null {
  if (!query) return 0;
  const q = query.toLowerCase();
  const s = text.toLowerCase();
  const idx = s.indexOf(q);
  if (idx >= 0) return 1000 - idx;
  let qi = 0;
  for (let i = 0; i < s.length && qi < q.length; i++) {
    if (s[i] === q[qi]) qi += 1;
  }
  return qi === q.length ? 200 - (s.length - q.length) : null;
}

function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-1">
      <div className="px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-foreground/35">
        {label}
      </div>
      {children}
    </div>
  );
}

/**
 * CommandPalette — ⌘K / Ctrl+K fuzzy launcher. Reuses the terminal command
 * registry and the showreel registry: Navigate → scroll, Run → terminal,
 * Play → showreel player. Also opens via the `mx:palette:open` event.
 */
export function CommandPalette() {
  const { t } = useTranslation();
  const reduced = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const navItems = useMemo<NavItem[]>(
    () => t.palette.sections.map((s) => ({ kind: "nav", label: s.label, sectionId: s.id })),
    [t],
  );
  const runItems = useMemo<RunItem[]>(
    () =>
      RUN_COMMANDS.map((cmd) => {
        const base = cmd.split(" ")[0] ?? cmd;
        const def = findCommand(base);
        return { kind: "run", label: cmd, cmd, hint: def ? def.summary(t) : "" };
      }),
    [t],
  );
  const playItems = useMemo<PlayItem[]>(
    () =>
      showreelContent.map((v) => ({
        kind: "play",
        id: v.id,
        label: t.showreel.videos[v.id].title,
        hint: `${v.titleEn} · ${v.durationSeconds}s`,
      })),
    [t],
  );

  const { navList, runList, playList, flat } = useMemo(() => {
    const q = query.trim();
    const rank = <T extends Item>(arr: T[], hay: (it: T) => string) => {
      const scored = arr
        .map((it) => ({ it, s: fuzzy(q, hay(it)) }))
        .filter((x): x is { it: T; s: number } => x.s !== null);
      if (q) scored.sort((a, b) => b.s - a.s);
      return scored.map((x) => x.it);
    };
    const navList = rank(navItems, (it) => it.label);
    const runList = rank(runItems, (it) => `${it.label} ${it.hint}`);
    const playList = rank(playItems, (it) => `${it.label} ${it.hint} ${it.id}`);
    return { navList, runList, playList, flat: [...navList, ...runList, ...playList] as Item[] };
  }, [navItems, runItems, playItems, query]);

  useEffect(() => {
    setSelected(0);
  }, [query, open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((v) => !v);
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    };
    const onOpen = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener(OPEN_EVENT, onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener(OPEN_EVENT, onOpen);
    };
  }, []);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      setQuery("");
      requestAnimationFrame(() => inputRef.current?.focus());
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const execute = useCallback(
    (it: Item) => {
      setOpen(false);
      if (it.kind === "nav") {
        document.getElementById(it.sectionId)?.scrollIntoView({
          behavior: reduced ? "auto" : "smooth",
          block: "start",
        });
      } else if (it.kind === "run") {
        window.dispatchEvent(new CustomEvent("mx:terminal:open", { detail: { run: it.cmd } }));
      } else {
        requestPlay(it.id);
      }
    },
    [reduced],
  );

  const onInputKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelected((s) => Math.min(s + 1, flat.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelected((s) => Math.max(s - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const it = flat[selected];
      if (it) execute(it);
    }
  };

  if (!open) return null;

  const renderRow = (it: Item, index: number) => {
    const active = index === selected;
    const key =
      it.kind === "nav" ? `n:${it.sectionId}` : it.kind === "run" ? `r:${it.cmd}` : `p:${it.id}`;
    return (
      <button
        key={key}
        onMouseEnter={() => setSelected(index)}
        onClick={() => execute(it)}
        className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left transition-colors"
        style={{ background: active ? "rgba(0,153,255,0.12)" : "transparent" }}
      >
        <span
          className="h-3.5 w-[3px] rounded-full"
          style={{ background: active ? "var(--color-gold)" : "transparent" }}
        />
        {it.kind === "nav" && (
          <>
            <span className="font-mono text-[11px] text-blue/60">#</span>
            <span className="text-[13.5px] text-foreground/85">{it.label}</span>
          </>
        )}
        {it.kind === "run" && (
          <>
            <span className="font-mono text-[12.5px] text-gold/85">{it.label}</span>
            <span className="truncate font-mono text-[11px] text-foreground/40">{it.hint}</span>
          </>
        )}
        {it.kind === "play" && (
          <>
            <span className="font-mono text-[11px] text-gold/70">▶</span>
            <span className="text-[13.5px] text-foreground/85">{it.label}</span>
            <span className="truncate font-mono text-[11px] text-foreground/40">{it.hint}</span>
          </>
        )}
        {active && <span className="ml-auto font-mono text-[10px] text-foreground/35">↵</span>}
      </button>
    );
  };

  return (
    <div
      className="fixed inset-0 z-[80] flex items-start justify-center px-4 pt-[12vh]"
      style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)", animation: "fadeIn 0.16s ease" }}
      onClick={() => setOpen(false)}
    >
      <div
        className="w-full max-w-xl overflow-hidden rounded-lg bg-[#060608]/95"
        style={{ boxShadow: "inset 0 0 0 1px rgba(0,153,255,0.18), 0 30px 80px rgba(0,0,0,0.55)" }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={t.palette.placeholder}
      >
        {/* search */}
        <div className="flex items-center gap-2 border-b border-blue/10 px-4 py-3">
          <span className="font-mono text-[13px] text-gold/70 select-none">⌘K</span>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onInputKey}
            spellCheck={false}
            autoComplete="off"
            placeholder={t.palette.placeholder}
            className="flex-1 bg-transparent text-[14px] text-foreground/90 caret-gold outline-none placeholder:text-foreground/30"
          />
        </div>

        {/* results */}
        <div className="max-h-[52vh] overflow-y-auto p-2">
          {flat.length === 0 && (
            <div className="px-3 py-6 text-center font-mono text-[12px] text-foreground/35">
              {t.palette.empty}
            </div>
          )}
          {navList.length > 0 && (
            <Group label={t.palette.groupNav}>{navList.map((it, i) => renderRow(it, i))}</Group>
          )}
          {runList.length > 0 && (
            <Group label={t.palette.groupRun}>
              {runList.map((it, j) => renderRow(it, navList.length + j))}
            </Group>
          )}
          {playList.length > 0 && (
            <Group label={t.palette.groupPlay}>
              {playList.map((it, k) => renderRow(it, navList.length + runList.length + k))}
            </Group>
          )}
        </div>

        {/* footer */}
        <div className="flex items-center gap-4 border-t border-blue/10 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.16em] text-foreground/30">
          <span>↑↓ select</span>
          <span>↵ open</span>
          <span>esc close</span>
        </div>
      </div>
    </div>
  );
}
