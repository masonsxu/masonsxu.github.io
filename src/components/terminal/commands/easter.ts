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

export const easterCommands: Command[] = [sudo, kubectl, gitlog];
