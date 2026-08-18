import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "../../i18n";
import { buildScene, cameraAt, type SceneGraph } from "../../v2/scene";
import { initSim, prunePulses, stepSim, type CursorField, type Pulse, type SimParams } from "../../v2/sim";
import { NeuralRendererGPU, type FrameData } from "../../v2/rendererGPU";
import { NeuralRenderer2D } from "../../v2/renderer2d";
import { SignalAudio } from "../../v2/audio";
import { add, cross, norm, scale, sub, v3, type Vec3 } from "../../v2/math";
import { CLUSTERS } from "./clusters";
import { Overlay } from "./Overlay";

const SECTIONS = CLUSTERS.length; // 10
const SECTION_VH = 130; // scroll per section
const rgb = (c: [number, number, number]) =>
  `rgb(${Math.round(c[0] * 255)},${Math.round(c[1] * 255)},${Math.round(c[2] * 255)})`;

const RAIL_LABELS_ZH = ["核心", "身份", "分布式平台", "数据湖", "表单引擎", "微服务模板", "能力矩阵", "成长轨迹", "开源贡献", "连接"];
const RAIL_LABELS_EN = ["core", "identity", "platform", "datalake", "form-engine", "template", "capability", "trajectory", "oss", "connect"];

export function NeuralApp() {
  const { t, locale, setLocale } = useTranslation();
  const scene: SceneGraph = useMemo(() => buildScene(CLUSTERS), []);

  const canvasGPURef = useRef<HTMLCanvasElement>(null);
  const canvas2DRef = useRef<HTMLCanvasElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const coordRef = useRef<HTMLSpanElement>(null);
  const veilRef = useRef<HTMLDivElement>(null);

  const scrollRef = useRef(0);
  const mouseRef = useRef({ x: 0, y: 0, active: false });
  const pulsesRef = useRef<Pulse[]>([]);
  const camPosRef = useRef<Vec3>([0, 0, 10]);
  const scrollVelRef = useRef(0);

  const [active, setActive] = useState(0);
  const [mode, setMode] = useState<"gpu" | "2d" | "boot">("boot");
  const [signalOn, setSignalOn] = useState(false);
  const audioRef = useRef<SignalAudio | null>(null);
  const activeRef = useRef(0);

  const scrollToSection = useCallback((i: number) => {
    const doc = document.documentElement;
    const max = doc.scrollHeight - window.innerHeight;
    const target = (i / (SECTIONS - 1)) * max;
    window.scrollTo({ top: target, behavior: "smooth" });
  }, []);

  useEffect(() => {
    let raf = 0;
    let disposed = false;
    let renderer: NeuralRendererGPU | null = null;
    let renderer2: NeuralRenderer2D | null = null;
    const sim: SimParams = initSim(scene);
    const cursor: CursorField = { point: [0, 0, 0], active: false };
    let time = 0;
    let last = performance.now();
    let veilHidden = false;
    let lastScroll = window.scrollY;

    const tick = (now: number) => {
      if (disposed) return;
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      time += dt;

      // scroll progress + velocity
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      scrollRef.current = p;
      scrollVelRef.current = Math.abs(window.scrollY - lastScroll) / Math.max(dt, 0.001);
      lastScroll = window.scrollY;

      if (progressRef.current) {
        progressRef.current.style.transform = `scaleX(${p})`;
      }

      // camera along spine + mouse parallax
      const cam = cameraAt(scene, p);
      const ahead = cameraAt(scene, Math.min(1, p + 0.035));
      const parallax = 4.5;
      const camPos: Vec3 = [
        cam[0] + mouseRef.current.x * parallax,
        cam[1] - mouseRef.current.y * parallax * 0.6,
        cam[2],
      ];
      camPosRef.current = camPos;
      let target: Vec3 = [ahead[0] + mouseRef.current.x * 6, ahead[1] - mouseRef.current.y * 4, ahead[2]];
      if (Math.hypot(target[0] - camPos[0], target[1] - camPos[1], target[2] - camPos[2]) < 0.5) {
        // at path end: extrapolate along the final segment
        const n = scene.stops.length;
        const lastStop = scene.stops[n - 1] ?? [0, 0, 0] as Vec3;
        const prevStop = scene.stops[n - 2] ?? lastStop;
        const dirEnd = norm(sub(lastStop, prevStop));
        target = add(camPos, scale(dirEnd, 12));
      }

      // cursor world point: project mouse to a plane 26 units ahead
      const fwd = norm(sub(target, camPos));
      const right = norm(cross(fwd, v3(0, 1, 0)));
      const up = cross(right, fwd);
      const tanF = Math.tan(Math.PI * 0.21);
      const aspect = window.innerWidth / Math.max(1, window.innerHeight);
      const dir = norm(
        add(add(fwd, scale(right, mouseRef.current.x * tanF * aspect)), scale(up, mouseRef.current.y * tanF)),
      );
      cursor.point = add(camPos, scale(dir, 26));
      cursor.active = mouseRef.current.active;

      // sim + render
      pulsesRef.current = prunePulses(pulsesRef.current, time);
      stepSim(scene, sim, dt, camPos, cursor, pulsesRef.current);

      const frame: FrameData = {
        sim,
        time,
        camPos,
        camTarget: target,
        pulse: pulsesRef.current[pulsesRef.current.length - 1] ?? null,
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
        console.warn("[neural] render error, stopping GPU path", err);
        renderer?.destroy();
        renderer = null;
      }

      // active cluster index
      const idx = Math.round(p * (SECTIONS - 1));
      if (idx !== activeRef.current) {
        activeRef.current = idx;
        setActive(idx);
      }
      if (coordRef.current) {
        coordRef.current.textContent = `X${camPos[0].toFixed(1)} Y${camPos[1].toFixed(1)} Z${camPos[2].toFixed(1)}`;
      }

      audioRef.current?.setVelocity(scrollVelRef.current / 4000);

      if (!veilHidden) {
        veilHidden = true;
        requestAnimationFrame(() => {
          veilRef.current?.setAttribute("data-hidden", "true");
          setTimeout(() => veilRef.current?.remove(), 1000);
        });
      }

      raf = requestAnimationFrame(tick);
    };

    const onMove = (e: PointerEvent) => {
      mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = (e.clientY / window.innerHeight) * 2 - 1;
      mouseRef.current.active = true;
    };
    const onLeave = () => {
      mouseRef.current.active = false;
      mouseRef.current.x = 0;
      mouseRef.current.y = 0;
    };
    const onClick = (e: PointerEvent) => {
      if ((e.target as HTMLElement).closest("a,button,.syn-panel")) return;
      pulsesRef.current.push({
        origin: cursor.point,
        t0: time,
        strength: 1,
      });
      if (pulsesRef.current.length > 4) pulsesRef.current.shift();
    };

    const boot = async () => {
      const canvasGPU = canvasGPURef.current;
      if (canvasGPU) {
        renderer = await NeuralRendererGPU.create(canvasGPU, scene);
      }
      if (renderer) {
        setMode("gpu");
      } else {
        const canvas2 = canvas2DRef.current;
        if (canvas2) {
          renderer2 = new NeuralRenderer2D(canvas2, scene);
          renderer2.resize();
          setMode("2d");
        }
      }
      last = performance.now();
      raf = requestAnimationFrame(tick);
    };
    boot();

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerleave", onLeave);
    window.addEventListener("pointerdown", onClick);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      renderer?.destroy();
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("pointerdown", onClick);
    };
  }, [scene]);

  const toggleSignal = useCallback(async () => {
    audioRef.current ??= new SignalAudio();
    const on = await audioRef.current.toggle();
    setSignalOn(on);
  }, []);

  const toggleLang = useCallback(() => {
    setLocale(locale === "zh" ? "en" : "zh");
  }, [locale, setLocale]);

  const railLabels = locale === "zh" ? RAIL_LABELS_ZH : RAIL_LABELS_EN;

  return (
    <div className="syn-root">
      <canvas ref={canvasGPURef} className="syn-canvas" style={{ display: mode === "gpu" ? "block" : "none" }} />
      <canvas ref={canvas2DRef} className="syn-canvas" style={{ display: mode === "2d" ? "block" : "none" }} />

      {/* scroll driver */}
      <div className="syn-scroll" style={{ height: `${SECTIONS * SECTION_VH}vh` }} aria-hidden />

      <Overlay active={active} />

      {/* top HUD */}
      <div className="syn-hud-top">
        <button
          className="syn-hud-btn"
          onClick={() => scrollToSection(0)}
          title="home"
        >
          SYNAPSE · MASONS.XU
        </button>
        <div className="flex items-center gap-2">
          <button className="syn-hud-btn" onClick={toggleLang}>{locale === "zh" ? "EN" : "中"}</button>
          <button className="syn-hud-btn" data-on={signalOn} onClick={toggleSignal}>
            {signalOn ? "◉ signal on" : "◎ signal off"}
          </button>
        </div>
      </div>

      {/* progress line */}
      <div className="syn-progress-line" ref={progressRef} style={{ width: "100%", transform: "scaleX(0)" }} />

      {/* right rail */}
      <nav className="syn-rail" aria-label="sections">
        {CLUSTERS.map((c, i) => (
          <button
            key={c.id}
            className="syn-rail-dot"
            data-active={active === i}
            style={{ "--dot": rgb(c.color) } as React.CSSProperties}
            onClick={() => scrollToSection(i)}
            aria-label={c.label}
          >
            <i />
            <span className="syn-rail-tip">
              {c.index} {railLabels[i]}
            </span>
          </button>
        ))}
      </nav>

      {/* bottom HUD */}
      <div className="syn-hud-bottom">
        <span ref={coordRef} className="tabular-nums">X0.0 Y0.0 Z0.0</span>
        <span>
          {String(active + 1).padStart(2, "0")} / {SECTIONS} · {CLUSTERS[active]?.label ?? "—"}
        </span>
      </div>

      {mode === "2d" && <div className="syn-badge">webgpu unavailable — canvas2d fallback active</div>}

      {/* boot veil */}
      <div className="syn-veil" ref={veilRef}>
        <div className="syn-veil-inner">
          <div className="syn-veil-logo">SYNAPSE</div>
          <div className="syn-veil-bar"><i /></div>
          <div className="text-[10px] tracking-[0.3em] uppercase">growing neural pathways…</div>
        </div>
      </div>

      <noscript>{t.hero.tagline}</noscript>
    </div>
  );
}
