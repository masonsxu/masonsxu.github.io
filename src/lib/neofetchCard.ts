/**
 * Render the `neofetch` identity card to a PNG and trigger a download.
 * Pure canvas — no extra dependencies. Mirrors the on-screen card layout.
 */
export interface NeofetchCardData {
  logo: string[];
  rows: [string, string][];
  footer: string;
}

export function downloadNeofetchCard({ logo, rows, footer }: NeofetchCardData): void {
  const scale = Math.min(window.devicePixelRatio || 1, 2) * 1.5;
  const W = 660;
  const H = 150 + rows.length * 22;
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(W * scale);
  canvas.height = Math.round(H * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.scale(scale, scale);

  // Background + silk border
  ctx.fillStyle = "#060608";
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = "rgba(0,153,255,0.35)";
  ctx.lineWidth = 1;
  ctx.strokeRect(8.5, 8.5, W - 17, H - 17);

  const mono = '"JetBrains Mono", ui-monospace, monospace';

  // ASCII logo (gold)
  ctx.font = `13px ${mono}`;
  ctx.fillStyle = "#D4AF37";
  ctx.textBaseline = "alphabetic";
  logo.forEach((l, i) => ctx.fillText(l, 30, 56 + i * 16));

  // Info column
  const colX = 250;
  ctx.font = `13px ${mono}`;
  ctx.fillStyle = "#D4AF37";
  ctx.fillText("masons@portfolio", colX, 48);
  ctx.fillStyle = "rgba(252,252,252,0.22)";
  ctx.fillText("────────────────────", colX, 62);

  ctx.font = `12px ${mono}`;
  rows.forEach(([k, v], i) => {
    const y = 84 + i * 22;
    ctx.fillStyle = "#0099FF";
    ctx.fillText(k, colX, y);
    ctx.fillStyle = "rgba(252,252,252,0.85)";
    ctx.fillText(v, colX + 72, y);
  });

  // Palette swatches
  const swatches = ["#D4AF37", "#0099FF", "#FCFCFC", "rgba(252,252,252,0.25)"];
  const swY = 84 + rows.length * 22 + 6;
  swatches.forEach((c, i) => {
    ctx.fillStyle = c;
    ctx.fillRect(colX + i * 28, swY, 22, 13);
  });

  // Footer
  ctx.font = `10px ${mono}`;
  ctx.fillStyle = "rgba(252,252,252,0.3)";
  ctx.fillText(footer, 30, H - 22);

  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "masonsos-neofetch.png";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }, "image/png");
}
