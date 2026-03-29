import { FlaskConical, Network, Shield, Zap } from 'lucide-react';
import ScrollReveal, { StaggerChild } from './ScrollReveal';
import SectionHeader from './SectionHeader';

export default function Architecture() {
  return (
    <section id="about" className="mb-32">
      <SectionHeader title="架构能力 / Architecture" />

      <ScrollReveal stagger className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-4">
        {/* Core: Three Pillars */}
        <StaggerChild className="md:col-span-2 md:row-span-2 h-full">
          <div className="h-full bg-surface border border-border/20 rounded-lg p-8 spotlight-card group hover:border-primary/50 transition-colors flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between mb-6">
                <div className="w-12 h-12 rounded bg-primary/10 flex items-center justify-center text-primary">
                  <FlaskConical size={24} />
                </div>
                <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-mono rounded">ARCHITECT</span>
              </div>
              <h3 className="text-xl font-bold text-text mb-6">核心竞争力</h3>
              <div className="space-y-5">
                <Pillar
                  icon={<Network size={16} />}
                  title="架构落地"
                  text="独立完成从技术选型到系统落地的全链路设计与交付"
                  tags={['DDD', '微服务', '全链路']}
                />
                <Pillar
                  icon={<Shield size={16} />}
                  title="可靠性"
                  text="对数据准确性零容忍，经大规模生产环境持续验证"
                  tags={['数据校验', '权限隔离', '高可用']}
                />
                <Pillar
                  icon={<Zap size={16} />}
                  title="工程效能"
                  text="IDL-First 流程 + AI 辅助开发，构建自动化工作流"
                  tags={['Vibe Coding', 'CloudWeGo', 'DevOps']}
                />
              </div>
            </div>
          </div>
        </StaggerChild>

        {/* Stat: Microservices */}
        <StaggerChild className="h-full">
          <div className="h-full bg-surface border border-border/20 rounded-lg p-6 spotlight-card flex flex-col justify-between group hover:border-primary/50">
            <div className="text-muted text-xs font-mono uppercase">Microservices</div>
            <div>
              <div className="text-4xl font-bold text-text font-mono group-hover:text-primary transition-colors">10+</div>
              <div className="text-xs text-muted mt-2">独立设计的微服务模块</div>
            </div>
          </div>
        </StaggerChild>

        {/* Stat: Code Lines */}
        <StaggerChild className="h-full">
          <div className="h-full bg-surface border border-border/20 rounded-lg p-6 spotlight-card flex flex-col justify-between group hover:border-primary/50">
            <div className="text-muted text-xs font-mono uppercase">Lines of Code</div>
            <div>
              <div className="text-4xl font-bold text-text font-mono group-hover:text-primary transition-colors">数万行</div>
              <div className="text-xs text-muted mt-2">Go 生产环境核心代码</div>
            </div>
          </div>
        </StaggerChild>

        {/* Stat: Architecture Transformation */}
        <StaggerChild className="md:col-span-2 h-full">
          <div className="h-full bg-surface border border-border/20 rounded-lg p-6 spotlight-card flex flex-col justify-between group hover:border-primary/50">
            <div>
              <div className="flex items-center justify-between">
                <div className="text-muted text-xs font-mono uppercase">Architecture</div>
                <div className="text-[10px] px-1.5 py-0.5 rounded bg-green-500/10 text-green-500 font-mono">MIGRATED</div>
              </div>
              <div className="mt-2 text-lg font-bold text-text font-mono group-hover:text-primary transition-colors">Python → Go</div>
              <div className="text-xs text-muted mt-1">主导整体架构转型</div>
            </div>
            <div className="mt-6 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted">Team Size</span>
                <span className="text-text font-mono">8 人</span>
              </div>
              <div className="flex items-center justify-between text-xs border-t border-text/5 pt-2">
                <span className="text-muted">Arch Docs</span>
                <span className="text-text font-mono">2,000+ 行</span>
              </div>
            </div>
          </div>
        </StaggerChild>
      </ScrollReveal>
    </section>
  )
}

function Pillar({ icon, title, text, tags }: { icon: React.ReactNode; title: string; text: string; tags: string[] }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-1.5">
        <span className="text-primary">{icon}</span>
        <span className="text-sm font-bold text-text">{title}</span>
      </div>
      <p className="text-sm text-muted pl-6 mb-2">{text}</p>
      <div className="flex flex-wrap gap-1.5 pl-6">
        {tags.map((tag) => (
          <span key={tag} className="text-[10px] px-1.5 py-0.5 bg-surface-light/50 rounded text-muted">{tag}</span>
        ))}
      </div>
    </div>
  )
}
