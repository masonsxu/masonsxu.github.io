import { useCallback, useRef } from 'react'
import { useNeuralBackground } from '../contexts/NeuralBackgroundContext'
import { GitHubIcon } from './GitHubIcon'
import { Mail, FileText } from 'lucide-react'

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
    <footer className="border-t border-border/20 pt-8 pb-8" onClick={handleFooterClick}>
      <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-4">
          <img src="/logo-options/logo-secondary-square.svg" alt="Masons Xu Emblem" className="w-10 h-10" />
          <div className="text-muted text-xs">
            &copy; 2026 徐俊飞. All rights reserved.
          </div>
        </div>
        <div className="flex items-center gap-6 text-sm">
          <a
            href="https://github.com/masonsxu"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted hover:text-white transition-colors flex items-center gap-2"
            onClick={e => e.stopPropagation()}
          >
            <GitHubIcon size={16} />
            <span className="hidden sm:inline">GitHub</span>
          </a>
          <a
            href="mailto:masonsxu@foxmail.com"
            className="text-muted hover:text-white transition-colors flex items-center gap-2"
            onClick={e => e.stopPropagation()}
          >
            <Mail size={16} />
            <span className="hidden sm:inline">Email</span>
          </a>
          <a
            href="resume.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted hover:text-white transition-colors flex items-center gap-2"
            onClick={e => e.stopPropagation()}
          >
            <FileText size={16} />
            <span className="hidden sm:inline">Resume</span>
          </a>
        </div>
      </div>
    </footer>
  )
}
