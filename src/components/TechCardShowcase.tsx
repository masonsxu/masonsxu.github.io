import { useRef, useState } from 'react'
import { Player, type PlayerRef } from '@remotion/player'
import { Play, Pause, RotateCcw, Clapperboard } from 'lucide-react'
import { TechCardVideo } from '../remotion/TechCardVideo'
import SectionHeader from './SectionHeader'
import ScrollReveal, { StaggerChild } from './ScrollReveal'

const FPS = 30
const DURATION_FRAMES = 15 * FPS

export default function TechCardShowcase() {
  const [isPlaying, setIsPlaying] = useState(true)
  const playerRef = useRef<PlayerRef>(null)

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
    <section id="showreel" className="mb-32 relative">
      <SectionHeader title="动态名片 / Showreel" className="mb-12" />

      <ScrollReveal stagger>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* 左侧：视频播放器 */}
          <StaggerChild className="lg:col-span-8">
            <div className="relative group">
              {/* 外层光晕 */}
              <div className="absolute -inset-3 bg-primary/5 rounded-2xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

              {/* 播放器容器 */}
              <div className="relative bg-surface border border-border/20 rounded-lg overflow-hidden spotlight-card">
                {/* 顶部状态栏 */}
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/10 bg-bg/50">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                      <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                      <span className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                    </div>
                    <span className="text-[10px] text-muted font-mono ml-2">tech-card-video.tsx</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-muted font-mono">
                    <span className="text-primary">REC</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  </div>
                </div>

                {/* 视频区域 */}
                <div className="relative aspect-video bg-[#0a0a0a]">
                  <Player
                    ref={playerRef}
                    component={TechCardVideo}
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

                  {/* 边角装饰 */}
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
                    1920 x 1080 &middot; 30fps &middot; 15s
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
                  <Clapperboard size={18} className="text-primary" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">Tech Card</h3>
                  <p className="text-muted text-xs">Remotion Composition</p>
                </div>
              </div>

              <p className="text-muted text-sm leading-relaxed">
                使用 <span className="text-white font-mono text-xs">Remotion</span> 构建的动态技术名片。通过
                <span className="text-primary"> spring()</span> 与
                <span className="text-primary"> interpolate()</span> 实现丝滑的动画曲线，展示核心技术栈标签的循环切换。
              </p>

              <div className="space-y-3 py-4 border-y border-border/10">
                <SpecItem label="动画引擎" value="Remotion v4" />
                <SpecItem label="分辨率" value="1920 x 1080" />
                <SpecItem label="时长" value="15 秒 / 450 帧" />
                <SpecItem label="帧率" value="30 fps" />
              </div>

              <div className="flex flex-wrap gap-2">
                {['spring()', 'interpolate()', 'Sequence', 'AbsoluteFill'].map(tag => (
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
