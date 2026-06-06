import type { HotspotData } from './Hotspot'

interface GameHUDProps {
  nearbyHotspot: HotspotData | null
  showProject: HotspotData | null
  onCloseProject: () => void
  onInteract: () => void
  fps?: number
}

const GLASS: React.CSSProperties = {
  background: 'rgba(20,25,35,0.75)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 12,
  color: '#e8e4dc',
  fontFamily: "'Inter','Noto Sans SC',system-ui,sans-serif",
}

export function GameHUD({ nearbyHotspot, showProject, onCloseProject, onInteract }: GameHUDProps) {
  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 50 }}>
      {showProject && (
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(0,0,0,0.5)', pointerEvents: 'auto', zIndex: 60,
        }}>
          <div style={{
            ...GLASS, padding: '28px 32px', maxWidth: 460, width: '90%',
            position: 'relative', border: '1px solid rgba(255,200,80,0.2)',
          }}>
            <button onClick={onCloseProject} style={{
              position: 'absolute', top: 12, right: 16, background: 'none', border: 'none',
              color: '#8a8a9a', fontSize: 20, cursor: 'pointer', pointerEvents: 'auto',
            }}>✕</button>
            <div style={{ fontSize: 32, marginBottom: 12 }}>{showProject.icon}</div>
            <h2 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 8px', color: '#f0e8dc' }}>
              {showProject.title}
            </h2>
            <p style={{ fontSize: 14, lineHeight: 1.7, color: '#b0a8a0', margin: 0 }}>
              {showProject.description}
            </p>
          </div>
        </div>
      )}

      {nearbyHotspot && !showProject && (
        <div style={{
          position: 'absolute', bottom: 80, left: '50%', transform: 'translateX(-50%)',
          ...GLASS, padding: '10px 22px', pointerEvents: 'auto', cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 10,
          border: '1px solid rgba(255,200,80,0.3)',
        }} onClick={onInteract}>
          <span style={{ fontSize: 16 }}>{nearbyHotspot.icon}</span>
          <span style={{ fontSize: 14 }}>{nearbyHotspot.title}</span>
          <span style={{ fontSize: 11, color: '#8a8a9a', marginLeft: 4 }}>[点击查看]</span>
        </div>
      )}

      <div style={{
        position: 'absolute', bottom: 24, left: '50%', transform: 'translateX(-50%)',
        ...GLASS, padding: '6px 16px', fontSize: 11, color: '#8a8a9a',
        whiteSpace: 'nowrap',
      }}>
        WASD 移动 · 鼠标环视 · 走近金色标记查看作品
      </div>
    </div>
  )
}
