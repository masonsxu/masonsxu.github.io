/**
 * WebGPU renderer for the neural organism.
 * Three additive pipelines: synapse lines, node glow sprites, background dust.
 * Falls back to null on any failure — caller then uses the 2D renderer.
 */
import { cross, mul, norm, perspective, lookAt, sub, v3, type Vec3 } from "./math";
import type { SceneGraph } from "./scene";
import type { SimParams } from "./sim";

const NODE_SHADER = /* wgsl */ `
struct Globals {
  viewProj: mat4x4f,
  camPos: vec4f,
  pulse: vec4f,
  params: vec4f, // time, aspect, pixelScale, pulseStrength
  res: vec4f,    // w, h, globalEnergy, pad
  camRight: vec4f,
  camUp: vec4f,
  camFwd: vec4f,
};
struct NodeData {
  posEnergy: vec4f, // xyz, energy
  misc: vec4f,      // rgb, sizeScale
};
struct Edge {
  ab: vec4f, // a, b, seed, clusterEnergyRef
};

@group(0) @binding(0) var<uniform> G: Globals;
@group(0) @binding(1) var<storage, read> nodes: array<NodeData>;
@group(0) @binding(2) var<storage, read> edges: array<Edge>;

struct NodeVOut {
  @builtin(position) clip: vec4f,
  @location(0) uv: vec2f,
  @location(1) color: vec3f,
  @location(2) energy: f32,
};

@vertex
fn nodeVS(@builtin(vertex_index) vi: u32, @builtin(instance_index) ii: u32) -> NodeVOut {
  var quad = array<vec2f, 6>(
    vec2f(-1.0, -1.0), vec2f(1.0, -1.0), vec2f(-1.0, 1.0),
    vec2f(-1.0, 1.0), vec2f(1.0, -1.0), vec2f(1.0, 1.0),
  );
  let q = quad[vi];
  let nd = nodes[ii];
  let e = nd.posEnergy.w;
  let sizePx = nd.misc.w * (3.0 + e * 14.0) * G.params.z;

  let c0 = G.viewProj * vec4f(nd.posEnergy.xyz, 1.0);
  let clip = vec4f(c0.xy + q * sizePx * c0.w, c0.z, c0.w);

  var out: NodeVOut;
  out.clip = clip;
  out.uv = q;
  out.color = nd.misc.rgb;
  out.energy = e;
  return out;
}

@fragment
fn nodeFS(inp: NodeVOut) -> @location(0) vec4f {
  let d = length(inp.uv);
  if (d > 1.0) { discard; }
  let core = smoothstep(1.0, 0.0, d);
  let glow = pow(core, 3.0);

  // pulse shell highlight
  let world = inp.clip.xyz / max(inp.clip.w, 0.001);
  let pd = distance(inp.clip.xyz, G.pulse.xyz);
  let page = G.params.x - G.pulse.w;
  var pulseBoost = 0.0;
  if (page > 0.0 && page < 2.5) {
    let wave = page * 34.0;
    pulseBoost = max(0.0, 1.0 - abs(pd - wave) / 12.0) * G.params.w;
  }

  let col = inp.color * (0.42 + inp.energy * 1.6 + pulseBoost * 1.2);
  var alpha = core * 0.7 + glow;
  return vec4f(col * alpha, glow);
}

struct LineVOut {
  @builtin(position) clip: vec4f,
  @location(0) color: vec3f,
  @location(1) intensity: f32,
  @location(2) dist: f32,
};

@vertex
fn lineVS(@builtin(vertex_index) vi: u32) -> LineVOut {
  let ei = vi / 2u;
  let end = vi % 2u;
  let e = edges[ei];
  let ai = u32(e.ab.x);
  let bi = u32(e.ab.y);
  var nd: NodeData;
  if (end == 0u) {
    nd = nodes[ai];
  } else {
    nd = nodes[bi];
  }
  let other: NodeData = nodes[bi];

  let shimmer = 0.5 + 0.5 * sin(G.params.x * 2.6 + e.ab.z * 40.0);
  let energy = (nd.posEnergy.w + other.posEnergy.w) * 0.5;

  // pulse traveling highlight
  let pd = distance(nd.posEnergy.xyz, G.pulse.xyz);
  let page = G.params.x - G.pulse.w;
  var pulseBoost = 0.0;
  if (page > 0.0 && page < 2.5) {
    let wave = page * 34.0;
    pulseBoost = max(0.0, 1.0 - abs(pd - wave) / 14.0) * G.params.w;
  }

  let intensity = clamp(0.06 + energy * 0.55 + shimmer * 0.10 + pulseBoost * 0.9, 0.0, 1.4);
  let color = mix(nd.misc.rgb, other.misc.rgb, 0.5);

  var out: LineVOut;
  out.clip = G.viewProj * vec4f(nd.posEnergy.xyz, 1.0);
  out.color = color;
  out.intensity = intensity;
  out.dist = distance(nd.posEnergy.xyz, G.camPos.xyz);
  return out;
}

@fragment
fn lineFS(inp: LineVOut) -> @location(0) vec4f {
  // distance fog keeps far synapses subtle
  let fog = exp(-inp.dist * 0.011);
  let a = inp.intensity * fog * 0.62;
  return vec4f(inp.color * a, a);
}

struct DustData {
  posSeed: vec4f, // xyz, seed
};

struct DustVOut {
  @builtin(position) clip: vec4f,
  @location(0) fade: f32,
};

@vertex
fn dustVS(@builtin(vertex_index) vi: u32, @builtin(instance_index) ii: u32) -> DustVOut {
  var quad = array<vec2f, 6>(
    vec2f(-1.0, -1.0), vec2f(1.0, -1.0), vec2f(-1.0, 1.0),
    vec2f(-1.0, 1.0), vec2f(1.0, -1.0), vec2f(1.0, 1.0),
  );
  let q = quad[vi];
  let dd = dust[ii];
  let s = dd.posSeed.w;
  let drift = vec3f(
    sin(G.params.x * 0.08 + s * 31.0),
    cos(G.params.x * 0.06 + s * 47.0),
    sin(G.params.x * 0.05 + s * 13.0),
  ) * 2.2;
  let p = dd.posSeed.xyz + drift;
  let c0 = G.viewProj * vec4f(p, 1.0);
  let sizePx = (0.8 + fract(s * 91.7) * 2.2) * G.params.z;
  let clip = vec4f(c0.xy + q * sizePx * c0.w, c0.z, c0.w);
  var out: DustVOut;
  out.clip = clip;
  out.fade = 0.12 + fract(s * 57.3) * 0.5;
  return out;
}

@fragment
fn dustFS(inp: DustVOut) -> @location(0) vec4f {
  let c = vec3f(0.55, 0.65, 0.85) * inp.fade;
  return vec4f(c, 1.0);
}

@group(0) @binding(3) var<storage, read> dust: array<DustData>;

/* ---------- black hole: fullscreen raymarch (Schwarzschild-ish) ---------- */

const PI: f32 = 3.14159265359;

struct QuadOut {
  @builtin(position) clip: vec4f,
  @location(0) uv: vec2f,
};

@vertex
fn quadVS(@builtin(vertex_index) vi: u32) -> QuadOut {
  var quad = array<vec2f, 6>(
    vec2f(-1.0, -1.0), vec2f(1.0, -1.0), vec2f(-1.0, 1.0),
    vec2f(-1.0, 1.0), vec2f(1.0, -1.0), vec2f(1.0, 1.0),
  );
  let q = quad[vi];
  var out: QuadOut;
  out.clip = vec4f(q, 0.0, 1.0);
  out.uv = q * 0.5 + 0.5;
  return out;
}

fn hash21(p: vec2f) -> f32 {
  return fract(sin(dot(p, vec2f(127.1, 311.7))) * 43758.5453);
}

fn starField(dir: vec3f) -> vec3f {
  let uv = vec2f(atan2(dir.z, dir.x) * 0.6, asin(clamp(dir.y, -1.0, 1.0)) * 1.2);
  var col = vec3f(0.0);
  for (var k = 0; k < 3; k = k + 1) {
    let scale = 26.0 + f32(k) * 34.0;
    let g = floor(uv * scale);
    let f = fract(uv * scale);
    let h = hash21(g + vec2f(f32(k) * 7.7, f32(k) * 3.1));
    if (h > 0.982) {
      let sp = vec2f(hash21(g + vec2f(1.3, 9.1)), hash21(g + vec2f(2.7, 4.3)));
      let d = length(f - sp);
      let bright = smoothstep(0.16, 0.0, d) * (h - 0.982) / 0.018;
      let tint = 0.75 + 0.25 * hash21(g + vec2f(5.5, 1.1));
      col += vec3f(tint, tint * 0.94, 1.0) * bright * (0.5 + 0.5 * hash21(g + vec2f(8.2, 2.4)));
    }
  }
  let band = exp(-pow(abs(dir.y + 0.12 * sin(dir.x * 2.0)) * 3.2, 2.0)) * 0.05;
  col += vec3f(0.32, 0.38, 0.62) * band;
  return col;
}

fn diskColor(pos: vec3f, rayDir: vec3f, t: f32) -> vec3f {
  let r = length(pos.xz);
  let din = 13.0;
  let dout = 46.0;
  if (r < din || r > dout) {
    return vec3f(0.0);
  }
  let omega = 8.0 * pow(r, -1.5);
  let ang = atan2(pos.z, pos.x) + t * omega;
  let streakA = hash21(vec2f(ang * 3.1, r * 0.55));
  let streakB = hash21(vec2f(ang * 11.0 + sin(r * 0.7 + t * 0.35) * 2.2, r * 2.1));
  let streak = 0.30 + 0.70 * mix(streakA, streakB, 0.5);
  let heat = pow(clamp(1.0 - (r - din) / (dout - din), 0.0, 1.0), 1.5);
  let cHot = vec3f(1.0, 0.96, 0.86);
  let cMid = vec3f(1.0, 0.70, 0.32);
  let cCool = vec3f(0.72, 0.22, 0.07);
  var col = mix(cCool, cMid, smoothstep(0.0, 0.55, heat));
  col = mix(col, cHot, smoothstep(0.55, 1.0, heat));
  // doppler beaming: tangential velocity toward viewer brightens
  let velDir = normalize(cross(vec3f(0.0, 1.0, 0.0), pos));
  let beta = clamp(0.55 * sqrt(din * 1.4 / r), 0.0, 0.72);
  let toward = dot(velDir, -rayDir);
  var beam = 1.0 / (1.0 - beta * toward);
  beam = clamp(beam * beam * beam, 0.25, 3.2);
  // gravitational dimming near inner edge
  let grav = pow(clamp(r / (r + 5.0), 0.0, 1.0), 1.3);
  let alpha = smoothstep(din, din + 4.0, r) * smoothstep(dout, dout - 13.0, r);
  return col * streak * (0.35 + heat * 2.1) * beam * grav * alpha;
}

fn diskDensity(pos: vec3f) -> f32 {
  let r = length(pos.xz);
  let din = 13.0;
  let dout = 46.0;
  if (r < din || r > dout) {
    return 0.0;
  }
  let thick = 0.8 + 3.6 * (r - din) / (dout - din);
  return exp(-abs(pos.y) / thick * 2.2) * smoothstep(din, din + 4.0, r) * smoothstep(dout, dout - 13.0, r);
}

@fragment
fn bhFS(inp: QuadOut) -> @location(0) vec4f {
  let uvN = (inp.uv - 0.5) * 2.0; // -1..1
  let tanHalf = tan(PI * 0.21);
  let rd = normalize(G.camFwd.xyz + (G.camRight.xyz * uvN.x * G.params.y + G.camUp.xyz * uvN.y) * tanHalf);
  var pos = G.camPos.xyz;
  var dir = rd;
  var col = vec3f(0.0);
  var captured = false;
  let rs = 6.0;
  for (var i = 0; i < 110; i = i + 1) {
    let toC = -pos;
    let d2 = dot(toC, toC);
    let d = sqrt(d2);
    if (d < rs * 1.05) {
      captured = true;
      break;
    }
    let stepSize = clamp(d * 0.16, 0.45, 9.0);
    let bend = normalize(toC) * (rs * 2.6 / max(d2, rs * rs)) * stepSize;
    let nextPos = pos + dir * stepSize + bend;
    // volumetric accretion disk: accumulate density along the bent ray
    let dens = diskDensity(pos);
    if (dens > 0.001) {
      col += diskColor(pos, dir, G.params.x) * dens * stepSize * 0.16;
    }
    dir = normalize(nextPos - pos);
    pos = nextPos;
    if (d > 330.0) {
      break;
    }
  }
  if (!captured) {
    col += starField(dir);
  } else {
    col += vec3f(1.0, 0.62, 0.24) * 0.05;
  }
  return vec4f(col, 1.0);
}
`;

const UPSCALE_SHADER = /* wgsl */ `
struct QuadOutU {
  @builtin(position) clip: vec4f,
  @location(0) uv: vec2f,
};

@vertex
fn quadVSU(@builtin(vertex_index) vi: u32) -> QuadOutU {
  var quad = array<vec2f, 6>(
    vec2f(-1.0, -1.0), vec2f(1.0, -1.0), vec2f(-1.0, 1.0),
    vec2f(-1.0, 1.0), vec2f(1.0, -1.0), vec2f(1.0, 1.0),
  );
  let q = quad[vi];
  var out: QuadOutU;
  out.clip = vec4f(q, 0.0, 1.0);
  out.uv = q * 0.5 + 0.5;
  return out;
}

@group(0) @binding(0) var bhTexU: texture_2d<f32>;
@group(0) @binding(1) var bhSampU: sampler;

@fragment
fn upscaleFSU(inp: QuadOutU) -> @location(0) vec4f {
  return textureSample(bhTexU, bhSampU, inp.uv);
}
`;

export interface FrameData {
  sim: SimParams;
  time: number;
  camPos: Vec3;
  camTarget: Vec3;
  pulse: { origin: Vec3; t0: number; strength: number } | null;
}

const MSAA = 4;

export class NeuralRendererGPU {
  private constructor(
    private device: GPUDevice,
    private ctx: GPUCanvasContext,
    private canvas: HTMLCanvasElement,
    private scene: SceneGraph,
    private pipelineLines: GPURenderPipeline,
    private pipelineNodes: GPURenderPipeline,
    private pipelineDust: GPURenderPipeline,
    private nodeBuf: GPUBuffer,
    private nodeData: Float32Array,
    private edgeBuf: GPUBuffer,
    private dustBuf: GPUBuffer,
    private uniBuf: GPUBuffer,
    private uniData: Float32Array,
    private bind: GPUBindGroup,
    private msaaTex: GPUTexture | null,
    private format: GPUTextureFormat,
    private withBlackhole: boolean,
    private pipelineBH: GPURenderPipeline | null,
    private pipelineUpscale: GPURenderPipeline | null,
    private bhTex: GPUTexture | null,
    private bhBind: GPUBindGroup | null,
  ) {}

  static async create(
    canvas: HTMLCanvasElement,
    scene: SceneGraph,
    dustLayout: "spine" | "sphere" = "spine",
    withBlackhole = false,
  ): Promise<NeuralRendererGPU | null> {
    try {
      if (new URLSearchParams(location.search).has("fallback")) return null;
      if (!("gpu" in navigator) || !navigator.gpu) return null;
      const adapter = await navigator.gpu.requestAdapter({ powerPreference: "high-performance" });
      if (!adapter) return null;
      const device = await adapter.requestDevice();
      const ctx = canvas.getContext("webgpu") as GPUCanvasContext | null;
      if (!ctx) return null;
      const format = navigator.gpu.getPreferredCanvasFormat();

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const cw = Math.max(1, Math.floor(canvas.clientWidth * dpr));
      const ch = Math.max(1, Math.floor(canvas.clientHeight * dpr));
      canvas.width = cw;
      canvas.height = ch;
      ctx.configure({ device, format, alphaMode: "premultiplied" });

      const module = device.createShaderModule({ code: NODE_SHADER, label: "neural" });

      const uniLayout = device.createBindGroupLayout({
        label: "neural-bgl",
        entries: [
          { binding: 0, visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT, buffer: { type: "uniform" } },
          { binding: 1, visibility: GPUShaderStage.VERTEX, buffer: { type: "read-only-storage" } },
          { binding: 2, visibility: GPUShaderStage.VERTEX, buffer: { type: "read-only-storage" } },
          { binding: 3, visibility: GPUShaderStage.VERTEX, buffer: { type: "read-only-storage" } },
        ],
      });
      const layout = device.createPipelineLayout({ bindGroupLayouts: [uniLayout] });

      const additive: GPUBlendComponent = { srcFactor: "one", dstFactor: "one", operation: "add" };
      const blendAdd: GPUBlendState = { color: additive, alpha: additive };

      const makePipeline = (vertex: string, frag: string, topology: GPUPrimitiveTopology, strip: boolean) =>
        device.createRenderPipeline({
          label: `pipe-${frag}`,
          layout,
          vertex: { module, entryPoint: vertex },
          fragment: { module, entryPoint: frag, targets: [{ format, blend: blendAdd }] },
          primitive: { topology, stripIndexFormat: strip ? "uint16" : undefined },
          multisample: { count: MSAA },
        });

      const pipelineLines = makePipeline("lineVS", "lineFS", "line-list", false);
      const pipelineNodes = makePipeline("nodeVS", "nodeFS", "triangle-list", false);
      const pipelineDust = makePipeline("dustVS", "dustFS", "triangle-list", false);

      // black hole fullscreen pass + upscale compositor (no blend — replaces background)
      let pipelineBH: GPURenderPipeline | null = null;
      let pipelineUpscale: GPURenderPipeline | null = null;
      if (withBlackhole) {
        pipelineBH = device.createRenderPipeline({
          label: "pipe-bh",
          layout,
          vertex: { module, entryPoint: "quadVS" },
          fragment: { module, entryPoint: "bhFS", targets: [{ format }] },
          primitive: { topology: "triangle-list" },
        });
        const upscaleBgl = device.createBindGroupLayout({
          entries: [
            { binding: 0, visibility: GPUShaderStage.FRAGMENT, texture: { sampleType: "float" } },
            { binding: 1, visibility: GPUShaderStage.FRAGMENT, sampler: { type: "filtering" } },
          ],
        });
        const moduleUp = device.createShaderModule({ code: UPSCALE_SHADER, label: "upscale" });
        pipelineUpscale = device.createRenderPipeline({
          label: "pipe-upscale",
          layout: device.createPipelineLayout({ bindGroupLayouts: [upscaleBgl] }),
          vertex: { module: moduleUp, entryPoint: "quadVSU" },
          fragment: { module: moduleUp, entryPoint: "upscaleFSU", targets: [{ format }] },
          primitive: { topology: "triangle-list" },
          multisample: { count: MSAA },
        });
      }

      // node buffer: posEnergy + misc per node (8 floats)
      const nodeData = new Float32Array(scene.nodeCount * 8);
      const nodeBuf = device.createBuffer({
        size: nodeData.byteLength,
        usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
      });

      // edges: 4 floats per edge
      const edgeData = new Float32Array(scene.edgeCount * 4);
      for (let e = 0; e < scene.edgeCount; e++) {
        edgeData[e * 4] = scene.edges[e * 2] ?? 0;
        edgeData[e * 4 + 1] = scene.edges[e * 2 + 1] ?? 0;
        edgeData[e * 4 + 2] = scene.edgeSeed[e] ?? 0;
        edgeData[e * 4 + 3] = 0;
      }
      const edgeBuf = device.createBuffer({
        size: edgeData.byteLength,
        usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
      });
      device.queue.writeBuffer(edgeBuf, 0, edgeData);

      // dust: near motes + far starfield
      const DUST = 1600;
      const dustData = new Float32Array(DUST * 4);
      for (let i = 0; i < DUST; i++) {
        const s = (i * 2654435761 % 4294967296) / 4294967296;
        const far = i % 5 >= 2; // 60% far stars, 40% near motes
        if (dustLayout === "sphere") {
          const a2 = s * Math.PI * 2;
          const a1 = (((i * 8093) % 1000) / 1000) * Math.PI;
          const r = far ? 240 + (((i * 3571) % 1000) / 1000) * 180 : 30 + (((i * 3571) % 1000) / 1000) * 180;
          dustData[i * 4] = Math.sin(a1) * Math.cos(a2) * r;
          dustData[i * 4 + 1] = Math.cos(a1) * r * 0.75;
          dustData[i * 4 + 2] = Math.sin(a1) * Math.sin(a2) * r;
          dustData[i * 4 + 3] = s * 10;
        } else {
          if (far) {
            const a2 = s * Math.PI * 2;
            const a1 = (((i * 8093) % 1000) / 1000) * Math.PI;
            const r = 200 + (((i * 3571) % 1000) / 1000) * 200;
            dustData[i * 4] = Math.sin(a1) * Math.cos(a2) * r;
            dustData[i * 4 + 1] = Math.cos(a1) * r * 0.7;
            dustData[i * 4 + 2] = -130 + Math.sin(a1) * Math.sin(a2) * r;
            dustData[i * 4 + 3] = s * 10;
          } else {
            const a = s * Math.PI * 2;
            const r = 20 + ((i * 7919) % 1000) / 1000 * 90;
            dustData[i * 4] = Math.cos(a) * r;
            dustData[i * 4 + 1] = ((i * 4371) % 1000) / 1000 * 120 - 60;
            dustData[i * 4 + 2] = -((i * 911) % 2900) / 10 - 5;
            dustData[i * 4 + 3] = s * 10;
          }
        }
      }
      const dustBuf = device.createBuffer({
        size: dustData.byteLength,
        usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
      });
      device.queue.writeBuffer(dustBuf, 0, dustData);

      const uniData = new Float32Array(44); // 176 bytes
      const uniBuf = device.createBuffer({
        size: 176,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
      });

      const bind = device.createBindGroup({
        layout: uniLayout,
        entries: [
          { binding: 0, resource: { buffer: uniBuf } },
          { binding: 1, resource: { buffer: nodeBuf } },
          { binding: 2, resource: { buffer: edgeBuf } },
          { binding: 3, resource: { buffer: dustBuf } },
        ],
      });

      device.addEventListener?.("uncapturederror", () => {});

      return new NeuralRendererGPU(
        device, ctx, canvas, scene,
        pipelineLines, pipelineNodes, pipelineDust,
        nodeBuf, nodeData, edgeBuf, dustBuf, uniBuf, uniData,
        bind, null, format, withBlackhole, pipelineBH, pipelineUpscale, null, null,
      );
    } catch (err) {
      console.warn("[neural] WebGPU init failed, falling back to 2D", err);
      return null;
    }
  }

  resize(): void {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.floor(this.canvas.clientWidth * dpr);
    const h = Math.floor(this.canvas.clientHeight * dpr);
    if (w === 0 || h === 0) return;
    if (this.canvas.width !== w || this.canvas.height !== h || !this.msaaTex) {
      this.canvas.width = w;
      this.canvas.height = h;
      this.msaaTex?.destroy();
      this.msaaTex = this.device.createTexture({
        size: [w, h],
        sampleCount: MSAA,
        format: this.format,
        usage: GPUTextureUsage.RENDER_ATTACHMENT,
      });
      this.ctx.configure({ device: this.device, format: this.format, alphaMode: "premultiplied" });
    }
    if (this.withBlackhole && this.pipelineUpscale) {
      const bw = Math.max(1, w >> 1);
      const bh = Math.max(1, h >> 1);
      if (!this.bhTex || this.bhTex.width !== bw || this.bhTex.height !== bh) {
        this.bhTex?.destroy();
        this.bhTex = this.device.createTexture({
          size: [bw, bh],
          format: this.format,
          usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING,
        });
        const bgl = this.pipelineUpscale.getBindGroupLayout(0);
        const sampler = this.device.createSampler({ magFilter: "linear", minFilter: "linear" });
        this.bhBind = this.device.createBindGroup({
          layout: bgl,
          entries: [
            { binding: 0, resource: this.bhTex.createView() },
            { binding: 1, resource: sampler },
          ],
        });
      }
    }
  }

  render(frame: FrameData): void {
    const { sim, time, camPos, camTarget, pulse } = frame;
    const w = this.canvas.width || 1;
    const h = this.canvas.height || 1;

    // pack node buffer
    const nd = this.nodeData;
    const clusters = this.scene.clusters;
    for (let i = 0; i < this.scene.nodeCount; i++) {
      const i3 = i * 3;
      const i8 = i * 8;
      const ci = this.scene.nodeCluster[i] ?? 0;
      const c = clusters[ci]?.color ?? [1, 1, 1];
      nd[i8] = sim.pos[i3] ?? 0;
      nd[i8 + 1] = sim.pos[i3 + 1] ?? 0;
      nd[i8 + 2] = sim.pos[i3 + 2] ?? 0;
      nd[i8 + 3] = sim.energy[i] ?? 0;
      nd[i8 + 4] = c[0];
      nd[i8 + 5] = c[1];
      nd[i8 + 6] = c[2];
      nd[i8 + 7] = i % 9 === 0 ? 2.8 : 1.0; // hub nodes render larger
    }
    this.device.queue.writeBuffer(this.nodeBuf, 0, nd);

    // camera
    const aspect = w / h;
    const proj = perspective(Math.PI * 0.42, aspect, 0.1, 1000);
    const view = lookAt(camPos, camTarget, v3(0, 1, 0));
    const viewProj = mul(proj, view);

    // camera basis for the raymarch pass
    const fwd = norm(sub(camTarget, camPos));
    const right = norm(cross(fwd, v3(0, 1, 0)));
    const upv = cross(right, fwd);

    // globals
    const u = this.uniData;
    u.set(viewProj, 0);
    u.set([camPos[0], camPos[1], camPos[2], 0], 16);
    const p = pulse ?? { origin: [0, 0, 0] as Vec3, t0: -10, strength: 0 };
    u.set([p.origin[0], p.origin[1], p.origin[2], p.t0], 20);
    u.set([time, aspect, 2 / h, p.strength], 24);
    u.set([w, h, 0, 0], 28);
    u.set([right[0], right[1], right[2], 0], 32);
    u.set([upv[0], upv[1], upv[2], 0], 36);
    u.set([fwd[0], fwd[1], fwd[2], 0], 40);
    this.device.queue.writeBuffer(this.uniBuf, 0, u);

    const msaaView = this.msaaTex?.createView();
    if (!msaaView) return;

    const enc = this.device.createCommandEncoder({ label: "neural-enc" });

    if (this.withBlackhole && this.pipelineBH && this.bhTex && this.pipelineUpscale && this.bhBind) {
      // pass 1: raymarch black hole at half resolution
      const bhPass = enc.beginRenderPass({
        colorAttachments: [{
          view: this.bhTex.createView(),
          clearValue: { r: 0, g: 0, b: 0, a: 1 },
          loadOp: "clear",
          storeOp: "store",
        }],
      });
      bhPass.setPipeline(this.pipelineBH);
      bhPass.setBindGroup(0, this.bind);
      bhPass.draw(6);
      bhPass.end();

      // pass 2: upscale into msaa target (replaces background)
      const upPass = enc.beginRenderPass({
        colorAttachments: [{
          view: msaaView,
          clearValue: { r: 0, g: 0, b: 0, a: 1 },
          loadOp: "clear",
          storeOp: "store",
        }],
      });
      upPass.setPipeline(this.pipelineUpscale);
      upPass.setBindGroup(0, this.bhBind);
      upPass.draw(6);
      upPass.end();
    }

    const pass = enc.beginRenderPass({
      colorAttachments: [
        {
          view: msaaView,
          resolveTarget: this.ctx.getCurrentTexture().createView(),
          clearValue: { r: 0, g: 0, b: 0, a: 1 },
          loadOp: this.withBlackhole && this.bhTex ? "load" : "clear",
          storeOp: "store",
        },
      ],
    });

    pass.setBindGroup(0, this.bind);

    pass.setPipeline(this.pipelineDust);
    pass.draw(6, 1600);

    pass.setPipeline(this.pipelineLines);
    pass.draw(this.scene.edgeCount * 2);

    pass.setPipeline(this.pipelineNodes);
    pass.draw(6, this.scene.nodeCount);

    pass.end();
    this.device.queue.submit([enc.finish()]);
  }

  destroy(): void {
    this.msaaTex?.destroy();
    this.bhTex?.destroy();
    this.nodeBuf.destroy();
    this.edgeBuf.destroy();
    this.dustBuf.destroy();
    this.uniBuf.destroy();
  }
}
