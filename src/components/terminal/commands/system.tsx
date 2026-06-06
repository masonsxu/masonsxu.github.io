import type { TranslationSet } from "../../../i18n/types";
import type { Command } from "./types";
import { line, blank, node } from "./types";

const LOGO = [
  "███╗   ███╗ ██╗  ██╗",
  "████╗ ████║ ╚██╗██╔╝",
  "██╔████╔██║  ╚███╔╝ ",
  "██║╚██╔╝██║  ██╔██╗ ",
  "██║ ╚═╝ ██║ ██╔╝ ██╗",
  "╚═╝     ╚═╝ ╚═╝  ╚═╝",
];

function Neofetch({ t }: { t: TranslationSet }) {
  const rows: [string, string][] = [
    ["host", "徐俊飞 / Masons Xu"],
    ["role", t.hero.tagline],
    ["uptime", "5 years in production"],
    ["kernel", "Go 1.24 · Python"],
    ["shell", "CloudWeGo · Kitex + Hertz"],
    ["data", "Iceberg · Airflow · Trino"],
    ["observ", "OpenTelemetry · Jaeger"],
    ["oss", "3 merged PRs @ CloudWeGo"],
    ["avail", "99.9%"],
    ["contact", "masonsxu@foxmail.com"],
  ];
  const swatches = ["#D4AF37", "#0099FF", "#FCFCFC", "rgba(252,252,252,0.25)"];
  return (
    <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 py-1">
      <pre className="m-0 select-none text-gold/80 text-[10px] leading-[1.2]">
        {LOGO.join("\n")}
      </pre>
      <div className="min-w-0">
        <div className="text-gold/90">masons@portfolio</div>
        <div className="text-foreground/20">────────────────────</div>
        {rows.map(([k, v]) => (
          <div key={k} className="flex gap-2">
            <span className="w-16 shrink-0 text-blue/80">{k}</span>
            <span className="break-words text-foreground/80">{v}</span>
          </div>
        ))}
        <div className="mt-2 flex gap-1.5">
          {swatches.map((c, i) => (
            <span
              key={i}
              className="inline-block h-3 w-5 rounded-[2px]"
              style={{ background: c }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

const neofetch: Command = {
  name: "neofetch",
  aliases: ["info"],
  usage: "neofetch",
  summary: (t) => t.terminal.cmd.neofetch,
  run: ({ t }) => [node(<Neofetch t={t} />)],
};

const help: Command = {
  name: "help",
  aliases: ["?"],
  usage: "help",
  summary: (t) => t.terminal.cmd.help,
  run: ({ commands, t }) => {
    const rows = commands
      .filter((c) => c.name !== "help")
      .map((c) => line(`  ${c.usage.padEnd(18)} ${c.summary(t)}`));
    return [line("Available commands:", "gold"), ...rows, blank(), line(t.terminal.promptHelp, "dim")];
  },
};

const clear: Command = {
  name: "clear",
  aliases: ["cls"],
  usage: "clear",
  summary: (t) => t.terminal.cmd.clear,
  run: ({ clearScreen }) => {
    clearScreen();
  },
};

const lang: Command = {
  name: "lang",
  usage: "lang zh|en",
  summary: (t) => t.terminal.cmd.lang,
  run: ({ args, locale, setLocale }) => {
    const next = (args[0] ?? "").toLowerCase();
    if (next === "zh" || next === "en") {
      setLocale(next);
      return [line(`locale → ${next}`, "gold")];
    }
    return [line(`current locale: ${locale}`, "dim"), line("usage: lang zh|en", "dim")];
  },
};

export const systemCommands: Command[] = [help, neofetch, clear, lang];
