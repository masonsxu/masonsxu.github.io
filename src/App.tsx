import { lazy, Suspense, useEffect, useRef } from 'react'
import Architecture from './components/Architecture'
import ExperienceTimeline from './components/ExperienceTimeline'
import Footer from './components/Footer'
import HeroEditorial from './components/HeroEditorial'
import Interlude from './components/Interlude'
import Navbar from './components/Navbar'
import OpenSource from './components/OpenSource'
import ProjectAccordion from './components/ProjectAccordion'
import SkillsRich from './components/SkillsRich'
import TypographicASCII from './components/TypographicASCII'
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
      <div className="relative isolate selection:bg-gold/20 selection:text-gold font-sans">
        <TypographicASCII />
        <div className="relative z-10">
          <Navbar />
          <main className="max-w-5xl 2xl:max-w-6xl mx-auto px-6 lg:px-7 pt-28 lg:pt-30 pb-18 lg:pb-20">
            <HeroEditorial />
            <ProjectAccordion />
            <Interlude type="quote" />
            <Architecture />
            <SkillsRich />
            <Interlude type="data" />
            <ExperienceTimeline />
            <Interlude type="keywords" />
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
