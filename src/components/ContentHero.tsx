import { ChevronDown, Download } from 'lucide-react'
import { lazy, Suspense } from 'react'

const HeroConstellation = lazy(() => import('./HeroConstellation'))

export default function ContentHero() {
  return (
    <section className="mb-24 lg:mb-28 relative">
      <div className="absolute -top-16 -left-16 w-80 h-80 bg-gold/4 rounded-full blur-[72px] pointer-events-none" />

      {/* Remotion Constellation Animation */}
      <div className="absolute right-0 top-0 w-full md:w-[46%] h-full pointer-events-none opacity-18 md:block">
        <Suspense fallback={null}>
          <HeroConstellation />
        </Suspense>
      </div>

      <div className="relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface border border-border/20 text-[11px] font-medium text-primary mb-7">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
          </span>
          可接受新机会 / Open to Work
        </div>

        <h1 className="font-bold tracking-tight text-text mb-7 lg:mb-8">
          <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2 mb-3">
            <span className="text-4xl sm:text-5xl lg:text-6xl 2xl:text-7xl font-sans">徐俊飞</span>
            <span className="text-xl sm:text-2xl lg:text-[2rem] text-muted font-normal font-sans italic">Masons Xu</span>
            <span className="animate-pulse text-primary text-3xl sm:text-4xl lg:text-6xl 2xl:text-7xl font-thin -ml-1">_</span>
          </div>
          <div className="text-3xl sm:text-4xl lg:text-5xl 2xl:text-6xl gold-gradient-text leading-[1.08] pb-2 font-serif">
            Go 后端工程师 · 分布式系统 · 云原生基础设施
          </div>
        </h1>

        <p className="text-lg lg:text-[1.375rem] text-muted/92 max-w-[52rem] leading-[1.8] mb-8 lg:mb-9">
          5 年 Go 后端开发经验，深耕<strong className="text-text">分布式系统架构</strong>与<strong className="text-text">云原生基础设施</strong>。<br />
          主导 Python 单体到 <strong className="text-text">CloudWeGo 微服务架构</strong>的整体转型，独立设计并交付 10+ 微服务的分布式数据平台；<br />
          构建基于 <strong className="text-text">Apache Iceberg + Airflow + Polars</strong> 的数据湖平台，处理多源异构数据的 ETL 与跨源 JOIN；<br />
          向 <strong className="text-text">CloudWeGo 开源项目</strong>提交 3 个已合并 PR，持续贡献 RPC/HTTP 框架生态。
        </p>

        <div className="flex flex-wrap gap-3 lg:gap-4">
          <a href="#projects" className="group px-7 py-3.5 bg-pearl text-obsidian font-bold uppercase tracking-[0.18em] text-[11px] rounded hover:bg-pearl/90 transition-all flex items-center gap-2 shimmer-effect">
            查看架构实践 / View Projects
            <ChevronDown size={16} className="transition-transform group-hover:translate-y-1" />
          </a>
          <a href="mailto:masonsxu@foxmail.com" className="px-7 py-3.5 bg-surface border border-border/20 text-primary font-bold uppercase tracking-[0.18em] text-[11px] rounded hover:border-primary/50 transition-colors">
            联系我 / Contact Me
          </a>
          <a href="resume.pdf" target="_blank" rel="noopener noreferrer" className="px-7 py-3.5 border border-border/20 text-muted font-bold uppercase tracking-[0.18em] text-[11px] rounded hover:text-text hover:border-text/30 transition-colors flex items-center gap-2">
            <Download size={16} />
            下载简历 / Resume
          </a>
        </div>
      </div>
    </section>
  )
}
