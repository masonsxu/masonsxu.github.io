import type { ReactNode } from "react";

interface SmdTagProps {
  children: ReactNode;
  variant?: "default" | "gold";
  className?: string;
}

/** SMD-style monospaced pill tag — used in place of the prior tag class. */
export function SmdTag({ children, variant = "default", className = "" }: SmdTagProps) {
  return (
    <span
      className={`smd-tag ${variant === "gold" ? "smd-tag-gold" : ""} ${className}`}
    >
      {children}
    </span>
  );
}
