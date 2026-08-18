import type { ReactNode } from "react";
import type { Locale, TranslationSet } from "../../../i18n/types";

/** A single rendered line of terminal output. */
export type OutputTone = "default" | "dim" | "gold" | "blue" | "error";

export type OutputLine =
  | { type: "text"; text: string; tone?: OutputTone }
  | { type: "node"; node: ReactNode };

/** Everything a command needs to read state and cause side effects. */
export interface CommandContext {
  args: string[];
  t: TranslationSet;
  locale: Locale;
  setLocale: (l: Locale) => void;
  /** Scroll a section into view by its DOM id (e.g. "projects"). */
  navigateTo: (sectionId: string) => void;
  /** Wipe the screen. */
  clearScreen: () => void;
  /** The full registry — used by `help` and tab-completion. */
  commands: Command[];
}

/** Commands return lines to print, or void (e.g. `clear`). */
export type CommandResult = OutputLine[] | void;

export interface Command {
  name: string;
  aliases?: string[];
  usage: string;
  /** Localized one-liner shown in `help`. */
  summary: (t: TranslationSet) => string;
  run: (ctx: CommandContext) => CommandResult;
}

/* ---------- output helpers ---------- */
export const line = (text: string, tone: OutputTone = "default"): OutputLine => ({
  type: "text",
  text,
  tone,
});
export const blank = (): OutputLine => ({ type: "text", text: "" });
export const node = (n: ReactNode): OutputLine => ({ type: "node", node: n });
