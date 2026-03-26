import { useEffect, useRef, useState } from 'react'
import { ComputeShaderSystem } from '../webgpu/ComputeShaderSystem'
import { ReflectionCompositor } from '../webgpu/ReflectionCompositor'
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

    const initWebGPU = async () => {
      try {
        console.log('Starting WebGPU initialization...')
        const canvasElement = canvasRef.current!
        console.log('Canvas element:', canvasElement)
        
        const context = new WebGPUContext(canvasElement)
        console.log('Created WebGPUContext')
        await context.init()
        console.log('Initialized WebGPUContext')

        // Initialize performance monitor for adaptive quality
        const performanceMonitor = new PerformanceMonitor(60, 100000) // 60 FPS target, base 100K particles
        console.log('Created PerformanceMonitor')
        
        // Initialize compute system with particle count based on device tier and performance
        const initialParticleCount = performanceMonitor.getRecommendedParticleCount()
        console.log(`Initial particle count: ${initialParticleCount}`)
        const computeSystem = new ComputeShaderSystem(context, initialParticleCount)
        await computeSystem.init()
        console.log('Initialized ComputeShaderSystem')

        // Initialize UI interaction layer
        const uiInteraction = new UIInteractionLayer(context)
        await uiInteraction.init()
        console.log('Initialized UIInteractionLayer')

        // Initialize render system
        const renderSystem = new RenderShaderSystem(context)
        await renderSystem.init()
        console.log('Initialized RenderShaderSystem')

        // Connect compute system output to render system input
        // Give the render system access to the compute system's current position buffer
        if (renderSystem && computeSystem) {
          renderSystem.setParticleBuffer(computeSystem.getCurrentPositionBuffer())
          console.log('Set particle buffer')
        }

        // Initialize reflection compositor
        const reflectionCompositor = new ReflectionCompositor(context)
        await reflectionCompositor.init()
        console.log('Initialized ReflectionCompositor')

        // Start render loop
        const animate = (timeStamp: number) => {
          if (!context || !renderSystem || !computeSystem || !uiInteraction || !reflectionCompositor) {
            console.log('Missing required components in render loop')
            return
          }

          // Update uniform matrices
          const projectionMatrix = new Float32Array([
            2 / context.width, 0, 0, 0,
            0, -2 / context.height, 0, 0,
            0, 0, 1, 0,
            -1, 1, 0, 1
          ])

          const viewMatrix = new Float32Array([
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
          ])

          // Calculate delta time
          const now = timeStamp / 1000 // Convert to seconds
          const deltaTime = animate.lastTime ? now - animate.lastTime : 0
          animate.lastTime = now

          // Update simulation parameters
          const mousePos = uiInteraction ? uiInteraction.getMousePos() : [0, 0] as [number, number]
          const mouseForce = uiInteraction ? uiInteraction.getMouseForce() : 0

          computeSystem.updateParameters(deltaTime, now, mousePos, mouseForce)

          // Dispatch compute shader
          computeSystem.dispatch()

          // Update render uniforms
          renderSystem.updateUniforms(projectionMatrix, viewMatrix, now)

          // Update the render system with the latest position buffer from compute system
          // (important for ping-pong buffering)
          renderSystem.setParticleBuffer(computeSystem.getCurrentPositionBuffer())

          // Get current particle count from compute system and render particles FIRST
          const particleCount = computeSystem.getParticleCount()
          if (particleCount === 0) {
            console.warn('WARNING: Particle count is 0!')
          }
          // Only log occasionally to avoid spam
          if (Math.random() < 0.01) {
            console.log(`Rendering frame with ${particleCount} particles`)
          }
          renderSystem.render(particleCount)

          // Capture UI for reflection (handle promise without await)
          reflectionCompositor.captureUI().catch(console.error)

          // Render reflection effect ON TOP of particles (handle promise without await)
          reflectionCompositor.renderReflection().catch(console.error)

          // Update performance monitor
          const frameTime = 1000 / 60 // Assuming 60fps for simplicity, in reality we'd measure actual frame time
          performanceMonitor.update(frameTime)

          requestAnimationFrame(animate)
        }
        animate.lastTime = performance.now() / 1000
        requestAnimationFrame(animate)
        console.log('Started render loop')
      } catch (error) {
        console.error('Failed to initialize WebGPU:', error)
      }
    }

    initWebGPU()

    return () => {
      // Cleanup
      // Note: We're not cleaning up here to avoid potential issues during development
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