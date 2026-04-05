import { Code2, Database, Network } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { prepareInlineFlow, walkInlineFlowLines, type InlineFlowLine, type InlineFlowFragment } from '../pretext/vendor/inline-flow'
import ScrollReveal, { StaggerChild } from './ScrollReveal'
import SectionHeader from './SectionHeader'

const BODY_FONT = "400 15px 'Inter', system-ui, -apple-system, sans-serif"
const BODY_LINE_HEIGHT = 26
const CODE_FONT = "600 13px 'JetBrains Mono', monospace"
const CHIP_FONT = "700 11px 'Inter', system-ui, -apple-system, sans-serif"
const CHIP_EXTRA_WIDTH = 16

type SkillDomain = {
  icon: React.ReactNode
  title: string
  description: string
  tags: string[]
  descriptionRich: RichSpec[]
}

type RichSpec =
  | { kind: 'text'; text: string }
  | { kind: 'code'; text: string }
  | { kind: 'chip'; label: string }

const domains: SkillDomain[] = [
  {
    icon: <Code2 size={18} />,
    title: 'Go 分布式系统',
    description: 'Go 1.24+ 生态，Kitex RPC + Hertz HTTP 双栈，Thrift IDL-First 契约驱动，Google Wire 编译时依赖注入，Casbin RBAC 权限治理',
    tags: ['Go 1.24+', 'Kitex RPC', 'Hertz HTTP', 'gRPC', 'GORM', 'Google Wire', 'Thrift IDL', 'Casbin RBAC'],
    descriptionRich: [
      { kind: 'code', text: 'Go 1.24+' },
      { kind: 'text', text: ' 生态，' },
      { kind: 'code', text: 'Kitex RPC' },
      { kind: 'text', text: ' + ' },
      { kind: 'code', text: 'Hertz HTTP' },
      { kind: 'text', text: ' 双栈，' },
      { kind: 'code', text: 'Thrift IDL-First' },
      { kind: 'text', text: ' 契约驱动，' },
      { kind: 'code', text: 'Google Wire' },
      { kind: 'text', text: ' 编译时依赖注入，' },
      { kind: 'chip', label: 'Casbin RBAC' },
      { kind: 'text', text: ' 权限治理' },
    ],
  },
  {
    icon: <Database size={18} />,
    title: '数据湖与 ETL',
    description: 'Apache Iceberg 数据湖，Airflow 3.1 编排，Trino SQL 查询，Polars 内存 JOIN，PyIceberg 直写 Parquet',
    tags: ['Apache Iceberg', 'Airflow 3.1', 'Trino', 'Polars', 'PyIceberg', 'PyArrow', 'Schema Evolution'],
    descriptionRich: [
      { kind: 'code', text: 'Apache Iceberg' },
      { kind: 'text', text: ' 数据湖，' },
      { kind: 'code', text: 'Airflow 3.1' },
      { kind: 'text', text: ' 编排，' },
      { kind: 'code', text: 'Trino SQL' },
      { kind: 'text', text: ' 查询，' },
      { kind: 'code', text: 'Polars' },
      { kind: 'text', text: ' 内存 JOIN，' },
      { kind: 'code', text: 'PyIceberg' },
      { kind: 'text', text: ' 直写 ' },
      { kind: 'code', text: 'Parquet' },
    ],
  },
  {
    icon: <Network size={18} />,
    title: '云原生与工程化',
    description: 'Docker 容器化，Kubernetes 编排，etcd 服务发现，OpenTelemetry + Jaeger 全链路可观测性，PostgreSQL + Redis 数据存储',
    tags: ['Docker', 'Podman', 'Kubernetes', 'etcd', 'OpenTelemetry', 'Jaeger', 'PostgreSQL', 'Redis'],
    descriptionRich: [
      { kind: 'code', text: 'Docker' },
      { kind: 'text', text: ' 容器化，' },
      { kind: 'code', text: 'Kubernetes' },
      { kind: 'text', text: ' 编排，' },
      { kind: 'code', text: 'etcd' },
      { kind: 'text', text: ' 服务发现，' },
      { kind: 'code', text: 'OpenTelemetry' },
      { kind: 'text', text: ' + ' },
      { kind: 'code', text: 'Jaeger' },
      { kind: 'text', text: ' 全链路可观测性，' },
      { kind: 'chip', label: 'PostgreSQL' },
      { kind: 'text', text: ' + ' },
      { kind: 'chip', label: 'Redis' },
    ],
  },
]

export default function Skills() {
  return (
    <section id="skills" className="mb-24 lg:mb-28">
      <SectionHeader title="Go / 分布式系统 / 云原生技术栈" className="mb-12" />

      <ScrollReveal stagger className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {domains.map((domain) => (
          <StaggerChild key={domain.title} className="h-full">
            <SkillCard domain={domain} />
          </StaggerChild>
        ))}
      </ScrollReveal>
    </section>
  )
}

function SkillCard({ domain }: { domain: SkillDomain }) {
  const contentRef = useRef<HTMLDivElement>(null)
  const [contentHeight, setContentHeight] = useState(0)

  const computeHeight = useCallback(() => {
    if (!contentRef.current) return

    const containerWidth = contentRef.current.clientWidth
    const contentWidth = Math.max(200, containerWidth - 40)

    const prepared = prepareRichInlineFlow(domain.descriptionRich)
    let lineCount = 0
    walkInlineFlowLines(prepared, contentWidth, (_line: InlineFlowLine) => {
      lineCount++
    })

    const tagsHeight = Math.ceil(domain.tags.length / 3) * 28 + 8
    setContentHeight(lineCount * BODY_LINE_HEIGHT + tagsHeight + 8)
  }, [domain])

  useEffect(() => {
    computeHeight()
    window.addEventListener('resize', computeHeight)
    document.fonts.ready.then(computeHeight)
    return () => window.removeEventListener('resize', computeHeight)
  }, [computeHeight])

  return (
    <div className="h-full bg-surface border border-border/20 rounded-lg p-5 lg:p-6 spotlight-card hover:border-primary/50 transition-colors">
      <div className="flex items-center gap-3 mb-5">
        <div className="text-primary">{domain.icon}</div>
        <h3 className="text-[15px] font-bold text-text uppercase tracking-wide">{domain.title}</h3>
      </div>

      <div ref={contentRef} className="relative overflow-hidden" style={{ height: `${contentHeight}px` }}>
        <RichInlineFlow specs={domain.descriptionRich} maxWidth={Math.max(200, (contentRef.current?.clientWidth ?? 280) - 40)} />

        <div className="absolute bottom-0 left-0 right-0 flex flex-wrap gap-2">
          {domain.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs px-2.5 py-1 bg-surface-light/50 border border-border/10 rounded text-muted hover:text-primary hover:border-primary/30 transition-colors"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

function prepareRichInlineFlow(specs: RichSpec[]) {
  return prepareInlineFlow(
    specs.map(spec => {
      if (spec.kind === 'chip') {
        return {
          text: spec.label,
          font: CHIP_FONT,
          break: 'never' as const,
          extraWidth: CHIP_EXTRA_WIDTH,
        }
      }
      if (spec.kind === 'code') {
        return {
          text: spec.text,
          font: CODE_FONT,
          extraWidth: 8,
        }
      }
      return {
        text: spec.text,
        font: BODY_FONT,
      }
    }),
  )
}

function RichInlineFlow({ specs, maxWidth }: { specs: RichSpec[]; maxWidth: number }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [lines, setLines] = useState<InlineFlowLine[]>([])

  useEffect(() => {
    const prepared = prepareRichInlineFlow(specs)
    const result: InlineFlowLine[] = []
    walkInlineFlowLines(prepared, maxWidth, (line: InlineFlowLine) => {
      result.push(line)
    })
    setLines(result)
  }, [specs, maxWidth])

  const classMap = specs.map(spec => {
    if (spec.kind === 'chip') return 'skill-chip'
    if (spec.kind === 'code') return 'skill-code'
    return 'skill-text'
  })

  return (
    <div ref={containerRef} className="mb-4">
      {lines.map((line, lineIndex) => (
        <div key={lineIndex} className="flex items-center flex-wrap gap-0" style={{ height: `${BODY_LINE_HEIGHT}px`, lineHeight: `${BODY_LINE_HEIGHT}px` }}>
          {line.fragments.map((fragment: InlineFlowFragment, fragIndex: number) => (
            <span
              key={fragIndex}
              className={classMap[fragment.itemIndex]}
              style={{ marginLeft: fragment.gapBefore > 0 ? `${fragment.gapBefore}px` : undefined }}
            >
              {fragment.text}
            </span>
          ))}
        </div>
      ))}
    </div>
  )
}
