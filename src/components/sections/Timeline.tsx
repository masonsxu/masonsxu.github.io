import { ScrollReveal, SectionLabel } from "../ScrollReveal";

const career = [
  {
    role: "Go 后端架构师 / 技术负责人",
    company: "Manteia 数据科技",
    time: "2025.03 — 至今",
    points: [
      "独立设计并交付基于 CloudWeGo 生态的分布式数据平台：Kitex RPC + Hertz HTTP 双栈架构，9 模块 go.work 工作区",
      "构建 Apache Iceberg 数据湖平台：Airflow 3.1 编排 + PyIceberg 直读 + Trino 查询 + Polars 内存计算",
      "设计分布式服务治理体系：Etcd 服务注册发现 + OpenTelemetry + Jaeger 全链路追踪；Casbin RBAC",
      "建立工程化机制：Google Wire 编译时 DI、6 位结构化错误码体系、DDD 四层架构规范",
    ],
  },
  {
    role: "Python 后端开发工程师",
    company: "Manteia 数据科技",
    time: "2021.06 — 2025.03",
    points: [
      "以应届生加入，独立成长为系统实际负责人，主导 Asyncio 性能重构：重写核心链路为异步架构，响应时间降低 50%",
      "主导 Docker 容器化转型：从手动部署到容器编排，交付时间缩短 87%，建立标准化 CI/CD 流程",
      "长期主导生产环境部署与排障，积累分布式系统调试经验，驱动后续 Go 微服务架构转型",
    ],
  },
];

const awards = [
  { icon: "★", text: "国家级单项奖学金 ×2", year: "2018 / 2019" },
  { icon: "◆", text: "河南省优秀学位论文", detail: "省级荣誉 Top 1%" },
  { icon: "★", text: "省级单项奖学金", year: "2020" },
];

export function Timeline() {
  return (
    <section className="section-padding relative">
      <div className="section-container">
        {/* Career */}
        <ScrollReveal>
          <SectionLabel>职业经历 / Career</SectionLabel>
          <h2 className="text-3xl md:text-4xl font-semibold mt-1">
            成长<span className="gold-text">轨迹</span>
          </h2>
        </ScrollReveal>

        <div className="mt-12 relative">
          {/* Timeline gold line */}
          <div className="absolute left-[11px] top-2 bottom-2 w-px bg-gradient-to-b from-gold/30 via-gold/15 to-transparent hidden md:block" />

          <div className="space-y-10">
            {career.map((job, i) => (
              <ScrollReveal key={i} delay={i * 150}>
                <div className="md:pl-10 relative">
                  {/* Timeline dot */}
                  <div className="absolute left-0 top-1.5 w-[23px] h-[23px] rounded-full border-2 border-gold/40 bg-obsidian hidden md:flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-gold/70" />
                  </div>

                  <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 mb-4">
                    <h3 className="text-lg md:text-xl font-semibold">{job.role}</h3>
                    <span className="text-sm text-gold/70 font-mono">{job.company}</span>
                    <span className="text-xs text-muted-foreground font-mono ml-auto">{job.time}</span>
                  </div>

                  <ul className="space-y-2.5">
                    {job.points.map((p, j) => (
                      <li key={j} className="flex gap-2.5 items-start text-sm text-foreground/60 leading-relaxed">
                        <span className="text-gold/40 mt-1 shrink-0">›</span>
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>

        {/* Career keywords */}
        <ScrollReveal delay={100}>
          <div className="mt-10 flex flex-wrap gap-2">
            {["Go", "微服务", "DDD", "CloudWeGo", "OpenTelemetry", "容器化", "AI 辅助开发", "架构决策"].map((kw) => (
              <span key={kw} className="text-[11px] font-mono text-muted-foreground/60 border border-white/[0.04] rounded-full px-3 py-1">
                {kw}
              </span>
            ))}
          </div>
        </ScrollReveal>

        {/* ── Education ── */}
        <div className="mt-24">
          <ScrollReveal>
            <SectionLabel>教育背景 / Education</SectionLabel>
          </ScrollReveal>

          <ScrollReveal delay={100}>
            <div className="mt-6 flex flex-col md:flex-row md:items-start gap-8 md:gap-16">
              {/* School info */}
              <div className="shrink-0">
                <h3 className="text-lg font-semibold">河南城建学院</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  信息管理与信息系统（大数据方向）· 本科
                </p>
                <p className="text-xs font-mono text-muted-foreground/60 mt-1">2017 — 2021</p>
              </div>

              {/* Awards: HORIZONTAL flowing badges */}
              <div className="flex-1">
                <p className="text-xs text-muted-foreground/60 uppercase tracking-wider mb-3 font-mono">
                  Honors & Awards
                </p>
                <div className="flex flex-wrap gap-2.5">
                  {awards.map((a, i) => (
                    <div
                      key={i}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gold/[0.12] bg-gold/[0.03] hover:border-gold/25 hover:bg-gold/[0.06] transition-all duration-300 group"
                    >
                      <span className="text-gold text-sm">{a.icon}</span>
                      <span className="text-sm text-foreground/80 whitespace-nowrap">{a.text}</span>
                      {a.year && (
                        <span className="text-[10px] font-mono text-muted-foreground/60">{a.year}</span>
                      )}
                      {a.detail && (
                        <span className="text-[10px] font-mono text-gold/50 border-l border-gold/10 pl-2">
                          {a.detail}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
