import { AnimatePresence, motion } from 'framer-motion'

interface Props {
  mode: 'activate' | 'deactivate' | null
  onComplete: () => void
}

export default function ActivationOverlay({ mode, onComplete }: Props) {
  return (
    <AnimatePresence onExitComplete={onComplete}>
      {mode && (
        <motion.div
          key={mode}
          className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          {/* Pulse ring */}
          <motion.div
            className="absolute rounded-full"
            style={{
              width: '200vmax',
              height: '200vmax',
              background: mode === 'activate'
                ? 'radial-gradient(circle, rgba(212,175,55,0.15) 0%, rgba(212,175,55,0.05) 30%, transparent 70%)'
                : 'radial-gradient(circle, transparent 0%, rgba(12,12,14,0.4) 50%, rgba(12,12,14,0.6) 100%)',
            }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: mode === 'activate' ? 0.8 : 0.6, ease: 'easeOut' }}
          />
          {/* Monospace text */}
          <motion.span
            className="relative font-mono text-xs tracking-widest text-primary"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.8, 0.8, 0] }}
            transition={{ duration: 1.5, times: [0, 0.1, 0.6, 1] }}
          >
            {mode === 'activate' ? '// neural network activated' : '// entering stealth mode'}
          </motion.span>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
