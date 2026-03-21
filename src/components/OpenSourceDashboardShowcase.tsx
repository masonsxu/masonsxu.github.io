import { useRef, useState } from 'react'
import { Player, type PlayerRef } from '@remotion/player'
import { Play, Pause, RotateCcw, Activity } from 'lucide-react'
import { OpenSourceDashboard, type ProjectData } from '../remotion/OpenSourceDashboard'
import SectionHeader from './SectionHeader'
import ScrollReveal, { StaggerChild } from './ScrollReveal'

const FPS = 30
const DURATION_FRAMES = 20 * FPS

// 默认数据（可通过 GitHub API 注入真实数据）
const DEFAULT_PROJECT_DATA: ProjectData = {
  repoName: 'cloudwego-microservice-demo',
  stars: 3,
  prs: 0,
  merged: 0,
  agentsMdLines: 331,
}

export default function OpenSourceDashboardShowcase() {
  const [isPlaying, setIsPlaying] = useState(true)
  const playerRef = useRef<PlayerRef>(null)
  const [projectData] = useState<ProjectData>(DEFAULT_PROJECT_DATA)

  const handleTogglePlay = () => {
    const player = playerRef.current
    if (!player) return
    if (isPlaying) {
      player.pause()
    } else {
      player.play()
    }
    setIsPlaying(!isPlaying)
  }

  const handleRestart = () => {
    const player = playerRef.current
    if (!player) return
    player.seekTo(0)
    player.play()
    setIsPlaying(true)
  }

  return (
    <section id="dashboard" className="mb-32 relative">
      <SectionHeader title="开源看板 / Dashboard" className="mb-12" />

      <ScrollReveal stagger>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* 左侧：视频播放器 */}
          <StaggerChild className="lg:col-span-8">
            <div className="relative group">
              <div className="absolute -inset-3 bg-primary/5 rounded-2xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

              <div className="relative bg-surface border border-border/20 rounded-lg overflow-hidden spotlight-card">
                {/* 顶部状态栏 */}
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/10 bg-bg/50">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                      <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                      <span className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                    </div>
                    <span className="text-[10px] text-muted font-mono ml-2">open-source-dashboard.tsx</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-muted font-mono">
                    <span className="text-primary">LIVE</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  </div>
                </div>

                {/* 视频区域 */}
                <div className="relative aspect-video bg-[#0a0a0a]">
                  <Player
                    ref={playerRef}
                    component={OpenSourceDashboard}
                    inputProps={{ data: projectData }}
                    compositionWidth={1920}
                    compositionHeight={1080}
                    durationInFrames={DURATION_FRAMES}
                    fps={FPS}
                    style={{ width: '100%', height: '100%' }}
                    loop
                    autoPlay
                    controls={false}
                    acknowledgeRemotionLicense
                    numberOfSharedAudioTags={0}
                  />

                  <div className="absolute top-3 left-3 w-5 h-5 border-l border-t border-primary/30 pointer-events-none" />
                  <div className="absolute top-3 right-3 w-5 h-5 border-r border-t border-primary/30 pointer-events-none" />
                  <div className="absolute bottom-3 left-3 w-5 h-5 border-l border-b border-primary/30 pointer-events-none" />
                  <div className="absolute bottom-3 right-3 w-5 h-5 border-r border-b border-primary/30 pointer-events-none" />
                </div>

                {/* 底部控制栏 */}
                <div className="flex items-center justify-between px-4 py-2.5 border-t border-border/10 bg-bg/50">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleTogglePlay}
                      className="w-7 h-7 rounded-full border border-border/20 flex items-center justify-center text-muted hover:text-primary hover:border-primary/50 transition-all"
                    >
                      {isPlaying ? <Pause size={12} /> : <Play size={12} />}
                    </button>
                    <button
                      onClick={handleRestart}
                      className="w-7 h-7 rounded-full border border-border/20 flex items-center justify-center text-muted hover:text-primary hover:border-primary/50 transition-all"
                    >
                      <RotateCcw size={12} />
                    </button>
                  </div>
                  <div className="text-[10px] text-muted font-mono">
                    1920 x 1080 &middot; 30fps &middot; 20s
                  </div>
                </div>
              </div>
            </div>
          </StaggerChild>

          {/* 右侧：说明信息 */}
          <StaggerChild className="lg:col-span-4">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 border border-border/20 rounded-lg flex items-center justify-center">
                  <Activity size={18} className="text-primary" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">Open Source Dashboard</h3>
                  <p className="text-muted text-xs">Remotion Composition &middot; 20s</p>
                </div>
              </div>

              <p className="text-muted text-sm leading-relaxed">
                基于 <span className="text-white font-mono text-xs">Remotion</span> 构建的开源项目动态看板。
                通过 <span className="text-primary">Props</span> 注入实时 GitHub 数据，展示
                <span className="text-primary"> cloudwego-microservice-demo</span> 项目的核心指标、
                AI 知识编码进度与微服务拓扑架构。
              </p>

              <div className="space-y-3 py-4 border-y border-border/10">
                <SpecItem label="动画引擎" value="Remotion v4" />
                <SpecItem label="分辨率" value="1920 x 1080" />
                <SpecItem label="时长" value="20 秒 / 600 帧" />
                <SpecItem label="帧率" value="30 fps" />
                <SpecItem label="数据驱动" value="Props Inject" />
              </div>

              <div className="flex flex-wrap gap-2">
                {['spring()', 'interpolate()', 'Sequence', 'SVG Topology', 'Ring Chart'].map(tag => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 bg-surface-light/30 border border-border/20 rounded text-[9px] text-muted uppercase tracking-wider font-mono"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </StaggerChild>
        </div>
      </ScrollReveal>
    </section>
  )
}

function SpecItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[11px] text-muted uppercase tracking-wider">{label}</span>
      <span className="text-xs text-white font-mono">{value}</span>
    </div>
  )
}
