import { useCallback, useEffect, useRef, useState } from 'react'
import { GameEngine } from './engine/GameEngine'
import { GameHUD } from './interaction/GameHUD'
import type { HotspotData } from './interaction/Hotspot'

export default function Game() {
  const containerRef = useRef<HTMLDivElement>(null)
  const engineRef = useRef<GameEngine | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [nearbyHotspot, setNearbyHotspot] = useState<HotspotData | null>(null)
  const [showProject, setShowProject] = useState<HotspotData | null>(null)

  const onHotspotNearby = useCallback((h: HotspotData | null) => {
    setNearbyHotspot(h)
  }, [])

  const onInteractRequest = useCallback(() => {
    if (nearbyHotspot) {
      setShowProject(nearbyHotspot)
    }
  }, [nearbyHotspot])

  const handleInteract = useCallback(() => {
    if (nearbyHotspot) {
      setShowProject(nearbyHotspot)
    }
  }, [nearbyHotspot])

  const handleCloseProject = useCallback(() => {
    setShowProject(null)
    const engine = engineRef.current
    if (engine && !engine.input.locked) {
      engine.input.requestLock(engine.renderer.domElement)
    }
  }, [])

  useEffect(() => {
    if (!containerRef.current) return

    try {
      const engine = new GameEngine({
        container: containerRef.current,
        onReady: () => setLoading(false),
        onHotspotNearby,
        onInteractRequest,
      })
      engineRef.current = engine
    } catch (err: any) {
      console.error('Game engine init failed:', err)
      setError(err?.message || 'Failed to initialize game engine')
      setLoading(false)
    }

    return () => {
      engineRef.current?.dispose()
      engineRef.current = null
    }
  }, [onHotspotNearby, onInteractRequest])

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden', background: '#000' }}>
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />

      <GameHUD
        nearbyHotspot={nearbyHotspot}
        showProject={showProject}
        onCloseProject={handleCloseProject}
        onInteract={handleInteract}
      />

      {loading && (
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'linear-gradient(180deg, #1a2a3a, #2a4a6a)',
          zIndex: 100, flexDirection: 'column', gap: 16,
          fontFamily: "'Inter','Noto Sans SC',system-ui,sans-serif",
          color: '#c0d0e0',
        }}>
          <div style={{
            width: 44, height: 44, border: '3px solid rgba(192,208,224,0.2)',
            borderTopColor: '#c0d0e0', borderRadius: '50%', animation: 'spin 0.9s linear infinite',
          }} />
          <p style={{ fontSize: 15, fontWeight: 500 }}>正在生成世界…</p>
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      )}

      {error && (
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: '#1a1a2e', flexDirection: 'column', gap: 12, padding: 32, textAlign: 'center',
          fontFamily: "'Inter','Noto Sans SC',system-ui,sans-serif", color: '#e0d0c0',
        }}>
          <p style={{ fontSize: 20, fontWeight: 600 }}>世界加载失败</p>
          <p style={{ fontSize: 14, color: '#a09080' }}>{error}</p>
        </div>
      )}
    </div>
  )
}
