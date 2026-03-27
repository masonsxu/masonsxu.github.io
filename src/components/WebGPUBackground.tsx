import { useEffect, useRef, useState } from 'react'
import { FlowField } from '../webgpu/FlowField'
import { ParticleSystem } from '../webgpu/ParticleSystem'
import { BloomEffect } from '../webgpu/BloomEffect'
import { PostFX } from '../webgpu/PostFX'
import { UIInteractionLayer } from '../webgpu/UIInteractionLayer'
import { WebGPUContext } from '../webgpu/WebGPUContext'
import { PerformanceMonitor } from '../webgpu/PerformanceMonitor'

export default function WebGPUBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [mounted, setMounted] = useState(false)

  // Defer mounting to allow first paint
  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true)
    }, 200)
    return () => clearTimeout(timer)
  }, [])

  // Initialize WebGPU when mounted
  useEffect(() => {
    if (!mounted || !canvasRef.current) return

    let rafId = 0
    let disposed = false

    const initWebGPU = async () => {
      try {
        const canvasElement = canvasRef.current!
        const context = new WebGPUContext(canvasElement)
        await context.init()

        if (disposed) { context.destroy(); return }

        // Performance monitor
        const performanceMonitor = new PerformanceMonitor(60)

        // UI interaction (pure CPU state, no async)
        const uiInteraction = new UIInteractionLayer(() => ({
          width: context.width,
          height: context.height,
        }))

        // Flow field
        const flowField = new FlowField(context)
        await flowField.init()
        if (disposed) { flowField.destroy(); context.destroy(); return }

        // Particle system
        const initialParticleCount = performanceMonitor.getRecommendedParticleCount()
        const particleSystem = new ParticleSystem(context, initialParticleCount)
        await particleSystem.init()
        if (disposed) { particleSystem.destroy(); flowField.destroy(); context.destroy(); return }

        // Bloom effect
        const bloomEffect = new BloomEffect(context)
        await bloomEffect.init()
        if (disposed) { bloomEffect.destroy(); particleSystem.destroy(); flowField.destroy(); context.destroy(); return }

        // Post-processing
        const postFX = new PostFX(context)
        await postFX.init()
        if (disposed) { postFX.destroy(); bloomEffect.destroy(); particleSystem.destroy(); flowField.destroy(); context.destroy(); return }

        // Resize handler
        const onResize = () => {
          context.resize()
          particleSystem.onResize()
        }
        window.addEventListener('resize', onResize)

        // Render loop
        let lastTime = performance.now()

        const animate = () => {
          if (disposed) return

          const now = performance.now()
          const deltaTime = Math.min((now - lastTime) / 1000, 0.1)
          lastTime = now
          const timeSeconds = now / 1000

          const w = context.width
          const h = context.height

          // Update interaction
          const mousePos = uiInteraction.getMousePos()
          const mouseForce = uiInteraction.getMouseForce()

          // Update system parameters
          flowField.updateParams(deltaTime, timeSeconds, [w, h], mousePos, mouseForce)
          particleSystem.updateComputeParams(deltaTime, timeSeconds, [w, h], mousePos, mouseForce)

          const pointSize = Math.max(Math.min(w, h) / 120, 2.0)
          particleSystem.updateRenderUniforms(pointSize, w, h, timeSeconds)

          // Ensure textures are correct size
          const hdrTarget = particleSystem.ensureHDRRenderTarget(w, h)
          bloomEffect.ensureTextures(w, h)

          // Get flow field read texture
          const flowFieldReadTex = flowField.getCurrentFieldTexture()
          particleSystem.setFlowFieldTexture(flowFieldReadTex)

          const device = context.device!

          // === Single Command Encoder ===
          const encoder = device.createCommandEncoder({ label: 'frame' })

          // --- Compute Pass ---
          const computePass = encoder.beginComputePass({ label: 'compute' })
          flowField.dispatch(computePass)
          particleSystem.dispatchCompute(computePass, flowFieldReadTex)
          computePass.end()

          // --- Render Pass 1: Particles → HDR offscreen ---
          const rp1 = encoder.beginRenderPass({
            label: 'render-particles',
            colorAttachments: [{
              view: hdrTarget.createView(),
              clearValue: { r: 0, g: 0, b: 0, a: 0 },
              loadOp: 'clear',
              storeOp: 'store',
            }],
          })
          particleSystem.renderToPass(rp1)
          rp1.end()

          // --- Render Pass 2: Bloom H (bright extract + horizontal blur) ---
          const rp2 = encoder.beginRenderPass({
            label: 'bloom-h',
            colorAttachments: [{
              view: bloomEffect.getIntermediateTexture().createView(),
              clearValue: { r: 0, g: 0, b: 0, a: 0 },
              loadOp: 'clear',
              storeOp: 'store',
            }],
          })
          bloomEffect.renderH(rp2, hdrTarget)
          rp2.end()

          // --- Render Pass 3: Bloom V (vertical blur) ---
          const rp3 = encoder.beginRenderPass({
            label: 'bloom-v',
            colorAttachments: [{
              view: bloomEffect.getOutputTexture().createView(),
              clearValue: { r: 0, g: 0, b: 0, a: 0 },
              loadOp: 'clear',
              storeOp: 'store',
            }],
          })
          bloomEffect.renderV(rp3)
          rp3.end()

          // --- Render Pass 4: Composite → Canvas ---
          const rp4 = encoder.beginRenderPass({
            label: 'composite',
            colorAttachments: [{
              view: context.getCurrentTextureView(),
              clearValue: { r: 0.047, g: 0.047, b: 0.055, a: 1 }, // #0C0C0E
              loadOp: 'clear',
              storeOp: 'store',
            }],
          })
          postFX.renderToPass(rp4, hdrTarget, bloomEffect.getOutputTexture())
          rp4.end()

          device.queue.submit([encoder.finish()])

          // Performance monitoring
          const frameTime = performance.now() - now
          performanceMonitor.update(frameTime)

          rafId = requestAnimationFrame(animate)
        }

        rafId = requestAnimationFrame(animate)
      } catch (error) {
        console.error('Failed to initialize WebGPU:', error)
      }
    }

    initWebGPU()

    return () => {
      disposed = true
      if (rafId) cancelAnimationFrame(rafId)
    }
  }, [mounted])

  if (!mounted) {
    return null
  }

  return (
    <div className="fixed inset-0 z-[-2] overflow-hidden" aria-hidden="true" style={{ pointerEvents: 'none' }}>
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  )
}
