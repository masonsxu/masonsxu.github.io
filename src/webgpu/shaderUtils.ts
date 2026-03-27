/**
 * 共享 WGSL 工具函数
 * 纯数学函数，不含任何 binding / struct 声明
 * 用法：拼接到各 shader module 前面
 */

export const SHADER_UTILS_WGSL = /* wgsl */ `
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
    0.211324865405187,
    0.366025403784439,
    -0.577350269189626,
    0.024390243902439
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
`
