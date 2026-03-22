import { useEffect } from 'react'
import Architecture from './components/Architecture'
import ContentHero from './components/ContentHero'
import Education from './components/Education'
import Essence from './components/Essence'
import Experience from './components/Experience'
import Footer from './components/Footer'
import Navbar from './components/Navbar'
import OpenSource from './components/OpenSource'
import Projects from './components/Projects'
import ShowreelGallery from './components/ShowreelGallery'
import Skills from './components/Skills'
import ThreeBackground from './components/ThreeBackground'

export default function App() {
  useEffect(() => {
    const updateSpotlight = (e: MouseEvent | TouchEvent) => {
      const isTouch = 'touches' in e
      const clientX = isTouch ? e.touches[0].clientX : (e as MouseEvent).clientX
      const clientY = isTouch ? e.touches[0].clientY : (e as MouseEvent).clientY

      const cards = document.getElementsByClassName('spotlight-card')
      for (const card of cards) {
        const rect = (card as HTMLElement).getBoundingClientRect()
          ; (card as HTMLElement).style.setProperty('--mouse-x', `${clientX - rect.left}px`)
          ; (card as HTMLElement).style.setProperty('--mouse-y', `${clientY - rect.top}px`)
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
      <ThreeBackground />
      <Navbar />
      <main className="max-w-6xl mx-auto px-6 pt-32 pb-20">
        <ContentHero />
        <Architecture />
        <Skills />
        <Projects />
        <Experience />
        <Education />
        <Essence />
        <ShowreelGallery />
        <OpenSource />
        <Footer />
      </main>
    </div>
  )
}