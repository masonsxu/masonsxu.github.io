import { useEffect, useRef } from "react";
import { useReducedMotion } from "../lib/silicon";

/**
 * ChipFabricBG — fixed-position canvas background that renders a programmatic
 * PCB trace fabric with gold data packets pulsing along the routes.
 *
 * Visual rules:
 *  - 90°/45° trace segments only (no curves, no diagonals).
 *  - Hex-staggered grid of "vias" (junction dots).
 *  - Packets travel between vias along trace segments, occasionally turning.
 *  - Reduced motion: render a single static frame, no rAF loop.
 *  - Mobile (< 720px width): packet count and trace count halved.
 */
export function ChipFabricBG() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = 0;
    let height = 0;
    let cellSize = 64;

    type Via = { x: number; y: number };
    type Trace = { a: Via; b: Via; len: number };
    type Packet = {
      trace: number;
      t: number; // 0..1 along trace
      speed: number; // per second
      hue: "gold" | "blue";
    };

    let vias: Via[] = [];
    let traces: Trace[] = [];
    let packets: Packet[] = [];

    const isMobile = () => window.innerWidth < 720;

    function buildFabric() {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      cellSize = isMobile() ? 80 : 96;
      const cols = Math.ceil(width / cellSize) + 1;
      const rows = Math.ceil(height / cellSize) + 1;

      // Lay vias on hex-staggered grid (every other row offset by 0.5 cell)
      vias = [];
      const grid: number[][] = [];
      for (let r = 0; r < rows; r++) {
        grid[r] = [];
        for (let c = 0; c < cols; c++) {
          const offset = r % 2 === 0 ? 0 : cellSize * 0.5;
          const x = c * cellSize + offset;
          const y = r * cellSize;
          // Pseudo-random skip ~12% to avoid perfect grid
          const skip = ((r * 73856093) ^ (c * 19349663)) >>> 0;
          if ((skip & 0xff) < 30) {
            grid[r][c] = -1;
            continue;
          }
          grid[r][c] = vias.length;
          vias.push({ x, y });
        }
      }

      // Build traces between adjacent vias (right + down + diag-down)
      traces = [];
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const i = grid[r]?.[c];
          if (i == null || i < 0) continue;
          const a = vias[i];
          // East
          const e = grid[r]?.[c + 1];
          if (e != null && e >= 0 && Math.random() > 0.35) {
            const b = vias[e];
            traces.push({ a, b, len: Math.hypot(b.x - a.x, b.y - a.y) });
          }
          // South
          const s = grid[r + 1]?.[c];
          if (s != null && s >= 0 && Math.random() > 0.45) {
            const b = vias[s];
            traces.push({ a, b, len: Math.hypot(b.x - a.x, b.y - a.y) });
          }
          // South-east diag (45°)
          const se = grid[r + 1]?.[r % 2 === 0 ? c : c + 1];
          if (se != null && se >= 0 && Math.random() > 0.7) {
            const b = vias[se];
            traces.push({ a, b, len: Math.hypot(b.x - a.x, b.y - a.y) });
          }
        }
      }

      // Spawn packets — count scales with viewport
      const target = Math.min(
        isMobile() ? 24 : 80,
        Math.floor(traces.length * 0.18),
      );
      packets = [];
      for (let i = 0; i < target; i++) {
        spawnPacket();
      }
    }

    function spawnPacket() {
      if (traces.length === 0) return;
      const idx = Math.floor(Math.random() * traces.length);
      packets.push({
        trace: idx,
        t: Math.random(),
        speed: 0.04 + Math.random() * 0.1,
        hue: Math.random() > 0.55 ? "blue" : "gold",
      });
    }

    function drawStatic() {
      ctx.clearRect(0, 0, width, height);
      // Vias
      ctx.fillStyle = "rgba(255, 255, 255, 0.04)";
      for (const v of vias) {
        ctx.beginPath();
        ctx.arc(v.x, v.y, 1, 0, Math.PI * 2);
        ctx.fill();
      }
      // Traces
      ctx.lineWidth = 1;
      ctx.strokeStyle = "rgba(0, 153, 255, 0.04)";
      ctx.beginPath();
      for (const tr of traces) {
        ctx.moveTo(tr.a.x, tr.a.y);
        ctx.lineTo(tr.b.x, tr.b.y);
      }
      ctx.stroke();
    }

    function draw(dt: number) {
      // Heavier trail — packets leave only a brief streak before fading to black
      ctx.fillStyle = "rgba(0, 0, 0, 0.32)";
      ctx.fillRect(0, 0, width, height);

      // Vias (very faint)
      ctx.fillStyle = "rgba(255, 255, 255, 0.035)";
      for (let i = 0; i < vias.length; i++) {
        const v = vias[i];
        ctx.fillRect(v.x - 0.5, v.y - 0.5, 1, 1);
      }

      // Traces — barely visible blue baseline
      ctx.lineWidth = 1;
      ctx.strokeStyle = "rgba(0, 153, 255, 0.035)";
      ctx.beginPath();
      for (const tr of traces) {
        ctx.moveTo(tr.a.x, tr.a.y);
        ctx.lineTo(tr.b.x, tr.b.y);
      }
      ctx.stroke();

      // Packets
      for (let i = 0; i < packets.length; i++) {
        const p = packets[i];
        p.t += p.speed * dt;
        if (p.t >= 1) {
          // Hop: pick another trace sharing the endpoint
          const cur = traces[p.trace];
          const endpoint = cur.b;
          const candidates: number[] = [];
          for (let j = 0; j < traces.length; j++) {
            if (j === p.trace) continue;
            const tj = traces[j];
            if (tj.a === endpoint || tj.b === endpoint) candidates.push(j);
          }
          if (candidates.length > 0) {
            const next = candidates[Math.floor(Math.random() * candidates.length)];
            const tn = traces[next];
            p.trace = next;
            p.t = tn.a === endpoint ? 0 : 1 - 0.001;
            // Reverse direction if needed by flipping speed sign
            if (tn.b === endpoint) p.speed = -Math.abs(p.speed);
            else p.speed = Math.abs(p.speed);
          } else {
            // Respawn elsewhere
            p.trace = Math.floor(Math.random() * traces.length);
            p.t = 0;
            p.speed = 0.06 + Math.random() * 0.16;
          }
        } else if (p.t <= 0) {
          p.trace = Math.floor(Math.random() * traces.length);
          p.t = 0;
          p.speed = Math.abs(p.speed);
        }

        const tr = traces[p.trace];
        const x = tr.a.x + (tr.b.x - tr.a.x) * p.t;
        const y = tr.a.y + (tr.b.y - tr.a.y) * p.t;

        if (p.hue === "gold") {
          ctx.fillStyle = "rgba(212, 175, 55, 0.55)";
          ctx.shadowColor = "rgba(212, 175, 55, 0.3)";
          ctx.shadowBlur = 4;
        } else {
          ctx.fillStyle = "rgba(0, 153, 255, 0.42)";
          ctx.shadowColor = "rgba(0, 153, 255, 0.25)";
          ctx.shadowBlur = 3;
        }
        ctx.beginPath();
        ctx.arc(x, y, 1.1, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.shadowBlur = 0;
    }

    let raf = 0;
    let last = performance.now();
    let alive = true;

    function loop(now: number) {
      if (!alive) return;
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      draw(dt);
      raf = requestAnimationFrame(loop);
    }

    let resizeT = 0;
    function onResize() {
      window.clearTimeout(resizeT);
      resizeT = window.setTimeout(() => {
        buildFabric();
        if (reduced) drawStatic();
      }, 150);
    }

    buildFabric();

    if (reduced) {
      drawStatic();
    } else {
      raf = requestAnimationFrame(loop);
    }
    window.addEventListener("resize", onResize);

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      window.clearTimeout(resizeT);
    };
  }, [reduced]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0"
      style={{
        opacity: 0.55,
        // Vignette mask: fade the canvas where the content sits (center column)
        // so traces feel like they live at the edges of the page, not on top
        // of the reading surface.
        WebkitMaskImage:
          "radial-gradient(ellipse 56% 70% at 50% 50%, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.55) 38%, rgba(0,0,0,1) 75%)",
        maskImage:
          "radial-gradient(ellipse 56% 70% at 50% 50%, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.55) 38%, rgba(0,0,0,1) 75%)",
      }}
    />
  );
}
