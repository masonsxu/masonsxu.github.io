import { useEffect, useRef } from "react";

interface NodeT {
  x: number; y: number; vx: number; vy: number;
  ax: number; ay: number;
  r: number; label: string | null;
}

interface LinkT { a: number; b: number }

interface Packet { link: number; t: number; speed: number }

const INK_LINE = "rgba(239, 237, 230, 0.065)";
const INK_NODE = "rgba(239, 237, 230, 0.5)";
const LABEL = "rgba(239, 237, 230, 0.3)";
const ACCENT = "rgba(101, 118, 255, 0.95)";

export function MeshBackground() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = 0, h = 0, dpr = 1;
    let nodes: NodeT[] = [];
    let links: LinkT[] = [];
    let packets: Packet[] = [];
    const mouse = { x: -9999, y: -9999 };
    let raf = 0;
    let running = true;
    let lastSpawn = 0;

    const rand = (seed: number) => {
      const s = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
      return s - Math.floor(s);
    };

    const build = () => {
      const small = window.innerWidth < 720;
      const named = small
        ? ["gw", "auth", "svc-01", "svc-02", "svc-03", "svc-04", "data", "iceberg"]
        : ["gw", "auth", "svc-01", "svc-02", "svc-03", "svc-04", "svc-05", "svc-06", "svc-07", "svc-08", "data", "iceberg"];
      const anonCount = small ? 6 : 14;
      nodes = [];
      named.forEach((label, i) => {
        nodes.push({
          x: 0.08 + rand(i + 1) * 0.84,
          y: 0.08 + rand(i + 51) * 0.84,
          vx: 0, vy: 0,
          ax: 0.06 + rand(i + 1) * 0.88,
          ay: 0.06 + rand(i + 51) * 0.88,
          r: label === "gw" || label === "data" ? 2.6 : 1.8,
          label,
        });
      });
      for (let i = 0; i < anonCount; i++) {
        const seed = i + 201;
        nodes.push({
          x: rand(seed), y: rand(seed + 77),
          vx: 0, vy: 0,
          ax: 0.05 + rand(seed) * 0.9,
          ay: 0.05 + rand(seed + 77) * 0.9,
          r: 1.2 + rand(seed + 33) * 1.1,
          label: null,
        });
      }
      const idx = (l: string) => nodes.findIndex(n => n.label === l);
      const svcIds = named.filter(n => n.startsWith("svc")).map(idx);
      links = [];
      const push = (a: number, b: number) => { if (a >= 0 && b >= 0) links.push({ a, b }); };
      push(idx("gw"), idx("auth"));
      svcIds.forEach(id => push(idx("gw"), id));
      svcIds.forEach((id, i) => {
        if (i % 2 === 0) push(id, idx("data"));
        const next = svcIds[i + 1];
        if (next !== undefined && i < svcIds.length - 1) push(id, next);
      });
      push(idx("data"), idx("iceberg"));
      nodes.forEach((n, i) => {
        if (n.label === null) {
          let best = -1, bd = 1e9;
          nodes.forEach((m, j) => {
            if (m.label === null || j === i) return;
            const d = (n.ax - m.ax) ** 2 + (n.ay - m.ay) ** 2;
            if (d < bd) { bd = d; best = j; }
          });
          if (best >= 0) push(i, best);
        }
      });
    };

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      ctx.strokeStyle = INK_LINE;
      ctx.lineWidth = 1;
      for (const l of links) {
        const a = nodes[l.a], b = nodes[l.b];
        if (!a || !b) continue;
        ctx.beginPath();
        ctx.moveTo(a.x * w, a.y * h);
        ctx.lineTo(b.x * w, b.y * h);
        ctx.stroke();
      }
      for (const p of packets) {
        const l = links[p.link];
        if (!l) continue;
        const a = nodes[l.a], b = nodes[l.b];
        if (!a || !b) continue;
        const t = p.t;
        const x = (a.x + (b.x - a.x) * t) * w;
        const y = (a.y + (b.y - a.y) * t) * h;
        ctx.fillStyle = ACCENT;
        ctx.beginPath();
        ctx.arc(x, y, 2.2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.font = "10px 'JetBrains Mono', monospace";
      for (const n of nodes) {
        const x = n.x * w, y = n.y * h;
        ctx.fillStyle = INK_NODE;
        ctx.beginPath();
        ctx.arc(x, y, n.r, 0, Math.PI * 2);
        ctx.fill();
        if (n.label) {
          ctx.fillStyle = LABEL;
          ctx.fillText(n.label, x + 7, y + 3);
        }
      }
    };

    const step = (dt: number, now: number) => {
      for (const n of nodes) {
        const px = n.x * w, py = n.y * h;
        let fx = (n.ax - n.x) * 0.9;
        let fy = (n.ay - n.y) * 0.9;
        fx += (rand(now * 0.001 + n.ax * 97) - 0.5) * 0.5;
        fy += (rand(now * 0.001 + n.ay * 97) - 0.5) * 0.5;
        const mx = mouse.x - px, my = mouse.y - py;
        const md = Math.hypot(mx, my);
        if (md < 340 && md > 1) {
          const pull = 26 / md;
          fx += (mx / md) * pull * 0.14;
          fy += (my / md) * pull * 0.14;
          if (md < 130) {
            const push = (1 - md / 130) * 9;
            fx -= (mx / md) * push;
            fy -= (my / md) * push;
          }
        }
        n.vx = (n.vx + fx * dt) * 0.965;
        n.vy = (n.vy + fy * dt) * 0.965;
        n.x += n.vx * dt;
        n.y += n.vy * dt;
        n.x = Math.max(0.02, Math.min(0.98, n.x));
        n.y = Math.max(0.02, Math.min(0.98, n.y));
      }
      if (now - lastSpawn > 620 && links.length > 0) {
        lastSpawn = now;
        packets.push({ link: Math.floor(rand(now) * links.length), t: 0, speed: 0.7 + rand(now + 5) * 0.9 });
      }
      packets = packets.filter(p => (p.t += p.speed * dt) <= 1);
    };

    const tick = (now: number) => {
      if (!running) return;
      step(1 / 60, now);
      draw();
      raf = requestAnimationFrame(tick);
    };

    const onMouse = (e: PointerEvent) => { mouse.x = e.clientX; mouse.y = e.clientY; };
    const onLeave = () => { mouse.x = -9999; mouse.y = -9999; };
    const onClick = (e: PointerEvent) => {
      if ((e.target as HTMLElement).closest("a,button,input,textarea")) return;
      let best = 0, bd = 1e18;
      nodes.forEach((n, i) => {
        const d = (n.x * w - e.clientX) ** 2 + (n.y * h - e.clientY) ** 2;
        if (d < bd) { bd = d; best = i; }
      });
      links.forEach((l, li) => {
        if ((l.a === best || l.b === best) && packets.length < 40) {
          const fwd = l.a === best;
          packets.push({ link: li, t: fwd ? 0 : 1, speed: (0.9 + Math.random() * 0.6) * (fwd ? 1 : -1) });
        }
      });
    };
    const onVis = () => {
      if (document.hidden) {
        running = false;
        cancelAnimationFrame(raf);
      } else if (!reduced) {
        running = true;
        raf = requestAnimationFrame(tick);
      }
    };

    build();
    resize();
    if (reduced) {
      draw();
    } else {
      raf = requestAnimationFrame(tick);
      window.addEventListener("pointermove", onMouse, { passive: true });
      window.addEventListener("pointerleave", onLeave);
      window.addEventListener("pointerdown", onClick);
      document.addEventListener("visibilitychange", onVis);
    }
    const onResize = () => { resize(); if (reduced) draw(); };
    window.addEventListener("resize", onResize);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onMouse);
      window.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("pointerdown", onClick);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  return <canvas ref={ref} className="w5-mesh" aria-hidden="true" />;
}
