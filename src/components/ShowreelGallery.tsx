import { Player } from '@remotion/player'
import { Activity, Clapperboard, Film, Flame, GitBranch, Play } from 'lucide-react'
import React, { useCallback, useRef, useState } from 'react'
import { ArchitectureEvolution } from '../remotion/ArchitectureEvolution'
import { GitHubHeatmap } from '../remotion/GitHubHeatmap'
import { OpenSourceDashboard, type ProjectData } from '../remotion/OpenSourceDashboard'
import { PortfolioTrailer } from '../remotion/PortfolioTrailer'
import { TechCardVideo } from '../remotion/TechCardVideo'
import ScrollReveal, { StaggerChild } from './ScrollReveal'
import SectionHeader from './SectionHeader'
import VideoModal from './VideoModal'

// ─── 从环境变量读取仓库数据（Cloudflare Pages 每日更新）─────────
const PROJECT_DATA: ProjectData = {
  repoName: 'cloudwego-microservice-demo',
  stars: Number(import.meta.env.VITE_OSS_STARS) || 3,
  prs: Number(import.meta.env.VITE_OSS_PRS) || 0,
  merged: Number(import.meta.env.VITE_OSS_MERGED) || 0,
  agentsMdLines: Number(import.meta.env.VITE_OSS_AGENTS_LINES) || 331,
}

// ─── 视频注册表（新增视频只需在这里追加一项）──────────────────
interface VideoEntry {
  id: string
  title: string
  subtitle: string
  description: string
  duration: number
  fps: number
  icon: React.ReactNode
  tags: string[]
  component: React.ComponentType<Record<string, never>> | React.ComponentType<{ data?: ProjectData }>
  inputProps?: { data: ProjectData }
}

const VIDEOS: VideoEntry[] = [
  {
    id: 'tech-card',
    title: '动态技术名片',
    subtitle: 'Tech Card',
    description:
      '使用 Remotion 构建的个人动态名片。通过 spring() 与 interpolate() 呈现名字入场、核心技术栈标签轮播与域名收尾。',
    duration: 15,
    fps: 30,
    icon: <Clapperboard size={20} className="text-primary" />,
    tags: ['spring()', 'interpolate()', 'Sequence', '15s'],
    component: TechCardVideo,
  },
  {
    id: 'oss-dashboard',
    title: '开源项目看板',
    subtitle: 'Open Source Dashboard',
    description:
      '数据驱动的开源看板动画。终端打字机入场、指标数字滚动、环形进度条、Kitex/Hertz 微服务拓扑图，数据来源于 Cloudflare 环境变量每日更新。',
    duration: 20,
    fps: 30,
    icon: <Activity size={20} className="text-primary" />,
    tags: ['Env Driven', 'SVG Topology', 'Ring Chart', '20s'],
    component: OpenSourceDashboard as any,
    inputProps: { data: PROJECT_DATA },
  },
  {
    id: 'arch-evolution',
    title: '架构演进历程',
    subtitle: 'Architecture Evolution',
    description:
      '从 Python 单体到 Go 微服务的架构演进叙事。展示 Monolith 裂变、DDD 分层设计、请求链路追踪与性能指标跳变，诠释架构即设计与功能的平衡。',
    duration: 25,
    fps: 30,
    icon: <GitBranch size={20} className="text-primary" />,
    tags: ['Series', 'DDD', 'Fission', 'spring()', '25s'],
    component: ArchitectureEvolution,
  },
  {
    id: 'github-heatmap',
    title: 'GitHub 贡献热力图',
    subtitle: 'Contribution Heatmap',
    description:
      'GitHub 贡献热力图动态生长动画。星空粒子漂浮入场、流星击中方格涟漪扩散、成就标签数据叠加、最终定格全景贡献墙，诠释持续构建的力量。',
    duration: 20,
    fps: 30,
    icon: <Flame size={20} className="text-primary" />,
    tags: ['Heatmap', 'Ripple', 'spring()', 'SVG Grid', '20s'],
    component: GitHubHeatmap,
  },
  {
    id: 'portfolio-trailer',
    title: '作品集预告片',
    subtitle: 'Portfolio Trailer',
    description:
      '60 秒完整预告片。通过 TransitionSeries + fade 交叉溶解串联技术名片、架构演进、贡献热力图与域名定格，附带全局暗角与胶片噪点后期。',
    duration: 60,
    fps: 30,
    icon: <Film size={20} className="text-primary" />,
    tags: ['TransitionSeries', 'fade()', 'Vignette', 'Grain', '60s'],
    component: PortfolioTrailer,
  },
]

// ─── 主组件 ─────────────────────────────────────────────────────
export default function ShowreelGallery() {
  const [activeVideo, setActiveVideo] = useState<VideoEntry | null>(null)
  const [isPlaying, setIsPlaying] = useState(true)
  const playerRef = useRef<any>(null)

  const handleOpen = useCallback((video: VideoEntry) => {
    setActiveVideo(video)
    setIsPlaying(true)
  }, [])

  const handleClose = useCallback(() => {
    setActiveVideo(null)
    setIsPlaying(true)
  }, [])

  const handleTogglePlay = useCallback(() => {
    const player = playerRef.current
    if (!player) return
    if (isPlaying) player.pause()
    else player.play()
    setIsPlaying(!isPlaying)
  }, [isPlaying])

  return (
    <section id="showreel" className="mb-32 relative">
      <SectionHeader title="技术演示影集 / Technical Showreel" className="mb-12" />

      <ScrollReveal>
        <p className="text-sm md:text-[15px] leading-7 text-muted max-w-3xl mb-8">
          通过可视化视频演示展示 <strong className="text-text">Go 微服务架构</strong>、<strong className="text-text">分布式系统演进</strong>、<strong className="text-text">GitHub 开源贡献</strong> 与 <strong className="text-text">数据平台实践</strong>，让技术作品集不仅可读，也可被直观看见。
        </p>
      </ScrollReveal>

      <ScrollReveal stagger>
        {/* 第一行：3 列 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {VIDEOS.slice(0, 3).map((video) => (
            <StaggerChild key={video.id}>
              <VideoCard
                video={video}
                onPlay={handleOpen}
                className="min-h-[200px] lg:min-h-[240px] h-full"
              />
            </StaggerChild>
          ))}
        </div>
        {/* 第二行：2 列居中 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6 max-w-[calc(66.666%+0.75rem)] mx-auto">
          {VIDEOS.slice(3, 5).map((video) => (
            <StaggerChild key={video.id}>
              <VideoCard
                video={video}
                onPlay={handleOpen}
                className="min-h-[200px] lg:min-h-[240px] h-full"
              />
            </StaggerChild>
          ))}
        </div>
      </ScrollReveal>

      {/* 弹层播放器 */}
      <VideoModal
        isOpen={!!activeVideo}
        onClose={handleClose}
        title={activeVideo?.title}
        subtitle={`${activeVideo?.duration}s · ${activeVideo?.fps}fps`}
        playerRef={playerRef}
        isPlaying={isPlaying}
        togglePlay={handleTogglePlay}
      >
        {activeVideo && (
          <div className="w-full h-full">
            <Player
              ref={playerRef}
              component={activeVideo.component as any}
              inputProps={activeVideo.inputProps ?? {}}
              compositionWidth={1920}
              compositionHeight={1080}
              durationInFrames={activeVideo.duration * activeVideo.fps}
              fps={activeVideo.fps}
              style={{ width: '100%', height: '100%' }}
              loop
              autoPlay
              controls={false}
              acknowledgeRemotionLicense
              numberOfSharedAudioTags={0}
              initiallyMuted
            />
          </div>
        )}
      </VideoModal>
    </section>
  )
}

// ─── 视频卡片 ───────────────────────────────────────────────────
function VideoCard({
  video,
  onPlay,
  className = '',
}: {
  video: VideoEntry
  onPlay: (v: VideoEntry) => void
  className?: string
}) {
  return (
    <button
      type="button"
      onClick={() => onPlay(video)}
      className={`group relative w-full text-left bg-surface border border-border/20 rounded-lg overflow-hidden spotlight-card transition-all hover:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/40 ${className}`}
    >
      {/* 预览区域 */}
      <div className="relative aspect-video overflow-hidden">
        {/* 预览图片 */}
        <img
          src={`/previews/${video.id}-preview.png`}
          alt={video.title}
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* 深色遮罩 */}
        <div className="absolute inset-0 bg-black/40" />
        {/* 内容覆盖层 */}
        <div className="absolute inset-0 flex flex-col items-center justify-end p-6 pointer-events-none">
          <div className="text-primary mb-4">
            {video.icon}
          </div>
          <h3 className="text-text font-bold text-center">{video.title}</h3>
        </div>

        {/* 中心大播放按钮 */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 rounded-full border-2 border-primary/30 flex items-center justify-center bg-bg/50 backdrop-blur-sm group-hover:border-primary/70 group-hover:bg-bg/70 group-hover:scale-110 transition-all duration-300">
            <Play
              size={24}
              className="text-primary/60 group-hover:text-primary transition-colors ml-1"
            />
          </div>
        </div>

        {/* 右上角时长标签 */}
        <div className="absolute top-3 right-3 px-2 py-0.5 bg-bg/70 backdrop-blur-sm border border-border/20 rounded text-[10px] text-muted font-mono">
          {video.duration}s
        </div>

        {/* 底部渐变 */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-surface/0 to-surface/80" />
      </div>

      {/* 信息区 */}
      <div className="p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 border border-border/20 rounded-lg flex items-center justify-center shrink-0">
            {video.icon}
          </div>
          <div className="min-w-0">
            <h3 className="text-text font-bold text-sm truncate">
              {video.title}
            </h3>
            <p className="text-muted text-[11px] font-mono">{video.subtitle}</p>
          </div>
        </div>

        <p className="text-muted text-xs leading-relaxed mb-4 line-clamp-2">
          {video.description}
        </p>

        <div className="flex flex-wrap gap-1.5">
          {video.tags.map((tag) => (
            <span
              key={tag}
              className="px-1.5 py-0.5 bg-surface-light/30 border border-border/15 rounded text-[9px] text-muted uppercase tracking-wider font-mono"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </button>
  )
}
