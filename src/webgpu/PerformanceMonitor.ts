/**
 * Performance Monitor
 * Tracks frame times for diagnostics
 */
export class PerformanceMonitor {
  private frameTimes: number[] = []
  private readonly maxFrameHistory: number = 60

  constructor(_targetFPS: number = 60) {
  }

  update(frameTime: number): void {
    this.frameTimes.push(frameTime)
    if (this.frameTimes.length > this.maxFrameHistory) {
      this.frameTimes.shift()
    }
  }

  getAverageFrameTime(): number {
    if (this.frameTimes.length === 0) return 0
    return this.frameTimes.reduce((a, b) => a + b, 0) / this.frameTimes.length
  }

  getCurrentFPS(): number {
    const avgFrameTime = this.getAverageFrameTime()
    return avgFrameTime > 0 ? 1000 / avgFrameTime : 0
  }
}
