import ScrollReveal from './ScrollReveal'
import SectionHeader from './SectionHeader'

export default function Experience() {
  return (
    <section id="experience" className="mb-32">
      <SectionHeader title="职业经历 / Career" className="mb-12" />

      <div className="relative space-y-8">
        <div className="absolute left-3 top-2 bottom-2 w-px bg-border/20" />

        {/* Job 1: Go Backend Architect */}
        <ScrollReveal>
          <div className="relative pl-10 group">
            <div className="absolute left-0 top-1.5 w-6 h-6 rounded-full bg-surface border-4 border-bg flex items-center justify-center z-10 group-hover:border-primary transition-colors">
              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
            </div>
            <div className="bg-surface border border-border/20 rounded-lg p-6 hover:border-primary/30 transition-colors">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-text">Go 后端架构师 / 技术负责人</h3>
                  <div className="text-primary text-sm mt-1">Manteia 数据科技</div>
                </div>
                <div className="font-mono text-xs text-muted bg-surface-light px-2 py-1 rounded mt-2 md:mt-0">
                  2025.03 - 至今
                </div>
              </div>
              <ul className="space-y-2 text-sm text-muted">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1.5 w-1 h-1 rounded-full bg-primary" />
                  <span>独立设计并交付基于 <strong className="text-text">CloudWeGo 生态</strong>的分布式数据平台：Kitex RPC + Hertz HTTP 双栈架构，9 模块 go.work 工作区，Thrift IDL-First 定义 10+ 微服务契约</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1.5 w-1 h-1 rounded-full bg-primary" />
                  <span>构建 <strong className="text-text">Apache Iceberg 数据湖平台</strong>：Airflow 3.1 编排 + PyIceberg 直读 + Trino 查询 + Polars 内存计算，实现 MySQL/MongoDB 多源异构数据统一入湖与跨源 JOIN</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1.5 w-1 h-1 rounded-full bg-primary" />
                  <span>设计分布式服务治理体系：Etcd 服务注册发现 + 通告地址解决容器网络映射；OpenTelemetry + Jaeger 全链路追踪；Casbin RBAC 多角色权限合并</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1.5 w-1 h-1 rounded-full bg-primary" />
                  <span>建立工程化机制：Google Wire 编译时依赖注入、6 位结构化错误码体系、DDD 四层架构规范，推动团队从「个人驱动」转向「系统驱动」</span>
                </li>
              </ul>
            </div>
          </div>
        </ScrollReveal>

        {/* Job 2: Python Backend */}
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
                  <span>以应届生加入，独立成长为系统实际负责人，主导 <strong className="text-text">Asyncio 性能重构</strong>：重写核心链路为异步架构，响应时间降低 50%</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1.5 w-1 h-1 rounded-full bg-primary" />
                  <span>主导 <strong className="text-text">Docker 容器化转型</strong>：从手动部署到容器编排，交付时间缩短 87%，建立标准化 CI/CD 流程</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1.5 w-1 h-1 rounded-full bg-primary" />
                  <span>长期主导生产环境部署与排障，积累大量分布式系统调试经验，成为驱动后续 Go 微服务架构转型的直接动力</span>
                </li>
              </ul>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
