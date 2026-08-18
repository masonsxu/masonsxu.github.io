import { showreelContent } from "../../../data/showreel-content";
import { requestPlay } from "../../../data/showreelBus";
import type { Command } from "./types";
import { line, blank } from "./types";

function resolveClip(token: string) {
  const q = token.toLowerCase();
  return showreelContent.find((v) => v.id.includes(q) || v.titleEn.toLowerCase().includes(q));
}

const showreel: Command = {
  name: "showreel",
  aliases: ["videos", "reel"],
  usage: "showreel",
  summary: (t) => t.terminal.cmd.showreel,
  run: ({ navigateTo }) => {
    navigateTo("showreel");
    return [
      line("Technical Showreel · 6 clips", "gold"),
      ...showreelContent.map((v) =>
        line(`  ${v.id.padEnd(20)} ${v.titleEn} · ${v.durationSeconds}s`),
      ),
      blank(),
      line("→ play <name>   例 / e.g.  play arch", "dim"),
    ];
  },
};

const play: Command = {
  name: "play",
  usage: "play <name>",
  summary: (t) => t.terminal.cmd.play,
  run: ({ args }) => {
    const token = (args[0] ?? "").toLowerCase();
    const ids = showreelContent.map((v) => v.id).join("  ");
    if (!token) {
      return [line("usage: play <name>", "error"), line(ids, "dim")];
    }
    const clip = resolveClip(token);
    if (!clip) {
      return [line(`no clip matched: ${token}`, "error"), line(ids, "dim")];
    }
    requestPlay(clip.id);
    return [line(`▶ playing ${clip.titleEn} · ${clip.durationSeconds}s`, "gold")];
  },
};

export const mediaCommands: Command[] = [showreel, play];
