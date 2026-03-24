import { motion, useInView } from 'framer-motion'
import { type ReactNode, useMemo, useRef } from 'react'

interface ScrollRevealProps {
  children: ReactNode
  className?: string
  stagger?: boolean
  delay?: number
}

// Hoist static variants to module level to avoid recreation
const STAGGER_VARIANTS = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
}

const STAGGER_CHILD_VARIANTS = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] as any } },
}

export default function ScrollReveal({ children, className = '', stagger = false, delay = 0 }: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '0px 0px -50px 0px' })

  const nonStaggerProps = useMemo(
    () => ({
      initial: { opacity: 0, y: 30 },
      animate: isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 },
      transition: { duration: 0.8, ease: [0.4, 0, 0.2, 1] as any, delay },
    }),
    [isInView, delay],
  )

  if (stagger) {
    return (
      <motion.div
        ref={ref}
        className={className}
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
        variants={STAGGER_VARIANTS}
      >
        {children}
      </motion.div>
    )
  }

  return (
    <motion.div ref={ref} className={className} {...nonStaggerProps}>
      {children}
    </motion.div>
  )
}

export function StaggerChild({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <motion.div className={className} variants={STAGGER_CHILD_VARIANTS}>
      {children}
    </motion.div>
  )
}
