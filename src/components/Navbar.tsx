import { Menu, Moon, Sun } from 'lucide-react'
import { useEffect, useState } from 'react'
import { GitHubIcon } from './GitHubIcon'
import { useTheme } from '../contexts/ThemeContext'

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('')
  const { theme, toggleTheme } = useTheme()

  useEffect(() => {
    const onScroll = () => {
      const sections = document.querySelectorAll('section[id]')
      let current = ''
      sections.forEach(s => {
        if (window.scrollY >= (s as HTMLElement).offsetTop - 120) current = s.id
      })
      setActiveSection(current)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault()
    setMenuOpen(false)
    const target = document.querySelector(href)
    if (target) {
      const offsetPosition = target.getBoundingClientRect().top + window.pageYOffset - 80
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' })
    }
  }

  const navLinks = [
    { href: '#about', label: '架构能力' },
    { href: '#skills', label: '专业技能' },
    { href: '#projects', label: '核心项目' },
    { href: '#experience', label: '职业经历' },
    { href: '#showreel', label: '动态影集' },
    { href: '#opensource', label: '开源贡献' },
  ]

  return (
    <nav className="fixed w-full z-50 top-0 glass transition-all duration-300">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <a href="#" onClick={e => handleAnchorClick(e, '#')} className="group">
          <img src={theme === 'dark' ? '/logo.svg' : '/logo-light.svg'} alt="Masons Xu Brand Logo" className="h-10 w-auto" />
        </a>

        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted">
          {navLinks.map(link => (
            <a
              key={link.href}
              href={link.href}
              onClick={e => handleAnchorClick(e, link.href)}
              className={`hover:text-text transition-colors ${activeSection === link.href.slice(1) ? 'nav-active' : ''}`}
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={toggleTheme}
            className="flex items-center justify-center w-8 h-8 rounded-md border border-border/20 text-muted hover:text-primary hover:border-primary/50 transition-all"
            aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <a
            href="https://github.com/masonsxu"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-md bg-surface border border-border/20 text-xs font-mono text-muted hover:text-text hover:border-primary/50 transition-all"
          >
            <GitHubIcon size={16} />
            GitHub
          </a>
          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-muted hover:text-text">
            <Menu size={24} />
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden absolute top-16 left-0 w-full bg-bg/95 backdrop-blur-xl border-b border-border/20 p-6 space-y-4">
          {navLinks.map(link => (
            <a key={link.href} href={link.href} onClick={e => handleAnchorClick(e, link.href)} className="block text-muted hover:text-text">
              {link.label}
            </a>
          ))}
        </div>
      )}
    </nav>
  )
}
