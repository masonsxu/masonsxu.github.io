import type { ReactNode } from "react";
import { useMemo } from "react";
import { useInView } from "../hooks";

export function ScrollReveal({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const { ref, inView } = useInView();
  const style = useMemo(
    () => (delay ? { transitionDelay: `${delay}ms` } : undefined),
    [delay],
  );
  return (
    <div
      ref={ref}
      className={`reveal ${inView ? "visible" : ""} ${className}`}
      style={style}
    >
      {children}
    </div>
  );
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <span className="text-xs font-mono text-gold tracking-[0.3em] uppercase block mb-4">
      {children}
    </span>
  );
}

export function GoldDivider() {
  return <div className="gold-divider w-full my-20 md:my-28" />;
}
