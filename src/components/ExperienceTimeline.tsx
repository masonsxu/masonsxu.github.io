import { useCallback, useEffect, useRef, useState } from 'react'
import { layout, prepare } from '@chenglou/pretext'
import { Briefcase, ChevronDown, ChevronUp } from 'lucide-react'
import ScrollReveal, { StaggerChild } from './ScrollReveal'
import SectionHeader from './SectionHeader'

const BODY_FONT = "400 15px 'Inter', system-ui, -apple-system, sans-serif"
const BODY_LINE_HEIGHT = 26

type ExperienceEntry = {
  id: string
  role: string
  company: string
  period: string
  isActive: boolean
  highlights: string[]
}

const entries: ExperienceEntry[] = [
  {
    id: 'go-architect',
    role: 'Go 后端架构师 / 技术负责人',
    company: '福建自贸试验区厦门片区 Manteia 数据科技有限公司',
    period: '2025.03 - 至今',
    isActive: true,
    highlights: [
      '独立设计并交付基于 CloudWeGo 生态的分布式数据平台：Kitex RPC + Hertz HTTP 双栈架构，9 模块 go.work 工作区，Thrift IDL-First 定义 10+ 微服务契约',
      '构建 Apache Iceberg 数据湖平台：Airflow 3.1 编排 + PyIceberg 直读 + Trino 查询 + Polars 内存计算，实现 MySQL/MongoDB 多源异构数据统一入湖与跨源 JOIN',
      '设计分布式服务治理体系：Etcd 服务注册发现 + 通告地址解决容器网络映射；OpenTelemetry + Jaeger 全链路追踪；Casbin RBAC 多角色权限合并',
      '建立工程化机制：Google Wire 编译时依赖注入、6 位结构化错误码体系、DDD 四层架构规范，推动团队从「个人驱动」转向「系统驱动」',
    ],
  },
  {
    id: 'python-backend',
    role: 'Python 后端开发工程师',
    company: '福建自贸试验区厦门片区 Manteia 数据科技有限公司',
    period: '2021.06 - 2025.03',
    isActive: false,
    highlights: [
      '以应届生加入，独立成长为系统实际负责人，主导 Asyncio 性能重构：重写核心链路为异步架构，响应时间降低 50%',
      '主导 Docker 容器化转型：从手动部署到容器编排，交付时间缩短 87%，建立标准化 CI/CD 流程',
      '长期主导生产环境部署与排障，积累大量分布式系统调试经验，成为驱动后续 Go 微服务架构转型的直接动力',
    ],
  },
]

export default function Experience() {
  return (
    <section id="experience" className="mb-24 lg:mb-28">
      <SectionHeader title="职业经历 / Career" className="mb-12" />

      <div className="relative space-y-4">
        <div className="absolute left-3 top-2 bottom-2 w-px bg-border/20" />

        <ScrollReveal stagger>
          {entries.map((entry, index) => (
            <StaggerChild key={entry.id}>
              <ExperienceAccordionItem entry={entry} defaultOpen={index === 0} />
            </StaggerChild>
          ))}
        </ScrollReveal>
      </div>
    </section>
  )
}

function ExperienceAccordionItem({ entry, defaultOpen = false }: { entry: ExperienceEntry; defaultOpen?: boolean }) {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  const contentRef = useRef<HTMLDivElement>(null)
  const [contentHeight, setContentHeight] = useState(0)

  const computeHeight = useCallback(() => {
    if (!contentRef.current) return

    const containerWidth = contentRef.current.clientWidth
    const contentWidth = Math.max(280, containerWidth - 48)

    let totalHeight = 0
    for (const highlight of entry.highlights) {
      const prepared = prepare(highlight, BODY_FONT)
      const metrics = layout(prepared, contentWidth, BODY_LINE_HEIGHT)
      totalHeight += metrics.height
    }

    const gaps = (entry.highlights.length - 1) * 10
    setContentHeight(totalHeight + gaps)
  }, [entry.highlights])

  useEffect(() => {
    computeHeight()
    window.addEventListener('resize', computeHeight)
    document.fonts.ready.then(computeHeight)
    return () => window.removeEventListener('resize', computeHeight)
  }, [computeHeight])

  return (
    <div className="relative pl-10 group">
      <div className={`absolute left-0 top-1.5 w-6 h-6 rounded-full bg-surface border-4 border-bg flex items-center justify-center z-10 transition-colors ${entry.isActive ? 'group-hover:border-primary' : 'group-hover:border-primary'}`}>
        <div className={`w-1.5 h-1.5 rounded-full ${entry.isActive ? 'bg-primary' : 'bg-muted'}`} />
      </div>

      <div className="bg-surface border border-border/20 rounded-lg overflow-hidden hover:border-primary/30 transition-colors spotlight-card">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full text-left p-5 lg:p-6 flex items-start justify-between gap-4 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-offset-2 focus:ring-offset-bg rounded-lg"
          aria-expanded={isOpen}
        >
          <div className="flex items-start gap-3 min-w-0">
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-surface-light border border-border/20 flex items-center justify-center text-primary">
              <Briefcase size={18} />
            </div>

            <div className="min-w-0">
              <h3 className="text-lg font-bold text-text">{entry.role}</h3>
              <div className={`text-sm mt-1 ${entry.isActive ? 'text-primary' : 'text-muted'}`}>{entry.company}</div>
            </div>
          </div>

          <div className="flex-shrink-0 flex flex-col items-end gap-2">
            <div className="font-mono text-xs text-muted bg-surface-light px-2 py-1 rounded">
              {entry.period}
            </div>
            <div className="text-muted transition-transform duration-200">
              {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </div>
          </div>
        </button>

        <div
          className="overflow-hidden transition-all duration-300 ease-out"
          style={{ height: isOpen ? `${contentHeight}px` : '0px' }}
        >
          <div ref={contentRef} className="px-5 lg:px-6 pb-6 pt-0 border-t border-border/10">
            <ul className="space-y-2.5 pt-5">
              {entry.highlights.map((highlight, i) => (
                <li key={i} className="flex items-start gap-2 text-[15px] leading-7 text-muted">
                  <span className="text-primary mt-1.5 w-1 h-1 rounded-full bg-primary flex-shrink-0" />
                  <span>{highlight}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
