import type { Command, OutputLine } from "./types";
import { line, blank } from "./types";

const sudo: Command = {
  name: "sudo",
  usage: "sudo hire-me",
  summary: (t) => t.terminal.cmd.sudo,
  run: ({ args, navigateTo }) => {
    const target = args.join(" ").toLowerCase();
    if (target === "hire-me" || target === "hireme" || target.startsWith("hire")) {
      navigateTo("contact");
      return [
        line("[sudo] authenticating recruiter… ", "dim"),
        line("✔ access granted — welcome aboard", "gold"),
        blank(),
        line("Masons 正在寻找有挑战的分布式系统机会。"),
        line("Let's build reliable systems together → scrolling to contact."),
      ];
    }
    return [
      line("Sorry, user is not in the sudoers file. This incident will be reported. 😏", "error"),
      line("hint: try `sudo hire-me`", "dim"),
    ];
  },
};

const kubectl: Command = {
  name: "kubectl",
  usage: "kubectl get masons",
  summary: () => "🥚 kubectl get masons",
  run: ({ args }) => {
    if ((args[0] ?? "") !== "get") {
      return [line("usage: kubectl get masons", "dim")];
    }
    return [
      line("NAME      READY   STATUS    ROLE                    AGE", "dim"),
      line("masons    1/1     Running   go-backend/architect    5y", "gold"),
    ];
  },
};

const gitlog: Command = {
  name: "git",
  usage: "git log",
  summary: () => "🥚 git log",
  run: ({ args, t }) => {
    if ((args[0] ?? "") !== "log") return [line("usage: git log", "dim")];
    const out: OutputLine[] = [];
    for (const c of t.timeline.careerItems) {
      for (const r of c.roles) {
        out.push(line(`commit  ${r.role}`, "gold"));
        out.push(line("Author: Masons Xu <masonsxu@foxmail.com>", "dim"));
        out.push(line(`  @ ${c.company}`));
        out.push(blank());
      }
    }
    return out;
  },
};

const top: Command = {
  name: "top",
  usage: "top",
  summary: () => "🥚 top",
  run: () => [
    line("load: distributed-systems · cloud-native · data-platform", "dim"),
    blank(),
    line("PID   COMMAND                  CPU%   STATUS", "dim"),
    line("  1   kitex/hertz-services      34%   running", "gold"),
    line("  2   iceberg-data-lake         22%   running"),
    line("  3   cloudwego-contrib         14%   running"),
    line("  4   ai-assisted-dev           12%   running"),
    line("  5   prod-debugging             9%   ☕ daily"),
  ],
};

const uptime: Command = {
  name: "uptime",
  usage: "uptime",
  summary: () => "🥚 uptime",
  run: () => [
    line("up 5 years · 99.9% availability", "gold"),
    line("load average: shipping, debugging, mentoring", "dim"),
  ],
};

const FORTUNES = [
  "架构不是设计出来的，而是在解决真实问题的过程中自然涌现的。",
  "可靠与精工，是工程师最好的艺术。",
  "可观测性不是事后补救，而是架构的一部分。",
  "Make it work, make it right, make it fast.",
  "Premature optimization is the root of all evil. — D. Knuth",
  "Simplicity is the soul of efficiency.",
];

const fortune: Command = {
  name: "fortune",
  usage: "fortune",
  summary: () => "🥚 fortune",
  run: () => {
    const f = FORTUNES[Math.floor(Math.random() * FORTUNES.length)] ?? FORTUNES[0] ?? "";
    return [line(`" ${f} "`, "gold")];
  },
};

export const easterCommands: Command[] = [sudo, kubectl, gitlog, top, uptime, fortune];
