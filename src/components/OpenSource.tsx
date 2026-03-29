import { ExternalLink, GraduationCap, Star } from 'lucide-react'
import { memo, useMemo } from 'react'
import { GitHubIcon } from './GitHubIcon'
import ScrollReveal, { StaggerChild } from './ScrollReveal'
import SectionHeader from './SectionHeader'

const PR_CONTRIBUTIONS = [
  {
    href: 'https://github.com/hertz-contrib/jwt/pull/27',
    prNum: '#27',
    title: 'hertz-contrib/jwt',
    desc: '修复 RefreshToken 中 orig_iat 被意外重置导致 MaxRefresh 窗口失效的 Bug',
  },
  {
    href: 'https://github.com/hertz-contrib/obs-opentelemetry/pull/67',
    prNum: '#67',
    title: 'obs-opentelemetry',
    desc: '优化可观测性组件，提升链路追踪稳定性与准确性',
  },
  {
    href: 'https://github.com/cloudwego/abcoder/pull/84',
    prNum: '#84',
    title: 'cloudwego/abcoder',
    desc: '修复 Go 1.25+ 环境下 sonic 依赖版本导致的安装编译错误',
  },
] as const

const FEATURED_TAGS = {
  primary: ['Kitex RPC', 'Hertz HTTP', 'Vibe Coding'] as const,
  secondary: ['Etcd', 'Wire DI', 'Casbin', 'OpenTelemetry', 'AGENTS.md', 'GitHub Actions'] as const,
}

const HIGHLIGHTS = [
  <>编写 <strong className="text-text">330+ 行 AGENTS.md</strong>，将架构规范编码为 AI 可理解的上下文</>,
  <>设计 <strong className="text-text">8 个 Custom Skills</strong> 封装端到端开发流程</>,
  <>部署 <strong className="text-text">3 个 AI 驱动 GitHub Actions</strong>，实现 DevOps 自动化</>,
] as const

const EDUCATION = {
  school: '河南城建学院',
  degree: '信息管理与信息系统（大数据方向）',
  period: '2017 - 2021',
  awards: [
    { icon: <Star size={14} className="text-yellow-500" />, title: '国家级单项奖学金 x2', desc: '2018 / 2019' },
    { icon: <GraduationCap size={14} className="text-primary" />, title: '河南省优秀学位论文', desc: '省级荣誉 (Top 1%)' },
    { icon: <GraduationCap size={14} className="text-primary" />, title: '省级单项奖学金', desc: '2020' },
  ]
}

const OSHighlight = memo(({ text }: { text: React.ReactNode }) => (
  <div className="flex items-start gap-3 text-sm text-muted">
    <span className="text-primary mt-1">▹</span>
    <span>{text}</span>
  </div>
))
OSHighlight.displayName = 'OSHighlight'

const PRCard = memo(({ pr }: { pr: typeof PR_CONTRIBUTIONS[number] }) => (
  <a
    href={pr.href}
    target="_blank"
    rel="noopener noreferrer"
    className="h-full p-5 bg-surface border border-border/20 rounded-lg hover:border-primary/50 transition-all group flex flex-col spotlight-card"
  >
    <div className="flex items-center justify-between mb-3">
      <div className="font-mono text-xs text-primary bg-primary/10 px-2 py-0.5 rounded">PR {pr.prNum}</div>
      <ExternalLink size={16} className="text-muted group-hover:text-text transition-colors" />
    </div>
    <h3 className="font-bold text-text mb-1 group-hover:text-primary transition-colors font-serif">
      {pr.title}
    </h3>
    <p className="text-xs text-muted">{pr.desc}</p>
  </a>
))
PRCard.displayName = 'PRCard'

export default function OpenSource() {
  const highlightsMemo = useMemo(() => HIGHLIGHTS.map((text, i) => <OSHighlight key={i} text={text} />), [])
  const prCardsMemo = useMemo(() => PR_CONTRIBUTIONS.map(pr => (
    <StaggerChild key={pr.prNum} className="h-full">
      <PRCard pr={pr} />
    </StaggerChild>
  )), [])

  return (
    <section id="opensource" className="mb-20">
      <SectionHeader title="开源与教育 / Open Source & Education" />

      {/* Featured Project */}
      <ScrollReveal>
        <div className="mb-8 group relative bg-surface border border-border/20 rounded-lg overflow-hidden hover:border-primary/50 transition-colors spotlight-card">
          <div className="p-8">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-mono font-bold">OPEN SOURCE</span>
              <span className="text-muted text-xs font-mono">2025</span>
              <a
                href="https://github.com/masonsxu/cloudwego-microservice-demo"
                target="_blank"
                rel="noopener noreferrer"
                className="ml-auto text-muted hover:text-text text-xs font-mono flex items-center gap-1.5 transition-colors"
              >
                <GitHubIcon size={14} />
                cloudwego-microservice-demo
              </a>
            </div>
            <h3 className="text-xl font-bold text-text mb-3 group-hover:text-primary transition-colors">
              CloudWeGo 微服务架构模板 · AI 辅助开发实践
            </h3>
            <p className="text-muted text-sm leading-relaxed mb-5 max-w-3xl">
              基于生产级 Go 微服务实践，提炼并开源 CloudWeGo 标准架构模板；系统性落地 AI 辅助开发（Vibe Coding），构建从编码到 DevOps 的全流程人机协作体系。
            </p>
            <div className="space-y-2 mb-6">
              {highlightsMemo}
            </div>
            <div className="flex flex-wrap gap-2">
              {FEATURED_TAGS.primary.map(t => (
                <span key={t} className="text-xs px-2 py-1 bg-primary/10 border border-primary/20 rounded text-primary">{t}</span>
              ))}
              {FEATURED_TAGS.secondary.map(t => (
                <span key={t} className="text-xs px-2 py-1 bg-surface-light/30 border border-border/20 rounded text-muted">{t}</span>
              ))}
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* PR Contributions */}
      <div className="text-xs text-muted font-mono uppercase tracking-widest mb-4">Merged Pull Requests</div>
      <ScrollReveal stagger className="grid md:grid-cols-3 gap-4 mb-8">
        {prCardsMemo}
      </ScrollReveal>

      {/* Education - Separate Row */}
      <div className="text-xs text-muted font-mono uppercase tracking-widest mb-4">Education</div>
      <ScrollReveal>
        <div className="bg-surface border border-border/20 rounded-lg p-6 spotlight-card hover:border-primary/50 transition-colors">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h4 className="text-lg font-bold text-text">{EDUCATION.degree}</h4>
              <div className="text-sm text-muted mt-1">{EDUCATION.school} · 本科 · {EDUCATION.period}</div>
            </div>
            <div className="flex flex-wrap gap-4">
              {EDUCATION.awards.map((award, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="shrink-0">{award.icon}</span>
                  <div>
                    <div className="text-xs text-text font-medium">{award.title}</div>
                    <div className="text-[10px] text-muted">{award.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </ScrollReveal>
    </section>
  )
}
