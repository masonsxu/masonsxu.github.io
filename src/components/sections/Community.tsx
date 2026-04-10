import { useTranslation } from "../../i18n";
import { ScrollReveal, SectionLabel } from "../ScrollReveal";

const prMeta = [
  { repo: "hertz-contrib/jwt", number: "#27", url: "https://github.com/hertz-contrib/jwt/pull/27" },
  { repo: "hertz-contrib/obs-opentelemetry", number: "#67", url: "https://github.com/hertz-contrib/obs-opentelemetry/pull/67" },
  { repo: "cloudwego/abcoder", number: "#84", url: "https://github.com/cloudwego/abcoder/pull/84" },
];

const communityTechs = [
  "Kitex RPC", "Hertz HTTP", "CloudWeGo", "Etcd", "Wire DI", "Casbin", "OpenTelemetry", "AGENTS.md", "GitHub Actions",
];

export function Community() {
  const { t } = useTranslation();
  const c = t.community;

  return (
    <section className="section-padding relative">
      <div className="section-container">
        <ScrollReveal>
          <SectionLabel>{c.label}</SectionLabel>
          <h2 className="text-3xl md:text-4xl font-semibold mt-1">
            {c.title}<span className="gold-text">{c.accent}</span>
          </h2>
        </ScrollReveal>

        {/* Featured project */}
        <ScrollReveal delay={100}>
          <div className="mt-12 rounded-2xl border border-gold/[0.1] bg-gold/[0.015] p-6 md:p-10">
            <div className="flex flex-wrap items-start gap-4 mb-5">
              <h3 className="text-xl font-semibold flex-1">
                {c.featuredTitle}
                <span className="text-muted-foreground font-normal text-base ml-2">{c.featuredSubtitle}</span>
              </h3>
            </div>

            <p className="text-sm text-foreground/60 leading-relaxed mb-6 max-w-3xl">
              {c.featuredDesc}
            </p>

            {/* Highlights as horizontal flow */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {c.featuredStats.map((item) => (
                <div key={item.label} className="flex items-center gap-3 bg-white/[0.02] rounded-xl p-4 border border-white/[0.03]">
                  <span className="text-2xl font-mono font-bold gold-text">
                    {item.value}
                    <span className="text-sm text-gold/60">{item.unit}</span>
                  </span>
                  <span className="text-xs text-muted-foreground leading-snug">{item.label}</span>
                </div>
              ))}
            </div>

            {/* Tech tags */}
            <div className="flex flex-wrap gap-2">
              {communityTechs.map((tag) => (
                <span key={tag} className="text-[11px] font-mono text-gold/60 bg-gold/[0.04] px-2.5 py-1 rounded-full border border-gold/[0.06]">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </ScrollReveal>

        {/* PRs */}
        <div className="mt-8">
          <ScrollReveal>
            <h3 className="text-sm font-medium text-muted-foreground mb-4">
              {c.prTitle}
            </h3>
          </ScrollReveal>

          <div className="space-y-3">
            {prMeta.map((pr, i) => (
              <ScrollReveal key={pr.number} delay={i * 80}>
                <a
                  href={pr.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 py-3.5 px-5 rounded-xl border border-white/[0.03] bg-white/[0.01] hover:border-gold/10 transition-colors duration-300"
                >
                  <div className="flex items-center gap-2 shrink-0">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-gold/60">
                      <path d="M10 1L3 8L10 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="text-sm font-mono text-gold/80">{pr.repo}</span>
                    <span className="text-xs font-mono text-muted-foreground">{pr.number}</span>
                  </div>
                  <span className="text-sm text-foreground/60">{c.prs[i].desc}</span>
                </a>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
