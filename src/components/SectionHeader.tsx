interface SectionHeaderProps {
  title: string
  className?: string
}

export default function SectionHeader({ title, className = 'mb-16' }: SectionHeaderProps) {
  return (
    <div className={`flex items-center gap-6 ${className}`}>
      <div className="h-px bg-border/20 flex-grow" />
      <h2 className="text-3xl font-serif text-text shrink-0">{title}</h2>
      <div className="h-px bg-border/20 flex-grow" />
    </div>
  )
}
