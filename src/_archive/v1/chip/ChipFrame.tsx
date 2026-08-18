import type { ReactNode } from "react";

interface ChipFrameProps {
  children: ReactNode;
  /** Silkscreen part number printed on top edge, e.g. "MX-CORE-01" */
  partNo?: string;
  /** Sub-line printed under partNo */
  subLabel?: string;
  /** Hex address printed on bottom-right corner */
  addr?: string;
  /** Number of pins per side (default 8) */
  pins?: number;
  /** Override className on outer wrapper */
  className?: string;
  /** Disable the per-side pins (use only the silk frame) */
  pinsHidden?: boolean;
}

/**
 * ChipFrame — IC package shell. Wraps a section's content in a silk-printed
 * border + corner registration marks + side pins.
 *
 * Layout: 24px breathing room around content. Pins overlap the border.
 * Pin energize animation lives in CSS keyframe `pinEnergize` and triggers
 * once the section enters the viewport via the `data-energized` attribute
 * (set by IntersectionObserver in callers).
 */
export function ChipFrame({
  children,
  partNo,
  subLabel,
  addr,
  pins = 8,
  className = "",
  pinsHidden = false,
}: ChipFrameProps) {
  const pinArray = Array.from({ length: pins });

  return (
    <div className={`relative ${className}`}>
      {/* Silk-printed border */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute inset-0 rounded-lg"
          style={{
            boxShadow:
              "inset 0 0 0 1px rgba(0, 153, 255, 0.18), inset 0 0 0 4px rgba(0, 0, 0, 0.6)",
          }}
        />
        {/* Corner registration marks */}
        {(["tl", "tr", "bl", "br"] as const).map((corner) => (
          <RegMark key={corner} corner={corner} />
        ))}
        {/* Silk text — top-left */}
        {partNo && (
          <div
            className="absolute top-3 left-5 font-mono text-[10px] tracking-[0.18em] text-gold/80 uppercase"
            style={{ letterSpacing: "0.18em" }}
          >
            {partNo}
            {subLabel && (
              <span className="ml-2 text-foreground/40 normal-case tracking-normal">
                · {subLabel}
              </span>
            )}
          </div>
        )}
        {/* Silk text — bottom-right */}
        {addr && (
          <div className="absolute bottom-3 right-5 font-mono text-[10px] text-foreground/40 tracking-[0.14em]">
            {addr}
          </div>
        )}
      </div>

      {/* Side pins */}
      {!pinsHidden && (
        <>
          {/* Top pins */}
          <div className="absolute -top-1 left-0 right-0 flex justify-evenly pointer-events-none">
            {pinArray.map((_, i) => (
              <Pin key={`t${i}`} delay={i * 35} />
            ))}
          </div>
          {/* Bottom pins */}
          <div className="absolute -bottom-1 left-0 right-0 flex justify-evenly pointer-events-none">
            {pinArray.map((_, i) => (
              <Pin key={`b${i}`} delay={(pins + i) * 35} />
            ))}
          </div>
        </>
      )}

      {/* Inner content */}
      <div className="relative z-10 px-6 py-10 md:px-10 md:py-14">{children}</div>
    </div>
  );
}

function RegMark({ corner }: { corner: "tl" | "tr" | "bl" | "br" }) {
  const pos: Record<typeof corner, string> = {
    tl: "top-1.5 left-1.5",
    tr: "top-1.5 right-1.5 rotate-90",
    bl: "bottom-1.5 left-1.5 -rotate-90",
    br: "bottom-1.5 right-1.5 rotate-180",
  };
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      className={`absolute ${pos[corner]}`}
      aria-hidden
    >
      <path
        d="M0 0 L6 0 M0 0 L0 6"
        stroke="rgba(212, 175, 55, 0.55)"
        strokeWidth="1"
      />
    </svg>
  );
}

function Pin({ delay }: { delay: number }) {
  return (
    <span
      className="block w-1 h-2 rounded-sm"
      style={{
        background: "rgba(255, 255, 255, 0.12)",
        animation: `pinEnergize 0.3s ${delay}ms cubic-bezier(0.2, 0.8, 0.2, 1) forwards`,
      }}
    />
  );
}
