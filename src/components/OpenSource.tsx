import { ExternalLink } from 'lucide-react'
import { memo, useMemo } from 'react'
import ScrollReveal, { StaggerChild } from './ScrollReveal'
import SectionHeader from './SectionHeader'
import { GitHubIcon } from './GitHubIcon'

// Hoist static data to module level
const PR_CONTRIBUTIONS = [
  {
    href: 'https://github.com/hertz-contrib/jwt/pull/27',
    prNum: '#27',
    title: 'hertz-contrib/jwt',
    desc: '定位并修复 RefreshToken 中 orig_iat 被意外重置导致 MaxRefresh 窗口失效的 Bug',
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
  <>编写 <strong className="text-white">330+ 行 AGENTS.md</strong>，将架构规范、分层约束、错误处理模式等领域知识编码为 AI 可理解的结构化上下文</>,
  <>设计 <strong className="text-white">8 个 Custom Skills</strong> 封装端到端开发流程（如 /add-rpc-method 一键完成 IDL→DAL→Converter→Logic→Handler 全层实现 + 测试编写）</>,
  <>部署 <strong className="text-white">3 个 AI 驱动 GitHub Actions</strong>（Issue 自动实现 / PR 自动 Review / Issue 自动分类），实现 DevOps 自动化</>,
] as const

// Memoize highlight component
const OSHighlight = memo(({ text }: { text: React.ReactNode }) => (
  <div className="flex items-start gap-3 text-sm text-muted">
    <span className="text-primary mt-1">▹</span>
    <span>{text}</span>
  </div>
))
OSHighlight.displayName = 'OSHighlight'

// Memoize PR card component
const PRCard = memo(({ pr }: { pr: typeof PR_CONTRIBUTIONS[number] }) => (
  <a
    href={pr.href}
    target="_blank"
    rel="noopener noreferrer"
    className="block h-full p-5 bg-surface border border-border/20 rounded-lg hover:border-primary/50 hover:bg-surface-light/30 transition-all group flex flex-col"
  >
    <div className="flex items-center justify-between mb-3">
      <div className="font-mono text-xs text-primary bg-primary/10 px-2 py-0.5 rounded">PR {pr.prNum}</div>
      <ExternalLink size={16} className="text-muted group-hover:text-white transition-colors" />
    </div>
    <h3 className="font-bold text-white mb-1 group-hover:text-primary transition-colors font-serif">
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
      <SectionHeader title="开源贡献 / Open Source" />

      {/* Featured Project */}
      <ScrollReveal>
        <div className="mb-8 group relative bg-surface border border-border/20 rounded-lg overflow-hidden hover:border-primary/50 transition-colors">
          <div className="p-8">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-mono font-bold">OPEN SOURCE</span>
              <span className="text-muted text-xs font-mono">2025</span>
              <a
                href="https://github.com/masonsxu/cloudwego-microservice-demo"
                target="_blank"
                rel="noopener noreferrer"
                className="ml-auto text-muted hover:text-white text-xs font-mono flex items-center gap-1.5 transition-colors"
              >
                <GitHubIcon size={14} />
                cloudwego-microservice-demo
              </a>
            </div>
            <h3 className="text-xl font-bold text-white mb-3 group-hover:text-primary transition-colors">
              CloudWeGo 微服务架构模板 · AI 辅助开发实践
            </h3>
            <p className="text-muted text-sm leading-relaxed mb-5 max-w-3xl">
              基于生产级 Go 微服务实践，提炼并开源 CloudWeGo 标准架构模板；同时系统性落地 AI 辅助开发（Vibe Coding），将架构规范编码为 AI 可执行知识，构建从编码到 DevOps 的全流程人机协作体系。
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
      <ScrollReveal stagger className="grid md:grid-cols-3 gap-4">
        {prCardsMemo}
      </ScrollReveal>
    </section>
  )
}
