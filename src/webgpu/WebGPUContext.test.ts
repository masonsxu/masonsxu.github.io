import { WebGPUContext } from './WebGPUContext'

// Simple validation that the class can be instantiated
const canvas = document.createElement('canvas')
const context = new WebGPUContext(canvas)
if (!(context instanceof WebGPUContext)) {
  throw new Error('WebGPUContext instance check failed')
}
if (context.device !== null) {
  throw new Error('Expected device to be null initially')
}
if (context.context !== null) {
  throw new Error('Expected context to be null initially')
}
context.destroy()
