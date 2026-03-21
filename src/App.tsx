import { useEffect } from 'react'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Architecture from './components/Architecture'
import Skills from './components/Skills'
import Projects from './components/Projects'
import Experience from './components/Experience'
import Education from './components/Education'
import Essence from './components/Essence'
import OpenSource from './components/OpenSource'
import Footer from './components/Footer'

export default function App() {
  useEffect(() => {
    const updateSpotlight = (e: MouseEvent | TouchEvent) => {
      const isTouch = 'touches' in e
      const clientX = isTouch ? e.touches[0].clientX : (e as MouseEvent).clientX
      const clientY = isTouch ? e.touches[0].clientY : (e as MouseEvent).clientY

      const cards = document.getElementsByClassName('spotlight-card')
      for (const card of cards) {
        const rect = (card as HTMLElement).getBoundingClientRect()
        ;(card as HTMLElement).style.setProperty('--mouse-x', `${clientX - rect.left}px`)
        ;(card as HTMLElement).style.setProperty('--mouse-y', `${clientY - rect.top}px`)
      }
    }

    const handleMouse = (e: MouseEvent) => updateSpotlight(e)
    const handleTouch = (e: TouchEvent) => updateSpotlight(e)

    document.addEventListener('mousemove', handleMouse)
    document.addEventListener('touchstart', handleTouch, { passive: true })
    document.addEventListener('touchmove', handleTouch, { passive: true })

    return () => {
      document.removeEventListener('mousemove', handleMouse)
      document.removeEventListener('touchstart', handleTouch)
      document.removeEventListener('touchmove', handleTouch)
    }
  }, [])

  return (
    <div className="antialiased selection:bg-gold/20 selection:text-gold font-sans">
      <div className="fixed inset-0 tech-bg z-[-1] pointer-events-none opacity-40" />
      <Navbar />
      <main className="max-w-6xl mx-auto px-6 pt-32 pb-20">
        <Hero />
        <Architecture />
        <Skills />
        <Projects />
        <Experience />
        <Education />
        <Essence />
        <OpenSource />
        <Footer />
      </main>
    </div>
  )
}
