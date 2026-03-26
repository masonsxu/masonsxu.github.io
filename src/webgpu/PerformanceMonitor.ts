/**
 * Performance Monitor
 * Tracks frame times and provides recommendations for adaptive quality adjustment
 */
export class PerformanceMonitor {
  private targetFrameTime: number; // in milliseconds
  private frameTimes: number[] = [];
  private readonly maxFrameHistory: number = 60; // Keep about 1 second of history at 60fps
  private readonly adjustmentThreshold: number = 1.2; // 20% deviation triggers adjustment
  private readonly adjustmentCooldown: number = 180; // 3 seconds at 60fps
  private framesSinceLastAdjustment: number = 0;
  
  // Device tier detection
  private deviceTier: 'high' | 'medium' | 'low' = 'medium';
  private baseParticleCount: number = 100000; // Base count for scaling

  constructor(targetFPS: number = 60, baseParticleCount: number = 100000) {
    this.targetFrameTime = 1000 / targetFPS;
    this.baseParticleCount = baseParticleCount;
    this.detectDeviceTier();
  }

  /**
   * Detect device tier based on hardware capabilities
   * In a production environment, this would use more sophisticated detection
   */
  private detectDeviceTier(): void {
    // Simple heuristic based on concurrency and memory (would be enhanced in production)
    const hardwareConcurrency = navigator.hardwareConcurrency || 4;
    const deviceMemory = (navigator as any).deviceMemory || 4; // GB
    
    if (hardwareConcurrency >= 8 && deviceMemory >= 8) {
      this.deviceTier = 'high';
    } else if (hardwareConcurrency >= 4 && deviceMemory >= 4) {
      this.deviceTier = 'medium';
    } else {
      this.deviceTier = 'low';
    }
  }

    /**
     * Get the recommended particle count based on device tier and performance
     * @returns Recommended particle count for current conditions
     */
    getRecommendedParticleCount(): number {
      // Base multiplier based on device tier
      let tierMultiplier = 1;
      switch (this.deviceTier) {
        case 'high':
          tierMultiplier = 5; // 500K particles for high-end (100K * 5)
          break;
        case 'medium':
          tierMultiplier = 2;  // 200K particles for medium (100K * 2)
          break;
        case 'low':
          tierMultiplier = 0.5; // 50K particles for low-end (100K * 0.5)
          break;
        default:
          // Fallback to medium if deviceTier is not set (should not happen)
          tierMultiplier = 2;
      }

      // Performance-based adjustment
      const performanceFactor = this.getQualityAdjustmentFactor();

      // Calculate final count
      const count = Math.floor(this.baseParticleCount * tierMultiplier * performanceFactor);
      // Fallback to baseParticleCount if calculation results in 0 (should not happen with reasonable values)
      return count === 0 ? this.baseParticleCount : count;
    }

  /**
   * Update with the time taken for the last frame
   * @param frameTime - Time taken for the last frame in milliseconds
   */
  update(frameTime: number): void {
    this.frameTimes.push(frameTime);
    if (this.frameTimes.length > this.maxFrameHistory) {
      this.frameTimes.shift();
    }

    this.framesSinceLastAdjustment++;
  }

  /**
   * Get the average frame time over the history
   * @returns Average frame time in milliseconds
   */
  getAverageFrameTime(): number {
    if (this.frameTimes.length === 0) {
      return 0;
    }
    const sum = this.frameTimes.reduce((a, b) => a + b, 0);
    return sum / this.frameTimes.length;
  }

  /**
   * Get the current FPS based on average frame time
   * @returns Current FPS
   */
  getCurrentFPS(): number {
    const avgFrameTime = this.getAverageFrameTime();
    return avgFrameTime > 0 ? 1000 / avgFrameTime : 0;
  }

  /**
   * Check if performance is below target (needs quality reduction)
   * @returns True if performance is significantly below target
   */
  isPerformanceLow(): boolean {
    if (this.framesSinceLastAdjustment < this.adjustmentCooldown) {
      return false;
    }
    const avgFrameTime = this.getAverageFrameTime();
    return avgFrameTime > this.targetFrameTime * this.adjustmentThreshold;
  }

  /**
   * Check if performance is above target (can increase quality)
   * @returns True if performance is significantly above target
   */
  isPerformanceHigh(): boolean {
    if (this.framesSinceLastAdjustment < this.adjustmentCooldown) {
      return false;
    }
    const avgFrameTime = this.getAverageFrameTime();
    return avgFrameTime < this.targetFrameTime / this.adjustmentThreshold;
  }

  /**
   * Get a quality adjustment factor (e.g., for particle count)
   * @returns Factor to multiply current quality by (e.g., 0.9 to reduce, 1.1 to increase)
   */
  getQualityAdjustmentFactor(): number {
    const avgFrameTime = this.getAverageFrameTime();
    const ratio = this.targetFrameTime / Math.max(avgFrameTime, 1);
    // Clamp the factor between 0.5 and 2.0
    return Math.max(0.5, Math.min(2.0, ratio));
  }

  /**
   * Reset the adjustment cooldown (call after making an adjustment)
   */
  resetAdjustmentCooldown(): void {
    this.framesSinceLastAdjustment = 0;
  }
}
