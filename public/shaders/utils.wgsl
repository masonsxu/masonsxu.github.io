// ================================================================
//  utils.wgsl — Liquid Metal 数学工具库
//  纯函数，不含任何 binding / struct 声明
//  用法：JS 侧拼接到 compute.wgsl 或 render.wgsl 前面
// ================================================================

const PI: f32 = 3.14159265359;
const TAU: f32 = 6.28318530718;

// ————————————————— Hash 函数 —————————————————

/// 1D -> 1D 伪随机
fn hash11(n: f32) -> f32 {
  return fract(sin(n * 127.1) * 43758.5453123);
}

/// 2D -> 1D 伪随机
fn hash21(p: vec2f) -> f32 {
  return fract(sin(dot(p, vec2f(127.1, 311.7))) * 43758.5453);
}

/// 2D -> 2D 伪随机（可用于梯度向量）
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
  // Skew / unskew 常量
  let C = vec4f(
    0.211324865405187,   // (3 - sqrt(3)) / 6
    0.366025403784439,   // (sqrt(3) - 1) / 2
    -0.577350269189626,  // -1 + 2 * C.x
    0.024390243902439    // 1 / 41
  );

  // 第一顶点：skew 到单纯形网格
  var i = floor(v + dot(v, C.yy));
  let x0 = v - i + dot(i, C.xx);

  // 判断所在单纯形三角形
  let i1 = select(vec2f(0.0, 1.0), vec2f(1.0, 0.0), x0.x > x0.y);

  // 其余两个顶点偏移
  let x1 = x0 - i1 + C.xx;
  let x2 = x0 + C.zz;

  // 置换 hash
  i = mod289v2(i);
  let p = permute3(
    permute3(i.y + vec3f(0.0, i1.y, 1.0))
           + i.x + vec3f(0.0, i1.x, 1.0)
  );

  // 径向衰减（四次方）
  var m = max(
    vec3f(0.5) - vec3f(dot(x0, x0), dot(x1, x1), dot(x2, x2)),
    vec3f(0.0)
  );
  m = m * m;
  m = m * m;

  // 从置换值导出梯度（避免 LUT）
  let gx = 2.0 * fract(p * C.www) - 1.0;
  let h = abs(gx) - 0.5;
  let ox = floor(gx + 0.5);
  let a0 = gx - ox;

  // 归一化修正
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);

  // 加权求和
  let g = vec3f(
    a0.x * x0.x + h.x * x0.y,
    a0.y * x1.x + h.y * x1.y,
    a0.z * x2.x + h.z * x2.y
  );

  return 130.0 * dot(m, g); // 输出范围 ≈ [-1, 1]
}

// ————————————————— Fractal Brownian Motion —————————————————
// 叠加多层 simplex noise 产生自相似细节
// persistence: 振幅衰减率 (0.5 = 标准)
// lacunarity: 频率递增率 (2.0 = 标准)

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

  return sum / max(maxAmp, 0.001); // 归一化到 [-1, 1]
}

// ————————————————— Curl Noise（无散度流场） —————————————————
// curl(psi) = (dpsi/dy, -dpsi/dx)
// 保证流场 incompressible → 粒子不会凭空聚团或消散
// 液态金属的关键：物理上不存在"源"和"汇"

fn curlNoise2D(p: vec2f, t: f32) -> vec2f {
  let e = 0.1; // 有限差分步长

  // 极慢的时间漂移 → 奢华感
  let q = p + vec2f(t * 0.07, t * 0.03);

  // 标量势 psi = fbm 的中心差分
  let dpsi_dx = fbm2D(q + vec2f(e, 0.0), 3u, 0.5, 2.0)
              - fbm2D(q - vec2f(e, 0.0), 3u, 0.5, 2.0);
  let dpsi_dy = fbm2D(q + vec2f(0.0, e), 3u, 0.5, 2.0)
              - fbm2D(q - vec2f(0.0, e), 3u, 0.5, 2.0);

  return vec2f(dpsi_dy, -dpsi_dx) / (2.0 * e);
}

// ————————————————— 粘度阻尼 —————————————————
// 指数衰减：v' = v * exp(-mu * dt)
// 高 viscosity → "稠"而"重"的液态金属运动

fn applyViscosity(vel: vec2f, viscosity: f32, dt: f32) -> vec2f {
  return vel * exp(-viscosity * dt);
}
