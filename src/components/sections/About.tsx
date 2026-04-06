import { ScrollReveal, SectionLabel } from "../ScrollReveal";

export function About() {
  return (
    <section className="section-padding relative">
      <div className="section-container">
        <ScrollReveal>
          <SectionLabel>个人简介 / About</SectionLabel>
        </ScrollReveal>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-12 lg:gap-20 mt-4">
          {/* Left: highlights */}
          <ScrollReveal delay={100}>
            <div className="space-y-6">
              {[
                "主导 Python 单体到 CloudWeGo 微服务架构的整体转型",
                "独立设计并交付 10+ 微服务的分布式数据平台",
                "构建 Apache Iceberg + Airflow 数据湖平台",
                "向 CloudWeGo 开源项目提交 3 个已合并 PR",
              ].map((item, i) => (
                <div key={i} className="flex gap-3 items-start group">
                  <div className="w-1 h-1 rounded-full bg-gold mt-2.5 shrink-0 group-hover:scale-150 transition-transform" />
                  <p className="text-foreground/80 text-sm leading-relaxed">{item}</p>
                </div>
              ))}
            </div>
          </ScrollReveal>

          {/* Right: paragraph + quote */}
          <ScrollReveal delay={250}>
            <div>
              <p className="text-muted-foreground leading-[1.8] text-[15px]">
                5 年 Go 后端开发经验，深耕<span className="text-foreground font-medium">分布式系统架构</span>与
                <span className="text-foreground font-medium">云原生基础设施</span>。
                从应届生成长为系统实际负责人，主导表单引擎设计、跨表单数据联动、性能重构、容器化转型与 25+ 第三方系统对接，
                长期主导生产环境部署与排障，积累大量分布式系统调试经验。
              </p>

              {/* Pull quote */}
              <blockquote className="mt-10 pl-5 border-l-2 border-gold/40 relative">
                <div className="absolute -left-[7px] top-0 w-3 h-3 rounded-full bg-obsidian border-2 border-gold/60" />
                <p className="text-foreground/70 italic text-[15px] leading-relaxed">
                  "架构不是设计出来的，而是在解决真实问题的过程中自然涌现的"
                </p>
                <cite className="text-xs text-muted-foreground mt-2 block not-italic font-mono tracking-wider">
                  — 工程哲学
                </cite>
              </blockquote>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
