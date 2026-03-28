import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNeuralBackground } from '../contexts/NeuralBackgroundContext'

export default function NeuralBackgroundToggle() {
  const { state, toggle } = useNeuralBackground()
  const [visible, setVisible] = useState(false)
  const [showBubble, setShowBubble] = useState(false)

  if (!state.enabled) return null

  return (
    <>
      {/* Delayed appearance */}
      <motion.div
        className="fixed bottom-6 right-6 z-40"
        initial={{ opacity: 0 }}
        animate={{ opacity: visible ? 1 : 0 }}
        onAnimationComplete={() => { if (state.enabled && !visible) setVisible(true) }}
        transition={{ delay: 2, duration: 0.4 }}
      >
        <button
          onClick={() => setShowBubble(v => !v)}
          className="w-2 h-2 rounded-full bg-primary/40 hover:bg-primary transition-colors cursor-pointer"
          aria-label="Neural background settings"
        />
      </motion.div>

      {/* Confirmation bubble */}
      <AnimatePresence>
        {showBubble && (
          <motion.div
            className="fixed bottom-10 right-6 z-40"
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <div className="bg-surface border border-border/20 rounded-lg px-4 py-3 shadow-lg">
              <p className="text-xs text-muted mb-2 font-mono">Deactivate neural background?</p>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setShowBubble(false)
                    toggle('close-button')
                  }}
                  className="px-3 py-1 text-xs text-primary border border-border/20 rounded hover:bg-surface-light transition-colors cursor-pointer"
                >
                  Yes
                </button>
                <button
                  onClick={() => setShowBubble(false)}
                  className="px-3 py-1 text-xs text-muted hover:text-white transition-colors cursor-pointer"
                >
                  No
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Close on outside click */}
      {showBubble && (
        <div className="fixed inset-0 z-30" onClick={() => setShowBubble(false)} />
      )}
    </>
  )
}
