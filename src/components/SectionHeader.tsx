interface SectionHeaderProps {
  title: string
  className?: string
}

export default function SectionHeader({ title, className = 'mb-14' }: SectionHeaderProps) {
  return (
    <div className={`flex items-center gap-4 md:gap-6 ${className}`}>
      <div className="h-px bg-border/20 flex-grow" />
      <h2 className="text-[1.75rem] md:text-3xl font-serif text-text shrink-0">{title}</h2>
      <div className="h-px bg-border/20 flex-grow" />
    </div>
  )
}
