import { useEffect, useRef, useState } from 'react'
import { NeuralNetwork } from '../webgpu/NeuralNetwork'
import { NetworkRenderer } from '../webgpu/NetworkRenderer'
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

        // UI interaction (hover tracking)
        const uiInteraction = new UIInteractionLayer(() => ({
          width: context.width,
          height: context.height,
        }))

        // Neural network
        const neuralNetwork = new NeuralNetwork(context)
        await neuralNetwork.init()
        if (disposed) { neuralNetwork.destroy(); context.destroy(); return }

        // Network renderer
        const networkRenderer = new NetworkRenderer(context, neuralNetwork)
        await networkRenderer.init()
        if (disposed) { networkRenderer.destroy(); neuralNetwork.destroy(); context.destroy(); return }

        // Bloom effect
        const bloomEffect = new BloomEffect(context)
        await bloomEffect.init()
        if (disposed) { bloomEffect.destroy(); networkRenderer.destroy(); neuralNetwork.destroy(); context.destroy(); return }

        // Post-processing
        const postFX = new PostFX(context)
        await postFX.init()
        if (disposed) { postFX.destroy(); bloomEffect.destroy(); networkRenderer.destroy(); neuralNetwork.destroy(); context.destroy(); return }

        // Resize handler
        const onResize = () => {
          context.resize()
          neuralNetwork.onResize()
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

          // Update neural network
          neuralNetwork.updateSimParams(deltaTime, timeSeconds, [w, h], mousePos, mouseForce)

          const pointScale = Math.max(Math.min(w, h) / 140, 1.5)
          neuralNetwork.updateRenderParams(pointScale, w, h, timeSeconds, mousePos)

          // Ensure textures
          const hdrTarget = neuralNetwork.ensureHDRRenderTarget(w, h)
          bloomEffect.ensureTextures(w, h)

          const device = context.device!

          // === Single Command Encoder ===
          const encoder = device.createCommandEncoder({ label: 'frame' })

          // --- Compute Pass: Node simulation ---
          const computePass = encoder.beginComputePass({ label: 'compute' })
          neuralNetwork.dispatchCompute(computePass)
          computePass.end()

          // --- Render Pass 1: Connections + Nodes + Dust → HDR offscreen ---
          const rp1 = encoder.beginRenderPass({
            label: 'render-scene',
            colorAttachments: [{
              view: hdrTarget.createView(),
              clearValue: { r: 0, g: 0, b: 0, a: 0 },
              loadOp: 'clear',
              storeOp: 'store',
            }],
          })
          networkRenderer.renderToPass(rp1)
          rp1.end()

          // --- Render Pass 2: Bloom H ---
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

          // --- Render Pass 3: Bloom V ---
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
      {/* Atmospheric overlays */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(90deg, rgba(12,12,14,0.96) 0%, rgba(12,12,14,0.91) 24%, rgba(12,12,14,0.5) 46%, rgba(12,12,14,0.1) 70%, rgba(12,12,14,0.3) 100%)',
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 79% 30%, rgba(212,175,55,0.12) 0%, rgba(212,175,55,0.06) 15%, rgba(212,175,55,0.02) 28%, rgba(12,12,14,0) 46%)',
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 72% 56%, rgba(242,210,136,0.06) 0%, rgba(242,210,136,0.02) 15%, rgba(12,12,14,0) 32%)',
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at center, rgba(12,12,14,0) 38%, rgba(12,12,14,0.3) 70%, rgba(12,12,14,0.85) 100%)',
        }}
      />
    </div>
  )
}
