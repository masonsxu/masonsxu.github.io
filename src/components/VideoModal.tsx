import { AnimatePresence, motion } from 'framer-motion'
import { Play, X } from 'lucide-react'
import { useCallback, useEffect, type ReactNode, type RefObject } from 'react'
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog'

interface VideoModalProps {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
  title?: string
  subtitle?: string
  playerRef?: RefObject<any>
  isPlaying?: boolean
  togglePlay?: () => void
}

export default function VideoModal({
  isOpen,
  onClose,
  children,
  title,
  subtitle,
  isPlaying,
  togglePlay,
}: VideoModalProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    },
    [onClose],
  )

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [isOpen, handleKeyDown])

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
          <DialogContent
            className="max-w-[1200px] w-[min(90vw,1200px)] p-0 overflow-hidden bg-[#0d0d10] border border-border/20"
            showCloseButton={false}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 5 }}
              transition={{
                type: 'spring',
                damping: 25,
                stiffness: 250,
              }}
              className="relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-border/10 bg-surface/80">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1.5">
                    <button
                      onClick={onClose}
                      className="w-3 h-3 rounded-full bg-red-500/70 hover:bg-red-500 transition-colors group relative"
                    >
                      <X
                        size={7}
                        className="absolute inset-0 m-auto text-red-900 opacity-0 group-hover:opacity-100 transition-opacity"
                      />
                    </button>
                    <span className="w-3 h-3 rounded-full bg-yellow-500/50" />
                    <span className="w-3 h-3 rounded-full bg-green-500/50" />
                  </div>
                  {title && (
                    <div className="flex items-center gap-2 ml-2">
                      <span className="text-xs text-text/90 font-medium">
                        {title}
                      </span>
                      {subtitle && (
                        <>
                          <span className="text-border/30 text-[10px]">|</span>
                          <span className="text-[10px] text-muted font-mono">
                            {subtitle}
                          </span>
                        </>
                      )}
                    </div>
                  )}
                </div>
                <button
                  onClick={onClose}
                  className="w-7 h-7 rounded-md flex items-center justify-center text-muted hover:text-text hover:bg-surface-light/50 transition-all"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Video content - maintains 16:9 aspect ratio */}
              <div className="relative aspect-video bg-[#0a0a0a]">
                {children}

                {/* Click overlay for play/pause */}
                {togglePlay && (
                  <div
                    className="absolute inset-0 z-[1] cursor-pointer"
                    onClick={togglePlay}
                  />
                )}

                {/* Pause indicator */}
                {togglePlay && !isPlaying && (
                  <div className="absolute inset-0 z-[2] flex items-center justify-center pointer-events-none">
                    <div className="w-16 h-16 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center">
                      <Play size={28} className="text-white/80 ml-1" />
                    </div>
                  </div>
                )}

                {/* Corner decorations */}
                <div className="absolute top-3 left-3 w-5 h-5 border-l border-t border-primary/25 pointer-events-none" />
                <div className="absolute top-3 right-3 w-5 h-5 border-r border-t border-primary/25 pointer-events-none" />
                <div className="absolute bottom-3 left-3 w-5 h-5 border-l border-b border-primary/25 pointer-events-none" />
                <div className="absolute bottom-3 right-3 w-5 h-5 border-r border-b border-primary/25 pointer-events-none" />
              </div>

              {/* Footer hint */}
              <div className="flex items-center justify-center px-4 py-2 border-t border-border/10 bg-surface/50">
                <span className="text-[10px] text-muted/60 font-mono tracking-wider">
                  ESC or click outside to close · click video to pause
                </span>
              </div>
            </motion.div>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  )
}
