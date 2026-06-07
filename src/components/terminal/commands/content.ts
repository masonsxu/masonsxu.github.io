import { contactLinks } from "../../../data/site-content";
import type { Command } from "./types";
import { line, blank } from "./types";

const whoami: Command = {
  name: "whoami",
  usage: "whoami",
  summary: (t) => t.terminal.cmd.whoami,
  run: ({ t }) => [
    line("MASONS.XU", "gold"),
    line(t.hero.tagline, "blue"),
    blank(),
    line(t.hero.description),
  ],
};

const ls: Command = {
  name: "ls",
  aliases: ["projects"],
  usage: "ls [projects]",
  summary: (t) => t.terminal.cmd.ls,
  run: ({ t, navigateTo }) => {
    navigateTo("projects");
    const rows = t.projects.items.map((p, i) => {
      const id = `p${String(i + 1).padStart(2, "0")}`;
      return line(`  ${id}  ${p.title} — ${p.subtitle}`);
    });
    return [line(`${t.projects.label} · ${t.projects.items.length} entries`, "dim"), ...rows, blank(), line("→ cat p01 查看详情 / open a project", "dim")];
  },
};

const cat: Command = {
  name: "cat",
  aliases: ["open"],
  usage: "cat p01",
  summary: (t) => t.terminal.cmd.cat,
  run: ({ args, t, navigateTo }) => {
    const raw = (args[0] ?? "").toLowerCase().replace(/^p/, "");
    const idx = Number.parseInt(raw, 10) - 1;
    const item = Number.isInteger(idx) ? t.projects.items[idx] : undefined;
    if (!item) {
      return [line(`usage: cat p01..p0${t.projects.items.length}`, "error")];
    }
    navigateTo("projects");
    const out = [
      line(`${item.title}`, "gold"),
      line(item.subtitle, "blue"),
      blank(),
      line(item.summary),
      blank(),
      line("highlights:", "dim"),
      ...item.highlights.map((h) => line(`  ◆ ${h.title} — ${h.desc}`)),
      blank(),
      line(`metrics: ${item.metrics.map((m) => `${m.value} ${m.label}`).join("  ·  ")}`, "dim"),
    ];
    return out;
  },
};

const about: Command = {
  name: "about",
  usage: "about",
  summary: (t) => t.terminal.cmd.about,
  run: ({ t, navigateTo }) => {
    navigateTo("about");
    const text = t.about.paragraph.map((p) => p.text).join("");
    return [
      line(t.about.label, "gold"),
      blank(),
      line(text),
      blank(),
      ...t.about.highlights.map((h) => line(`  ▸ ${h}`, "dim")),
    ];
  },
};

const metrics: Command = {
  name: "metrics",
  aliases: ["stats"],
  usage: "metrics",
  summary: (t) => t.terminal.cmd.metrics,
  run: ({ t }) =>
    t.hero.stats.map((s) => line(`  ${`${s.num}${s.suffix}`.padEnd(8)} ${s.label}`, "gold")),
};

const contact: Command = {
  name: "contact",
  usage: "contact",
  summary: (t) => t.terminal.cmd.contact,
  run: ({ t, navigateTo }) => {
    navigateTo("contact");
    return [
      line(t.contact.label, "gold"),
      blank(),
      ...contactLinks.map((c) => line(`  ${c.label.padEnd(8)} ${c.value}`, "blue")),
    ];
  },
};

export const contentCommands: Command[] = [whoami, ls, cat, about, metrics, contact];
