import { useEffect, useRef, useCallback, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'

interface VideoModalProps {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
  title?: string
  subtitle?: string
}

export default function VideoModal({
  isOpen,
  onClose,
  children,
  title,
  subtitle,
}: VideoModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null)

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

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={overlayRef}
          onClick={handleOverlayClick}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
          }}
        >
          {/* 背景装饰：微弱金色光斑 */}
          <div
            className="absolute inset-0 pointer-events-none opacity-30"
            style={{
              backgroundImage:
                'radial-gradient(ellipse 600px 400px at 50% 40%, rgba(212, 175, 55, 0.08), transparent)',
            }}
          />

          {/* 主卡片 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{
              type: 'spring',
              damping: 30,
              stiffness: 300,
              mass: 0.8,
            }}
            className="relative w-full max-w-5xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 外层光晕 */}
            <div className="absolute -inset-px rounded-xl bg-gradient-to-b from-primary/20 via-primary/5 to-transparent pointer-events-none" />

            <div
              className="relative rounded-xl overflow-hidden"
              style={{
                backgroundColor: '#0d0d10',
                border: '1px solid rgba(212, 175, 55, 0.15)',
                boxShadow:
                  '0 0 80px rgba(212, 175, 55, 0.06), 0 25px 60px rgba(0, 0, 0, 0.6)',
              }}
            >
              {/* 顶部栏 */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-border/10 bg-surface/80">
                <div className="flex items-center gap-3">
                  {/* 交通灯 */}
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
                  {/* 标题 */}
                  {title && (
                    <div className="flex items-center gap-2 ml-2">
                      <span className="text-xs text-white/90 font-medium">
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
                {/* 右侧关闭按钮 */}
                <button
                  onClick={onClose}
                  className="w-7 h-7 rounded-md flex items-center justify-center text-muted hover:text-white hover:bg-surface-light/50 transition-all"
                >
                  <X size={14} />
                </button>
              </div>

              {/* 视频内容区 */}
              <div className="relative aspect-video bg-[#0a0a0a]">
                {children}

                {/* 四角装饰 */}
                <div className="absolute top-3 left-3 w-5 h-5 border-l border-t border-primary/25 pointer-events-none" />
                <div className="absolute top-3 right-3 w-5 h-5 border-r border-t border-primary/25 pointer-events-none" />
                <div className="absolute bottom-3 left-3 w-5 h-5 border-l border-b border-primary/25 pointer-events-none" />
                <div className="absolute bottom-3 right-3 w-5 h-5 border-r border-b border-primary/25 pointer-events-none" />
              </div>

              {/* 底部提示 */}
              <div className="flex items-center justify-center px-4 py-2 border-t border-border/10 bg-surface/50">
                <span className="text-[10px] text-muted/60 font-mono tracking-wider">
                  ESC or click outside to close
                </span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
