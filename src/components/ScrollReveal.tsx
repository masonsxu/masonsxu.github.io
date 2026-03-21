import { type ReactNode, useRef } from 'react'
import { motion, useInView } from 'framer-motion'

interface ScrollRevealProps {
  children: ReactNode
  className?: string
  stagger?: boolean
  delay?: number
}

export default function ScrollReveal({ children, className = '', stagger = false, delay = 0 }: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '0px 0px -50px 0px' })

  if (stagger) {
    return (
      <motion.div
        ref={ref}
        className={className}
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.12 } },
        }}
      >
        {children}
      </motion.div>
    )
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1], delay }}
    >
      {children}
    </motion.div>
  )
}

export function StaggerChild({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] } },
      }}
    >
      {children}
    </motion.div>
  )
}
