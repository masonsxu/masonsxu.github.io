/**
 * ============================================================================
 *  roomEngine.ts —— 「我记忆的旧房间」第一人称步行模拟引擎
 * ============================================================================
 *
 *  本文件封装所有 Three.js 逻辑，对外暴露一个 createMemoryRoom() 工厂，
 *  返回一个 controller 句柄供 React 调用。引擎与 React 之间通过回调通信，
 *  所有「游戏化逻辑」都用【★游戏逻辑】注释标出，便于检索：
 *
 *    ★游戏逻辑 - 收集系统    : 记忆碎片的生成、靠近自动拾取
 *    ★游戏逻辑 - 物件交互    : 准星射线检测、镜头拉近聚焦
 *    ★游戏逻辑 - 结局触发    : 收集 + 浏览齐全 → 开门 → 走近门触发结束语
 *    ★游戏逻辑 - 漫游控制    : 桌面端指针锁定 / 移动端虚拟摇杆、头部晃动、脚步声
 *
 *  内容全部来自 src/data/room-content.ts（其又来自 website-content.md）。
 *  THREE 由 loadThree() 从 CDN 注入，这里以 any 接收。
 * ============================================================================
 */

import {
  exhibits,
  paintings as paintingData,
  memoryShards,
  requiredExhibitIds,
} from "../../data/room-content";
import { loadAddon } from "./loadThree";

/* ------------------------------ 对外类型 ------------------------------ */

export interface RoomCallbacks {
  /** 引擎就绪（场景已构建、首帧已渲染） */
  onReady?: () => void;
  /** ★收集系统：拾取到一枚记忆碎片 */
  onShardCollected?: (shardId: string, collected: number, total: number) => void;
  /** ★物件交互：聚焦某个展品（id 为 null 表示退出聚焦回到漫游） */
  onFocusChange?: (focus: { kind: string; id: string } | null) => void;
  /** 准星指向的可交互物件变化（用于显示「点击查看」提示） */
  onHoverChange?: (hover: { kind: string; id: string; label: string } | null) => void;
  /** 窗户「白日梦」切换到第 index 个愿景 */
  onVisionChange?: (index: number) => void;
  /** ★结局触发：所有碎片 + 核心展品齐全，门开了 */
  onEndingReady?: () => void;
  /** ★结局触发：玩家走到门口，进入结束语 */
  onEndingReached?: () => void;
  /** 指针锁定状态变化（桌面端：true=漫游中，false=暂停/聚焦） */
  onPointerLockChange?: (locked: boolean) => void;
}

export interface RoomOptions {
  container: HTMLElement;
  THREE: any;
  isMobile: boolean;
  callbacks: RoomCallbacks;
}

/* ===========================================================================
 *  程序化纹理（不加载任何外部纹理文件，全部用 Canvas 现场生成）
 *  —— 风格：纯色 + 噪点，保留手工感
 * =========================================================================== */

/** 通用噪点叠加 */
function addNoise(ctx: CanvasRenderingContext2D, w: number, h: number, amount: number, alpha: number) {
  const img = ctx.getImageData(0, 0, w, h);
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    const n = (Math.random() - 0.5) * amount;
    d[i] += n;
    d[i + 1] += n;
    d[i + 2] += n;
    d[i + 3] = d[i + 3] * alpha + 255 * (1 - alpha);
  }
  ctx.putImageData(img, 0, 0);
}

/** 木地板纹理：暖木色 + 丰富木纹 + 拼板缝 + 木节 */
function makeWoodTexture(THREE: any): any {
  const S = 1024;
  const c = document.createElement("canvas");
  c.width = c.height = S;
  const ctx = c.getContext("2d")!;
  // 基底渐变
  const base = ctx.createLinearGradient(0, 0, 0, S);
  base.addColorStop(0, "#a07348");
  base.addColorStop(0.5, "#9c6b3f");
  base.addColorStop(1, "#8e5e36");
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, S, S);
  // 主木纹条（更密更自然）
  for (let i = 0; i < 500; i++) {
    const y = Math.random() * S;
    const dark = Math.random() > 0.5;
    const r = dark ? 70 + Math.random() * 40 : 120 + Math.random() * 50;
    const g = dark ? 40 + Math.random() * 30 : 70 + Math.random() * 35;
    const b = dark ? 18 + Math.random() * 18 : 30 + Math.random() * 25;
    ctx.strokeStyle = `rgba(${r},${g},${b},${0.04 + Math.random() * 0.12})`;
    ctx.lineWidth = 0.3 + Math.random() * 2.5;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.bezierCurveTo(S * 0.33, y + (Math.random() - 0.5) * 12, S * 0.66, y + (Math.random() - 0.5) * 12, S, y);
    ctx.stroke();
  }
  // 木节（偶尔出现）
  for (let i = 0; i < 6; i++) {
    const kx = Math.random() * S;
    const ky = Math.random() * S;
    const kr = 6 + Math.random() * 14;
    const kg = ctx.createRadialGradient(kx, ky, 0, kx, ky, kr);
    kg.addColorStop(0, "rgba(60,35,18,0.4)");
    kg.addColorStop(0.6, "rgba(80,50,25,0.2)");
    kg.addColorStop(1, "rgba(80,50,25,0)");
    ctx.fillStyle = kg;
    ctx.beginPath();
    ctx.ellipse(kx, ky, kr, kr * 0.7, Math.random() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }
  // 拼板缝（每 ~170px 一道）
  ctx.strokeStyle = "rgba(30,16,8,0.55)";
  ctx.lineWidth = 2.5;
  for (let y = 0; y <= S; y += 170) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(S, y);
    ctx.stroke();
  }
  // 板间微妙色差
  for (let y = 0; y < S; y += 170) {
    if (Math.random() > 0.4) {
      ctx.fillStyle = `rgba(${Math.random() > 0.5 ? 180 : 100},${80 + Math.random() * 40},${30 + Math.random() * 20},0.04)`;
      ctx.fillRect(0, y + 3, S, 164);
    }
  }
  addNoise(ctx, S, S, 22, 0.92);
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(4, 5);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

/** 墙面纹理：米色灰泥 + 纹理感 + 柔和污渍 */
function makeWallTexture(THREE: any): any {
  const S = 512;
  const c = document.createElement("canvas");
  c.width = c.height = S;
  const ctx = c.getContext("2d")!;
  // 基底：微妙的暖色渐变
  const base = ctx.createLinearGradient(0, 0, 0, S);
  base.addColorStop(0, "#ddd0ba");
  base.addColorStop(1, "#d5c5a8");
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, S, S);
  // 柔和污渍与色斑
  for (let i = 0; i < 50; i++) {
    const x = Math.random() * S;
    const y = Math.random() * S;
    const r = 15 + Math.random() * 80;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    const tone = Math.random();
    if (tone < 0.4) {
      g.addColorStop(0, "rgba(180,160,130,0.12)");
    } else if (tone < 0.7) {
      g.addColorStop(0, "rgba(200,180,150,0.08)");
    } else {
      g.addColorStop(0, "rgba(160,140,110,0.10)");
    }
    g.addColorStop(1, "rgba(180,160,130,0)");
    ctx.fillStyle = g;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }
  // 细腻的刷痕
  for (let i = 0; i < 80; i++) {
    const x1 = Math.random() * S;
    const y1 = Math.random() * S;
    ctx.strokeStyle = `rgba(${160 + Math.random() * 40},${140 + Math.random() * 40},${110 + Math.random() * 40},${0.02 + Math.random() * 0.04})`;
    ctx.lineWidth = 1 + Math.random() * 3;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x1 + (Math.random() - 0.5) * 120, y1 + (Math.random() - 0.5) * 30);
    ctx.stroke();
  }
  addNoise(ctx, S, S, 12, 0.94);
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** 地毯纹理：波斯风格同心纹样，多层装饰 */
function makeRugTexture(THREE: any): any {
  const S = 512;
  const c = document.createElement("canvas");
  c.width = c.height = S;
  const ctx = c.getContext("2d")!;
  // 底色：深红
  ctx.fillStyle = "#8b2e25";
  ctx.fillRect(0, 0, S, S);
  const cx = S / 2, cy = S / 2;
  // 最外层金边
  ctx.strokeStyle = "rgba(240,200,140,0.6)";
  ctx.lineWidth = 6;
  ctx.strokeRect(10, 10, S - 20, S - 20);
  // 外层暗色带
  ctx.fillStyle = "rgba(60,25,18,0.5)";
  ctx.fillRect(20, 20, S - 40, S - 40);
  // 次外层金边
  ctx.strokeStyle = "rgba(240,200,140,0.45)";
  ctx.lineWidth = 3;
  ctx.strokeRect(28, 28, S - 56, S - 56);
  // 内层暖红底
  ctx.fillStyle = "#a23c33";
  ctx.fillRect(36, 36, S - 72, S - 72);
  // 四角装饰花
  const cornerR = 40;
  [[44, 44], [S - 44, 44], [44, S - 44], [S - 44, S - 44]].forEach(([px, py]) => {
    ctx.save();
    ctx.translate(px, py);
    ctx.strokeStyle = "rgba(240,200,140,0.4)";
    ctx.lineWidth = 2;
    for (let a = 0; a < 8; a++) {
      ctx.beginPath();
      ctx.moveTo(0, 0);
      const angle = (a / 8) * Math.PI * 2;
      ctx.lineTo(Math.cos(angle) * cornerR, Math.sin(angle) * cornerR);
      ctx.stroke();
    }
    ctx.restore();
  });
  // 中央大菱形
  ctx.strokeStyle = "rgba(240,200,140,0.55)";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(cx, cy - 120);
  ctx.lineTo(cx + 120, cy);
  ctx.lineTo(cx, cy + 120);
  ctx.lineTo(cx - 120, cy);
  ctx.closePath();
  ctx.stroke();
  // 菱形内层
  ctx.strokeStyle = "rgba(200,160,100,0.35)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx, cy - 85);
  ctx.lineTo(cx + 85, cy);
  ctx.lineTo(cx, cy + 85);
  ctx.lineTo(cx - 85, cy);
  ctx.closePath();
  ctx.stroke();
  // 中央圆
  ctx.strokeStyle = "rgba(240,200,140,0.5)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(cx, cy, 42, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx, cy, 22, 0, Math.PI * 2);
  ctx.stroke();
  // 边缘细密锯齿纹
  ctx.strokeStyle = "rgba(240,200,140,0.25)";
  ctx.lineWidth = 1;
  for (let x = 30; x < S - 30; x += 8) {
    ctx.beginPath();
    ctx.moveTo(x, 22);
    ctx.lineTo(x + 4, 28);
    ctx.lineTo(x + 8, 22);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, S - 22);
    ctx.lineTo(x + 4, S - 28);
    ctx.lineTo(x + 8, S - 22);
    ctx.stroke();
  }
  for (let y = 30; y < S - 30; y += 8) {
    ctx.beginPath();
    ctx.moveTo(22, y);
    ctx.lineTo(28, y + 4);
    ctx.lineTo(22, y + 8);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(S - 22, y);
    ctx.lineTo(S - 28, y + 4);
    ctx.lineTo(S - 22, y + 8);
    ctx.stroke();
  }
  addNoise(ctx, S, S, 20, 0.88);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** 柔和径向光点 sprite（碎片光晕 / 尘埃 / 灯光） */
function makeGlowTexture(THREE: any, inner = "rgba(255,240,200,1)", outer = "rgba(255,210,140,0)"): any {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, inner);
  g.addColorStop(0.35, inner.replace("1)", "0.6)"));
  g.addColorStop(1, outer);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** 窗外天空渐变纹理（三段色，自上而下）—— 用于「白日梦」换天 */
function makeSkyTexture(THREE: any, colors: [string, string, string]): any {
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 512;
  const ctx = c.getContext("2d")!;
  const g = ctx.createLinearGradient(0, 0, 0, 512);
  g.addColorStop(0, colors[0]);
  g.addColorStop(0.55, colors[1]);
  g.addColorStop(1, colors[2]);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 256, 512);
  // 柔和云彩
  for (let i = 0; i < 8; i++) {
    const cx = Math.random() * 256;
    const cy = 60 + Math.random() * 180;
    const cr = 20 + Math.random() * 50;
    const cg = ctx.createRadialGradient(cx, cy, 0, cx, cy, cr);
    cg.addColorStop(0, "rgba(255,255,255,0.12)");
    cg.addColorStop(0.6, "rgba(255,255,255,0.04)");
    cg.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = cg;
    ctx.fillRect(cx - cr, cy - cr, cr * 2, cr * 2);
  }
  // 太阳光晕
  const sun = ctx.createRadialGradient(160, 120, 0, 160, 120, 100);
  sun.addColorStop(0, "rgba(255,250,230,0.85)");
  sun.addColorStop(0.3, "rgba(255,245,220,0.4)");
  sun.addColorStop(1, "rgba(255,250,230,0)");
  ctx.fillStyle = sun;
  ctx.fillRect(0, 0, 256, 350);
  // 远处山影（多层）
  ctx.fillStyle = "rgba(50,45,60,0.20)";
  ctx.beginPath();
  ctx.moveTo(0, 380);
  ctx.lineTo(30, 340);
  ctx.lineTo(70, 360);
  ctx.lineTo(110, 330);
  ctx.lineTo(150, 355);
  ctx.lineTo(200, 325);
  ctx.lineTo(256, 350);
  ctx.lineTo(256, 512);
  ctx.lineTo(0, 512);
  ctx.closePath();
  ctx.fill();
  // 近处山影
  ctx.fillStyle = "rgba(40,40,55,0.35)";
  ctx.beginPath();
  ctx.moveTo(0, 420);
  ctx.lineTo(40, 380);
  ctx.lineTo(80, 400);
  ctx.lineTo(130, 370);
  ctx.lineTo(180, 395);
  ctx.lineTo(220, 375);
  ctx.lineTo(256, 405);
  ctx.lineTo(256, 512);
  ctx.lineTo(0, 512);
  ctx.closePath();
  ctx.fill();
  // 树木轮廓
  ctx.fillStyle = "rgba(30,35,25,0.45)";
  ctx.beginPath();
  ctx.moveTo(0, 440);
  for (let x = 0; x < 256; x += 12) {
    const h = 8 + Math.random() * 25;
    ctx.lineTo(x, 440 - h);
    ctx.lineTo(x + 6, 440 - h + 5);
  }
  ctx.lineTo(256, 450);
  ctx.lineTo(256, 512);
  ctx.lineTo(0, 512);
  ctx.closePath();
  ctx.fill();
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/* ===========================================================================
 *  程序化音频（脚步声 / 环境氛围）—— 不使用任何外部音频文件
 *  ★游戏逻辑 - 漫游控制：脚步声、可静音
 * =========================================================================== */

function createAudio() {
  let ctx: AudioContext | null = null;
  let master: GainNode | null = null;
  let ambientGain: GainNode | null = null;
  let noiseBuffer: AudioBuffer | null = null;
  let muted = false;
  let started = false;

  function ensure() {
    if (ctx) return;
    const AC = (window.AudioContext || (window as any).webkitAudioContext) as typeof AudioContext;
    if (!AC) return;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = muted ? 0 : 0.9;
    master.connect(ctx.destination);
    // 预生成白噪声 buffer（脚步声用）
    const len = ctx.sampleRate * 0.4;
    noiseBuffer = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
  }

  /** 启动低沉的环境氛围垫（首个用户手势后调用） */
  function startAmbient() {
    ensure();
    if (!ctx || !master || started) return;
    started = true;
    ambientGain = ctx.createGain();
    ambientGain.gain.value = 0.05;
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 420;
    ambientGain.connect(lp);
    lp.connect(master);
    // 三个低频振荡，营造温暖的房间「空气感」
    [55, 82.5, 110].forEach((f, i) => {
      const osc = ctx!.createOscillator();
      osc.type = i === 2 ? "triangle" : "sine";
      osc.frequency.value = f;
      const g = ctx!.createGain();
      g.gain.value = 0.5 / (i + 1);
      osc.connect(g);
      g.connect(ambientGain!);
      osc.start();
      // 缓慢的「呼吸」LFO
      const lfo = ctx!.createOscillator();
      lfo.frequency.value = 0.05 + i * 0.02;
      const lfoGain = ctx!.createGain();
      lfoGain.gain.value = 0.18;
      lfo.connect(lfoGain);
      lfoGain.connect(g.gain);
      lfo.start();
    });
  }

  /** 单次脚步：噪声脉冲过带通滤波 + 快速衰减 */
  function step() {
    ensure();
    if (!ctx || !master || !noiseBuffer || muted) return;
    if (ctx.state === "suspended") ctx.resume();
    const src = ctx.createBufferSource();
    src.buffer = noiseBuffer;
    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = 380 + Math.random() * 260;
    bp.Q.value = 0.8;
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 1400;
    const g = ctx.createGain();
    const t = ctx.currentTime;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.22 + Math.random() * 0.06, t + 0.006);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);
    src.connect(bp);
    bp.connect(lp);
    lp.connect(g);
    g.connect(master);
    src.start(t);
    src.stop(t + 0.2);
  }

  /** 拾取碎片的清脆音（正弦上滑） */
  function chime() {
    ensure();
    if (!ctx || !master || muted) return;
    if (ctx.state === "suspended") ctx.resume();
    const t = ctx.currentTime;
    [880, 1320].forEach((f, i) => {
      const osc = ctx!.createOscillator();
      osc.type = "sine";
      osc.frequency.setValueAtTime(f, t);
      osc.frequency.exponentialRampToValueAtTime(f * 1.5, t + 0.18);
      const g = ctx!.createGain();
      g.gain.setValueAtTime(0.0001, t + i * 0.04);
      g.gain.exponentialRampToValueAtTime(0.12, t + i * 0.04 + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + i * 0.04 + 0.5);
      osc.connect(g);
      g.connect(master!);
      osc.start(t + i * 0.04);
      osc.stop(t + i * 0.04 + 0.6);
    });
  }

  return {
    resume() {
      ensure();
      if (ctx && ctx.state === "suspended") ctx.resume();
      startAmbient();
    },
    step,
    chime,
    setMuted(m: boolean) {
      muted = m;
      if (master && ctx) master.gain.setTargetAtTime(m ? 0 : 0.9, ctx.currentTime, 0.05);
    },
    isMuted: () => muted,
  };
}

/* ===========================================================================
 *  房间尺寸常量（单位：米）—— 控制多边形预算与移动边界
 * =========================================================================== */
const ROOM = { halfX: 4, halfZ: 5, height: 3.2 };
const EYE = 1.62; // 视点高度
const PLAYER_R = 0.34; // 玩家碰撞半径
const SHARD_PICK_R = 1.15; // ★收集系统：拾取触发半径
const DOOR_REACH = 1.6; // ★结局触发：走到门口的判定半径

/* ===========================================================================
 *  主工厂：创建一间可漫游的旧房间
 * =========================================================================== */
export function createMemoryRoom(opts: RoomOptions) {
  const { container, THREE, isMobile, callbacks } = opts;
  const V3 = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);

  /* ---------------- 渲染器 / 场景 / 相机 ---------------- */
  const renderer = new THREE.WebGLRenderer({
    antialias: !isMobile,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2));
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.domElement.style.display = "block";
  renderer.domElement.style.touchAction = "none";
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color("#e9c79a");
  scene.fog = new THREE.FogExp2("#e7c193", 0.018); // 降低雾密度，让远处更清晰

  const camera = new THREE.PerspectiveCamera(
    72,
    container.clientWidth / container.clientHeight,
    0.05,
    120,
  );
  // 出生点：门口，面朝房间深处（默认相机看向 -Z）
  camera.position.set(0, EYE, 4.2);

  /* ---------------- 灯光（暖金色「日落时刻」，丰富层次）---------------- */
  // 半球光：天空暖、地面反射
  const hemi = new THREE.HemisphereLight(0xffe7c4, 0x4a3826, 0.6);
  scene.add(hemi);
  // 环境补光，避免死黑
  const ambient = new THREE.AmbientLight(0xffd9a8, 0.3);
  scene.add(ambient);
  // 主光：从窗户斜射进来的「太阳」，投射柔和阴影
  const sun = new THREE.DirectionalLight(0xffcf8f, 2.6);
  sun.position.set(2.2, 5.2, -8.5);
  sun.target.position.set(-0.4, 0.6, -2);
  sun.castShadow = true;
  sun.shadow.mapSize.set(isMobile ? 1024 : 2048, isMobile ? 1024 : 2048);
  sun.shadow.camera.near = 0.5;
  sun.shadow.camera.far = 22;
  sun.shadow.camera.left = -6;
  sun.shadow.camera.right = 6;
  sun.shadow.camera.top = 6;
  sun.shadow.camera.bottom = -6;
  sun.shadow.bias = -0.0006;
  sun.shadow.normalBias = 0.02;
  scene.add(sun);
  scene.add(sun.target);

  // 补充暖光：模拟地板漫反射的暖色
  const floorBounce = new THREE.PointLight(0xffc870, 0.6, 12, 2);
  floorBounce.position.set(0, 0.3, -2);
  scene.add(floorBounce);

  // 窗户射入的散射暖光
  const windowFill = new THREE.SpotLight(0xffe4b5, 1.2, 16, Math.PI / 3.5, 0.6, 1.5);
  windowFill.position.set(0, 2.8, -ROOM.halfZ + 0.5);
  windowFill.target.position.set(0, 0, 0);
  windowFill.castShadow = false;
  scene.add(windowFill);
  scene.add(windowFill.target);

  /* ---------------- 材质 ---------------- */
  const woodTex = makeWoodTexture(THREE);
  const wallTex = makeWallTexture(THREE);
  const floorMat = new THREE.MeshStandardMaterial({ map: woodTex, roughness: 0.82, metalness: 0.02 });
  const wallMat = new THREE.MeshStandardMaterial({ map: wallTex, roughness: 0.95, metalness: 0 });
  const ceilMat = new THREE.MeshStandardMaterial({ color: 0xeaddc4, roughness: 1 });
  // 天花板纹理（淡淡的石膏质感）
  const ceilTex = (() => {
    const c = document.createElement("canvas");
    c.width = c.height = 256;
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = "#eaddc4";
    ctx.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 15; i++) {
      const x = Math.random() * 256, y = Math.random() * 256, r = 20 + Math.random() * 50;
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, "rgba(220,210,190,0.08)");
      g.addColorStop(1, "rgba(220,210,190,0)");
      ctx.fillStyle = g;
      ctx.fillRect(x - r, y - r, r * 2, r * 2);
    }
    addNoise(ctx, 256, 256, 8, 0.96);
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  })();
  const ceilMatTextured = new THREE.MeshStandardMaterial({ map: ceilTex, roughness: 1 });
  const woodDark = new THREE.MeshStandardMaterial({ color: 0x5f3d24, roughness: 0.65, metalness: 0.02 });
  const woodMid = new THREE.MeshStandardMaterial({ color: 0x8a5a33, roughness: 0.7, metalness: 0.02 });
  const woodLight = new THREE.MeshStandardMaterial({ color: 0xb07d4a, roughness: 0.75, metalness: 0.02 });
  // 金属材质（门把手等）
  const metalBrass = new THREE.MeshStandardMaterial({ color: 0xd9b25a, metalness: 0.85, roughness: 0.25 });

  /** 通用盒体辅助 */
  function addBox(
    w: number, h: number, d: number, mat: any,
    x: number, y: number, z: number,
    parent: any = scene, cast = true, receive = true,
  ) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    m.position.set(x, y, z);
    m.castShadow = cast;
    m.receiveShadow = receive;
    parent.add(m);
    return m;
  }

  /* 可交互物件登记表（★物件交互：射线检测的目标） */
  interface Interactable {
    root: any; kind: "exhibit" | "painting" | "window";
    id: string; label: string;
    focusPos: any; focusLook: any;
    viewed: boolean; baseScale: number;
  }
  const interactables: Interactable[] = [];
  function registerInteractable(
    root: any, kind: Interactable["kind"], id: string, label: string,
    focusPos: any, focusLook: any,
  ) {
    root.traverse((o: any) => { if (o.isMesh) o.userData.interactId = id; });
    root.userData.interactId = id;
    interactables.push({ root, kind, id, label, focusPos, focusLook, viewed: false, baseScale: 1 });
  }

  /* =========================================================================
   *  构建房间外壳：地板 / 天花板 / 四面墙（远墙留窗洞）/ 踢脚线 / 门
   * ======================================================================= */
  function buildShell() {
    const { halfX, halfZ, height } = ROOM;
    // 地板
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(halfX * 2, halfZ * 2), floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);
    // 天花板（带纹理）
    const ceil = new THREE.Mesh(new THREE.PlaneGeometry(halfX * 2, halfZ * 2), ceilMatTextured);
    ceil.rotation.x = Math.PI / 2;
    ceil.position.y = height;
    scene.add(ceil);
    // 左右墙
    addBox(0.15, height, halfZ * 2, wallMat, -halfX, height / 2, 0, scene, false, true);
    addBox(0.15, height, halfZ * 2, wallMat, halfX, height / 2, 0, scene, false, true);
    // 近墙（门所在，z=+halfZ）—— 中央留门洞 (宽1.2 高2.15)
    const doorW = 1.2, doorH = 2.15;
    addBox(halfX * 2, height, 0.15, wallMat, 0, height / 2, halfZ, scene, false, true); // 先整面
    // 远墙（窗户所在，z=-halfZ）—— 四条边框出窗洞
    const winL = -1.35, winR = 1.35, winB = 1.0, winT = 2.4;
    addBox(halfX * 2, winB, 0.15, wallMat, 0, winB / 2, -halfZ, scene, false, true); // 窗下
    addBox(halfX * 2, height - winT, 0.15, wallMat, 0, (winT + height) / 2, -halfZ, scene, false, true); // 窗上
    addBox(halfX - winR, winT - winB, 0.15, wallMat, (winR + halfX) / 2, (winB + winT) / 2, -halfZ, scene, false, true); // 窗右
    addBox(halfX + winL, winT - winB, 0.15, wallMat, (winL - halfX) / 2, (winB + winT) / 2, -halfZ, scene, false, true); // 窗左
    // 踢脚线
    const baseMat = woodDark;
    addBox(halfX * 2, 0.12, 0.04, baseMat, 0, 0.06, halfZ - 0.07, scene, false, true);
    addBox(halfX * 2, 0.12, 0.04, baseMat, 0, 0.06, -halfZ + 0.07, scene, false, true);
    addBox(0.04, 0.12, halfZ * 2, baseMat, -halfX + 0.07, 0.06, 0, scene, false, true);
    addBox(0.04, 0.12, halfZ * 2, baseMat, halfX - 0.07, 0.06, 0, scene, false, true);
    return { doorW, doorH };
  }
  const shell = buildShell();

  // 地板上的窗户光斑（一块半透明暖色平面贴在地板上）
  const floorLight = new THREE.Mesh(
    new THREE.PlaneGeometry(3.5, 4.5),
    new THREE.MeshBasicMaterial({
      color: 0xffe8b0, transparent: true, opacity: 0.08,
      blending: THREE.AdditiveBlending, depthWrite: false,
    }),
  );
  floorLight.rotation.x = -Math.PI / 2;
  floorLight.position.set(0.3, 0.015, -2.5);
  scene.add(floorLight);

  /* =========================================================================
   *  ★结局触发 - 门：默认紧闭，集齐后开一道缝透光
   * ======================================================================= */
  const doorPivot = new THREE.Group(); // 以铰链为原点旋转
  let doorLightPlane: any = null;
  let doorGlow: any = null;
  function buildDoor() {
    const { halfZ } = ROOM;
    const { doorW, doorH } = shell;
    // 门框（更精致）
    addBox(doorW + 0.28, doorH + 0.14, 0.08, woodDark, 0, doorH / 2 + 0.02, halfZ - 0.02, scene, false, true);
    // 门框装饰线
    addBox(doorW + 0.32, 0.03, 0.10, woodMid, 0, doorH + 0.08, halfZ - 0.02, scene, false, false);
    // 铰链支点放在门洞左侧
    doorPivot.position.set(-doorW / 2, doorH / 2, halfZ - 0.06);
    scene.add(doorPivot);
    // 门板
    const door = new THREE.Mesh(new THREE.BoxGeometry(doorW, doorH, 0.05), woodMid);
    door.position.set(doorW / 2, 0, 0);
    door.castShadow = true;
    doorPivot.add(door);
    // 门板上的装饰面板（两块长方形凹板）
    const panelMat = new THREE.MeshStandardMaterial({ color: 0x9a6a3e, roughness: 0.7 });
    addBox(doorW - 0.16, doorH * 0.35, 0.008, panelMat, doorW / 2, doorH * 0.22, 0.03, doorPivot);
    addBox(doorW - 0.16, doorH * 0.30, 0.008, panelMat, doorW / 2, -doorH * 0.18, 0.03, doorPivot);
    // 门把手（更精致的铜把手）
    const knob = new THREE.Mesh(
      new THREE.SphereGeometry(0.04, 12, 12),
      metalBrass,
    );
    knob.position.set(doorW - 0.14, 0, 0.04);
    doorPivot.add(knob);
    // 把手底座
    const knobBase = new THREE.Mesh(
      new THREE.CylinderGeometry(0.015, 0.02, 0.03, 8),
      metalBrass,
    );
    knobBase.position.set(doorW - 0.14, 0, 0.028);
    knobBase.rotation.x = Math.PI / 2;
    doorPivot.add(knobBase);
    // 铰链（上下两片）
    const hingeMat = new THREE.MeshStandardMaterial({ color: 0x8a7a60, metalness: 0.7, roughness: 0.4 });
    [0.3, -0.3].forEach((dy) => {
      const hinge = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.10, 0.02), hingeMat);
      hinge.position.set(0.03, dy, -0.03);
      doorPivot.add(hinge);
    });
    // 门缝透出的光（初始隐藏，开门时点亮）
    doorLightPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(doorW + 0.5, doorH + 0.4),
      new THREE.MeshBasicMaterial({ color: 0xfff3d4, transparent: true, opacity: 0 }),
    );
    doorLightPlane.position.set(0, doorH / 2 + 0.02, halfZ + 0.14);
    scene.add(doorLightPlane);
    doorGlow = new THREE.PointLight(0xffe6b0, 0, 6, 2);
    doorGlow.position.set(0, doorH / 2, halfZ - 0.4);
    scene.add(doorGlow);
  }
  buildDoor();

  /* =========================================================================
   *  窗户 + 窗外天空 + 体积光（god rays）+ 窗台 + 窗帘
   * ======================================================================= */
  let skyMesh: any = null;
  const godRays = new THREE.Group();
  function buildWindow() {
    const { halfZ } = ROOM;
    const frameMat = new THREE.MeshStandardMaterial({ color: 0xf2e6cf, roughness: 0.5 });
    const winGroup = new THREE.Group();
    winGroup.position.set(0, 1.7, -halfZ + 0.05);
    scene.add(winGroup);
    // 外框（稍厚实）
    addBox(3.0, 1.7, 0.12, frameMat, 0, 0, 0, winGroup, false, false);
    // 窗台（更宽的窗台，有前缘装饰）
    addBox(3.15, 0.08, 0.38, woodLight, 0, -0.85, 0.14, winGroup, true, true);
    addBox(3.15, 0.035, 0.04, woodMid, 0, -0.81, 0.32, winGroup, false, false); // 窗台前沿
    // 十字窗棂
    addBox(0.08, 1.55, 0.13, frameMat, 0, 0, 0.02, winGroup, false, false);
    addBox(2.85, 0.08, 0.13, frameMat, 0, 0, 0.02, winGroup, false, false);
    // 玻璃（更通透的反光效果）
    const glass = new THREE.Mesh(
      new THREE.PlaneGeometry(2.7, 1.5),
      new THREE.MeshPhysicalMaterial({
        color: 0xd4eaff, transparent: true, opacity: 0.12,
        roughness: 0.05, metalness: 0, transmission: 0.6, thickness: 0.01,
        emissive: 0x88bbff, emissiveIntensity: 0.12,
      }),
    );
    glass.position.set(0, 0, -0.02);
    winGroup.add(glass);
    // 窗外天空（在窗后一段距离的大平面）
    skyMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(12, 8),
      new THREE.MeshBasicMaterial({ map: makeSkyTexture(THREE, exhibits.window.visions[0].sky), fog: false }),
    );
    skyMesh.position.set(0, 1.7, -halfZ - 2.0);
    scene.add(skyMesh);

    // ---- 体积光：更多层次的光束，配合尘埃营造光柱 ----
    const rayMat = new THREE.MeshBasicMaterial({
      color: 0xffe6b3, transparent: true, opacity: 0.04,
      blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false,
    });
    for (let i = 0; i < 6; i++) {
      const plane = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 6.5), rayMat.clone());
      plane.position.set(-1.2 + i * 0.5, 1.5, -2.0 + i * 0.15);
      plane.rotation.set(-Math.PI / 2 + 0.45, 0, 0.15 + i * 0.025);
      godRays.add(plane);
    }
    scene.add(godRays);

    // ---- 窗帘（两侧垂下的布料感） ----
    const curtainMat = new THREE.MeshStandardMaterial({
      color: 0xf0e6d2, roughness: 0.95, metalness: 0,
      transparent: true, opacity: 0.85, side: THREE.DoubleSide,
    });
    // 左窗帘
    const curtainL = new THREE.Mesh(new THREE.PlaneGeometry(0.55, 2.0), curtainMat);
    curtainL.position.set(-1.65, 0.85, 0.15);
    curtainL.rotation.y = 0.15;
    curtainL.castShadow = true;
    winGroup.add(curtainL);
    // 右窗帘
    const curtainR = new THREE.Mesh(new THREE.PlaneGeometry(0.55, 2.0), curtainMat.clone());
    curtainR.position.set(1.65, 0.85, 0.15);
    curtainR.rotation.y = -0.15;
    curtainR.castShadow = true;
    winGroup.add(curtainR);
    // 窗帘杆
    const rodMat = new THREE.MeshStandardMaterial({ color: 0x8a6a40, metalness: 0.6, roughness: 0.3 });
    const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 3.6, 8), rodMat);
    rod.rotation.z = Math.PI / 2;
    rod.position.set(0, 1.72, 0.18);
    winGroup.add(rod);
    // 窗帘杆两端的装饰球
    const finial = new THREE.SphereGeometry(0.04, 8, 8);
    const fL = new THREE.Mesh(finial, rodMat);
    fL.position.set(-1.8, 1.72, 0.18);
    winGroup.add(fL);
    const fR = new THREE.Mesh(finial, rodMat);
    fR.position.set(1.8, 1.72, 0.18);
    winGroup.add(fR);

    // 窗台上的小盆栽
    const potMini = new THREE.Mesh(
      new THREE.CylinderGeometry(0.07, 0.055, 0.12, 10),
      new THREE.MeshStandardMaterial({ color: 0xc47a50, roughness: 0.8 }),
    );
    potMini.position.set(0.9, -0.79, 0.08);
    potMini.castShadow = true;
    winGroup.add(potMini);
    const miniLeaf = new THREE.Mesh(
      new THREE.SphereGeometry(0.09, 8, 6),
      new THREE.MeshStandardMaterial({ color: 0x5a8a4a, roughness: 0.85 }),
    );
    miniLeaf.position.set(0.9, -0.66, 0.08);
    miniLeaf.scale.y = 1.2;
    winGroup.add(miniLeaf);

    // 窗户作为可交互物件（★物件交互：切换白日梦）
    registerInteractable(glass, "window", "window", exhibits.window.label, V3(0, 1.6, -2.6), V3(0, 1.75, -halfZ));
    // 让玻璃在父级 group 下也能命中
    glass.userData.interactId = "window";
  }
  buildWindow();

  /* 切换窗外「白日梦」—— 同时换天 + 调主光颜色（★物件交互） */
  let visionIndex = 0;
  function setVision(index: number) {
    const visions = exhibits.window.visions;
    visionIndex = ((index % visions.length) + visions.length) % visions.length;
    const v = visions[visionIndex];
    if (skyMesh) {
      skyMesh.material.map?.dispose();
      skyMesh.material.map = makeSkyTexture(THREE, v.sky);
      skyMesh.material.needsUpdate = true;
    }
    const c = new THREE.Color(v.light);
    sun.color.copy(c);
    godRays.children.forEach((p: any) => p.material.color.copy(c));
    scene.background = new THREE.Color(v.sky[1]);
    if (scene.fog) scene.fog.color = new THREE.Color(v.sky[2]);
    // 夜晚降低曝光、白天提高
    renderer.toneMappingExposure = v.id === "night" ? 0.82 : v.id === "vision" ? 1.12 : 1.08;
    callbacks.onVisionChange?.(visionIndex);
  }

  /* =========================================================================
   *  家具：地毯 / 书桌 / 椅子 / 书架 / 绿植 / 沙发 / 台灯
   * ======================================================================= */
  function buildRug() {
    const rug = new THREE.Mesh(
      new THREE.PlaneGeometry(3.4, 2.4),
      new THREE.MeshStandardMaterial({ map: makeRugTexture(THREE), roughness: 1 }),
    );
    rug.rotation.x = -Math.PI / 2;
    rug.position.set(0, 0.012, -0.4);
    rug.receiveShadow = true;
    scene.add(rug);
  }
  buildRug();

  // 书桌（靠远墙，窗下）—— 更细致的结构
  const DESK = { x: -0.3, y: 0.78, z: -4.25, w: 2.4, d: 0.9 };
  function buildDesk() {
    const g = new THREE.Group();
    scene.add(g);
    // 桌面（加前缘装饰条）
    addBox(DESK.w, 0.055, DESK.d, woodMid, DESK.x, DESK.y, DESK.z, g);
    addBox(DESK.w + 0.02, 0.03, 0.03, woodDark, DESK.x, DESK.y - 0.04, DESK.z + DESK.d / 2 - 0.015, g);
    // 桌腿（方形带锥度感）
    const lx = DESK.w / 2 - 0.08, lz = DESK.d / 2 - 0.08;
    [[-lx, -lz], [lx, -lz], [-lx, lz], [lx, lz]].forEach(([dx, dz]) => {
      addBox(0.07, DESK.y - 0.06, 0.07, woodDark, DESK.x + dx, (DESK.y - 0.06) / 2, DESK.z + dz, g);
    });
    // 桌下抽屉柜（更细致，有拉手）
    addBox(0.72, 0.48, 0.65, woodDark, DESK.x + 0.75, 0.26, DESK.z, g);
    // 抽屉面板线
    for (let i = 0; i < 3; i++) {
      addBox(0.62, 0.008, 0.008, metalBrass, DESK.x + 0.75, 0.10 + i * 0.14, DESK.z + 0.33, g);
    }
    // 抽屉拉手
    for (let i = 0; i < 3; i++) {
      const knob = new THREE.Mesh(
        new THREE.SphereGeometry(0.018, 8, 8),
        metalBrass,
      );
      knob.position.set(DESK.x + 0.75, 0.10 + i * 0.14 + 0.04, DESK.z + 0.34);
      g.add(knob);
    }
    // 桌上散落的笔
    const penMat = new THREE.MeshStandardMaterial({ color: 0x2a2a2a, roughness: 0.5, metalness: 0.3 });
    const pen = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.18, 6), penMat);
    pen.position.set(DESK.x + 1.05, DESK.y + 0.04, DESK.z + 0.25);
    pen.rotation.z = Math.PI / 2;
    pen.rotation.y = 0.3;
    g.add(pen);
  }
  buildDesk();

  function buildChair() {
    const g = new THREE.Group();
    g.position.set(DESK.x, 0, DESK.z + 1.05);
    scene.add(g);
    // 坐垫（木框 + 软垫感）
    addBox(0.5, 0.05, 0.5, woodMid, 0, 0.46, 0, g);
    const cushionMat = new THREE.MeshStandardMaterial({ color: 0x6a7a5a, roughness: 0.95 });
    addBox(0.42, 0.06, 0.42, cushionMat, 0, 0.52, 0, g);
    // 靠背（略弯，带横条）
    addBox(0.5, 0.5, 0.05, woodMid, 0, 0.74, -0.22, g);
    addBox(0.4, 0.06, 0.04, woodMid, 0, 0.62, -0.22, g); // 横条
    // 椅腿
    [[-0.2, -0.2], [0.2, -0.2], [-0.2, 0.2], [0.2, 0.2]].forEach(([dx, dz]) => {
      addBox(0.045, 0.46, 0.045, woodDark, dx, 0.23, dz, g);
    });
    // 后腿延伸为靠背支撑
    addBox(0.045, 0.82, 0.045, woodDark, -0.2, 0.41, -0.2, g);
    addBox(0.045, 0.82, 0.045, woodDark, 0.2, 0.41, -0.2, g);
  }
  buildChair();

  function buildBookshelf() {
    const g = new THREE.Group();
    g.position.set(-ROOM.halfX + 0.28, 0, -1.0);
    scene.add(g);
    const shelfMat = woodDark;
    // 背板
    addBox(0.34, 2.6, 2.6, shelfMat, 0, 1.3, 0, g);
    // 隔板（更厚实）
    for (let i = 0; i <= 4; i++) {
      addBox(0.36, 0.04, 2.6, woodMid, 0, 0.3 + i * 0.56, 0, g);
    }
    // 侧板
    addBox(0.04, 2.6, 2.6, woodMid, 0.16, 1.3, 0, g);
    addBox(0.04, 2.6, 2.6, woodMid, -0.16, 1.3, 0, g);
    // 书（彩色小盒，有更丰富的颜色变化）
    const bookColors = [0x9c4a3c, 0x3c6e71, 0xd4a017, 0x5a6f5a, 0x84563c, 0x6b5b95, 0xb85c3a, 0x4a7c59, 0xc48a3a, 0x7a5a8a];
    for (let s = 0; s < 4; s++) {
      let z = -1.15;
      while (z < 1.05) {
        const h = 0.32 + Math.random() * 0.14;
        const w = 0.04 + Math.random() * 0.05;
        const col = bookColors[Math.floor(Math.random() * bookColors.length)];
        const bookMat = new THREE.MeshStandardMaterial({ color: col, roughness: 0.88 });
        const b = addBox(0.20, h, w, bookMat,
          0.02, 0.3 + s * 0.56 + h / 2 + 0.03, z, g);
        b.rotation.y = (Math.random() - 0.5) * 0.04;
        // 有些书有装饰线条（书脊）
        if (Math.random() > 0.6) {
          const stripe = addBox(0.21, 0.008, w + 0.002,
            new THREE.MeshStandardMaterial({ color: 0xd4b070, roughness: 0.6, metalness: 0.3 }),
            0.025, 0.3 + s * 0.56 + h * 0.35 + 0.03, z, g);
        }
        z += w + 0.008 + Math.random() * 0.008;
      }
    }
    // 书架顶部放一个小摆件
    const figurine = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.06, 0.18, 8),
      new THREE.MeshStandardMaterial({ color: 0xd4b896, roughness: 0.7 }),
    );
    figurine.position.set(0.02, 2.62, 0.5);
    g.add(figurine);
  }
  buildBookshelf();

  function buildPlant() {
    const g = new THREE.Group();
    g.position.set(ROOM.halfX - 0.7, 0, -ROOM.halfZ + 0.8);
    scene.add(g);
    // 花盆（陶土质感，有盆沿）
    const pot = new THREE.Mesh(
      new THREE.CylinderGeometry(0.26, 0.19, 0.42, 14),
      new THREE.MeshStandardMaterial({ color: 0xb5683f, roughness: 0.75 }),
    );
    pot.position.y = 0.21; pot.castShadow = true; pot.receiveShadow = true;
    g.add(pot);
    // 盆沿
    const rim = new THREE.Mesh(
      new THREE.TorusGeometry(0.26, 0.02, 8, 16),
      new THREE.MeshStandardMaterial({ color: 0xc47850, roughness: 0.7 }),
    );
    rim.position.y = 0.42;
    rim.rotation.x = Math.PI / 2;
    g.add(rim);
    // 土壤
    const soil = new THREE.Mesh(
      new THREE.CylinderGeometry(0.24, 0.24, 0.04, 14),
      new THREE.MeshStandardMaterial({ color: 0x5a3d2a, roughness: 1 }),
    );
    soil.position.y = 0.40;
    g.add(soil);
    // 叶子（更多层次，两种绿色）
    const leafMat1 = new THREE.MeshStandardMaterial({ color: 0x5e7d4f, roughness: 0.85 });
    const leafMat2 = new THREE.MeshStandardMaterial({ color: 0x4a6d3a, roughness: 0.85 });
    for (let i = 0; i < 10; i++) {
      const mat = i % 2 === 0 ? leafMat1 : leafMat2;
      const leaf = new THREE.Mesh(new THREE.ConeGeometry(0.08 + Math.random() * 0.05, 0.8 + Math.random() * 0.5, 5), mat);
      leaf.position.set((Math.random() - 0.5) * 0.22, 0.75 + Math.random() * 0.2, (Math.random() - 0.5) * 0.22);
      leaf.rotation.set((Math.random() - 0.5) * 0.7, Math.random() * Math.PI, (Math.random() - 0.5) * 0.7);
      leaf.castShadow = true;
      g.add(leaf);
    }
    // 主茎（一根较高的）
    const stem = new THREE.Mesh(
      new THREE.CylinderGeometry(0.015, 0.012, 0.6, 6),
      new THREE.MeshStandardMaterial({ color: 0x3a5a2a, roughness: 0.9 }),
    );
    stem.position.y = 0.72;
    stem.rotation.set(0.1, 0, 0.05);
    g.add(stem);
    return g;
  }
  const plantGroup = buildPlant();

  function buildSofa() {
    const g = new THREE.Group();
    g.position.set(ROOM.halfX - 0.55, 0, 1.3);
    g.rotation.y = -Math.PI / 2;
    scene.add(g);
    const sofaMat = new THREE.MeshStandardMaterial({ color: 0x7d8a6b, roughness: 0.95 });
    const sofaDark = new THREE.MeshStandardMaterial({ color: 0x5e6b4e, roughness: 0.9 });
    // 底座
    addBox(1.8, 0.12, 0.78, sofaDark, 0, 0.1, 0, g);
    // 坐垫（有分段感）
    addBox(0.85, 0.18, 0.72, sofaMat, -0.44, 0.28, 0, g);
    addBox(0.85, 0.18, 0.72, sofaMat, 0.44, 0.28, 0, g);
    // 靠背（更厚实）
    addBox(1.8, 0.42, 0.2, sofaMat, 0, 0.56, -0.28, g);
    // 扶手（圆润感用多段叠加模拟）
    addBox(0.18, 0.36, 0.72, sofaMat, -0.82, 0.5, 0, g);
    addBox(0.18, 0.36, 0.72, sofaMat, 0.82, 0.5, 0, g);
    // 扶手顶部圆角
    addBox(0.18, 0.06, 0.72, sofaDark, -0.82, 0.7, 0, g);
    addBox(0.18, 0.06, 0.72, sofaDark, 0.82, 0.7, 0, g);
    // 抱枕（两个不同颜色）
    const pillow1Mat = new THREE.MeshStandardMaterial({ color: 0xc77b4a, roughness: 0.95 });
    const pillow2Mat = new THREE.MeshStandardMaterial({ color: 0x8a7a5a, roughness: 0.95 });
    const p1 = addBox(0.35, 0.35, 0.12, pillow1Mat, -0.4, 0.52, 0.12, g);
    p1.rotation.y = 0.15; p1.rotation.z = 0.08;
    const p2 = addBox(0.35, 0.35, 0.12, pillow2Mat, 0.35, 0.52, 0.1, g);
    p2.rotation.y = -0.2; p2.rotation.z = -0.05;
    // 沙发脚
    const sofaFootMat = new THREE.MeshStandardMaterial({ color: 0x4a3020, roughness: 0.6 });
    [[-0.8, 0.32], [0.8, 0.32], [-0.8, -0.32], [0.8, -0.32]].forEach(([dx, dz]) => {
      const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.06, 8), sofaFootMat);
      foot.position.set(dx, 0.03, dz);
      g.add(foot);
    });
  }
  buildSofa();

  // 台灯（含暖色点光源 + 光晕）—— 也是碎片「rookie」的藏匿点
  let lampLight: any = null;
  function buildLamp() {
    const g = new THREE.Group();
    g.position.set(DESK.x - 0.85, DESK.y + 0.03, DESK.z + 0.05);
    scene.add(g);
    // 底座（圆形）
    const base = new THREE.Mesh(
      new THREE.CylinderGeometry(0.10, 0.12, 0.02, 16),
      woodDark,
    );
    base.castShadow = true;
    g.add(base);
    // 灯杆（稍细，有装饰环）
    addBox(0.022, 0.40, 0.022, woodDark, 0, 0.21, 0, g);
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.03, 0.006, 6, 12),
      metalBrass,
    );
    ring.position.y = 0.15;
    ring.rotation.x = Math.PI / 2;
    g.add(ring);
    // 灯罩（圆台，发光材质）
    const shade = new THREE.Mesh(
      new THREE.ConeGeometry(0.16, 0.22, 16, 1, true),
      new THREE.MeshStandardMaterial({
        color: 0xe9c27a, roughness: 0.55, side: THREE.DoubleSide,
        emissive: 0xffcf7a, emissiveIntensity: 0.7,
      }),
    );
    shade.position.y = 0.45;
    shade.castShadow = false;
    g.add(shade);
    // 灯泡发光点
    const bulb = new THREE.Mesh(
      new THREE.SphereGeometry(0.025, 8, 8),
      new THREE.MeshStandardMaterial({ color: 0xfff5e0, emissive: 0xffe8a0, emissiveIntensity: 3 }),
    );
    bulb.position.y = 0.40;
    g.add(bulb);
    // 暖色点光源
    lampLight = new THREE.PointLight(0xffce82, 1.6, 5.0, 2);
    lampLight.position.set(0, 0.42, 0);
    lampLight.castShadow = true;
    lampLight.shadow.mapSize.set(512, 512);
    lampLight.shadow.bias = -0.002;
    g.add(lampLight);
  }
  buildLamp();

  /* =========================================================================
   *  ★物件交互 - 主题展品 ①：老式电脑（CRT）→ 架构作品时间线
   * ======================================================================= */
  function buildComputer() {
    const g = new THREE.Group();
    g.position.set(DESK.x + 0.15, DESK.y + 0.03, DESK.z - 0.05);
    scene.add(g);
    const caseMat = new THREE.MeshStandardMaterial({ color: 0xd9cdb0, roughness: 0.65 });
    // 显示器外壳（CRT 造型，后部更厚）
    addBox(0.62, 0.48, 0.52, caseMat, 0, 0.27, 0, g);
    // CRT 后部圆弧（用扁球模拟）
    const crtBack = new THREE.Mesh(
      new THREE.SphereGeometry(0.28, 10, 8),
      new THREE.MeshStandardMaterial({ color: 0xc9bd9f, roughness: 0.7 }),
    );
    crtBack.position.set(0, 0.27, -0.18);
    crtBack.scale.set(1.1, 0.85, 0.6);
    crtBack.castShadow = true;
    g.add(crtBack);
    // 屏幕（自发光，呼应「开机」）
    const screen = new THREE.Mesh(
      new THREE.PlaneGeometry(0.46, 0.34),
      new THREE.MeshStandardMaterial({ color: 0x1d3b34, emissive: 0x2fae8e, emissiveIntensity: 0.7, roughness: 0.4 }),
    );
    screen.position.set(0, 0.3, 0.265);
    g.add(screen);
    // 屏幕发光溢出
    const screenGlow = new THREE.PointLight(0x2fae8e, 0.4, 1.5, 2);
    screenGlow.position.set(0, 0.3, 0.35);
    g.add(screenGlow);
    // 显示器底座
    addBox(0.3, 0.03, 0.22, caseMat, 0, 0.015, 0.08, g);
    // 显示器按钮
    const btnMat = new THREE.MeshStandardMaterial({ color: 0x8a7a6a, roughness: 0.5 });
    for (let i = 0; i < 3; i++) {
      const btn = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.01, 8), btnMat);
      btn.position.set(-0.08 + i * 0.08, 0.06, 0.265);
      btn.rotation.x = Math.PI / 2;
      g.add(btn);
    }
    // 键盘（有键帽起伏感）
    addBox(0.5, 0.035, 0.18, caseMat, 0, 0.02, 0.42, g);
    // 键盘按键行（简化为几排小凸起）
    const keyMat = new THREE.MeshStandardMaterial({ color: 0xc9bda0, roughness: 0.6 });
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 10; col++) {
        const key = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.008, 0.032), keyMat);
        key.position.set(-0.18 + col * 0.04, 0.043, 0.34 + row * 0.04);
        g.add(key);
      }
    }
    // 鼠标
    const mouse = new THREE.Mesh(
      new THREE.BoxGeometry(0.06, 0.025, 0.1),
      new THREE.MeshStandardMaterial({ color: 0xc9bda0, roughness: 0.6 }),
    );
    mouse.position.set(0.35, 0.02, 0.42);
    g.add(mouse);
    registerInteractable(g, "exhibit", "computer", exhibits.computer.label,
      V3(DESK.x + 0.15, 1.18, DESK.z + 1.15), V3(DESK.x + 0.15, 1.05, DESK.z - 0.05));
  }
  buildComputer();

  /* ★物件交互 - 主题展品 ②：摊开的书 → 灵魂底色 / 工程哲学 */
  function buildBook() {
    const g = new THREE.Group();
    g.position.set(DESK.x + 0.95, DESK.y + 0.04, DESK.z + 0.18);
    g.rotation.y = -0.3;
    scene.add(g);
    const pageMat = new THREE.MeshStandardMaterial({ color: 0xf3ecd8, roughness: 0.95 });
    const coverMat = new THREE.MeshStandardMaterial({ color: 0x6b3f2a, roughness: 0.8 });
    addBox(0.62, 0.03, 0.44, coverMat, 0, 0, 0, g); // 封底
    // 两页微微张开
    const pL = addBox(0.3, 0.012, 0.42, pageMat, -0.155, 0.025, 0, g);
    const pR = addBox(0.3, 0.012, 0.42, pageMat, 0.155, 0.025, 0, g);
    pL.rotation.z = 0.06; pR.rotation.z = -0.06;
    registerInteractable(g, "exhibit", "book", exhibits.book.label,
      V3(DESK.x + 0.95, 1.22, DESK.z + 1.2), V3(DESK.x + 0.95, 0.85, DESK.z + 0.18));
  }
  buildBook();

  /* ★物件交互 - 主题展品 ③：旅行背包 → 职业旅程 */
  function buildBackpack() {
    const g = new THREE.Group();
    g.position.set(1.6, 0, -2.7);
    g.rotation.y = 0.5;
    scene.add(g);
    const bagMat = new THREE.MeshStandardMaterial({ color: 0x9c6b3a, roughness: 0.9 });
    const bagMat2 = new THREE.MeshStandardMaterial({ color: 0x7a5230, roughness: 0.9 });
    // 主袋
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.6, 0.34), bagMat);
    body.position.y = 0.34; body.castShadow = true; body.receiveShadow = true;
    g.add(body);
    // 前袋
    addBox(0.36, 0.3, 0.12, bagMat2, 0, 0.26, 0.22, g);
    // 顶盖
    addBox(0.52, 0.12, 0.36, bagMat2, 0, 0.62, 0, g);
    // 背带
    addBox(0.08, 0.5, 0.06, bagMat2, -0.15, 0.4, -0.18, g);
    addBox(0.08, 0.5, 0.06, bagMat2, 0.15, 0.4, -0.18, g);
    registerInteractable(g, "exhibit", "backpack", exhibits.backpack.label,
      V3(1.6, 1.15, -1.5), V3(1.6, 0.4, -2.7));
  }
  buildBackpack();

  /* =========================================================================
   *  墙上的相框（加分探索）—— 教育 / 开源 / 影集
   * ======================================================================= */
  function buildPaintings() {
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x4a2f1d, roughness: 0.6 });
    // 相框配置：[id, 墙面位置, 朝向法线, 画布主色]
    const cfg: Record<string, { pos: any; look: any; canvasPos: any; rot: number; color: number }> = {
      education: { pos: V3(-ROOM.halfX + 0.12, 1.7, -2.4), canvasPos: V3(-ROOM.halfX + 0.09, 1.7, -2.4),
        look: V3(-ROOM.halfX, 1.7, -2.4), rot: Math.PI / 2, color: 0x35506b },
      opensource: { pos: V3(-ROOM.halfX + 0.12, 1.7, 0.6), canvasPos: V3(-ROOM.halfX + 0.09, 1.7, 0.6),
        look: V3(-ROOM.halfX, 1.7, 0.6), rot: Math.PI / 2, color: 0x4a3b2a },
      showreel: { pos: V3(ROOM.halfX - 0.12, 1.85, -1.4), canvasPos: V3(ROOM.halfX - 0.09, 1.85, -1.4),
        look: V3(ROOM.halfX, 1.85, -1.4), rot: -Math.PI / 2, color: 0x3a2f4a },
    };
    paintingData.forEach((p) => {
      const c = cfg[p.id];
      if (!c) return;
      const g = new THREE.Group();
      g.position.copy(c.canvasPos);
      g.rotation.y = c.rot;
      scene.add(g);
      addBox(0.9, 0.66, 0.04, frameMat, 0, 0, 0, g, false, false); // 外框
      const canvas = new THREE.Mesh(
        new THREE.PlaneGeometry(0.78, 0.54),
        new THREE.MeshStandardMaterial({ color: c.color, roughness: 0.9, emissive: c.color, emissiveIntensity: 0.08 }),
      );
      canvas.position.z = 0.025;
      g.add(canvas);
      // 聚焦点：站在墙前一点看向画
      const focusPos = c.look.clone().add(c.pos.clone().sub(c.look).normalize().multiplyScalar(1.25));
      focusPos.y = 1.6;
      registerInteractable(g, "painting", p.id, p.label, focusPos, c.canvasPos.clone());
    });
  }
  buildPaintings();

  /* =========================================================================
   *  ★收集系统 - 记忆碎片：5 枚自发光粒子球，藏在隐秘角落
   *  靠近自动拾取（见动画循环里的 proximity 检测）
   * ======================================================================= */
  const glowTex = makeGlowTexture(THREE);
  interface Shard {
    id: string; group: any; core: any; halo: any;
    pos: any; baseY: number; collected: boolean; collecting: number;
  }
  const shards: Shard[] = [];
  // 每枚碎片的世界坐标（藏匿点）
  const shardPos: Record<string, any> = {
    taurus: V3(-ROOM.halfX + 0.34, 1.52, -0.9),    // 书架书缝
    rookie: V3(DESK.x - 0.55, DESK.y + 0.12, DESK.z + 0.05), // 台灯光晕下
    midnight: V3(-1.15, 0.96, -ROOM.halfZ + 0.32),  // 窗台角落
    pearl: V3(ROOM.halfX - 0.7, 0.62, -ROOM.halfZ + 0.85), // 绿植后
    origin: V3(2.7, 0.3, 1.55),                      // 木箱盒底
  };
  function buildOpenBox() {
    // 「origin」碎片藏在沙发旁的开口木箱里
    const g = new THREE.Group();
    g.position.set(2.7, 0, 1.55);
    scene.add(g);
    const m = woodLight;
    addBox(0.5, 0.04, 0.4, m, 0, 0.02, 0, g);
    addBox(0.5, 0.26, 0.04, m, 0, 0.15, -0.18, g);
    addBox(0.5, 0.26, 0.04, m, 0, 0.15, 0.18, g);
    addBox(0.04, 0.26, 0.4, m, -0.23, 0.15, 0, g);
    addBox(0.04, 0.26, 0.4, m, 0.23, 0.15, 0, g);
  }
  buildOpenBox();

  function buildShards() {
    memoryShards.forEach((s) => {
      const pos = shardPos[s.id];
      const group = new THREE.Group();
      group.position.copy(pos);
      scene.add(group);
      // 内核：自发光小球
      const core = new THREE.Mesh(
        new THREE.IcosahedronGeometry(0.07, 1),
        new THREE.MeshStandardMaterial({
          color: 0xfff0c8, emissive: 0xffd27a, emissiveIntensity: 2.2, roughness: 0.3,
        }),
      );
      group.add(core);
      // 光晕 sprite
      const halo = new THREE.Sprite(new THREE.SpriteMaterial({
        map: glowTex, color: 0xffdf9c, transparent: true, opacity: 0.9,
        blending: THREE.AdditiveBlending, depthWrite: false, fog: false,
      }));
      halo.scale.set(0.6, 0.6, 0.6);
      group.add(halo);
      shards.push({ id: s.id, group, core, halo, pos: pos.clone(), baseY: pos.y, collected: false, collecting: 0 });
    });
  }
  buildShards();

  /* =========================================================================
   *  尘埃粒子：在体积光中缓慢漂浮（更丰富）
   * ======================================================================= */
  let dust: any = null;
  function buildDust() {
    const count = isMobile ? 320 : 600;
    const geo = new THREE.BufferGeometry();
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * ROOM.halfX * 2;
      arr[i * 3 + 1] = Math.random() * ROOM.height;
      arr[i * 3 + 2] = (Math.random() - 0.5) * ROOM.halfZ * 2;
    }
    geo.setAttribute("position", new THREE.BufferAttribute(arr, 3));
    dust = new THREE.Points(geo, new THREE.PointsMaterial({
      map: glowTex, color: 0xffe6b8, size: 0.06, transparent: true, opacity: 0.45,
      blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true, fog: false,
    }));
    scene.add(dust);
  }
  buildDust();

  /* =========================================================================
   *  天花板灯具：复古吊灯
   * ======================================================================= */
  let ceilingLight: any = null;
  function buildCeilingLamp() {
    const g = new THREE.Group();
    g.position.set(0, ROOM.height, -1.5);
    scene.add(g);
    // 吊链/线
    const wire = new THREE.Mesh(
      new THREE.CylinderGeometry(0.008, 0.008, 0.4, 4),
      new THREE.MeshStandardMaterial({ color: 0x555555, metalness: 0.8, roughness: 0.3 }),
    );
    wire.position.y = 0.2;
    g.add(wire);
    // 灯罩（碗形，用圆锥倒扣）
    const shade = new THREE.Mesh(
      new THREE.ConeGeometry(0.25, 0.15, 16, 1, true),
      new THREE.MeshStandardMaterial({
        color: 0xd4b886, roughness: 0.6, side: THREE.DoubleSide,
        emissive: 0xffe8b0, emissiveIntensity: 0.4,
      }),
    );
    shade.position.y = 0;
    shade.rotation.x = Math.PI;
    g.add(shade);
    // 灯泡
    const bulb = new THREE.Mesh(
      new THREE.SphereGeometry(0.05, 10, 8),
      new THREE.MeshStandardMaterial({
        color: 0xfff5e0, emissive: 0xffe8a0, emissiveIntensity: 2.5,
      }),
    );
    bulb.position.y = -0.02;
    g.add(bulb);
    // 灯光
    ceilingLight = new THREE.PointLight(0xffe0a0, 0.8, 8, 2);
    ceilingLight.position.set(0, -0.1, 0);
    ceilingLight.castShadow = true;
    ceilingLight.shadow.mapSize.set(512, 512);
    ceilingLight.shadow.bias = -0.002;
    g.add(ceilingLight);
  }
  buildCeilingLamp();

  /* =========================================================================
   *  ★漫游控制：状态机 + 输入
   *  mode: roam（漫游）| transition（镜头补间）| focus（聚焦看卡片）
   * ======================================================================= */
  let mode: "roam" | "transition" | "focus" = "roam";
  const euler = new THREE.Euler(0, 0, 0, "YXZ"); // yaw=y, pitch=x
  const keys = new Set<string>();
  const moveInput = { x: 0, y: 0 };    // 移动端左摇杆 / 也兼容键盘合成
  const lookDelta = { x: 0, y: 0 };    // 移动端右侧滑动累积量
  let pointerLocked = false;
  const clock = new THREE.Clock();

  // 头部晃动 & 脚步
  let bobTime = 0;
  let bobOffset = 0;
  let lastStep = 0;

  // 聚焦补间
  const focusAnim = {
    active: false, t: 0, dur: 0.9,
    fromPos: V3(), toPos: V3(),
    fromQuat: new THREE.Quaternion(), toQuat: new THREE.Quaternion(),
    onDone: null as null | (() => void),
  };
  const roamPose = { pos: V3(), quat: new THREE.Quaternion() }; // 聚焦前的漫游姿态，退出时还原

  // ★收集 & ★结局 进度
  let collectedCount = 0;
  let endingReady = false;
  let endingReached = false;
  let doorOpening = false;
  let doorAngle = 0;

  const tmpV = V3();
  const dummy = new THREE.Object3D();
  const raycaster = new THREE.Raycaster();
  let hovered: Interactable | null = null;

  /* ---------- 碰撞盒（XZ 平面 AABB，阻止穿过大件家具）---------- */
  const blockers = [
    { minX: -1.55, maxX: 0.95, minZ: -4.75, maxZ: -3.75 }, // 书桌
    { minX: -4, maxX: -3.45, minZ: -2.45, maxZ: 0.45 },     // 书架
    { minX: 2.95, maxX: 4, minZ: 0.35, maxZ: 2.3 },          // 沙发
    { minX: 2.9, maxX: 3.7, minZ: -4.6, maxZ: -3.85 },       // 绿植
    { minX: 1.15, maxX: 2.05, minZ: -3.15, maxZ: -2.25 },    // 背包
    { minX: -0.65, maxX: 0.05, minZ: -3.55, maxZ: -2.85 },   // 椅子
    { minX: 2.4, maxX: 3.0, minZ: 1.25, maxZ: 1.85 },        // 木箱
  ];
  function resolveCollision(x: number, z: number): [number, number] {
    // 房间边界
    const bx = ROOM.halfX - 0.35, bz = ROOM.halfZ - 0.35;
    x = Math.max(-bx, Math.min(bx, x));
    z = Math.max(-bz, Math.min(bz, z));
    // 逐个碰撞盒推出（取最小穿透轴）
    for (const b of blockers) {
      const minX = b.minX - PLAYER_R, maxX = b.maxX + PLAYER_R;
      const minZ = b.minZ - PLAYER_R, maxZ = b.maxZ + PLAYER_R;
      if (x > minX && x < maxX && z > minZ && z < maxZ) {
        const dl = x - minX, dr = maxX - x, dn = z - minZ, df = maxZ - z;
        const m = Math.min(dl, dr, dn, df);
        if (m === dl) x = minX; else if (m === dr) x = maxX;
        else if (m === dn) z = minZ; else z = maxZ;
      }
    }
    return [x, z];
  }

  /* ---------- 朝向辅助：由 yaw 得到前 / 右方向 ---------- */
  function getForward(out: any) { out.set(-Math.sin(euler.y), 0, -Math.cos(euler.y)); return out; }
  function getRight(out: any) { out.set(Math.cos(euler.y), 0, -Math.sin(euler.y)); return out; }

  /* ---------- ★漫游控制：每帧移动 + 头部晃动 + 脚步声 ---------- */
  const fwdV = V3(), rightV = V3();
  function updateMovement(dt: number) {
    const canMove = isMobile || pointerLocked;
    let inF = 0, inR = 0;
    if (canMove) {
      if (keys.has("w") || keys.has("arrowup")) inF += 1;
      if (keys.has("s") || keys.has("arrowdown")) inF -= 1;
      if (keys.has("d") || keys.has("arrowright")) inR += 1;
      if (keys.has("a") || keys.has("arrowleft")) inR -= 1;
      inF += moveInput.y; // 移动端摇杆（+y=前）
      inR += moveInput.x; // 移动端摇杆（+x=右）
    }
    const mag = Math.hypot(inF, inR);
    if (mag > 0.001) {
      const nf = inF / Math.max(mag, 1), nr = inR / Math.max(mag, 1);
      const speed = 2.9 * Math.min(mag, 1);
      getForward(fwdV); getRight(rightV);
      let nx = camera.position.x + (fwdV.x * nf + rightV.x * nr) * speed * dt;
      let nz = camera.position.z + (fwdV.z * nf + rightV.z * nr) * speed * dt;
      [nx, nz] = resolveCollision(nx, nz);
      camera.position.x = nx;
      camera.position.z = nz;
      // 头部晃动
      bobTime += dt * 9.5 * Math.min(mag, 1);
      bobOffset = Math.sin(bobTime) * 0.045;
      // 脚步声：每半个晃动周期一步
      const stepIdx = Math.floor(bobTime / Math.PI);
      if (stepIdx !== lastStep) { lastStep = stepIdx; audio.step(); }
    } else {
      bobOffset *= 1 - Math.min(1, dt * 8); // 平滑回正
    }
    camera.position.y = EYE + bobOffset;

    // 移动端环视：消费滑动增量
    if (lookDelta.x !== 0 || lookDelta.y !== 0) {
      euler.y -= lookDelta.x;
      euler.x -= lookDelta.y;
      euler.x = Math.max(-Math.PI / 2 + 0.05, Math.min(Math.PI / 2 - 0.05, euler.x));
      lookDelta.x = 0; lookDelta.y = 0;
    }
    camera.quaternion.setFromEuler(euler);
  }

  /* ---------- ★物件交互：准星射线检测（屏幕中心）---------- */
  function findInteractable(obj: any): Interactable | null {
    let o = obj;
    while (o) {
      if (o.userData && o.userData.interactId) {
        return interactables.find((i) => i.id === o.userData.interactId) || null;
      }
      o = o.parent;
    }
    return null;
  }
  function updateHover() {
    raycaster.setFromCamera({ x: 0, y: 0 }, camera); // 屏幕正中（准星）
    const hits = raycaster.intersectObjects(interactables.map((i) => i.root), true);
    let found: Interactable | null = null;
    for (const h of hits) {
      const it = findInteractable(h.object);
      if (it) {
        // 限制可交互距离，远处不提示
        it.root.getWorldPosition(tmpV);
        if (camera.position.distanceTo(tmpV) < 3.8) found = it;
        break;
      }
    }
    if (found !== hovered) {
      hovered = found;
      callbacks.onHoverChange?.(found ? { kind: found.kind, id: found.id, label: found.label } : null);
    }
  }

  /* ---------- ★物件交互：聚焦到展品（镜头优雅拉近）---------- */
  function markViewed(id: string) {
    const it = interactables.find((i) => i.id === id);
    if (it) it.viewed = true;
    checkEnding();
  }
  function focusInteractable(it: Interactable) {
    if (!it) return;
    // 窗户：不锁镜头，点击即切换「白日梦」，可反复点
    if (it.kind === "window") {
      setVision(visionIndex + 1);
      markViewed("window");
      return;
    }
    // 其它展品 / 相框：拉近镜头 + 弹卡片
    roamPose.pos.copy(camera.position);
    roamPose.quat.copy(camera.quaternion);
    dummy.position.copy(it.focusPos);
    dummy.lookAt(it.focusLook);
    focusAnim.fromPos.copy(camera.position);
    focusAnim.toPos.copy(it.focusPos);
    focusAnim.fromQuat.copy(camera.quaternion);
    focusAnim.toQuat.copy(dummy.quaternion);
    focusAnim.t = 0; focusAnim.active = true;
    focusAnim.onDone = () => {
      mode = "focus";
      markViewed(it.id);
      callbacks.onFocusChange?.({ kind: it.kind, id: it.id });
    };
    mode = "transition";
    hovered = null;
    callbacks.onHoverChange?.(null);
    if (!isMobile && document.pointerLockElement) document.exitPointerLock(); // 释放鼠标读卡片
  }
  function exitFocus() {
    if (mode !== "focus" && mode !== "transition") return;
    focusAnim.fromPos.copy(camera.position);
    focusAnim.toPos.copy(roamPose.pos);
    focusAnim.fromQuat.copy(camera.quaternion);
    focusAnim.toQuat.copy(roamPose.quat);
    focusAnim.t = 0; focusAnim.active = true;
    focusAnim.onDone = () => {
      mode = "roam";
      callbacks.onFocusChange?.(null);
      if (!isMobile) requestLock(); // 退出卡片后重新锁定指针继续漫游
    };
    mode = "transition";
    callbacks.onFocusChange?.(null);
  }
  const easeInOut = (k: number) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
  function updateFocusAnim(dt: number) {
    focusAnim.t += dt;
    const k = Math.min(1, focusAnim.t / focusAnim.dur);
    const e = easeInOut(k);
    camera.position.lerpVectors(focusAnim.fromPos, focusAnim.toPos, e);
    camera.quaternion.slerpQuaternions(focusAnim.fromQuat, focusAnim.toQuat, e);
    if (k >= 1) {
      focusAnim.active = false;
      const cb = focusAnim.onDone; focusAnim.onDone = null;
      cb && cb();
    }
  }

  /* ---------- ★收集系统：靠近自动拾取 ---------- */
  function checkShardPickup() {
    for (const s of shards) {
      if (s.collected) continue;
      s.group.getWorldPosition(tmpV);
      const d = Math.hypot(camera.position.x - tmpV.x, camera.position.z - tmpV.z);
      if (d < SHARD_PICK_R && Math.abs(camera.position.y - tmpV.y) < 1.6) {
        s.collected = true;
        s.collecting = 0.0001;
        collectedCount += 1;
        audio.chime();
        callbacks.onShardCollected?.(s.id, collectedCount, shards.length);
        checkEnding();
      }
    }
  }

  /* ---------- ★结局触发：集齐碎片 + 浏览完核心展品 → 开门 ---------- */
  function checkEnding() {
    if (endingReady) return;
    const allShards = collectedCount >= shards.length;
    const allViewed = requiredExhibitIds.every((id) =>
      interactables.find((i) => i.id === id)?.viewed,
    );
    if (allShards && allViewed) {
      endingReady = true;
      doorOpening = true; // 门开始缓缓打开（见循环）
      callbacks.onEndingReady?.();
    }
  }
  function checkEndingReach() {
    if (!endingReady || endingReached) return;
    if (camera.position.z > ROOM.halfZ - DOOR_REACH && Math.abs(camera.position.x) < 1.0) {
      endingReached = true;
      callbacks.onEndingReached?.();
    }
  }

  /* =========================================================================
   *  后处理：暖光 Bloom + Vignette（异步加载 addon）
   * ======================================================================= */
  let composer: any = null;
  let bloomPass: any = null;
  // 异步加载后处理管线（不阻塞首帧渲染）
  (async () => {
    try {
      const { EffectComposer } = await loadAddon("postprocessing/EffectComposer.js");
      const { RenderPass } = await loadAddon("postprocessing/RenderPass.js");
      const { UnrealBloomPass } = await loadAddon("postprocessing/UnrealBloomPass.js");
      const { ShaderPass } = await loadAddon("postprocessing/ShaderPass.js");
      composer = new EffectComposer(renderer);
      composer.addPass(new RenderPass(scene, camera));
      bloomPass = new UnrealBloomPass(
        new THREE.Vector2(container.clientWidth, container.clientHeight),
        0.35,  // strength — 微妙暖光晕
        0.6,   // radius
        0.82,  // threshold — 只有较亮区域泛光
      );
      composer.addPass(bloomPass);
      // 简单暗角 shader
      const vignetteShader = {
        uniforms: {
          tDiffuse: { value: null },
          offset: { value: 1.0 },
          darkness: { value: 1.2 },
        },
        vertexShader: `varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
        fragmentShader: `uniform sampler2D tDiffuse;uniform float offset;uniform float darkness;varying vec2 vUv;void main(){vec4 texel=texture2D(tDiffuse,vUv);vec2 uv=(vUv-vec2(0.5))*vec2(offset);float v=clamp(1.0-dot(uv,uv),0.0,1.0);texel.rgb*=mix(1.0-darkness,1.0,v);gl_FragColor=texel;}`,
      };
      const vignettePass = new ShaderPass(vignetteShader);
      composer.addPass(vignettePass);
    } catch (e) {
      console.warn("Post-processing load failed, using basic renderer:", e);
    }
  })();

  /* =========================================================================
   *  动画主循环
   * ======================================================================= */
  let raf = 0;
  let ready = false;
  function animate() {
    raf = requestAnimationFrame(animate);
    const dt = Math.min(clock.getDelta(), 0.05);
    const t = clock.elapsedTime;

    // 碎片：旋转 + 浮动 + 光晕脉动 + 拾取消散动画
    for (const s of shards) {
      if (s.collecting > 0) {
        s.collecting += dt * 1.8;
        const p = Math.min(1, s.collecting);
        s.halo.scale.setScalar(0.6 + p * 1.8);
        s.halo.material.opacity = 0.9 * (1 - p);
        s.core.scale.setScalar(Math.max(0.001, 1 - p));
        s.group.position.y = s.baseY + p * 0.7;
        if (p >= 1) { scene.remove(s.group); s.collecting = 0; }
        continue;
      }
      if (s.collected) continue;
      s.core.rotation.y += dt * 1.2;
      s.core.rotation.x += dt * 0.6;
      s.group.position.y = s.baseY + Math.sin(t * 1.8 + s.baseY) * 0.055;
      const pulse = 0.55 + Math.sin(t * 3 + s.baseY * 4) * 0.15;
      s.halo.scale.setScalar(pulse);
      s.core.material.emissiveIntensity = 2.2 + Math.sin(t * 4) * 0.6;
    }

    // 尘埃缓慢上浮 + 水平漂移（更自然）
    if (dust) {
      const pos = dust.geometry.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        let y = pos.getY(i) + dt * (0.06 + Math.sin(i * 0.1) * 0.02);
        if (y > ROOM.height) y = 0;
        pos.setY(i, y);
        pos.setX(i, pos.getX(i) + Math.sin(t * 0.25 + i * 0.7) * dt * 0.015);
        pos.setZ(i, pos.getZ(i) + Math.cos(t * 0.2 + i * 0.5) * dt * 0.01);
      }
      pos.needsUpdate = true;
    }
    // 体积光轻微呼吸
    godRays.children.forEach((p: any, i: number) => {
      p.material.opacity = 0.04 + Math.sin(t * 0.5 + i * 0.7) * 0.015;
    });

    // 天花板灯轻微闪烁
    if (ceilingLight) {
      ceilingLight.intensity = 0.8 + Math.sin(t * 8) * 0.02 + Math.sin(t * 13) * 0.01;
    }

    // ★结局：门缓缓打开 + 透光
    if (doorOpening && doorAngle > -0.62) {
      doorAngle -= dt * 0.35;
      doorPivot.rotation.y = doorAngle;
      const k = Math.min(1, -doorAngle / 0.62);
      if (doorLightPlane) doorLightPlane.material.opacity = k * 0.9;
      if (doorGlow) doorGlow.intensity = k * 2.4;
    }

    // 状态机
    if (mode === "roam") {
      updateMovement(dt);
      updateHover();
      checkShardPickup();   // ★收集
      checkEndingReach();   // ★结局
    } else if (mode === "transition") {
      updateFocusAnim(dt);
    }

    // 渲染（有后处理用 composer，否则直接渲染）
    if (composer) {
      composer.render();
    } else {
      renderer.render(scene, camera);
    }
    if (!ready) { ready = true; callbacks.onReady?.(); }
  }

  /* =========================================================================
   *  事件监听（键盘 / 鼠标 / 指针锁定 / 缩放）
   * ======================================================================= */
  const onKeyDown = (e: KeyboardEvent) => {
    keys.add(e.key.toLowerCase());
    if (e.key === "Escape" && mode === "focus") exitFocus();
  };
  const onKeyUp = (e: KeyboardEvent) => keys.delete(e.key.toLowerCase());
  const onMouseMove = (e: MouseEvent) => {
    if (!pointerLocked || mode !== "roam") return;
    euler.y -= e.movementX * 0.0022;
    euler.x -= e.movementY * 0.0022;
    euler.x = Math.max(-Math.PI / 2 + 0.05, Math.min(Math.PI / 2 - 0.05, euler.x));
  };
  const onMouseDown = () => {
    if (mode !== "roam") return;
    if (!pointerLocked && !isMobile) { requestLock(); return; } // 点击进入/恢复漫游
    if (pointerLocked && hovered) focusInteractable(hovered);   // ★物件交互：对准并点击
  };
  const onPointerLockChange = () => {
    pointerLocked = document.pointerLockElement === renderer.domElement;
    callbacks.onPointerLockChange?.(pointerLocked);
    if (pointerLocked) audio.resume();
  };
  const onResize = () => {
    const w = container.clientWidth, h = container.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
    if (composer) composer.setSize(w, h);
  };
  function requestLock() {
    audio.resume();
    if (!isMobile) renderer.domElement.requestPointerLock?.();
  }

  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("keyup", onKeyUp);
  document.addEventListener("mousemove", onMouseMove);
  renderer.domElement.addEventListener("mousedown", onMouseDown);
  document.addEventListener("pointerlockchange", onPointerLockChange);
  window.addEventListener("resize", onResize);

  // 启动音频引擎实例
  const audio = createAudio();

  // 启动渲染循环
  animate();

  /* =========================================================================
   *  对外控制句柄（供 React 调用）
   * ======================================================================= */
  return {
    /** 移动端左摇杆：x∈[-1,1] 右为正，y∈[-1,1] 前为正 */
    setMoveInput(x: number, y: number) { moveInput.x = x; moveInput.y = y; },
    /** 移动端右侧滑动环视：传入弧度增量 */
    applyLook(dx: number, dy: number) { lookDelta.x += dx; lookDelta.y += dy; },
    /** ★物件交互：触发当前准星指向物件（移动端「查看」按钮 / 桌面提示点击） */
    interactHovered() { if (hovered && mode === "roam") focusInteractable(hovered); },
    /** 移动端：在屏幕某点直接点按拾取/交互 */
    tapAt(clientX: number, clientY: number) {
      if (mode !== "roam") return;
      const rect = renderer.domElement.getBoundingClientRect();
      const nx = ((clientX - rect.left) / rect.width) * 2 - 1;
      const ny = -((clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera({ x: nx, y: ny }, camera);
      const hits = raycaster.intersectObjects(interactables.map((i) => i.root), true);
      for (const h of hits) {
        const it = findInteractable(h.object);
        if (it) {
          it.root.getWorldPosition(tmpV);
          if (camera.position.distanceTo(tmpV) < 4.2) { focusInteractable(it); }
          break;
        }
      }
    },
    /** 退出聚焦回到漫游（卡片背景点击 / 关闭按钮） */
    exitFocus,
    /** 桌面端：点击进入/恢复漫游（请求指针锁定） */
    requestLock,
    /** 静音切换 */
    setMuted(m: boolean) { audio.setMuted(m); },
    /** 当前是否处于聚焦读卡状态 */
    getMode: () => mode,
    /** 销毁：解绑事件、释放资源 */
    dispose() {
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      document.removeEventListener("mousemove", onMouseMove);
      renderer.domElement.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("pointerlockchange", onPointerLockChange);
      window.removeEventListener("resize", onResize);
      if (document.pointerLockElement) document.exitPointerLock();
      scene.traverse((o: any) => {
        if (o.geometry) o.geometry.dispose?.();
        if (o.material) {
          const mats = Array.isArray(o.material) ? o.material : [o.material];
          mats.forEach((m: any) => { m.map?.dispose?.(); m.dispose?.(); });
        }
      });
      renderer.dispose();
      if (renderer.domElement.parentNode === container) container.removeChild(renderer.domElement);
    },
  };
}

export type RoomController = ReturnType<typeof createMemoryRoom>;
