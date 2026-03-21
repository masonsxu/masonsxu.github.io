export default function Footer() {
  return (
    <footer className="border-t border-border/20 pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
      <div className="text-muted text-xs">
        &copy; 2026 徐俊飞. All rights reserved.
      </div>
      <div className="flex items-center gap-6 text-sm">
        <a href="https://github.com/masonsxu" target="_blank" rel="noopener noreferrer" className="text-muted hover:text-white transition-colors">GitHub</a>
        <a href="mailto:masonsxu@foxmail.com" className="text-muted hover:text-white transition-colors">Email</a>
        <a href="resume.pdf" target="_blank" rel="noopener noreferrer" className="text-muted hover:text-white transition-colors">Resume</a>
      </div>
    </footer>
  )
}
