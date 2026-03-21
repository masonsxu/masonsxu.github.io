interface SectionHeaderProps {
  title: string
  className?: string
}

export default function SectionHeader({ title, className = 'mb-8' }: SectionHeaderProps) {
  return (
    <div className={`flex items-center justify-between ${className}`}>
      <h2 className="text-sm font-bold text-muted uppercase tracking-widest">{title}</h2>
      <div className="h-px bg-border/20 flex-1 ml-6" />
    </div>
  )
}
