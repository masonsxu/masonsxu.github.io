interface InterludeProps {
  type: 'quote' | 'data' | 'keywords'
  children?: React.ReactNode
}

const interludes = {
  quote: {
    content: "架构不是设计出来的，而是在解决真实问题的过程中自然涌现的",
    attribution: "— 工程哲学"
  },
  data: {
    metrics: [
      { value: "99.9%", label: "系统可用性" },
      { value: "50%", label: "响应时间降低" },
      { value: "10+", label: "微服务模块" },
      { value: "87%", label: "部署时间缩短" }
    ]
  },
  keywords: {
    items: ["Go", "微服务", "DDD", "CloudWeGo", "OpenTelemetry", "容器化", "AI 辅助开发", "架构决策"]
  }
}

export default function Interlude({ type }: InterludeProps) {
  if (type === 'quote') {
    const quote = interludes.quote
    return (
      <section className="py-24 my-16 border-y border-border/10">
        <div className="max-w-3xl mx-auto text-center">
          <blockquote className="text-2xl md:text-3xl font-serif text-text leading-relaxed mb-6">
            "{quote.content}"
          </blockquote>
          <cite className="text-muted text-sm font-mono not-italic">{quote.attribution}</cite>
        </div>
      </section>
    )
  }

  if (type === 'data') {
    const data = interludes.data
    return (
      <section className="py-20 my-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {data.metrics.map((metric) => (
            <div key={metric.label} className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-primary font-mono mb-2">{metric.value}</div>
              <div className="text-xs text-muted uppercase tracking-widest">{metric.label}</div>
            </div>
          ))}
        </div>
      </section>
    )
  }

  if (type === 'keywords') {
    const keywords = interludes.keywords
    return (
      <section className="py-20 my-16">
        <div className="flex flex-wrap justify-center gap-3">
          {keywords.items.map((item) => (
            <span
              key={item}
              className="px-4 py-2 bg-surface border border-border/20 rounded-full text-sm text-muted hover:text-primary hover:border-primary/50 transition-colors"
            >
              {item}
            </span>
          ))}
        </div>
      </section>
    )
  }

  return null
}
