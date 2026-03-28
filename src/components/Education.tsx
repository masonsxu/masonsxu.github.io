import { GraduationCap, Star } from 'lucide-react';
import ScrollReveal, { StaggerChild } from './ScrollReveal';
import SectionHeader from './SectionHeader';

export default function Education() {
  return (
    <section id="education" className="mb-32">
      <SectionHeader title="教育背景 / Education" className="mb-12" />

      <ScrollReveal stagger className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <StaggerChild className="lg:col-span-2 h-full">
          <div className="h-full bg-surface border border-border/20 rounded-lg p-8 hover:border-primary/50 transition-colors spotlight-card flex flex-col justify-center">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-2">
              <h3 className="text-xl font-bold text-text font-serif">信息管理与信息系统 (大数据方向)</h3>
              <div className="font-mono text-xs text-muted bg-surface-light px-2 py-1 rounded mt-2 md:mt-0 shrink-0">
                2017 - 2021
              </div>
            </div>
            <div className="text-muted text-sm">河南城建学院 · 本科</div>
          </div>
        </StaggerChild>

        <StaggerChild className="h-full">
          <div className="h-full bg-surface border border-border/20 rounded-lg p-8 hover:border-primary/50 transition-colors spotlight-card">
            <div className="text-xs font-bold text-muted uppercase mb-4 tracking-widest">Honors & Awards</div>
            <div className="space-y-4">
              <Award
                icon={<Star size={16} className="text-yellow-500" />}
                title={<>国家级单项奖学金 <span className="text-xs text-muted font-normal ml-1">x2</span></>}
                desc="2018 / 2019"
              />
              <Award
                icon={<GraduationCap size={16} className="text-primary" />}
                title="河南省优秀学位论文"
                desc="省级荣誉 (Top 1%)"
              />
              <Award
                icon={<GraduationCap size={16} className="text-primary" />}
                title="省级单项奖学金"
                desc="2020"
              />
            </div>
          </div>
        </StaggerChild>
      </ScrollReveal>
    </section>
  )
}

function Award({ icon, title, desc }: { icon: React.ReactNode; title: React.ReactNode; desc: string }) {
  return (
    <div className="flex items-start gap-3 group">
      <div className="mt-0.5 opacity-80 group-hover:opacity-100 transition-opacity">
        {icon}
      </div>
      <div>
        <div className="text-sm text-text font-medium group-hover:text-primary transition-colors">
          {title}
        </div>
        <div className="text-xs text-muted">{desc}</div>
      </div>
    </div>
  )
}
