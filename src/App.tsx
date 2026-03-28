import { lazy, Suspense, useCallback, useEffect, useRef } from 'react'
import Architecture from './components/Architecture'
import ContentHero from './components/ContentHero'
import Education from './components/Education'
import Experience from './components/Experience'
import Footer from './components/Footer'
import Navbar from './components/Navbar'
import OpenSource from './components/OpenSource'
import Projects from './components/Projects'
import Skills from './components/Skills'
import { ThemeProvider } from './contexts/ThemeContext'

const Essence = lazy(() => import('./components/Essence'))
const ShowreelGallery = lazy(() => import('./components/ShowreelGallery'))

function SpotlightEffect() {
  const rafRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    const cardsCache = new Map<Element, DOMRect>()

    const updateSpotlight = (clientX: number, clientY: number) => {
      const cards = document.getElementsByClassName('spotlight-card')
      for (const card of cards) {
        let rect = cardsCache.get(card)
        if (!rect) {
          rect = (card as HTMLElement).getBoundingClientRect()
          cardsCache.set(card, rect)
        }
        ;(card as HTMLElement).style.setProperty('--mouse-x', `${clientX - rect.left}px`)
        ;(card as HTMLElement).style.setProperty('--mouse-y', `${clientY - rect.top}px`)
      }
    }

    const scheduleUpdate = (e: MouseEvent | TouchEvent) => {
      if (rafRef.current !== undefined) return

      const isTouch = 'touches' in e
      const clientX = isTouch ? e.touches[0].clientX : (e as MouseEvent).clientX
      const clientY = isTouch ? e.touches[0].clientY : (e as MouseEvent).clientY

      rafRef.current = requestAnimationFrame(() => {
        updateSpotlight(clientX, clientY)
        rafRef.current = undefined
      })
    }

    const handleMouse = (e: MouseEvent) => scheduleUpdate(e)
    const handleTouch = (e: TouchEvent) => scheduleUpdate(e)

    document.addEventListener('mousemove', handleMouse)
    document.addEventListener('touchstart', handleTouch, { passive: true })
    document.addEventListener('touchmove', handleTouch, { passive: true })

    return () => {
      document.removeEventListener('mousemove', handleMouse)
      document.removeEventListener('touchstart', handleTouch)
      document.removeEventListener('touchmove', handleTouch)
      if (rafRef.current !== undefined) cancelAnimationFrame(rafRef.current)
      cardsCache.clear()
    }
  }, [])

  return null
}

function AppContent() {
  return (
    <>
      <SpotlightEffect />
      <div className="antialiased selection:bg-gold/20 selection:text-gold font-sans">
        <Navbar />
        <main className="max-w-6xl mx-auto px-6 pt-32 pb-20">
          <ContentHero />
          <Architecture />
          <Skills />
          <Projects />
          <Experience />
          <Education />
          <Suspense fallback={null}>
            <Essence />
          </Suspense>
          <Suspense fallback={null}>
            <ShowreelGallery />
          </Suspense>
          <OpenSource />
          <Footer />
        </main>
      </div>
    </>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  )
}
