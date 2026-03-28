import ScrollReveal from './ScrollReveal'
import SectionHeader from './SectionHeader'

export default function Experience() {
  return (
    <section id="experience" className="mb-32">
      <SectionHeader title="职业经历 / Career Path" className="mb-12" />

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
                  <div className="text-primary text-sm mt-1">福建自贸试验区厦门片区 Manteia 数据科技有限公司</div>
                </div>
                <div className="font-mono text-xs text-muted bg-surface-light px-2 py-1 rounded mt-2 md:mt-0">
                  2025.03 - 至今
                </div>
              </div>
              <ul className="space-y-2 text-sm text-muted">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1.5 w-1 h-1 rounded-full bg-primary" />
                  <span>公司进入架构转型关键节点，以独立技术负责人身份承担全部技术决策——从框架评估选型到系统落地，完整交付核心数据管理平台（详见「架构实践」），方案成为公司微服务建设标准</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1.5 w-1 h-1 rounded-full bg-primary" />
                  <span>带领 8 人跨职能团队（3 后端 + 2 前端 + 2 测试 + 1 产品），建立代码评审、技术分享、IDL 优先开发等工程化机制，推动团队从「个人驱动」转向「系统驱动」</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1.5 w-1 h-1 rounded-full bg-primary" />
                  <span>在大规模生产环境中承担最终架构决策与核心模块攻坚，设计完整的安全合规体系，保障多租户数据隔离与异常全链路可追踪</span>
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
                  <div className="text-muted text-sm mt-1">福建自贸试验区厦门片区 Manteia 数据科技有限公司</div>
                </div>
                <div className="font-mono text-xs text-muted bg-surface-light px-2 py-1 rounded mt-2 md:mt-0">
                  2021.06 - 2025.03
                </div>
              </div>
              <ul className="space-y-2 text-sm text-muted">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1.5 w-1 h-1 rounded-full bg-primary" />
                  <span>以应届生身份加入技术初创团队，在没有前人经验可参考的场景下独立成长，逐步成为核心系统的实际负责人，主导性能重构与容器化改造（详见「架构实践」）</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1.5 w-1 h-1 rounded-full bg-primary" />
                  <span>长期主导生产环境部署与技术对接，在受限的生产环境中积累了大量排障与应急处理经验——这段经历也是后来驱动架构转型的直接动力</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1.5 w-1 h-1 rounded-full bg-primary" />
                  <span>在与 Python 单体架构长期共事的过程中，深刻理解了其扩展性边界，为主导后续 Go 微服务转型提供了最真实的实践依据</span>
                </li>
              </ul>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
