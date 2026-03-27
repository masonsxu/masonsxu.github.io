// ================================================================
//  compute.wgsl — Liquid Metal 粒子物理模拟（自包含）
//
//  包含全部数学工具函数 + 物理模拟逻辑
//  无外部依赖，可直接通过浏览器 WebGPU 编译
//
//  架构：
//    binding 0  particlesIn   — 上一帧粒子（read）
//    binding 1  particlesOut  — 本帧粒子（read_write）
//    binding 2  params        — 逐帧 uniform
//    binding 3  densityGrid   — 密度网格 atomic（read_write）
//
//  每帧两次 dispatch（同一 command buffer，GPU 自动屏障）：
//    1. buildDensityGrid  — 清零后统计每格粒子数
//    2. simulate          — 读密度 + 物理积分 + 写出
//
//  Ping-pong：JS 侧每帧交换 binding 0/1 的 buffer
// ================================================================

// ═══════════════════════════════════════════════════════════════
//  Section 1: 数学工具函数
// ═══════════════════════════════════════════════════════════════

const PI: f32 = 3.14159265359;
const TAU: f32 = 6.28318530718;

// ————————————————— Hash 函数 —————————————————

fn hash11(n: f32) -> f32 {
  return fract(sin(n * 127.1) * 43758.5453123);
}

fn hash21(p: vec2f) -> f32 {
  return fract(sin(dot(p, vec2f(127.1, 311.7))) * 43758.5453);
}

fn hash22(p: vec2f) -> vec2f {
  let k = vec2f(dot(p, vec2f(127.1, 311.7)),
                dot(p, vec2f(269.5, 183.3)));
  return fract(sin(k) * 43758.5453) * 2.0 - 1.0;
}

// ————————————————— Simplex Noise 2D —————————————————
// 基于 Ashima Arts 参考实现，纯算术，无 LUT
// 全程 f32 运算，避免 i32/f32 混用

fn mod289v2(x: vec2f) -> vec2f { return x - floor(x / 289.0) * 289.0; }
fn mod289v3(x: vec3f) -> vec3f { return x - floor(x / 289.0) * 289.0; }
fn permute3(x: vec3f) -> vec3f { return mod289v3((x * 34.0 + 10.0) * x); }

fn simplexNoise2D(v: vec2f) -> f32 {
  let C = vec4f(
    0.211324865405187,   // (3 - sqrt(3)) / 6
    0.366025403784439,   // (sqrt(3) - 1) / 2
    -0.577350269189626,  // -1 + 2 * C.x
    0.024390243902439    // 1 / 41
  );

  var i = floor(v + dot(v, C.yy));
  let x0 = v - i + dot(i, C.xx);

  let i1 = select(vec2f(0.0, 1.0), vec2f(1.0, 0.0), x0.x > x0.y);

  let x1 = x0 - i1 + C.xx;
  let x2 = x0 + C.zz;

  i = mod289v2(i);
  let p = permute3(
    permute3(i.y + vec3f(0.0, i1.y, 1.0))
           + i.x + vec3f(0.0, i1.x, 1.0)
  );

  var m = max(
    vec3f(0.5) - vec3f(dot(x0, x0), dot(x1, x1), dot(x2, x2)),
    vec3f(0.0)
  );
  m = m * m;
  m = m * m;

  let gx = 2.0 * fract(p * C.www) - 1.0;
  let h = abs(gx) - 0.5;
  let ox = floor(gx + 0.5);
  let a0 = gx - ox;

  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);

  let g = vec3f(
    a0.x * x0.x + h.x * x0.y,
    a0.y * x1.x + h.y * x1.y,
    a0.z * x2.x + h.z * x2.y
  );

  return 130.0 * dot(m, g);
}

// ————————————————— Fractal Brownian Motion —————————————————

fn fbm2D(p: vec2f, octaves: u32, persistence: f32, lacunarity: f32) -> f32 {
  var sum = 0.0;
  var amp = 1.0;
  var freq = 1.0;
  var maxAmp = 0.0;

  for (var i = 0u; i < octaves; i++) {
    sum += amp * simplexNoise2D(p * freq);
    maxAmp += amp;
    amp *= persistence;
    freq *= lacunarity;
  }

  return sum / max(maxAmp, 0.001);
}

// ————————————————— Curl Noise（无散度流场） —————————————————
// curl(psi) = (dpsi/dy, -dpsi/dx)
// 保证流场 incompressible → 粒子不会凭空聚团或消散

fn curlNoise2D(p: vec2f, t: f32) -> vec2f {
  let e = 0.1;

  let q = p + vec2f(t * 0.07, t * 0.03);

  let dpsi_dx = fbm2D(q + vec2f(e, 0.0), 3u, 0.5, 2.0)
              - fbm2D(q - vec2f(e, 0.0), 3u, 0.5, 2.0);
  let dpsi_dy = fbm2D(q + vec2f(0.0, e), 3u, 0.5, 2.0)
              - fbm2D(q - vec2f(0.0, e), 3u, 0.5, 2.0);

  return vec2f(dpsi_dy, -dpsi_dx) / (2.0 * e);
}

// ————————————————— 粘度阻尼 —————————————————

fn applyViscosity(vel: vec2f, viscosity: f32, dt: f32) -> vec2f {
  return vel * exp(-viscosity * dt);
}

// ═══════════════════════════════════════════════════════════════
//  Section 2: 数据结构与 Bindings
// ═══════════════════════════════════════════════════════════════

struct Particle {
  pos: vec2f,
  vel: vec2f,
}

struct Params {
  dt: f32,
  time: f32,
  resolution: vec2f,
  mouse: vec2f,
  mouseForce: f32,
  particleCount: u32,
}

@group(0) @binding(0) var<storage, read>       particlesIn:  array<Particle>;
@group(0) @binding(1) var<storage, read_write>  particlesOut: array<Particle>;
@group(0) @binding(2) var<uniform>              params:       Params;

// ═══════════════════════════════════════════════════════════════
//  Section 3: 模拟常量（Luxury-Slow 配置）
// ═══════════════════════════════════════════════════════════════

const NOISE_SCALE: f32    = 3.0;
const FLOW_SPEED: f32     = 0.12; // 降低速度，实现 luxury-slow
const DETAIL_SCALE: f32   = 9.0;
const DETAIL_WEIGHT: f32  = 0.15;
const TIME_SCALE: f32     = 0.04; // 减缓时间变化

const VISCOSITY_COEFF: f32 = 12.0; // 增加阻尼，使运动更平滑
const MAX_SPEED: f32       = 0.10; // 限制最大速度

const MOUSE_RADIUS: f32   = 0.12;
const MOUSE_STRENGTH: f32 = 0.35; // 降低鼠标强度，更渐进的响应

const BOUNDARY_MARGIN: f32 = 0.02;
const BOUNDARY_FORCE: f32  = 2.0;

// ═══════════════════════════════════════════════════════════════
//  Section 4: 辅助函数
// ═══════════════════════════════════════════════════════════════

fn calcMouseForce(p: vec2f) -> vec2f {
  if (params.mouseForce < 0.001) {
    return vec2f(0.0);
  }

  let aspect = params.resolution.x / max(params.resolution.y, 1.0);
  var delta = p - params.mouse;
  delta.x *= aspect;

  let dist = length(delta);
  if (dist < 0.001 || dist > MOUSE_RADIUS) {
    return vec2f(0.0);
  }

  let falloff = smoothstep(MOUSE_RADIUS, 0.0, dist);
  let dir = delta / dist;
  return dir * falloff * MOUSE_STRENGTH * params.mouseForce;
}

fn boundaryForce(p: vec2f) -> vec2f {
  var f = vec2f(0.0);

  if (p.x < BOUNDARY_MARGIN) {
    f.x += (BOUNDARY_MARGIN - p.x) / BOUNDARY_MARGIN * BOUNDARY_FORCE;
  }
  if (p.x > 1.0 - BOUNDARY_MARGIN) {
    f.x -= (p.x - (1.0 - BOUNDARY_MARGIN)) / BOUNDARY_MARGIN * BOUNDARY_FORCE;
  }
  if (p.y < BOUNDARY_MARGIN) {
    f.y += (BOUNDARY_MARGIN - p.y) / BOUNDARY_MARGIN * BOUNDARY_FORCE;
  }
  if (p.y > 1.0 - BOUNDARY_MARGIN) {
    f.y -= (p.y - (1.0 - BOUNDARY_MARGIN)) / BOUNDARY_MARGIN * BOUNDARY_FORCE;
  }

  return f;
}

// ═══════════════════════════════════════════════════════════════
//  Section 5: Entry Points
// ═══════════════════════════════════════════════════════════════

// 粒子物理模拟
@compute @workgroup_size(256)
fn simulate(@builtin(global_invocation_id) gid: vec3u) {
  let idx = gid.x;
  let count = arrayLength(&particlesIn);
  if (idx >= count) {
    return;
  }

  var pos = particlesIn[idx].pos;
  var vel = particlesIn[idx].vel;
  let dt = params.dt;
  let t = params.time * TIME_SCALE;

  // 1. Curl noise 流场（无散度 → 天然不可压缩，无需 PBD 密度约束）
  let flowBase = curlNoise2D(pos * NOISE_SCALE, t) * FLOW_SPEED;
  let flowDetail = curlNoise2D(pos * DETAIL_SCALE, t * 1.5) * FLOW_SPEED * DETAIL_WEIGHT;
  // 轻微扩散抖动，防止粒子长时间轨迹重合
  let diffusion = vec2f(
    (hash21(vec2f(f32(idx), t * 0.3)) - 0.5),
    (hash21(vec2f(f32(idx) + 99.0, t * 0.3)) - 0.5),
  ) * 0.0003;
  let flowForce = flowBase + flowDetail + diffusion;

  // 2. 鼠标交互
  let mForce = calcMouseForce(pos);

  // 3. 边界回弹
  let bForce = boundaryForce(pos);

  // 4. 半隐式 Euler 积分
  let totalForce = flowForce + mForce + bForce;
  vel += totalForce * dt;

  // 5. 粘度阻尼
  vel = applyViscosity(vel, VISCOSITY_COEFF, dt);

  // 6. 速度限幅
  let speed = length(vel);
  if (speed > MAX_SPEED) {
    vel = vel * (MAX_SPEED / speed);
  }

  // 7. 位置更新 + 硬边界
  pos = clamp(pos + vel * dt, vec2f(0.001), vec2f(0.999));

  // 8. 写出
  particlesOut[idx] = Particle(pos, vel);
}
