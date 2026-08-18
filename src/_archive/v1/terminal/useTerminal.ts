import { useCallback, useRef, useState } from "react";
import { useTranslation } from "../../i18n";
import { useReducedMotion } from "../../lib/silicon";
import { commands, commandNames, findCommand } from "./commands";
import type { OutputLine } from "./commands/types";
import { line, blank } from "./commands/types";

export interface TerminalEntry {
  id: number;
  /** The echoed input command; null for the system banner. */
  input: string | null;
  output: OutputLine[];
}

function banner(welcome: readonly string[]): TerminalEntry {
  return {
    id: 0,
    input: null,
    output: [...welcome.map((w) => line(w, "dim")), blank()],
  };
}

export function useTerminal() {
  const { t, locale, setLocale } = useTranslation();
  const reduced = useReducedMotion();

  const [entries, setEntries] = useState<TerminalEntry[]>(() => [banner(t.terminal.welcome)]);
  const [input, setInput] = useState("");
  const idRef = useRef(1);
  const cmdHistory = useRef<string[]>([]);
  const histIdx = useRef(-1);

  const navigateTo = useCallback(
    (sectionId: string) => {
      const el = document.getElementById(sectionId);
      el?.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
    },
    [reduced],
  );

  const clearScreen = useCallback(() => setEntries([]), []);

  const append = useCallback((inputText: string, output: OutputLine[]) => {
    setEntries((prev) => [...prev, { id: idRef.current++, input: inputText, output }]);
  }, []);

  const run = useCallback(
    (raw: string) => {
      const trimmed = raw.trim();
      if (trimmed) {
        cmdHistory.current.push(trimmed);
        if (cmdHistory.current.length > 50) cmdHistory.current.shift();
      }
      histIdx.current = -1;

      if (!trimmed) {
        append(raw, []);
        return;
      }

      const parts = trimmed.split(/\s+/);
      const name = parts[0] ?? "";
      const args = parts.slice(1);
      const cmd = findCommand(name);

      if (!cmd) {
        append(raw, [
          line(t.terminal.unknown.replace("{cmd}", name), "error"),
        ]);
        return;
      }

      const result = cmd.run({ args, t, locale, setLocale, navigateTo, clearScreen, commands });
      if (cmd.name === "clear") return; // screen already wiped, skip echo
      append(raw, result ?? []);
    },
    [append, clearScreen, locale, navigateTo, setLocale, t],
  );

  const submit = useCallback(() => {
    run(input);
    setInput("");
  }, [input, run]);

  /** Keyboard handling for the input: history (↑/↓), tab-completion, Enter. */
  const onInputKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        submit();
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        const h = cmdHistory.current;
        if (h.length === 0) return;
        histIdx.current = histIdx.current < 0 ? h.length - 1 : Math.max(0, histIdx.current - 1);
        setInput(h[histIdx.current] ?? "");
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        const h = cmdHistory.current;
        if (histIdx.current < 0) return;
        histIdx.current += 1;
        if (histIdx.current >= h.length) {
          histIdx.current = -1;
          setInput("");
        } else {
          setInput(h[histIdx.current] ?? "");
        }
        return;
      }
      if (e.key === "Tab") {
        e.preventDefault();
        const token = input.trim();
        if (!token) return;
        const matches = commandNames.filter((n) => n.startsWith(token));
        if (matches.length === 1 && matches[0]) {
          setInput(matches[0] + " ");
        } else if (matches.length > 1) {
          append(input, [line(matches.join("   "), "dim")]);
        }
      }
    },
    [append, input, submit],
  );

  return { entries, input, setInput, run, submit, onInputKeyDown };
}
