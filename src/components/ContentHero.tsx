import { ChevronDown, Download } from 'lucide-react'
import { lazy, Suspense } from 'react'

const HeroConstellation = lazy(() => import('./HeroConstellation'))

export default function ContentHero() {
  return (
    <section className="mb-32 relative">
      <div className="absolute -top-20 -left-20 w-96 h-96 bg-gold/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Remotion Constellation Animation */}
      <div className="absolute right-0 top-0 w-full md:w-1/2 h-full pointer-events-none opacity-30 md:block">
        <Suspense fallback={null}>
          <HeroConstellation />
        </Suspense>
      </div>

      <div className="relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface border border-border/20 text-xs font-medium text-primary mb-8">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
          </span>
          可接受新机会 / Open to Work
        </div>

        <h1 className="font-bold tracking-tight text-white mb-8">
          <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2 mb-4">
            <span className="text-5xl md:text-7xl font-sans">徐俊飞</span>
            <span className="text-2xl md:text-4xl text-muted font-light font-sans italic">Masons Xu</span>
            <span className="animate-pulse text-primary text-4xl md:text-7xl font-thin -ml-2">_</span>
          </div>
          <div className="text-4xl md:text-6xl gold-gradient-text leading-tight pb-3 font-serif">
            后端技术负责人 · 分布式系统架构师
          </div>
        </h1>

        <p className="text-lg md:text-xl text-muted max-w-3xl leading-relaxed mb-10">
          5 年专注<strong className="text-white">分布式系统架构</strong>与<strong className="text-white">规模化落地</strong>，积累 Go 微服务架构设计与<strong className="text-white">企业级系统交付</strong>双重经验。<br />
          主导 Python 单体到 Go 微服务的<strong className="text-white">整体架构转型</strong>，独立完成核心分布式数据管理平台从0到1的架构设计与落地交付；<br />
          主导<strong className="text-white">众多生产环境</strong>部署，系统可用性 <strong className="text-white">99.9%</strong>。
        </p>

        <div className="flex flex-wrap gap-4">
          <a href="#projects" className="group px-8 py-3 bg-white text-black font-bold uppercase tracking-wider text-xs rounded hover:bg-gray-200 transition-all flex items-center gap-2 shimmer-effect">
            查看架构实践 / View Projects
            <ChevronDown size={16} className="transition-transform group-hover:translate-y-1" />
          </a>
          <a href="mailto:masonsxu@foxmail.com" className="px-8 py-3 bg-surface border border-border/20 text-primary font-bold uppercase tracking-wider text-xs rounded hover:border-primary/50 transition-colors">
            联系我 / Contact Me
          </a>
          <a href="resume.pdf" target="_blank" rel="noopener noreferrer" className="px-8 py-3 border border-border/20 text-muted font-bold uppercase tracking-wider text-xs rounded hover:text-white hover:border-white/30 transition-colors flex items-center gap-2">
            <Download size={16} />
            下载简历 / Resume
          </a>
        </div>
      </div>
    </section>
  )
}
