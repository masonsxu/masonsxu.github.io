import * as THREE from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'

export function createGradientMap(steps = 4): THREE.DataTexture {
  const data = new Uint8Array(steps * 4)
  const colors = [
    [255, 220, 180],
    [220, 180, 140],
    [160, 130, 100],
    [100, 80, 65],
  ]
  for (let i = 0; i < steps; i++) {
    const c = colors[Math.min(i, colors.length - 1)]!
    data[i * 4] = c[0]
    data[i * 4 + 1] = c[1]
    data[i * 4 + 2] = c[2]
    data[i * 4 + 3] = 255
  }
  const tex = new THREE.DataTexture(data, steps, 1, THREE.RGBAFormat)
  tex.minFilter = THREE.NearestFilter
  tex.magFilter = THREE.NearestFilter
  tex.needsUpdate = true
  return tex
}

const DepthEdgeShader: THREE.ShaderMaterialParameters = {
  uniforms: {
    tDiffuse: { value: null },
    tDepth: { value: null },
    cameraNear: { value: 0.1 },
    cameraFar: { value: 500 },
    resolution: { value: new THREE.Vector2(1024, 768) },
    outlineColor: { value: new THREE.Color(0x0a0a0a) },
    threshold: { value: 0.03 },
    thickness: { value: 1.0 },
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform sampler2D tDepth;
    uniform float cameraNear;
    uniform float cameraFar;
    uniform vec2 resolution;
    uniform vec3 outlineColor;
    uniform float threshold;
    uniform float thickness;

    varying vec2 vUv;

    float linearizeDepth(float depth) {
      return 2.0 * cameraNear / (cameraFar + cameraNear - depth * (cameraFar - cameraNear));
    }

    void main() {
      vec4 color = texture2D(tDiffuse, vUv);
      vec2 texel = thickness / resolution;

      float center = texture2D(tDepth, vUv).r;
      float centerLinear = linearizeDepth(center);

      float edge = 0.0;
      for (int x = -1; x <= 1; x++) {
        for (int y = -1; y <= 1; y++) {
          if (x == 0 && y == 0) continue;
          vec2 uv = vUv + vec2(float(x), float(y)) * texel;
          float d = texture2D(tDepth, uv).r;
          float ld = linearizeDepth(d);
          if (abs(centerLinear - ld) > threshold) {
            edge = 1.0;
            break;
          }
        }
        if (edge > 0.5) break;
      }

      vec3 finalColor = mix(color.rgb, outlineColor, edge * 0.7);
      gl_FragColor = vec4(finalColor, color.a);
    }
  `,
}

class DepthPass {
  readonly renderTarget: THREE.WebGLRenderTarget
  private scene: THREE.Scene
  private camera: THREE.Camera
  private width: number
  private height: number

  constructor(width: number, height: number, scene: THREE.Scene, camera: THREE.Camera) {
    this.width = width
    this.height = height
    this.scene = scene
    this.camera = camera
    this.renderTarget = new THREE.WebGLRenderTarget(width, height)
    this.renderTarget.depthTexture = new THREE.DepthTexture(width, height)
    this.renderTarget.depthTexture.format = THREE.DepthFormat
  }

  render(renderer: THREE.WebGLRenderer): void {
    const current = renderer.getRenderTarget()
    renderer.setRenderTarget(this.renderTarget)
    renderer.render(this.scene, this.camera)
    renderer.setRenderTarget(current)
  }

  setSize(w: number, h: number): void {
    this.width = w
    this.height = h
    this.renderTarget.setSize(w, h)
    if (this.renderTarget.depthTexture) {
      this.renderTarget.depthTexture.image.width = w
      this.renderTarget.depthTexture.image.height = h
    }
  }

  dispose(): void {
    this.renderTarget.dispose()
  }
}

export class ToonPipeline {
  readonly composer: EffectComposer
  private readonly depthPass: DepthPass
  private readonly outlinePass: ShaderPass
  private readonly bloomPass: UnrealBloomPass
  private readonly renderPass: RenderPass

  constructor(renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.Camera) {
    const w = renderer.domElement.width
    const h = renderer.domElement.height

    this.composer = new EffectComposer(renderer)

    this.renderPass = new RenderPass(scene, camera)
    this.composer.addPass(this.renderPass)

    this.bloomPass = new UnrealBloomPass(
      new THREE.Vector2(w, h),
      0.2,
      0.5,
      0.85,
    )
    this.composer.addPass(this.bloomPass)

    this.depthPass = new DepthPass(w, h, scene, camera)

    const outlineUniforms = THREE.UniformsUtils.clone(DepthEdgeShader.uniforms!)
    this.outlinePass = new ShaderPass({
      uniforms: outlineUniforms,
      vertexShader: DepthEdgeShader.vertexShader!,
      fragmentShader: DepthEdgeShader.fragmentShader!,
    })
    outlineUniforms['resolution'].value.set(w, h)
    outlineUniforms['cameraNear'].value = camera instanceof THREE.PerspectiveCamera ? camera.near : 0.1
    outlineUniforms['cameraFar'].value = camera instanceof THREE.PerspectiveCamera ? camera.far : 500
    this.composer.addPass(this.outlinePass)

    const outputPass = new OutputPass()
    this.composer.addPass(outputPass)
  }

  render(): void {
    this.depthPass.render(this.composer.renderer)
    this.outlinePass.uniforms['tDepth'].value = this.depthPass.renderTarget.depthTexture
    this.composer.render()
  }

  setSize(w: number, h: number): void {
    this.composer.setSize(w, h)
    this.depthPass.setSize(w, h)
    this.bloomPass.resolution.set(w, h)
    this.outlinePass.uniforms['resolution'].value.set(w, h)
  }

  dispose(): void {
    this.composer.dispose()
    this.depthPass.dispose()
  }
}
