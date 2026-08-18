/**
 * Canvas2D fallback renderer — same sim, same palette, zero WebGPU needed.
 */
import type { SceneGraph } from "./scene";
import type { SimParams } from "./sim";
import type { FrameData } from "./rendererGPU";
import { sub } from "./math";

export class NeuralRenderer2D {
  private dust: { x: number; y: number; z: number; s: number }[] = [];

  constructor(private canvas: HTMLCanvasElement, private scene: SceneGraph, layout: "spine" | "sphere" = "spine") {
    for (let i = 0; i < 420; i++) {
      const s = ((i * 2654435761) % 1000) / 1000;
      const far = i % 5 >= 2;
      if (layout === "sphere" && far) {
        const a1 = ((i * 8093) % 1000) / 1000 * Math.PI;
        const r = 240 + ((i * 3571) % 1000) / 1000 * 160;
        this.dust.push({
          x: Math.sin(a1) * Math.cos(s * Math.PI * 2) * r,
          y: Math.cos(a1) * r * 0.75,
          z: Math.sin(a1) * Math.sin(s * Math.PI * 2) * r,
          s,
        });
      } else if (layout === "sphere") {
        const a1 = ((i * 8093) % 1000) / 1000 * Math.PI;
        const r = 30 + ((i * 3571) % 1000) / 1000 * 180;
        this.dust.push({
          x: Math.sin(a1) * Math.cos(s * Math.PI * 2) * r,
          y: Math.cos(a1) * r * 0.75,
          z: Math.sin(a1) * Math.sin(s * Math.PI * 2) * r,
          s,
        });
      } else {
        this.dust.push({
          x: Math.cos(s * Math.PI * 2) * (30 + s * 70),
          y: (s - 0.5) * 90,
          z: -((i * 911) % 2900) / 10 - 5,
          s,
        });
      }
    }
  }

  resize(): void {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.floor(this.canvas.clientWidth * dpr);
    const h = Math.floor(this.canvas.clientHeight * dpr);
    if (w > 0 && h > 0 && (this.canvas.width !== w || this.canvas.height !== h)) {
      this.canvas.width = w;
      this.canvas.height = h;
    }
  }

  render(frame: FrameData): void {
    const ctx = this.canvas.getContext("2d");
    if (!ctx) return;
    const { sim, camPos, camTarget, time } = frame;
    const w = this.canvas.width;
    const h = this.canvas.height;
    const aspect = w / h;

    // simple pinhole projection
    const fwd = sub(camTarget, camPos);
    const fl = (h / 2) / Math.tan(Math.PI * 0.21);
    const fz = Math.hypot(fwd[0], fwd[1], fwd[2]) || 1;
    const fx = fwd[0] / fz, fy = fwd[1] / fz, fzz = fwd[2] / fz;

    const project = (x: number, y: number, z: number): [number, number, number] => {
      const dx = x - camPos[0], dy = y - camPos[1], dz = z - camPos[2];
      const depth = dx * fx + dy * fy + dz * fzz;
      if (depth <= 0.5) return [0, 0, -1];
      const rightX = fy, rightY = -fx; // cheap orthonormal-ish basis (xz-plane flight)
      const upX = 0, upY = 1;
      const px = (dx * rightX + dy * rightY) / depth * fl;
      const py = (dx * upX + dy * upY) / depth * fl;
      return [w / 2 + px * (aspect > 1 ? 1 : aspect), h / 2 - py, depth];
    };

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "#02030a";
    ctx.fillRect(0, 0, w, h);
    ctx.globalCompositeOperation = "lighter";

    // dust
    for (const d of this.dust) {
      const [sx, sy, depth] = project(
        d.x + Math.sin(time * 0.08 + d.s * 31) * 2,
        d.y + Math.cos(time * 0.06 + d.s * 47) * 2,
        d.z,
      );
      if (depth < 0) continue;
      const r = Math.max(0.4, (1 - depth / 300) * 2.4 * (this.canvas.width / 900));
      ctx.fillStyle = `rgba(120,140,190,${0.10 + d.s * 0.16})`;
      ctx.beginPath();
      ctx.arc(sx, sy, r, 0, Math.PI * 2);
      ctx.fill();
    }

    const S = this.scene;

    // synapses
    ctx.lineWidth = Math.max(0.5, this.canvas.width / 2400);
    const at = (a: ArrayLike<number>, i: number) => a[i] ?? 0;
    for (let e = 0; e < S.edgeCount; e++) {
      const a = at(S.edges, e * 2);
      const b = at(S.edges, e * 2 + 1);
      const [ax, ay, ad] = project(at(sim.pos, a * 3), at(sim.pos, a * 3 + 1), at(sim.pos, a * 3 + 2));
      const [bx, by, bd] = project(at(sim.pos, b * 3), at(sim.pos, b * 3 + 1), at(sim.pos, b * 3 + 2));
      if (ad < 0 || bd < 0) continue;
      const energy = (at(sim.energy, a) + at(sim.energy, b)) * 0.5;
      const fog = Math.exp(-((ad + bd) * 0.5) * 0.016);
      const alpha = (0.05 + energy * 0.4) * fog;
      if (alpha < 0.015) continue;
      const c = S.clusters[at(S.nodeCluster, a)]?.color ?? [1, 1, 1];
      ctx.strokeStyle = `rgba(${(c[0] * 255) | 0},${(c[1] * 255) | 0},${(c[2] * 255) | 0},${alpha})`;
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.lineTo(bx, by);
      ctx.stroke();
    }

    // nodes
    const base = this.canvas.width / 1400;
    for (let i = 0; i < S.nodeCount; i++) {
      const [sx, sy, depth] = project(at(sim.pos, i * 3), at(sim.pos, i * 3 + 1), at(sim.pos, i * 3 + 2));
      if (depth < 0) continue;
      const e = at(sim.energy, i);
      const c = S.clusters[at(S.nodeCluster, i)]?.color ?? [1, 1, 1];
      const r = (1 + e * 5) * base * (1 - Math.min(depth / 300, 0.7));
      if (r < 0.4) continue;
      const alpha = Math.min(0.9, 0.15 + e * 0.75);
      const g = ctx.createRadialGradient(sx, sy, 0, sx, sy, r * 3);
      g.addColorStop(0, `rgba(${(c[0] * 255) | 0},${(c[1] * 255) | 0},${(c[2] * 255) | 0},${alpha})`);
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(sx, sy, r * 3, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalCompositeOperation = "source-over";
  }
}
