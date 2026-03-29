import ScrollReveal from './ScrollReveal'
import SectionHeader from './SectionHeader'

export default function Experience() {
  return (
    <section id="experience" className="mb-32">
      <SectionHeader title="职业经历 / Career" className="mb-12" />

      <div className="relative space-y-8">
        <div className="absolute left-3 top-2 bottom-2 w-px bg-border/20" />

        {/* Job 1 */}
        <ScrollReveal>
          <div className="relative pl-10 group">
            <div className="absolute left-0 top-1.5 w-6 h-6 rounded-full bg-surface border-4 border-bg flex items-center justify-center z-10 group-hover:border-primary transition-colors">
              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
            </div>
            <div className="bg-surface border border-border/20 rounded-lg p-6 hover:border-primary/30 transition-colors">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-text">技术负责人 / Go 后端架构师</h3>
                  <div className="text-primary text-sm mt-1">Manteia 数据科技</div>
                </div>
                <div className="font-mono text-xs text-muted bg-surface-light px-2 py-1 rounded mt-2 md:mt-0">
                  2025.03 - 至今
                </div>
              </div>
              <ul className="space-y-2 text-sm text-muted">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1.5 w-1 h-1 rounded-full bg-primary" />
                  <span>独立承担全部技术决策，从框架选型到系统落地，交付核心数据管理平台成为公司微服务标准</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1.5 w-1 h-1 rounded-full bg-primary" />
                  <span>带领 8 人跨职能团队，建立代码评审、IDL-First 等工程化机制，推动团队从「个人驱动」转向「系统驱动」</span>
                </li>
              </ul>
            </div>
          </div>
        </ScrollReveal>

        {/* Job 2 */}
        <ScrollReveal delay={0.15}>
          <div className="relative pl-10 group">
            <div className="absolute left-0 top-1.5 w-6 h-6 rounded-full bg-surface border-4 border-bg flex items-center justify-center z-10 group-hover:border-primary transition-colors">
              <div className="w-1.5 h-1.5 rounded-full bg-muted" />
            </div>
            <div className="bg-surface border border-border/20 rounded-lg p-6 hover:border-primary/50 transition-colors">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-text">Python 后端开发工程师</h3>
                  <div className="text-muted text-sm mt-1">Manteia 数据科技</div>
                </div>
                <div className="font-mono text-xs text-muted bg-surface-light px-2 py-1 rounded mt-2 md:mt-0">
                  2021.06 - 2025.03
                </div>
              </div>
              <ul className="space-y-2 text-sm text-muted">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1.5 w-1 h-1 rounded-full bg-primary" />
                  <span>以应届生加入初创团队，独立成长为系统实际负责人，主导性能重构与容器化改造</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1.5 w-1 h-1 rounded-full bg-primary" />
                  <span>长期主导生产环境部署，积累大量排障经验，成为驱动后续架构转型的直接动力</span>
                </li>
              </ul>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
