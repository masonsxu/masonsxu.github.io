import { useEffect, useRef, useState } from 'react'

export default function WebGPUSimpleTest() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [mounted, setMounted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [log, setLog] = useState<string[]>([])

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
        setLog(prev => [...prev, 'Starting simple WebGPU test...'])
        const canvasElement = canvasRef.current!
        setLog(prev => [...prev, `Canvas element: ${canvasElement}`])
        
        // Check WebGPU support
        if (!navigator.gpu) {
          throw new Error('WebGPU not supported on this browser')
        }
        setLog(prev => [...prev, 'WebGPU is supported'])

        // Request adapter
        const adapter = await navigator.gpu.requestAdapter({
          powerPreference: 'high-performance',
        })
        if (!adapter) {
          throw new Error('Could not request WebGPU adapter')
        }
        setLog(prev => [...prev, 'GPU adapter acquired'])

        // Request device
        const device = await adapter.requestDevice({
          requiredLimits: {
            maxStorageBufferBindingSize: adapter.limits.maxStorageBufferBindingSize,
          },
        })
        setLog(prev => [...prev, 'GPU device acquired'])
        setLog(prev => [...prev, `Device: ${device}`])

        // Get canvas context
        const context = canvasElement.getContext('webgpu')
        if (!context) {
          throw new Error('Failed to get WebGPU canvas context')
        }
        setLog(prev => [...prev, 'WebGPU canvas context acquired'])

        // Get preferred format
        const format = navigator.gpu.getPreferredCanvasFormat()
        setLog(prev => [...prev, `Preferred canvas format: ${format}`])

        // Configure context
        context.configure({
          device: device,
          format: format,
          alphaMode: 'opaque',
        })

        // Set canvas size
        const resizeCanvas = () => {
          canvasElement.width = canvasElement.clientWidth
          canvasElement.height = canvasElement.clientHeight
          context.configure({
            device: device,
            format: format,
            alphaMode: 'opaque',
          })
        }

        resizeCanvas()
        window.addEventListener('resize', resizeCanvas)

        // Create a simple render pipeline for a triangle
        const shaderModule = device.createShaderModule({
          label: 'simple-triangle-shader',
          code: /* wgsl */ `
            @vertex
            fn vs(@builtin(vertex_index) vertexIndex : u32) -> @builtin(position) vec4<f32> {
              var pos = array<vec2<f32>, 3>(
                vec2<f32>(0.0, 0.5),
                vec2<f32>(-0.5, -0.5),
                vec2<f32>(0.5, -0.5)
              );
              return vec4<f32>(pos[vertexIndex], 0.0, 1.0);
            }

            @fragment
            fn fs() -> @location(0) vec4<f32> {
              return vec4<f32>(0.831, 0.686, 0.216, 1.0); // Gold color
            }
          `,
        })

        const pipeline = device.createRenderPipeline({
          label: 'simple-triangle-pipeline',
          layout: device.createPipelineLayout({ bindGroupLayouts: [] }),
          vertex: {
            module: shaderModule,
            entryPoint: 'vs',
          },
          fragment: {
            module: shaderModule,
            entryPoint: 'fs',
            targets: [{ format }],
          },
          primitive: {
            topology: 'triangle-list',
          },
        })

        // Render loop
        const render = () => {
          const textureView = context.getCurrentTexture().createView()

          const commandEncoder = device.createCommandEncoder({
            label: 'frame encoder',
          })

          const renderPass = commandEncoder.beginRenderPass({
            colorAttachments: [{
              view: textureView,
              clearValue: { r: 0.043, g: 0.055, b: 0.078, a: 1.0 }, // Dark background
              loadOp: 'clear',
              storeOp: 'store',
            }],
          })

          renderPass.setPipeline(pipeline)
          renderPass.draw(3) // Draw triangle
          renderPass.end()

          device.queue.submit([commandEncoder.finish()])

          requestAnimationFrame(render)
        }

        requestAnimationFrame(render)
        setLog(prev => [...prev, 'Simple WebGPU test rendering started'])

      } catch (error) {
        console.error('Failed to initialize WebGPU in simple test:', error)
        setError(error instanceof Error ? error.message : String(error))
        setLog(prev => [...prev, `ERROR: ${error}`])
      }
    }

    initWebGPU()

    return () => {
      window.removeEventListener('resize', () => {})
    }
  }, [mounted])

  if (!mounted) {
    return null
  }

  return (
    <div className="fixed inset-0 z-[-2] overflow-hidden" aria-hidden="true" style={{ pointerEvents: 'none' }}>
      <canvas ref={canvasRef} className="block h-full w-full" />
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-black bg-opacity-50 text-white text-sm font-mono z-[9999]" style={{ pointerEvents: 'none' }}>
        <div>Simple WebGPU Test:</div>
        <div>Mounted: {mounted}</div>
        <div>Error: {error || 'None'}</div>
        <div className="mt-2 max-h-[200px] overflow-y-auto">
          {log.map((line, index) => (
            <div key={index}>{line}</div>
          ))}
        </div>
      </div>
    </div>
  )
}