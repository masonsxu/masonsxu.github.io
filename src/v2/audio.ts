/**
 * Ambient neural drone — two detuned oscillators through a lowpass
 * whose cutoff follows scroll velocity. Starts only on user gesture.
 */
export class SignalAudio {
  private ctx: AudioContext | null = null;
  private nodes: { oscA: OscillatorNode; oscB: OscillatorNode; filter: BiquadFilterNode; gain: GainNode } | null = null;
  running = false;

  async toggle(): Promise<boolean> {
    if (this.running) {
      this.stop();
      return false;
    }
    await this.start();
    return this.running;
  }

  private async start(): Promise<void> {
    try {
      const AC: typeof AudioContext =
        window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AC) return;
      const ctx = this.ctx ?? new AC();
      this.ctx = ctx;
      await ctx.resume();

      const oscA = ctx.createOscillator();
      oscA.type = "sine";
      oscA.frequency.value = 55;
      const oscB = ctx.createOscillator();
      oscB.type = "sine";
      oscB.frequency.value = 55 * 1.5 + 0.7;

      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 220;
      filter.Q.value = 6;

      const gain = ctx.createGain();
      gain.gain.value = 0;
      gain.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 2.5);

      // slow LFO on filter for breathing motion
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 0.08;
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 140;
      lfo.connect(lfoGain).connect(filter.frequency);

      oscA.connect(filter);
      oscB.connect(filter);
      filter.connect(gain).connect(ctx.destination);

      oscA.start();
      oscB.start();
      lfo.start();
      this.nodes = { oscA, oscB, filter, gain };
      this.running = true;
    } catch {
      this.running = false;
    }
  }

  private stop(): void {
    if (!this.ctx || !this.nodes) return;
    const t = this.ctx.currentTime;
    this.nodes.gain.gain.linearRampToValueAtTime(0, t + 0.6);
    const n = this.nodes;
    setTimeout(() => {
      n.oscA.stop();
      n.oscB.stop();
    }, 800);
    this.nodes = null;
    this.running = false;
  }

  /** velocity in 0..1 raises cutoff and level slightly */
  setVelocity(v: number): void {
    if (!this.ctx || !this.nodes) return;
    const target = 180 + Math.min(1, v) * 900;
    this.nodes.filter.frequency.setTargetAtTime(target, this.ctx.currentTime, 0.25);
  }
}
