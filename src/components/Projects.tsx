import ScrollReveal, { StaggerChild } from './ScrollReveal';
import SectionHeader from './SectionHeader';

export default function Projects() {
  return (
    <section id="projects" className="mb-32">
      <SectionHeader title="架构实践 / Projects" className="mb-12" />

      <ScrollReveal stagger className="space-y-6">
        {/* Project 1 */}
        <StaggerChild>
          <div className="group relative bg-surface border border-border/20 rounded-lg overflow-hidden hover:border-primary/50 transition-colors spotlight-card">
            <div className="grid md:grid-cols-12 gap-0">
              <div className="md:col-span-8 p-8 flex flex-col justify-between h-full relative z-10">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="px-2 py-0.5 rounded-full bg-accent/10 text-accent text-xs font-mono font-bold">CORE</span>
                    <span className="text-muted text-xs font-mono">2025.03 - 至今</span>
                  </div>
                  <h3 className="text-2xl font-bold text-text mb-3 group-hover:text-accent transition-colors">
                    分布式数据管理平台 — 微服务架构从 0 到 1
                  </h3>
                  <p className="text-muted text-sm leading-relaxed mb-6 max-w-2xl">
                    主导 Python 单体到 Go 微服务的整体重架构，构建新一代企业级数字化基础设施。
                  </p>
                  <div className="space-y-2 mb-8">
                    <div className="flex items-start gap-3 text-sm text-text">
                      <span className="text-accent mt-1">▹</span>
                      <span><strong className="text-text">DDD 四层架构</strong> + 仓储模式，业务逻辑与框架完全解耦</span>
                    </div>
                    <div className="flex items-start gap-3 text-sm text-text">
                      <span className="text-accent mt-1">▹</span>
                      <span>全链路可观测性（OpenTelemetry），系统保持 99.9% 可用性</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="md:col-span-4 border-l border-border/20 p-8 flex flex-col justify-center space-y-6">
                <div>
                  <div className="text-xs text-muted font-mono uppercase mb-2">Scale</div>
                  <div className="grid grid-cols-2 gap-4">
                    <StatItem value="10+" label="Services" />
                    <StatItem value="数万行" label="LOC" />
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted font-mono uppercase mb-2">Stack</div>
                  <div className="flex flex-wrap gap-2">
                    <Tag text="DDD" />
                    <Tag text="Kitex" />
                    <Tag text="Wire" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </StaggerChild>

        {/* Project 2: Compact */}
        <StaggerChild>
          <div className="group bg-surface border border-border/20 rounded-lg p-6 hover:border-primary/50 transition-colors spotlight-card">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-2 py-0.5 rounded-full bg-muted/10 text-muted text-xs font-mono font-bold">PYTHON ERA</span>
                  <span className="text-muted text-xs font-mono">2021.06 - 2025.03</span>
                </div>
                <h3 className="text-lg font-bold text-text group-hover:text-primary transition-colors">
                  遗留系统性能优化与容器化转型
                </h3>
                <p className="text-muted text-sm mt-2">
                  Asyncio 重写核心链路，响应时间降低 50%；Docker 容器化部署，时间缩短 87%
                </p>
              </div>
              <div className="flex gap-6 md:gap-8">
                <StatItem value="-50%" label="Response" />
                <StatItem value="-87%" label="Deploy" />
                <StatItem value="99.9%" label="Uptime" />
              </div>
            </div>
          </div>
        </StaggerChild>
      </ScrollReveal>
    </section>
  )
}

function StatItem({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="text-xl font-bold text-text font-mono">{value}</div>
      <div className="text-[10px] text-muted">{label}</div>
    </div>
  )
}

function Tag({ text }: { text: string }) {
  return <span className="text-xs px-2 py-1 bg-surface-light/30 rounded text-muted">{text}</span>
}
