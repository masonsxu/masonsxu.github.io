import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import Architecture from './components/Architecture'
import ContentHero from './components/ContentHero'
import Education from './components/Education'
import Experience from './components/Experience'
import Footer from './components/Footer'
import Navbar from './components/Navbar'
import OpenSource from './components/OpenSource'
import Projects from './components/Projects'
import Skills from './components/Skills'

const ThreeBackground = lazy(() => import('./components/ThreeBackground'))
const Essence = lazy(() => import('./components/Essence'))
const ShowreelGallery = lazy(() => import('./components/ShowreelGallery'))

/**
 * Defer heavy rendering until after first paint
 * Simplified - direct timeout is sufficient for this use case
 */
function useDeferredMount(delay = 200) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    const timer = setTimeout(() => {
      performance.mark('app-heavy-components-mount-start')
      setMounted(true)
      performance.mark('app-heavy-components-mount-end')
    }, delay)
    return () => clearTimeout(timer)
  }, [delay])
  return mounted
}

export default function App() {
  const rafRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    performance.mark('app-first-paint')
  }, [])

  const bgReady = useDeferredMount(200)

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
        ; (card as HTMLElement).style.setProperty('--mouse-x', `${clientX - rect.left}px`)
          ; (card as HTMLElement).style.setProperty('--mouse-y', `${clientY - rect.top}px`)
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

  return (
    <div className="antialiased selection:bg-gold/20 selection:text-gold font-sans">
      <div className="fixed inset-0 tech-bg z-[-1] pointer-events-none opacity-40" />
      {bgReady && (
        <Suspense fallback={null}>
          <ThreeBackground />
        </Suspense>
      )}
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
  )
}
