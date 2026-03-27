/**
 * NetworkRenderer — 神经网络连线 + 节点/微尘渲染
 *
 * 架构：
 *   - Connection pipeline: instanced thin quad 沿连线方向，行进光脉冲
 *   - Node/Dust pipeline: instanced circle quad，splat texture 软边，深度选色
 *   - 两个 pipeline 共用 rgba16float HDR target（additive blend）
 *   - Dust 复用 node pipeline，draw 时 firstInstance = nodeCount
 *
 * Connection bindings:
 *   binding 0: nodes (storage, read-only)
 *   binding 1: connections (storage, read-only)
 *   binding 2: render uniforms (uniform, 32 bytes)
 *
 * Node bindings:
 *   binding 0: nodes (storage, read-only)
 *   binding 1: splat texture (texture_2d)
 *   binding 2: splat sampler (filtering)
 *   binding 3: render uniforms (uniform, 32 bytes)
 */

import { WebGPUContext } from './WebGPUContext'
import { NeuralNetwork } from './NeuralNetwork'
import { SHADER_UTILS_WGSL } from './shaderUtils'

const NODE_COUNT = 200

const QUAD_OFFSETS_WGSL = /* wgsl */ `
const QUAD_OFFSETS: array<vec2f, 6> = array<vec2f, 6>(
  vec2f(-0.5, -0.5), vec2f( 0.5, -0.5), vec2f(-0.5,  0.5),
  vec2f(-0.5,  0.5), vec2f( 0.5, -0.5), vec2f( 0.5,  0.5),
);
const QUAD_UVS: array<vec2f, 6> = array<vec2f, 6>(
  vec2f(0.0, 1.0), vec2f(1.0, 1.0), vec2f(0.0, 0.0),
  vec2f(0.0, 0.0), vec2f(1.0, 1.0), vec2f(1.0, 0.0),
);
`

export class NetworkRenderer {
  private device: GPUDevice

  // Connection pipeline
  private connPipeline: GPURenderPipeline | null = null
  private connLayout: GPUBindGroupLayout | null = null
  private connBindGroup: GPUBindGroup | null = null

  // Node pipeline
  private nodePipeline: GPURenderPipeline | null = null
  private nodeLayout: GPUBindGroupLayout | null = null
  private nodeBindGroup: GPUBindGroup | null = null

  // Textures
  private splatTexture: GPUTexture | null = null
  private splatSampler: GPUSampler | null = null

  constructor(_ctx: WebGPUContext, private neural: NeuralNetwork) {
    this.device = _ctx.device!
  }

  async init(): Promise<void> {
    this.createSplatTexture()
    await this.createPipelines()
    this.createBindGroups()
  }

  // ————————————————— Splat Texture —————————————————

  private createSplatTexture(): void {
    const size = 64
    const data = new Uint8Array(size * size * 4)

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const idx = (y * size + x) * 4
        const nx = x / size
        const ny = y / size
        const dist = Math.sqrt((nx - 0.5) ** 2 + (ny - 0.5) ** 2) * 2.0
        let alpha = 1.0 - dist
        alpha = Math.max(0, alpha)
        alpha = Math.pow(alpha, 1.5)

        data[idx] = 255
        data[idx + 1] = 255
        data[idx + 2] = 255
        data[idx + 3] = alpha * 255
      }
    }

    this.splatTexture = this.device.createTexture({
      label: 'neural-splat',
      size: [size, size, 1],
      format: 'rgba8unorm',
      usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST,
    })

    this.device.queue.writeTexture(
      { texture: this.splatTexture },
      data,
      { bytesPerRow: size * 4, rowsPerImage: size },
      { width: size, height: size },
    )

    this.splatSampler = this.device.createSampler({
      label: 'neural-splat-sampler',
      addressModeU: 'clamp-to-edge',
      addressModeV: 'clamp-to-edge',
      magFilter: 'linear',
      minFilter: 'linear',
    })
  }

  // ————————————————— Pipelines —————————————————

  private async createPipelines(): Promise<void> {
    // === Connection Pipeline ===
    const connCode = SHADER_UTILS_WGSL + QUAD_OFFSETS_WGSL + /* wgsl */ `

struct Node {
  pos: vec2f,
  vel: vec2f,
  size: f32,
  depth: f32,
  brightness: f32,
  _pad: f32,
}

struct Connection {
  nodeA: f32,
  nodeB: f32,
  strength: f32,
  _pad: f32,
}

struct RenderUniforms {
  pointScale: f32,
  canvasW: f32,
  canvasH: f32,
  time: f32,
  mousePos: vec2f,
  _pad: vec2f,
}

struct ConnVsOut {
  @builtin(position) pos: vec4f,
  @location(0) alongLine: f32,
  @location(1) acrossLine: f32,
  @location(2) strength: f32,
  @location(3) worldPos: vec2f,
  @location(4) connHash: f32,
  @location(5) avgBrightness: f32,
}

@group(0) @binding(0) var<storage, read> nodes: array<Node>;
@group(0) @binding(1) var<storage, read> connections: array<Connection>;
@group(0) @binding(2) var<uniform> uniforms: RenderUniforms;

@vertex
fn vsConnection(@builtin(vertex_index) vid: u32, @builtin(instance_index) iid: u32) -> ConnVsOut {
  let conn = connections[iid];
  let nodeA = nodes[u32(conn.nodeA)];
  let nodeB = nodes[u32(conn.nodeB)];

  // 像素坐标
  let posA = vec2f(nodeA.pos.x * uniforms.canvasW, nodeA.pos.y * uniforms.canvasH);
  let posB = vec2f(nodeB.pos.x * uniforms.canvasW, nodeB.pos.y * uniforms.canvasH);

  let dir = posB - posA;
  let len = length(dir);
  let tangent = dir / max(len, 0.001);
  let normal = vec2f(-tangent.y, tangent.x);

  // 线宽：1.0 + strength * 1.5
  let lineWidth = 1.0 + conn.strength * 1.5;

  // Quad 角落偏移
  let corner = QUAD_OFFSETS[vid];
  let halfLen = len * 0.5;
  let halfWid = lineWidth * 0.5;

  let worldPos = (posA + posB) * 0.5 + tangent * corner.x * halfLen + normal * corner.y * halfWid;

  let clipX = (worldPos.x / uniforms.canvasW) * 2.0 - 1.0;
  let clipY = 1.0 - (worldPos.y / uniforms.canvasH) * 2.0;

  var out: ConnVsOut;
  out.pos = vec4f(clipX, clipY, 0.0, 1.0);
  out.alongLine = corner.x + 0.5;  // 0 at start, 1 at end
  out.acrossLine = corner.y;        // -0.5 to 0.5
  out.strength = conn.strength;
  out.worldPos = worldPos;
  out.connHash = hash11(f32(iid) * 13.7);
  out.avgBrightness = (nodeA.brightness + nodeB.brightness) * 0.5;

  return out;
}

@fragment
fn fsConnection(input: ConnVsOut) -> @location(0) vec4f {
  // 柔性边缘衰减
  let edgeDist = abs(input.acrossLine) * 2.0;
  let edgeAlpha = smoothstep(1.0, 0.2, edgeDist);

  // 鼠标距离增强
  let mousePixel = vec2f(uniforms.mousePos.x * uniforms.canvasW, uniforms.mousePos.y * uniforms.canvasH);
  let mouseDist = length(input.worldPos - mousePixel) / max(uniforms.canvasW, uniforms.canvasH);
  let mouseBoost = smoothstep(0.18, 0.0, mouseDist) * 2.5;

  // 行进光脉冲
  let pulseSpeed = 0.12 + input.connHash * 0.08;
  let pulsePos = fract(uniforms.time * pulseSpeed + input.connHash * 3.0);
  let pulseDist = abs(input.alongLine - pulsePos);
  // 双向脉冲：从两端向中间
  let pulse2Pos = fract(uniforms.time * pulseSpeed * 0.7 + input.connHash * 5.0 + 0.5);
  let pulse2Dist = abs(input.alongLine - pulse2Pos);
  let pulse = smoothstep(0.08, 0.0, pulseDist) * 0.9
             + smoothstep(0.06, 0.0, pulse2Dist) * 0.5;

  // 基础亮度
  let baseBright = input.strength * 0.12 * min(input.avgBrightness, 1.0);

  // 颜色：gold → lightGold → pearl（脉冲时）
  let gold = vec3f(0.831, 0.686, 0.216);
  let lightGold = vec3f(0.949, 0.824, 0.533);
  let pearl = vec3f(0.988, 0.988, 0.988);

  var color = mix(gold, lightGold, pulse * 0.7);
  color = mix(color, pearl, pulse * pulse * 0.4);

  let totalBright = (baseBright + pulse * 0.5 + mouseBoost * 0.15) * edgeAlpha;

  return vec4f(color * totalBright, totalBright * 0.55);
}
`

    const connModule = this.device.createShaderModule({ label: 'conn-shader', code: connCode })
    connModule.getCompilationInfo().then((info) => {
      for (const msg of info.messages) {
        if (msg.type === 'error') console.error(`Connection WGSL [${msg.lineNum}:${msg.linePos}]: ${msg.message}`)
      }
    }).catch(() => {})

    this.connLayout = this.device.createBindGroupLayout({
      label: 'conn-layout',
      entries: [
        { binding: 0, visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT, buffer: { type: 'read-only-storage' } },
        { binding: 1, visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT, buffer: { type: 'read-only-storage' } },
        { binding: 2, visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT, buffer: { type: 'uniform' } },
      ],
    })

    this.connPipeline = this.device.createRenderPipeline({
      label: 'conn-pipeline',
      layout: this.device.createPipelineLayout({ bindGroupLayouts: [this.connLayout] }),
      vertex: { module: connModule, entryPoint: 'vsConnection' },
      fragment: {
        module: connModule,
        entryPoint: 'fsConnection',
        targets: [{
          format: 'rgba16float',
          blend: {
            color: { srcFactor: 'one', dstFactor: 'one' },
            alpha: { srcFactor: 'one', dstFactor: 'one' },
          },
        }],
      },
      primitive: { topology: 'triangle-list' },
    })

    // === Node/Dust Pipeline ===
    const nodeCode = SHADER_UTILS_WGSL + QUAD_OFFSETS_WGSL + /* wgsl */ `

struct Node {
  pos: vec2f,
  vel: vec2f,
  size: f32,
  depth: f32,
  brightness: f32,
  _pad: f32,
}

struct RenderUniforms {
  pointScale: f32,
  canvasW: f32,
  canvasH: f32,
  time: f32,
  mousePos: vec2f,
  _pad: vec2f,
}

const NODE_COUNT: u32 = ${NODE_COUNT}u;

struct NodeVsOut {
  @builtin(position) pos: vec4f,
  @location(0) uv: vec2f,
  @location(1) depth: f32,
  @location(2) brightness: f32,
  @location(3) nodeIdx: f32,
  @location(4) size: f32,
}

@group(0) @binding(0) var<storage, read> nodes: array<Node>;
@group(0) @binding(1) var splatTex: texture_2d<f32>;
@group(0) @binding(2) var splatSamp: sampler;
@group(0) @binding(3) var<uniform> uniforms: RenderUniforms;

@vertex
fn vsNode(@builtin(vertex_index) vid: u32, @builtin(instance_index) iid: u32) -> NodeVsOut {
  let node = nodes[iid];

  let pixelX = node.pos.x * uniforms.canvasW;
  let pixelY = node.pos.y * uniforms.canvasH;

  let size = node.size * uniforms.pointScale * max(node.depth, 0.15);

  let offset = QUAD_OFFSETS[vid] * size;
  let px = pixelX + offset.x;
  let py = pixelY + offset.y;

  let clipX = (px / uniforms.canvasW) * 2.0 - 1.0;
  let clipY = 1.0 - (py / uniforms.canvasH) * 2.0;

  var out: NodeVsOut;
  out.pos = vec4f(clipX, clipY, 0.0, 1.0);
  out.uv = QUAD_UVS[vid];
  out.depth = node.depth;
  out.brightness = node.brightness;
  out.nodeIdx = f32(iid);
  out.size = size;

  return out;
}

@fragment
fn fsNode(input: NodeVsOut) -> @location(0) vec4f {
  let splatAlpha = textureSample(splatTex, splatSamp, input.uv).a;

  // 调色板
  let gold = vec3f(0.831, 0.686, 0.216);
  let lightGold = vec3f(0.949, 0.824, 0.533);
  let amber = vec3f(0.757, 0.498, 0.098);
  let pearl = vec3f(0.988, 0.988, 0.988);
  let muted = vec3f(0.631, 0.631, 0.667);

  // 深度层选色
  var color: vec3f;
  if (input.depth > 0.7) {
    // 前景：亮金 → 珍珠白
    color = mix(gold, pearl, 0.25);
  } else if (input.depth > 0.4) {
    // 中景：浅金
    color = mix(lightGold, gold, 0.35);
  } else {
    // 背景：琥珀 → 暗金
    color = mix(amber, gold, 0.45);
  }

  // 微尘用更暗的颜色
  if (input.nodeIdx >= ${NODE_COUNT}.0) {
    color = mix(amber, muted, 0.5) * 0.4;

    // 微尘闪烁
    let twinklePhase = hash11(input.nodeIdx * 47.3);
    let twinkle = 0.6 + 0.4 * sin(uniforms.time * 0.3 + twinklePhase * TAU);
    color *= twinkle;
  } else {
    // Per-node 色彩变化
    let colorVar = hash11(input.nodeIdx * 31.7);
    color = mix(color, lightGold, colorVar * 0.35);

    // 高亮节点偶尔闪珍珠色
    let pearlChance = hash11(input.nodeIdx * 97.1);
    if (pearlChance > 0.85) {
      color = mix(color, pearl, 0.3);
    }
  }

  // HDR 亮度
  color *= input.brightness;

  // Alpha
  let alpha = splatAlpha * min(input.brightness, 1.0);

  return vec4f(color * alpha, alpha);
}
`

    const nodeModule = this.device.createShaderModule({ label: 'node-shader', code: nodeCode })
    nodeModule.getCompilationInfo().then((info) => {
      for (const msg of info.messages) {
        if (msg.type === 'error') console.error(`Node WGSL [${msg.lineNum}:${msg.linePos}]: ${msg.message}`)
      }
    }).catch(() => {})

    this.nodeLayout = this.device.createBindGroupLayout({
      label: 'node-layout',
      entries: [
        { binding: 0, visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT, buffer: { type: 'read-only-storage' } },
        { binding: 1, visibility: GPUShaderStage.FRAGMENT, texture: { sampleType: 'float' } },
        { binding: 2, visibility: GPUShaderStage.FRAGMENT, sampler: { type: 'filtering' } },
        { binding: 3, visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT, buffer: { type: 'uniform' } },
      ],
    })

    this.nodePipeline = this.device.createRenderPipeline({
      label: 'node-pipeline',
      layout: this.device.createPipelineLayout({ bindGroupLayouts: [this.nodeLayout] }),
      vertex: { module: nodeModule, entryPoint: 'vsNode' },
      fragment: {
        module: nodeModule,
        entryPoint: 'fsNode',
        targets: [{
          format: 'rgba16float',
          blend: {
            color: { srcFactor: 'one', dstFactor: 'one' },
            alpha: { srcFactor: 'one', dstFactor: 'one' },
          },
        }],
      },
      primitive: { topology: 'triangle-list' },
    })
  }

  // ————————————————— Bind Groups —————————————————

  private createBindGroups(): void {
    const nodeBuffer = this.neural.getReadNodeBuffer()
    const connBuffer = this.neural.getConnectionBuffer()
    const renderBuffer = this.neural.getRenderParamsBuffer()

    this.connBindGroup = this.device.createBindGroup({
      label: 'conn-bind',
      layout: this.connLayout!,
      entries: [
        { binding: 0, resource: { buffer: nodeBuffer } },
        { binding: 1, resource: { buffer: connBuffer } },
        { binding: 2, resource: { buffer: renderBuffer } },
      ],
    })

    this.nodeBindGroup = this.device.createBindGroup({
      label: 'node-bind',
      layout: this.nodeLayout!,
      entries: [
        { binding: 0, resource: { buffer: nodeBuffer } },
        { binding: 1, resource: this.splatTexture!.createView() },
        { binding: 2, resource: this.splatSampler! },
        { binding: 3, resource: { buffer: renderBuffer } },
      ],
    })
  }

  /** 每帧重新创建 bind groups（因为 node buffer 在 ping-pong） */
  ensureBindGroups(): void {
    const nodeBuffer = this.neural.getReadNodeBuffer()

    this.connBindGroup = this.device.createBindGroup({
      label: 'conn-bind',
      layout: this.connLayout!,
      entries: [
        { binding: 0, resource: { buffer: nodeBuffer } },
        { binding: 1, resource: { buffer: this.neural.getConnectionBuffer() } },
        { binding: 2, resource: { buffer: this.neural.getRenderParamsBuffer() } },
      ],
    })

    this.nodeBindGroup = this.device.createBindGroup({
      label: 'node-bind',
      layout: this.nodeLayout!,
      entries: [
        { binding: 0, resource: { buffer: nodeBuffer } },
        { binding: 1, resource: this.splatTexture!.createView() },
        { binding: 2, resource: this.splatSampler! },
        { binding: 3, resource: { buffer: this.neural.getRenderParamsBuffer() } },
      ],
    })
  }

  // ————————————————— Render —————————————————

  renderToPass(pass: GPURenderPassEncoder): void {
    if (!this.connPipeline || !this.nodePipeline) return

    this.ensureBindGroups()

    // 1. 连线
    pass.setPipeline(this.connPipeline)
    pass.setBindGroup(0, this.connBindGroup!)
    pass.draw(6, this.neural.connectionCount)

    // 2. 节点
    pass.setPipeline(this.nodePipeline)
    pass.setBindGroup(0, this.nodeBindGroup!)
    pass.draw(6, this.neural.nodeCount)

    // 3. 微尘（firstInstance 偏移到 nodeCount）
    pass.draw(6, this.neural.dustCount, 0, this.neural.nodeCount)
  }

  // ————————————————— Cleanup —————————————————

  destroy(): void {
    this.splatTexture?.destroy()
    this.splatTexture = null
    this.splatSampler = null
    this.connPipeline = null
    this.connLayout = null
    this.connBindGroup = null
    this.nodePipeline = null
    this.nodeLayout = null
    this.nodeBindGroup = null
  }
}
