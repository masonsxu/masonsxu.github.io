import { Menu } from 'lucide-react'
import { useEffect, useState } from 'react'
import { GitHubIcon } from './GitHubIcon'

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('')

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
          <img src="/logo.svg" alt="Masons Xu Brand Logo" className="h-10 w-auto" />
        </a>

        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted">
          {navLinks.map(link => (
            <a
              key={link.href}
              href={link.href}
              onClick={e => handleAnchorClick(e, link.href)}
              className={`hover:text-white transition-colors ${activeSection === link.href.slice(1) ? 'nav-active' : ''}`}
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <a
            href="https://github.com/masonsxu"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-md bg-surface border border-border/20 text-xs font-mono text-muted hover:text-white hover:border-primary/50 transition-all"
          >
            <GitHubIcon size={16} />
            GitHub
          </a>
          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-muted hover:text-white">
            <Menu size={24} />
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden absolute top-16 left-0 w-full bg-bg/95 backdrop-blur-xl border-b border-border/20 p-6 space-y-4">
          {navLinks.map(link => (
            <a key={link.href} href={link.href} onClick={e => handleAnchorClick(e, link.href)} className="block text-muted hover:text-white">
              {link.label}
            </a>
          ))}
        </div>
      )}
    </nav>
  )
}
