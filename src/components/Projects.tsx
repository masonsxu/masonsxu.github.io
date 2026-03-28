import ScrollReveal, { StaggerChild } from './ScrollReveal';
import SectionHeader from './SectionHeader';

export default function Projects() {
  return (
    <section id="projects" className="mb-32">
      <SectionHeader title="架构实践 / Architecture Projects" className="mb-12" />

      <ScrollReveal stagger className="space-y-6">
        {/* Project 1 */}
        <StaggerChild>
          <div className="group relative bg-surface border border-border/20 rounded-lg overflow-hidden hover:border-primary/50 transition-colors spotlight-card">
            <div className="grid md:grid-cols-12 gap-0">
              <div className="md:col-span-8 p-8 flex flex-col justify-between h-full relative z-10">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="px-2 py-0.5 rounded-full bg-accent/10 text-accent text-xs font-mono font-bold">ENTERPRISE</span>
                    <span className="text-muted text-xs font-mono">2025.03 - 至今</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-accent transition-colors">
                    核心分布式数据管理平台 — 微服务架构从 0 到 1
                  </h3>
                  <p className="text-muted text-sm leading-relaxed mb-6 max-w-2xl">
                    对原有 Python 单体系统进行整体重架构，构建公司新一代企业级数字化基础设施，解决服务扩展性瓶颈，支持众多生产环境规模化部署。
                  </p>
                  <div className="space-y-2 mb-8">
                    <div className="flex items-start gap-3 text-sm text-text">
                      <span className="text-accent mt-1">▹</span>
                      <span>设计 <strong className="text-white">DDD 四层架构</strong> + 仓储模式，业务逻辑与框架完全解耦</span>
                    </div>
                    <div className="flex items-start gap-3 text-sm text-text">
                      <span className="text-accent mt-1">▹</span>
                      <span>搭建高性能数据湖服务与多级权限体系，实现菜单与 API 级鉴权</span>
                    </div>
                    <div className="flex items-start gap-3 text-sm text-text">
                      <span className="text-accent mt-1">▹</span>
                      <span>建立全链路可观测性体系（OpenTelemetry），系统长期保持 99.9% 可用性</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="md:col-span-4 border-l border-border/20 p-8 flex flex-col justify-center space-y-6">
                <div>
                  <div className="text-xs text-muted font-mono uppercase mb-2">System Scale</div>
                  <div className="grid grid-cols-2 gap-4">
                    <StatItem value="10+" label="Services" />
                    <StatItem value="数万行" label="LOC" />
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted font-mono uppercase mb-2">Architecture</div>
                  <div className="flex flex-wrap gap-2">
                    <Tag text="DDD Layers" />
                    <Tag text="Kitex RPC" />
                    <Tag text="Wire DI" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </StaggerChild>

        {/* Project 2: Mria */}
        <StaggerChild>
          <div className="group relative bg-surface border border-border/20 rounded-lg overflow-hidden hover:border-primary/50 transition-colors spotlight-card">
            <div className="grid md:grid-cols-12 gap-0">
              <div className="md:col-span-8 p-8 flex flex-col justify-between h-full relative z-10">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="px-2 py-0.5 rounded-full bg-muted/10 text-muted text-xs font-mono font-bold uppercase tracking-wider">Python Era</span>
                    <span className="text-muted text-xs font-mono">2021.06 - 2025.03</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-primary transition-colors font-serif">
                    遗留系统性能优化与容器化转型
                  </h3>
                  <p className="text-muted text-sm leading-relaxed mb-6 max-w-2xl">
                    诊断并解决遗留系统的并发瓶颈与部署效率问题。主导从 Shell 脚本到 Docker 容器化的架构转型，完成众多生产环境的规模化交付。
                  </p>
                  <div className="space-y-2 mb-8">
                    <div className="flex items-start gap-3 text-sm text-text">
                      <span className="text-primary mt-1">▹</span>
                      <span>基于 <strong className="text-white">Asyncio</strong> 重写核心查询链路，接口响应时间降低 50%</span>
                    </div>
                    <div className="flex items-start gap-3 text-sm text-text">
                      <span className="text-primary mt-1">▹</span>
                      <span>优化核心数据处理算法，响应时间缩短 35%</span>
                    </div>
                    <div className="flex items-start gap-3 text-sm text-text">
                      <span className="text-primary mt-1">▹</span>
                      <span>设计多环境 <strong className="text-white">Docker</strong> 镜像构建策略，部署时间 4h→30min，故障率降低 45%</span>
                    </div>
                  </div>

                  {/* Incident Handling */}
                  <div className="mt-6 border-t border-border/20 pt-5">
                    <div className="text-xs font-bold text-muted uppercase tracking-widest mb-3">典型线上事故处理 / Incident Handling</div>
                    <div className="space-y-3">
                      <Incident num="01" title="服务器死机恢复：" desc="Redis 升级时 gcc 源码编译污染内核，服务器重启失败——交叉编译 Redis 二进制包传送，系统当日恢复" />
                      <Incident num="02" title="SSH 失效依赖修复：" desc="安全补丁引发 apt 依赖链断裂——通过 nc 传输缺失 deb 包完成恢复" />
                      <Incident num="03" title="语音合成卡顿根治：" desc="Python ctypes 内嵌 C 模块引发卡顿——改用 subprocess 进程隔离调用" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="md:col-span-4 border-l border-border/20 p-8 flex flex-col justify-center space-y-6">
                <div>
                  <div className="text-xs text-muted font-mono uppercase mb-2">Scale & Impact</div>
                  <div className="grid grid-cols-2 gap-4">
                    <StatItem value="众多" label="Prod Envs" />
                    <StatItem value="-87%" label="Deploy Time" />
                    <StatItem value="-50%" label="Response Time" />
                    <StatItem value="99.9%" label="System Availability" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </StaggerChild>
      </ScrollReveal>
    </section>
  )
}

function StatItem({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="text-xl font-bold text-white font-mono">{value}</div>
      <div className="text-[10px] text-muted">{label}</div>
    </div>
  )
}

function Tag({ text }: { text: string }) {
  return <span className="text-xs px-2 py-1 bg-surface-light/30 rounded text-muted">{text}</span>
}

function Incident({ num, title, desc }: { num: string; title: string; desc: string }) {
  return (
    <div className="flex items-start gap-3 text-sm">
      <span className="text-primary/60 mt-0.5 shrink-0">{num}</span>
      <div>
        <span className="text-white font-medium">{title}</span>
        <span className="text-muted">{desc}</span>
      </div>
    </div>
  )
}
