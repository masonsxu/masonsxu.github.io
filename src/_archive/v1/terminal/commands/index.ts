import type { Command } from "./types";
import { systemCommands } from "./system";
import { contentCommands } from "./content";
import { mediaCommands } from "./media";
import { easterCommands } from "./easter";

/** Single source of truth: append a Command anywhere above and it shows in `help`. */
export const commands: Command[] = [
  ...systemCommands,
  ...contentCommands,
  ...mediaCommands,
  ...easterCommands,
];

export function findCommand(token: string): Command | undefined {
  const name = token.toLowerCase();
  return commands.find((c) => c.name === name || c.aliases?.includes(name));
}

/** Command names + aliases, used for tab-completion. */
export const commandNames: string[] = commands.flatMap((c) => [c.name, ...(c.aliases ?? [])]);
