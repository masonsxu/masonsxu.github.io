import { useEffect, useRef } from "react";
import { useTranslation } from "../../i18n";
import { useTerminal } from "./useTerminal";
import type { OutputLine, OutputTone } from "./commands/types";

const TONE: Record<OutputTone, string> = {
  default: "text-foreground/85",
  dim: "text-foreground/40",
  gold: "text-gold/90",
  blue: "text-blue/80",
  error: "text-[#ff7a7a]",
};

function Prompt() {
  return (
    <span className="select-none whitespace-nowrap">
      <span className="text-gold/90">masons</span>
      <span className="text-foreground/40">@</span>
      <span className="text-blue/80">portfolio</span>
      <span className="text-foreground/40">:~$&nbsp;</span>
    </span>
  );
}

function Line({ item }: { item: OutputLine }) {
  if (item.type === "node") return <div className="py-1">{item.node}</div>;
  return (
    <div className={`whitespace-pre-wrap break-words ${TONE[item.tone ?? "default"]}`}>
      {item.text === "" ? " " : item.text}
    </div>
  );
}

interface TerminalProps {
  variant?: "overlay" | "inline";
  onClose?: () => void;
  autoFocus?: boolean;
  /** Run this command once on mount (used by the command palette). */
  initialCommand?: string;
  /** Override the output area max height (px). */
  bodyMaxHeight?: number;
}

export function Terminal({ variant = "inline", onClose, autoFocus = true, initialCommand, bodyMaxHeight }: TerminalProps) {
  const { t } = useTranslation();
  const { entries, input, setInput, run, onInputKeyDown } = useTerminal();
  const bodyRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const ranInitial = useRef(false);

  useEffect(() => {
    const el = bodyRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [entries]);

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  useEffect(() => {
    if (initialCommand && !ranInitial.current) {
      ranInitial.current = true;
      run(initialCommand);
    }
  }, [initialCommand, run]);

  const focusInput = () => inputRef.current?.focus();

  return (
    <div
      className="relative flex flex-col overflow-hidden rounded-lg bg-[#060608]/95 font-mono text-[12.5px] leading-[1.7]"
      style={{ boxShadow: "inset 0 0 0 1px rgba(0,153,255,0.18), 0 30px 80px rgba(0,0,0,0.55)" }}
      onClick={focusInput}
    >
      {/* header */}
      <div className="flex items-center justify-between border-b border-blue/10 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-gold/80" style={{ animation: "clkBlink 2.4s steps(1) infinite" }} />
          <span className="text-[10px] uppercase tracking-[0.2em] text-gold/80">MX-TERM-01</span>
          <span className="text-[10px] tracking-[0.12em] text-foreground/35">· {t.terminal.title}</span>
        </div>
        {variant === "overlay" && (
          <button
            onClick={(e) => { e.stopPropagation(); onClose?.(); }}
            className="text-[10px] uppercase tracking-[0.18em] text-foreground/40 transition-colors hover:text-gold/90"
          >
            {t.terminal.closeHint} ✕
          </button>
        )}
      </div>

      {/* output */}
      <div
        ref={bodyRef}
        role="log"
        aria-live="polite"
        className="min-h-[180px] flex-1 overflow-y-auto px-4 py-3"
        style={{ maxHeight: bodyMaxHeight ? `${bodyMaxHeight}px` : variant === "overlay" ? "min(56vh, 460px)" : "320px" }}
      >
        {entries.map((entry) => (
          <div key={entry.id} className="mb-1">
            {entry.input !== null && (
              <div className="flex">
                <Prompt />
                <span className="text-foreground/90">{entry.input}</span>
              </div>
            )}
            {entry.output.map((o, i) => (
              <Line key={i} item={o} />
            ))}
          </div>
        ))}
      </div>

      {/* mobile quick-command chips */}
      <div className="flex flex-wrap gap-1.5 border-t border-blue/10 px-4 pt-2.5 sm:hidden">
        {t.terminal.chips.map((c) => (
          <button
            key={c.cmd}
            onClick={(e) => { e.stopPropagation(); run(c.cmd); focusInput(); }}
            className="smd-tag"
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* input */}
      <div className="flex items-center px-4 py-3">
        <Prompt />
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onInputKeyDown}
          spellCheck={false}
          autoCapitalize="off"
          autoComplete="off"
          aria-label={t.terminal.title}
          className="flex-1 bg-transparent text-foreground/90 caret-gold outline-none placeholder:text-foreground/25"
          placeholder={t.terminal.promptHelp}
        />
      </div>
    </div>
  );
}
