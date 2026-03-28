import { useCallback, useRef } from 'react'
import { useNeuralBackground } from '../contexts/NeuralBackgroundContext'

export default function Footer() {
  const { toggle } = useNeuralBackground()
  const tapsRef = useRef<number[]>([])

  const handleFooterClick = useCallback(() => {
    const now = Date.now()
    tapsRef.current = tapsRef.current.filter(t => now - t < 2000)
    tapsRef.current.push(now)
    if (tapsRef.current.length >= 5) {
      tapsRef.current = []
      toggle('footer')
    }
  }, [toggle])

  return (
    <footer className="border-t border-border/20 pt-8 flex flex-col md:flex-row justify-between items-center gap-6" onClick={handleFooterClick}>
      <div className="text-muted text-xs">
        &copy; 2026 徐俊飞. All rights reserved.
      </div>
      <div className="flex items-center gap-6 text-sm">
        <a
          href="https://github.com/masonsxu"
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted hover:text-white transition-colors"
          onClick={e => e.stopPropagation()}
        >
          GitHub
        </a>
        <a
          href="mailto:masonsxu@foxmail.com"
          className="text-muted hover:text-white transition-colors"
          onClick={e => e.stopPropagation()}
        >
          Email
        </a>
        <a
          href="resume.pdf"
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted hover:text-white transition-colors"
          onClick={e => e.stopPropagation()}
        >
          Resume
        </a>
      </div>
    </footer>
  )
}
