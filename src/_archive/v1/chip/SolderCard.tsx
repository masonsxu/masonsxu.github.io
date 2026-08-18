import type { CSSProperties, MouseEvent, ReactNode } from "react";
import { useCallback } from "react";

interface SolderCardProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  onClick?: () => void;
  as?: "div" | "button" | "a";
  href?: string;
  ariaLabel?: string;
}

/**
 * SolderCard — base container for any "card-as-IC-with-pads".
 * Tracks pointer position via CSS vars for the radial pad-glow underlay.
 * Stack with ChipFrame inside for a fully framed module.
 */
export function SolderCard({
  children,
  className = "",
  style,
  onClick,
  as = "div",
  href,
  ariaLabel,
}: SolderCardProps) {
  const onMove = useCallback((e: MouseEvent<HTMLElement>) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    (e.currentTarget as HTMLElement).style.setProperty("--pad-x", `${x}%`);
    (e.currentTarget as HTMLElement).style.setProperty("--pad-y", `${y}%`);
  }, []);

  const baseClass =
    "solder-pad relative rounded-lg bg-surface/40 backdrop-blur-sm transition-colors duration-300";
  const ringClass =
    "shadow-[inset_0_0_0_1px_rgba(0,153,255,0.16)] hover:shadow-[inset_0_0_0_1px_rgba(0,153,255,0.32)]";
  const merged = `${baseClass} ${ringClass} ${className}`;

  if (as === "button") {
    return (
      <button
        type="button"
        className={`${merged} text-left w-full cursor-pointer`}
        style={style}
        onMouseMove={onMove}
        onClick={onClick}
        aria-label={ariaLabel}
      >
        {children}
      </button>
    );
  }
  if (as === "a") {
    return (
      <a
        href={href}
        className={`${merged} block`}
        style={style}
        onMouseMove={onMove}
        aria-label={ariaLabel}
      >
        {children}
      </a>
    );
  }
  return (
    <div className={merged} style={style} onMouseMove={onMove}>
      {children}
    </div>
  );
}
