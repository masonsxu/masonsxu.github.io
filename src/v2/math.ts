/** Minimal vec3 / mat4 / spline math for the neural organism renderer. */

export type Vec3 = [number, number, number];

export function v3(x = 0, y = 0, z = 0): Vec3 {
  return [x, y, z];
}

export function add(a: Vec3, b: Vec3): Vec3 {
  return [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
}

export function sub(a: Vec3, b: Vec3): Vec3 {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}

export function scale(a: Vec3, s: number): Vec3 {
  return [a[0] * s, a[1] * s, a[2] * s];
}

export function lerp(a: Vec3, b: Vec3, t: number): Vec3 {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
}

export function len(a: Vec3): number {
  return Math.hypot(a[0], a[1], a[2]);
}

export function norm(a: Vec3): Vec3 {
  const l = len(a) || 1;
  return [a[0] / l, a[1] / l, a[2] / l];
}

export function cross(a: Vec3, b: Vec3): Vec3 {
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ];
}

export function dot(a: Vec3, b: Vec3): number {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

/** Column-major 4x4 matrix (WebGPU / WGSL convention). */
export type Mat4 = Float32Array;

export function perspective(fovY: number, aspect: number, near: number, far: number): Mat4 {
  const f = 1 / Math.tan(fovY / 2);
  const nf = 1 / (near - far);
  const m = new Float32Array(16);
  m[0] = f / aspect;
  m[5] = f;
  m[10] = far * nf;
  m[11] = -1;
  m[14] = far * near * nf;
  return m;
}

export function lookAt(eye: Vec3, center: Vec3, up: Vec3): Mat4 {
  const zAxis = norm(sub(eye, center));
  const xAxis = norm(cross(up, zAxis));
  const yAxis = cross(zAxis, xAxis);
  const m = new Float32Array(16);
  m[0] = xAxis[0]; m[1] = yAxis[0]; m[2] = zAxis[0]; m[3] = 0;
  m[4] = xAxis[1]; m[5] = yAxis[1]; m[6] = zAxis[1]; m[7] = 0;
  m[8] = xAxis[2]; m[9] = yAxis[2]; m[10] = zAxis[2]; m[11] = 0;
  m[12] = -dot(xAxis, eye);
  m[13] = -dot(yAxis, eye);
  m[14] = -dot(zAxis, eye);
  m[15] = 1;
  return m;
}

export function mul(a: Mat4, b: Mat4): Mat4 {
  const out = new Float32Array(16);
  for (let c = 0; c < 4; c++) {
    for (let r = 0; r < 4; r++) {
      out[c * 4 + r] =
        (a[r] ?? 0) * (b[c * 4] ?? 0) +
        (a[4 + r] ?? 0) * (b[c * 4 + 1] ?? 0) +
        (a[8 + r] ?? 0) * (b[c * 4 + 2] ?? 0) +
        (a[12 + r] ?? 0) * (b[c * 4 + 3] ?? 0);
    }
  }
  return out;
}

/** Catmull-Rom interpolation over a list of control points. */
export function catmullRom(points: Vec3[], t: number): Vec3 {
  const n = points.length;
  const zero: Vec3 = [0, 0, 0];
  if (n === 0) return zero;
  if (n === 1) return points[0] ?? zero;
  const clamped = Math.min(Math.max(t, 0), 1) * (n - 1);
  const i = Math.min(Math.floor(clamped), n - 2);
  const f = clamped - i;
  const p0 = points[Math.max(i - 1, 0)] ?? zero;
  const p1 = points[i] ?? zero;
  const p2 = points[i + 1] ?? zero;
  const p3 = points[Math.min(i + 2, n - 1)] ?? zero;
  const out: Vec3 = [0, 0, 0];
  for (let k = 0; k < 3; k++) {
    const v0 = p0[k] ?? 0, v1 = p1[k] ?? 0, v2 = p2[k] ?? 0, v3 = p3[k] ?? 0;
    out[k] =
      0.5 *
      (2 * v1 +
        (-v0 + v2) * f +
        (2 * v0 - 5 * v1 + 4 * v2 - v3) * f * f +
        (-v0 + 3 * v1 - 3 * v2 + v3) * f * f * f);
  }
  return out;
}

/** Deterministic hash → [0,1). Never use Math.random in render paths. */
export function hash1(n: number): number {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
}

export function hash3(n: number): Vec3 {
  return [hash1(n), hash1(n + 17.31), hash1(n + 41.73)];
}

/** Cheap smooth pseudo-noise in [-1,1]. */
export function noise1(x: number, seed = 0): number {
  const i = Math.floor(x);
  const f = x - i;
  const u = f * f * (3 - 2 * f);
  const a = hash1(i + seed * 57.3) * 2 - 1;
  const b = hash1(i + 1 + seed * 57.3) * 2 - 1;
  return a + (b - a) * u;
}

/** Points on a fibonacci sphere of given radius. */
export function fibSphere(i: number, total: number, radius: number): Vec3 {
  const k = i + 0.5;
  const phi = Math.PI * (3 - Math.sqrt(5));
  const y = 1 - (k / total) * 2;
  const r = Math.sqrt(Math.max(0, 1 - y * y));
  const theta = phi * k;
  return [Math.cos(theta) * r * radius, y * radius, Math.sin(theta) * r * radius];
}
