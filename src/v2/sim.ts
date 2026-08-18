/**
 * CPU neural simulation — springs to anchors, noise wander, cursor
 * repulsion, camera-proximity energy, and expanding click pulses.
 * Positions are written into a Float32Array consumed by both renderers.
 */
import { noise1, type Vec3 } from "./math";
import type { SceneGraph } from "./scene";

export interface SimParams {
  pos: Float32Array; // xyz per node (live)
  energy: Float32Array; // per node 0..1
  clustersEnergy: Float32Array; // per cluster 0..1
  /** orbital angle per cluster (Keplerian, around Y through origin) */
  orbitAngle: Float32Array;
  /** rotated station centers, NC*3, updated each step */
  rotatedStops: Float32Array;
  time: number;
}

export interface Pulse {
  origin: Vec3;
  t0: number;
  strength: number;
}

export interface CursorField {
  point: Vec3; // world-space attractor/repulsor
  active: boolean;
}

/** bounds-checked reads for typed arrays under noUncheckedIndexedAccess */
const at = (a: ArrayLike<number>, i: number): number => a[i] ?? 0;

export function initSim(scene: SceneGraph): SimParams {
  const rotatedStops = new Float32Array(scene.stops.length * 3);
  scene.stops.forEach((s, i) => {
    rotatedStops[i * 3] = s[0];
    rotatedStops[i * 3 + 1] = s[1];
    rotatedStops[i * 3 + 2] = s[2];
  });
  return {
    pos: Float32Array.from(scene.anchor),
    energy: new Float32Array(scene.nodeCount),
    clustersEnergy: new Float32Array(scene.clusters.length),
    orbitAngle: new Float32Array(scene.clusters.length),
    rotatedStops,
    time: 0,
  };
}

export function stepSim(
  scene: SceneGraph,
  sim: SimParams,
  dt: number,
  camPos: Vec3,
  cursor: CursorField,
  pulses: Pulse[],
) {
  sim.time += dt;
  const t = sim.time;
  const n = scene.nodeCount;
  const dtp = Math.min(dt, 1 / 30);
  const NC = scene.clusters.length;

  // Keplerian orbit: each cluster rotates around Y through the origin
  const cosA = new Float32Array(NC);
  const sinA = new Float32Array(NC);
  for (let c = 0; c < NC; c++) {
    const stop = scene.stops[c] ?? [0, 0, 0];
    const sx = at(stop, 0);
    const sy = at(stop, 1);
    const sz = at(stop, 2);
    const r = Math.hypot(sx, sz);
    const omega = r > 20 ? 15 * Math.pow(r, -1.5) : 0;
    sim.orbitAngle[c] = at(sim.orbitAngle, c) + omega * dt;
    const ca = Math.cos(at(sim.orbitAngle, c));
    const sa = Math.sin(at(sim.orbitAngle, c));
    cosA[c] = ca;
    sinA[c] = sa;
    sim.rotatedStops[c * 3] = sx * ca + sz * sa;
    sim.rotatedStops[c * 3 + 1] = sy;
    sim.rotatedStops[c * 3 + 2] = -sx * sa + sz * ca;
  }

  // cluster energy: proximity of camera to each (rotated) stop
  for (let c = 0; c < NC; c++) {
    const dx = camPos[0] - at(sim.rotatedStops, c * 3);
    const dy = camPos[1] - at(sim.rotatedStops, c * 3 + 1);
    const dz = camPos[2] - at(sim.rotatedStops, c * 3 + 2);
    const d = Math.hypot(dx, dy, dz);
    const target = Math.max(0, 1 - d / 55);
    const prev = at(sim.clustersEnergy, c);
    sim.clustersEnergy[c] = prev + (target - prev) * Math.min(1, dtp * 5);
  }

  for (let i = 0; i < n; i++) {
    const i3 = i * 3;
    const ci = at(scene.nodeCluster, i);
    // rotated anchor (Keplerian orbit of the whole cluster)
    const ax0 = at(scene.anchor, i3);
    const ay = at(scene.anchor, i3 + 1);
    const az0 = at(scene.anchor, i3 + 2);
    const ca = at(cosA, ci);
    const sa = at(sinA, ci);
    const ax = ax0 * ca + az0 * sa;
    const az = -ax0 * sa + az0 * ca;

    // spring toward anchor
    let px = at(sim.pos, i3);
    let py = at(sim.pos, i3 + 1);
    let pz = at(sim.pos, i3 + 2);
    const k = 3.2;
    px += (ax - px) * k * dtp;
    py += (ay - py) * k * dtp;
    pz += (az - pz) * k * dtp;

    // noise wander (amplitude rises with cluster energy)
    const amp = 0.35 + at(sim.clustersEnergy, ci) * 2.4;
    px += noise1(t * 0.7 + i * 0.13, 1) * amp * dtp * 8;
    py += noise1(t * 0.7 + i * 0.13, 2) * amp * dtp * 8;
    pz += noise1(t * 0.7 + i * 0.13, 3) * amp * dtp * 8;

    // cursor repulsion
    if (cursor.active) {
      const dx = px - cursor.point[0];
      const dy = py - cursor.point[1];
      const dz = pz - cursor.point[2];
      const d2 = dx * dx + dy * dy + dz * dz;
      const R = 9;
      if (d2 < R * R && d2 > 0.001) {
        const d = Math.sqrt(d2);
        const f = (1 - d / R) * 26 * dtp;
        px += (dx / d) * f;
        py += (dy / d) * f;
        pz += (dz / d) * f;
      }
    }

    // pulses: expanding shells push nodes outward
    let pulseBoost = 0;
    for (let p = 0; p < pulses.length; p++) {
      const pu = pulses[p];
      if (!pu) continue;
      const age = t - pu.t0;
      if (age < 0 || age > 2.5) continue;
      const wave = age * 34; // shell radius
      const dx = px - pu.origin[0];
      const dy = py - pu.origin[1];
      const dz = pz - pu.origin[2];
      const d = Math.hypot(dx, dy, dz) || 1;
      const band = Math.max(0, 1 - Math.abs(d - wave) / 7);
      if (band > 0) {
        const f = band * pu.strength * 22 * dtp;
        px += (dx / d) * f;
        py += (dy / d) * f;
        pz += (dz / d) * f;
        pulseBoost = Math.max(pulseBoost, band);
      }
    }

    sim.pos[i3] = px;
    sim.pos[i3 + 1] = py;
    sim.pos[i3 + 2] = pz;

    // node energy = cluster energy + pulse + shimmer
    const shimmer = 0.5 + 0.5 * Math.sin(t * 2.2 + i * 1.7);
    const target = Math.min(
      1,
      0.12 + at(sim.clustersEnergy, ci) * 0.85 + pulseBoost * 0.6 + shimmer * 0.08,
    );
    sim.energy[i] = at(sim.energy, i) + (target - at(sim.energy, i)) * Math.min(1, dtp * 8);
  }
}

export function prunePulses(pulses: Pulse[], time: number): Pulse[] {
  return pulses.filter((p) => time - p.t0 < 2.5);
}
