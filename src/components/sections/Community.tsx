import { useTranslation } from "../../i18n";
import { ScrollReveal } from "../ScrollReveal";
import { SmdTag } from "../chip/SmdTag";

const prMeta = [
  {
    repo: "hertz-contrib/jwt",
    number: "#27",
    url: "https://github.com/hertz-contrib/jwt/pull/27",
  },
  {
    repo: "hertz-contrib/obs-opentelemetry",
    number: "#67",
    url: "https://github.com/hertz-contrib/obs-opentelemetry/pull/67",
  },
  {
    repo: "cloudwego/abcoder",
    number: "#84",
    url: "https://github.com/cloudwego/abcoder/pull/84",
  },
];

const communityTechs = [
  "Kitex RPC",
  "Hertz HTTP",
  "CloudWeGo",
  "Etcd",
  "Wire DI",
  "Casbin",
  "OpenTelemetry",
  "AGENTS.md",
  "GitHub Actions",
];

export function Community() {
  const { t } = useTranslation();
  const c = t.community;

  return (
    <section className="section-padding relative">
      <div className="section-container">
        <ScrollReveal>
          <div className="silicon-eyebrow mb-3">0x0100 · {c.label}</div>
          <h2 className="font-display font-medium text-3xl md:text-5xl tracking-[-0.035em] leading-[0.95]">
            {c.title}
            <span className="text-gold">{c.accent}</span>
          </h2>
        </ScrollReveal>

        {/* Featured project */}
        <ScrollReveal delay={120}>
          <div
            className="mt-12 p-7 md:p-9 rounded-md"
            style={{
              boxShadow: "inset 0 0 0 1px rgba(212, 175, 55, 0.22)",
              background:
                "linear-gradient(135deg, rgba(212, 175, 55, 0.04), transparent 60%)",
            }}
          >
            <div className="font-mono text-[10px] tracking-[0.22em] uppercase text-gold/85 mb-3">
              MODULE · OPEN-SOURCE
            </div>
            <h3 className="font-display text-xl md:text-2xl font-medium tracking-[-0.02em]">
              {c.featuredTitle}
              <span className="text-foreground/45 font-normal text-base ml-2">
                {c.featuredSubtitle}
              </span>
            </h3>

            <p className="mt-4 max-w-3xl text-[14px] leading-[1.7] text-foreground/65">
              {c.featuredDesc}
            </p>

            {/* Stats — register cells */}
            <div
              className="mt-6 grid grid-cols-1 md:grid-cols-3 rounded-md overflow-hidden"
              style={{ boxShadow: "inset 0 0 0 1px rgba(0, 153, 255, 0.14)" }}
            >
              {c.featuredStats.map((item, i) => (
                <div
                  key={item.label}
                  className="p-5 border-r border-b md:border-b-0 last:border-r-0 border-blue/8"
                >
                  <div className="font-mono text-[9.5px] tracking-[0.18em] uppercase text-blue/55 mb-2">
                    REG {String(i + 1).padStart(2, "0")}
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="font-display text-2xl font-medium text-gold tracking-tight tabular-nums">
                      {item.value}
                    </span>
                    <span className="font-display text-[15px] text-gold/70">
                      {item.unit}
                    </span>
                  </div>
                  <div className="mt-2 text-[12px] text-foreground/55 leading-snug">
                    {item.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Tech tags */}
            <div className="mt-6 flex flex-wrap gap-1.5">
              {communityTechs.map((tag) => (
                <SmdTag key={tag} variant="gold">
                  {tag}
                </SmdTag>
              ))}
            </div>
          </div>
        </ScrollReveal>

        {/* PR patches */}
        <div className="mt-10">
          <ScrollReveal>
            <div className="font-mono text-[10px] tracking-[0.18em] uppercase text-blue/55 mb-4">
              {c.prTitle}
            </div>
          </ScrollReveal>
          <div className="space-y-2">
            {prMeta.map((pr, i) => (
              <ScrollReveal key={pr.number} delay={i * 75}>
                <a
                  href={pr.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group grid grid-cols-1 md:grid-cols-[auto_1fr_auto] items-center gap-3 md:gap-5 px-5 py-4 rounded-md transition-colors duration-300 hover:bg-white/[0.025]"
                  style={{
                    boxShadow: "inset 0 0 0 1px rgba(0, 153, 255, 0.12)",
                  }}
                >
                  {/* Status LED + repo */}
                  <div className="flex items-center gap-3 shrink-0">
                    <span
                      className="inline-block w-1.5 h-1.5 rounded-full bg-gold"
                      style={{ boxShadow: "0 0 8px rgba(212, 175, 55, 0.65)" }}
                      aria-hidden
                    />
                    <span className="font-mono text-[12px] text-gold/85 tracking-[0.06em]">
                      {pr.repo}
                    </span>
                    <span className="font-mono text-[11px] text-foreground/45">
                      {pr.number}
                    </span>
                  </div>
                  <span className="text-[13px] text-foreground/65 leading-snug">
                    {c.prs[i].desc}
                  </span>
                  <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-blue/55 group-hover:text-gold transition-colors">
                    MERGED →
                  </span>
                </a>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
