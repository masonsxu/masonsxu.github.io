import { Player } from '@remotion/player'
import { Sun } from 'lucide-react'
import { ConstellationAnimation } from '../remotion/ConstellationAnimation'
import ScrollReveal, { StaggerChild } from './ScrollReveal'
import SectionHeader from './SectionHeader'

export default function Essence() {
  return (
    <section id="essence" className="mb-32 relative">
      <SectionHeader title="灵魂底色 / The Essence" className="mb-12" />

      <ScrollReveal stagger className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Philosophy Text */}
        <StaggerChild>
          <div className="space-y-6">
            <h3 className="text-3xl md:text-4xl font-serif font-bold text-text leading-tight">
              设计与架构的<br /><span className="gold-gradient-text italic">华丽交响</span>
            </h3>
            <p className="text-muted leading-relaxed md:text-lg">
              我认为，一段优雅的代码应当如顶级奢侈品般，在隐秘处追求极致的细节。<strong className="text-text">Midnight Pearl</strong> 不仅仅是一套配色方案，它代表了我对系统架构的追求：深邃、稳定且散发着理性的光芒。
            </p>
            <div className="flex gap-8 py-4 border-y border-border/20">
              <EssenceWord word="Obsidian" label="Stability / 稳健" />
              <EssenceWord word="Pearl" label="Clarity / 纯粹" />
              <EssenceWord word="Gold" label="Excellence / 卓越" />
            </div>
          </div>
        </StaggerChild>

        {/* Zodiac Card */}
        <StaggerChild>
          <div className="relative group">
            <div className="absolute -inset-4 bg-primary/5 rounded-[2rem] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="relative bg-surface border border-border/20 rounded-lg p-6 md:p-8 spotlight-card overflow-hidden">
              {/* Remotion Constellation */}
              <div className="absolute inset-0 pointer-events-none opacity-30">
                <Player
                  component={ConstellationAnimation}
                  compositionWidth={400}
                  compositionHeight={400}
                  durationInFrames={300}
                  fps={30}
                  style={{ width: '100%', height: '100%' }}
                  loop
                  autoPlay
                  controls={false}
                  acknowledgeRemotionLicense
                  numberOfSharedAudioTags={0}
                />
              </div>

              <div className="relative z-10">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <span className="text-primary text-[10px] uppercase tracking-[0.3em] font-bold block mb-1">Constellation</span>
                    <h4 className="text-text text-3xl font-serif font-bold">Taurus</h4>
                    <div className="text-muted text-sm font-light">金牛座 / 4.20 - 5.20</div>
                  </div>
                  <div className="w-8 h-8 border border-border/20 rounded-full flex items-center justify-center">
                    <Sun size={16} className="text-primary" />
                  </div>
                </div>
                <p className="text-muted italic font-serif text-sm leading-relaxed mb-6">
                  "Luxury is the balance of design and function, much like the steady heart of the Bull."
                </p>
                <div className="flex flex-wrap gap-2 mb-8">
                  <span className="px-2 py-0.5 bg-surface-light/30 border border-border/20 rounded text-[9px] text-muted uppercase tracking-wider">Reliable</span>
                  <span className="px-2 py-0.5 bg-surface-light/30 border border-border/20 rounded text-[9px] text-muted uppercase tracking-wider">Artistic</span>
                </div>
                <button className="w-full py-3 bg-surface border border-border/20 text-primary text-[10px] font-bold uppercase tracking-widest rounded shimmer-effect hover:border-primary/50 transition-all">
                  Energy / 探索星能
                </button>
              </div>
            </div>
          </div>
        </StaggerChild>
      </ScrollReveal>
    </section>
  )
}

function EssenceWord({ word, label }: { word: string; label: string }) {
  return (
    <div>
      <div className="text-primary font-serif text-2xl">{word}</div>
      <div className="text-[10px] text-muted uppercase tracking-widest">{label}</div>
    </div>
  )
}
