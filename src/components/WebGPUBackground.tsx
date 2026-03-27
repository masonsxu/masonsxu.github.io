import { useEffect, useRef, useState } from 'react'
import { ComputeShaderSystem } from '../webgpu/ComputeShaderSystem'
import { RenderShaderSystem } from '../webgpu/RenderShaderSystem'
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
        const performanceMonitor = new PerformanceMonitor(60, 100000)

        // Compute system
        const initialParticleCount = performanceMonitor.getRecommendedParticleCount()
        const computeSystem = new ComputeShaderSystem(context, initialParticleCount)
        await computeSystem.init()

        if (disposed) { computeSystem.destroy(); context.destroy(); return }

        // UI interaction
        const uiInteraction = new UIInteractionLayer(context)
        await uiInteraction.init()

        // Render system
        const renderSystem = new RenderShaderSystem(context)
        await renderSystem.init()

        if (disposed) {
          renderSystem.destroy(); computeSystem.destroy(); context.destroy(); return
        }

        // Connect compute output to render input
        renderSystem.setParticleBuffer(computeSystem.getCurrentPositionBuffer())

        // Render loop
        let lastTime = performance.now()

        const animate = () => {
          if (disposed) return

          const now = performance.now()
          const deltaTime = (now - lastTime) / 1000
          lastTime = now
          const timeSeconds = now / 1000

          // Update simulation parameters
          const mousePos = uiInteraction.getMousePos()
          const mouseForce = uiInteraction.getMouseForce()
          computeSystem.updateParameters(deltaTime, timeSeconds, mousePos, mouseForce)

          // Update render uniforms
          const pointSize = Math.max(Math.min(context.width, context.height) / 120, 2.0)
          renderSystem.updateUniforms(pointSize, timeSeconds)
          renderSystem.setParticleBuffer(computeSystem.getCurrentPositionBuffer())

          const particleCount = computeSystem.getParticleCount()

          // Single command encoder: compute + render
          const encoder = context.device!.createCommandEncoder({ label: 'frame' })

          // Compute passes
          computeSystem.dispatchToEncoder(encoder)

          // Render pass
          const textureView = context.context!.getCurrentTexture().createView()
          const pass = encoder.beginRenderPass({
            label: 'render-particles',
            colorAttachments: [
              {
                view: textureView,
                clearValue: { r: 0.047, g: 0.047, b: 0.055, a: 1.0 }, // #0C0C0E Obsidian
                loadOp: 'clear',
                storeOp: 'store',
              },
            ],
          })
          renderSystem.renderToPass(pass, particleCount)
          pass.end()

          context.device!.queue.submit([encoder.finish()])

          // Update performance monitor with actual frame time
          performanceMonitor.update(now - lastTime + deltaTime * 1000)

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
