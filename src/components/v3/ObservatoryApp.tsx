import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "../../i18n";
import { buildScene, ringLayout, type SceneGraph } from "../../v2/scene";
import { initSim, prunePulses, stepSim, type CursorField, type Pulse, type SimParams } from "../../v2/sim";
import { NeuralRendererGPU, type FrameData } from "../../v2/rendererGPU";
import { NeuralRenderer2D } from "../../v2/renderer2d";
import { SignalAudio } from "../../v2/audio";
import { add, cross, len, mul, norm, perspective, lookAt, scale, sub, v3, type Vec3 } from "../../v2/math";
import { CLUSTERS } from "../v2/clusters";
import { Overlay } from "../v2/Overlay";

const N = CLUSTERS.length;
const ACTIVATE_R = 46;
/** bounds-checked read for typed arrays under noUncheckedIndexedAccess */
const at = (a: ArrayLike<number>, i: number): number => a[i] ?? 0;
const rgb = (c: [number, number, number]) =>
  `rgb(${Math.round(c[0] * 255)},${Math.round(c[1] * 255)},${Math.round(c[2] * 255)})`;

const LABELS_ZH = ["奇点·核心", "身份", "分布式平台", "数据湖", "表单引擎", "微服务模板", "能力矩阵", "成长轨迹", "开源贡献", "连接信标"];
const LABELS_EN = ["singularity", "identity", "platform", "datalake", "form-engine", "template", "capability", "trajectory", "oss", "beacon"];

interface FlightState {
  pos: Vec3;
  yaw: number;
  pitch: number;
  vel: Vec3;
  speed: number;
}

function fwdOf(yaw: number, pitch: number): Vec3 {
  const cp = Math.cos(pitch);
  return [Math.sin(yaw) * cp, Math.sin(pitch), -Math.cos(yaw) * cp];
}

function easeInOut(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export function ObservatoryApp({ blackhole = true }: { blackhole?: boolean }) {
  const { t, locale, setLocale } = useTranslation();
  const scene: SceneGraph = useMemo(() => buildScene(CLUSTERS, ringLayout), []);
  const simRef = useRef<SimParams | null>(null);
  simRef.current ??= initSim(scene);

  const canvasGPURef = useRef<HTMLCanvasElement>(null);
  const canvas2DRef = useRef<HTMLCanvasElement>(null);
  const warpRef = useRef<HTMLDivElement>(null);
  const velReadoutRef = useRef<HTMLSpanElement>(null);
  const labelRefs = useRef<(HTMLDivElement | null)[]>([]);

  const flight = useRef<FlightState>({ pos: [0, 150, 300], yaw: 0, pitch: -0.55, vel: [0, 0, 0], speed: 22 });
  const timeRef = useRef(0);
  const keys = useRef<Set<string>>(new Set());
  const drag = useRef<{ on: boolean; x: number; y: number }>({ on: false, x: 0, y: 0 });
  const warp = useRef<{ from: Vec3; to: Vec3; fromYaw: number; toYaw: number; fromPitch: number; toPitch: number; t0: number; dur: number } | null>(null);
  const pulses = useRef<Pulse[]>([]);
  const autoDrift = useRef(false);

  const [active, setActive] = useState(0);
  const [nearIdx, setNearIdx] = useState(0);
  const [mode, setMode] = useState<"gpu" | "2d">("gpu");
  const [signalOn, setSignalOn] = useState(false);
  const audioRef = useRef<SignalAudio | null>(null);
  const activeRef = useRef(0);
  const nearRef = useRef(0);

  const labels = locale === "zh" ? LABELS_ZH : LABELS_EN;

  const warpTo = useCallback((i: number, dur = 1.9) => {
    const sim = simRef.current;
    if (!sim) return;
    const st: Vec3 = [at(sim.rotatedStops, i * 3), at(sim.rotatedStops, i * 3 + 1), at(sim.rotatedStops, i * 3 + 2)];
    const outward = norm(st); // station → away from origin
    let target = add(st, scale(outward, 42));
    target = [target[0], target[1] + 7, target[2]];
    const dir = norm(sub(st, target));
    const yaw = Math.atan2(dir[0], -dir[2]);
    const pitch = Math.asin(Math.max(-1, Math.min(1, dir[1])));
    const f = flight.current;
    warp.current = {
      from: [...f.pos] as Vec3,
      to: target,
      fromYaw: f.yaw,
      toYaw: yaw,
      fromPitch: f.pitch,
      toPitch: pitch,
      t0: timeRef.current,
      dur,
    };
    pulses.current.push({ origin: st, t0: timeRef.current, strength: 1 });
  }, []);

  useEffect(() => {
    (window as unknown as { __OBS__?: unknown }).__OBS__ = {
      flight: flight.current,
      warp: (i: number, d = 1.9) => warpTo(i, d),
    };
  }, [warpTo]);

  useEffect(() => {
    let raf = 0;
    let disposed = false;
    let renderer: NeuralRendererGPU | null = null;
    let renderer2: NeuralRenderer2D | null = null;
    const sim = simRef.current!;
    const cursor: CursorField = { point: [0, 0, 0], active: false };
    let time = 0;
    let last = performance.now();

    const onKeyDown = (e: KeyboardEvent) => {
      keys.current.add(e.key.toLowerCase());
      if (e.key >= "0" && e.key <= "9") {
        const idx = e.key === "0" ? 9 : Number(e.key) - 1;
        if (idx < N) warpTo(idx);
      }
      if (["w", "a", "s", "d", "q", "e", " "].includes(e.key.toLowerCase())) e.preventDefault();
    };
    const onKeyUp = (e: KeyboardEvent) => keys.current.delete(e.key.toLowerCase());
    const onDown = (e: PointerEvent) => {
      if ((e.target as HTMLElement).closest("a,button,.syn-panel,.obs-dock")) return;
      drag.current = { on: true, x: e.clientX, y: e.clientY };
    };
    const onMove = (e: PointerEvent) => {
      if (!drag.current.on) return;
      const dx = e.clientX - drag.current.x;
      const dy = e.clientY - drag.current.y;
      drag.current.x = e.clientX;
      drag.current.y = e.clientY;
      flight.current.yaw -= dx * 0.0032;
      flight.current.pitch = Math.max(-1.4, Math.min(1.4, flight.current.pitch - dy * 0.0032));
    };
    const onUp = () => { drag.current.on = false; };
    const onWheel = (e: WheelEvent) => {
      flight.current.speed = Math.max(4, Math.min(120, flight.current.speed * (e.deltaY < 0 ? 1.12 : 0.89)));
    };
    const onClick = (e: PointerEvent) => {
      if ((e.target as HTMLElement).closest("a,button,.syn-panel,.obs-dock")) return;
      const f = flight.current;
      const dir = fwdOf(f.yaw, f.pitch);
      pulses.current.push({ origin: add(f.pos, scale(dir, 26)), t0: time, strength: 1 });
      if (pulses.current.length > 4) pulses.current.shift();
    };
    const onKeyTouch = (e: TouchEvent) => {
      // single-finger drag handled by pointer events; two-finger tap toggles drift
      if (e.touches.length === 2) autoDrift.current = !autoDrift.current;
    };

    const tick = (now: number) => {
      if (disposed) return;
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      time += dt;
      timeRef.current = time;
      const f = flight.current;

      // warp tween
      if (warp.current) {
        const w = warp.current;
        const k = Math.max(0, Math.min(1, (time - w.t0) / w.dur));
        const e2 = easeInOut(k);
        f.pos = [
          w.from[0] + (w.to[0] - w.from[0]) * e2,
          w.from[1] + (w.to[1] - w.from[1]) * e2,
          w.from[2] + (w.to[2] - w.from[2]) * e2,
        ];
        f.yaw = w.fromYaw + (w.toYaw - w.fromYaw) * e2;
        f.pitch = w.fromPitch + (w.toPitch - w.fromPitch) * e2;
        warpRef.current?.setAttribute("data-on", k < 0.92 ? "true" : "false");
        if (k >= 1) warp.current = null;
      } else {
        warpRef.current?.setAttribute("data-on", "false");
        // flight controls
        const fwd = fwdOf(f.yaw, f.pitch);
        const right = norm(cross(fwd, v3(0, 1, 0)));
        const boost = keys.current.has("shift") ? 3.2 : 1;
        let ax = 0, ay = 0, az = 0;
        if (keys.current.has("w") || autoDrift.current) { ax += fwd[0]; ay += fwd[1]; az += fwd[2]; }
        if (keys.current.has("s")) { ax -= fwd[0]; ay -= fwd[1]; az -= fwd[2]; }
        if (keys.current.has("d")) { ax += right[0]; ay += right[1]; az += right[2]; }
        if (keys.current.has("a")) { ax -= right[0]; ay -= right[1]; az -= right[2]; }
        if (keys.current.has("e") || keys.current.has(" ")) ay += 1;
        if (keys.current.has("q")) ay -= 1;
        const al = Math.hypot(ax, ay, az);
        if (al > 0.001) {
          ax = (ax / al) * f.speed * boost;
          ay = (ay / al) * f.speed * boost;
          az = (az / al) * f.speed * boost;
        }
        // damped velocity
        const damp = Math.exp(-dt * 3.2);
        f.vel = [
          f.vel[0] * damp + ax * dt,
          f.vel[1] * damp + ay * dt,
          f.vel[2] * damp + az * dt,
        ];
        f.pos = [f.pos[0] + f.vel[0], f.pos[1] + f.vel[1], f.pos[2] + f.vel[2]];
        // keep inside the observatory sphere, outside the event horizon
        const r = Math.hypot(f.pos[0], f.pos[1], f.pos[2]);
        if (r > 230) {
          const s = 230 / r;
          f.pos = [f.pos[0] * s, f.pos[1] * s, f.pos[2] * s];
        } else if (r < 16 && r > 0.001) {
          const s = 16 / r;
          f.pos = [f.pos[0] * s, f.pos[1] * s, f.pos[2] * s];
        }
      }

      const fwd = fwdOf(f.yaw, f.pitch);
      const camPos = f.pos;
      const camTarget = add(camPos, fwd);
      cursor.point = add(camPos, scale(fwd, 26));
      cursor.active = drag.current.on;

      // nearest station (dynamic orbital positions)
      let near = 0;
      let nearD = Infinity;
      const dists: number[] = [];
      for (let i = 0; i < N; i++) {
        const dx = camPos[0] - at(sim.rotatedStops, i * 3);
        const dy = camPos[1] - at(sim.rotatedStops, i * 3 + 1);
        const dz = camPos[2] - at(sim.rotatedStops, i * 3 + 2);
        const d = Math.hypot(dx, dy, dz);
        dists.push(d);
        if (d < nearD) { nearD = d; near = i; }
      }
      if (near !== nearRef.current) {
        nearRef.current = near;
        setNearIdx(near);
      }
      const newActive = nearD < ACTIVATE_R ? near : -1;
      if (newActive !== activeRef.current) {
        activeRef.current = newActive;
        setActive(newActive);
      }

      // sim
      pulses.current = prunePulses(pulses.current, time);
      stepSim(scene, sim, dt, camPos, cursor, pulses.current);

      // project station labels to screen
      const w = window.innerWidth;
      const h = window.innerHeight;
      const proj = perspective(Math.PI * 0.42, w / h, 0.1, 500);
      const view = lookAt(camPos, camTarget, v3(0, 1, 0));
      const vp = mul(proj, view);
      for (let i = 0; i < N; i++) {
        const el = labelRefs.current[i];
        if (!el) continue;
        const sx0 = at(sim.rotatedStops, i * 3);
        const sy0 = at(sim.rotatedStops, i * 3 + 1);
        const sz0 = at(sim.rotatedStops, i * 3 + 2);
        const cx = at(vp, 0) * sx0 + at(vp, 4) * sy0 + at(vp, 8) * sz0 + at(vp, 12);
        const cy = at(vp, 1) * sx0 + at(vp, 5) * sy0 + at(vp, 9) * sz0 + at(vp, 13);
        const cw = at(vp, 3) * sx0 + at(vp, 7) * sy0 + at(vp, 11) * sz0 + at(vp, 15);
        if (cw <= 0.1) {
          el.style.opacity = "0";
          continue;
        }
        const sx = (cx / cw * 0.5 + 0.5) * w;
        const sy = (1 - (cy / cw * 0.5 + 0.5)) * h;
        const behind = Math.max(0, Math.min(1, (at(dists, i) - 40) / 160));
        el.style.opacity = String(0.9 - behind * 0.55);
        el.style.transform = `translate(-50%,-50%) translate(${sx.toFixed(1)}px, ${sy.toFixed(1)}px)`;
        el.querySelector<HTMLElement>(".obs-label-dist")!.textContent = `${Math.round(at(dists, i))}m`;
        el.dataset.near = String(i === near);
      }

      if (velReadoutRef.current) {
        velReadoutRef.current.textContent = `${Math.round(len(f.vel))} m/s · spd ${Math.round(f.speed)}`;
      }

      audioRef.current?.setVelocity(len(f.vel) / 40);

      const frame: FrameData = {
        sim,
        time,
        camPos,
        camTarget,
        pulse: pulses.current[pulses.current.length - 1] ?? null,
      };

      try {
        if (renderer) {
          renderer.resize();
          renderer.render(frame);
        } else if (renderer2) {
          renderer2.resize();
          renderer2.render(frame);
        }
      } catch (err) {
        console.warn("[obs] render error", err);
        renderer?.destroy();
        renderer = null;
      }

      raf = requestAnimationFrame(tick);
    };

    const boot = async () => {
      const c = canvasGPURef.current;
      if (c) renderer = await NeuralRendererGPU.create(c, scene, "sphere", blackhole);
      if (!renderer) {
        const c2 = canvas2DRef.current;
        if (c2) {
          renderer2 = new NeuralRenderer2D(c2, scene, "sphere");
          renderer2.resize();
          setMode("2d");
        }
      }
      last = performance.now();
      raf = requestAnimationFrame(tick);
      // cinematic intro: dive from high orbit down to the first station
      warpTo(0, blackhole ? 5.2 : 3.2);
    };
    boot();

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    window.addEventListener("pointerleave", onUp);
    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("pointerdown", onClick);
    window.addEventListener("touchstart", onKeyTouch, { passive: true });

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      renderer?.destroy();
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      window.removeEventListener("pointerleave", onUp);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("pointerdown", onClick);
      window.removeEventListener("touchstart", onKeyTouch);
    };
  }, [scene, warpTo, blackhole]);

  const toggleSignal = useCallback(async () => {
    audioRef.current ??= new SignalAudio();
    setSignalOn(await audioRef.current.toggle());
  }, []);

  const toggleLang = useCallback(() => setLocale(locale === "zh" ? "en" : "zh"), [locale, setLocale]);

  return (
    <div className="obs-root">
      <canvas ref={canvasGPURef} className="obs-canvas" style={{ display: mode === "gpu" ? "block" : "none" }} />
      <canvas ref={canvas2DRef} className="obs-canvas" style={{ display: mode === "2d" ? "block" : "none" }} />
      <div className="obs-warp" ref={warpRef} />
      <div className="obs-cross" />

      {/* 3D station labels */}
      {CLUSTERS.map((c, i) => (
        <div
          key={c.id}
          ref={el => { labelRefs.current[i] = el; }}
          className="obs-label"
          style={{ "--dot": rgb(c.color) } as React.CSSProperties}
          data-near={nearIdx === i}
        >
          <span className="obs-label-name">{c.index} {labels[i]}</span>
          <span className="obs-label-dist">—m</span>
          <i className="obs-label-dot" />
        </div>
      ))}

      <Overlay active={active} />

      {/* top HUD */}
      <div className="syn-hud-top">
        <button className="syn-hud-btn" onClick={() => warpTo(0)}>OBSERVATORY · MASONS.XU</button>
        <div className="flex items-center gap-2">
          <button className="syn-hud-btn" onClick={toggleLang}>{locale === "zh" ? "EN" : "中"}</button>
          <button className="syn-hud-btn" data-on={signalOn} onClick={toggleSignal}>
            {signalOn ? "◉ signal on" : "◎ signal off"}
          </button>
        </div>
      </div>

      {/* help */}
      <div className="obs-help">
        <b>drag</b> look · <b>wasd</b> fly · <b>q/e</b> down/up · <b>shift</b> boost<br />
        <b>wheel</b> speed · <b>1–9,0</b> warp · <b>click</b> pulse · <b>2-finger tap</b> drift
      </div>

      {/* velocity readout */}
      <div className="syn-hud-bottom">
        <span ref={velReadoutRef} className="tabular-nums">0 m/s</span>
        <span>{nearIdx >= 0 ? `nearest · ${labels[nearIdx]}` : "deep space"}</span>
      </div>

      {/* station dock */}
      <nav className="obs-dock" aria-label="stations">
        {CLUSTERS.map((c, i) => (
          <button
            key={c.id}
            className="obs-dock-chip"
            style={{ "--dot": rgb(c.color) } as React.CSSProperties}
            data-near={nearIdx === i}
            onClick={() => warpTo(i)}
          >
            <i />
            {c.index} {labels[i]}
          </button>
        ))}
      </nav>

      {mode === "2d" && <div className="syn-badge">webgpu unavailable — canvas2d fallback active</div>}

      <noscript>{t.hero.tagline}</noscript>
    </div>
  );
}
