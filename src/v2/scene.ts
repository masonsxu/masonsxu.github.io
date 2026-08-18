/**
 * Scene builder — maps portfolio content into a neural organism:
 * 10 clusters along a spine, nodes per cluster, synapse edges,
 * and a camera spline that flies through every cluster center.
 */
import { add, catmullRom, fibSphere, hash1, hash3, scale, v3, type Vec3 } from "./math";

export interface ClusterDef {
  id: string;
  label: string;
  index: string;
  color: [number, number, number];
  radius: number;
  nodeCount: number;
  keywords: string[];
}

export interface SceneGraph {
  clusters: ClusterDef[];
  /** nodeCount total */
  nodeCount: number;
  edgeCount: number;
  /** per-node: cluster index */
  nodeCluster: Uint16Array;
  /** per-node anchor position */
  anchor: Float32Array; // 3 floats
  /** edges as pairs of node indices */
  edges: Uint32Array; // 2 per edge
  /** per-edge: cluster index + random seed */
  edgeSeed: Float32Array;
  /** spine control points (also camera stops) */
  stops: Vec3[];
  cameraPath: Vec3[];
}

const CLUSTER_COLORS: [number, number, number][] = [
  [0.13, 0.83, 0.93], // cyan — hero
  [0.65, 0.55, 0.98], // violet — about
  [0.20, 0.85, 0.70], // teal — p1
  [0.95, 0.45, 0.71], // magenta — p2
  [0.98, 0.72, 0.25], // amber — p3
  [0.55, 0.85, 0.40], // green — p4
  [0.83, 0.35, 0.90], // purple — skills
  [0.35, 0.66, 1.00], // blue — career
  [1.00, 0.62, 0.30], // orange — oss
  [0.92, 0.90, 0.55], // warm white — contact
];

export type LayoutFn = (i: number, total: number) => Vec3;

export function spineLayout(i: number, total: number): Vec3 {
  const t = i / (total - 1);
  const z = -t * 260;
  const x = Math.sin(t * Math.PI * 2.6) * 34 + Math.sin(t * Math.PI * 7.3) * 8;
  const y = Math.cos(t * Math.PI * 1.9) * 14 + Math.sin(t * Math.PI * 4.7) * 6;
  return [x, y, z];
}

/** Stations on an orbital ring around the central singularity (black hole). */
export function ringLayout(i: number, total: number): Vec3 {
  const a = (i / total) * Math.PI * 2 + Math.PI / total;
  const r = 84 + Math.sin(i * 2.3) * 20;
  const y = Math.sin(i * 1.9) * 22;
  return [Math.cos(a) * r, y, Math.sin(a) * r];
}

export function buildScene(clusters: ClusterDef[], layout: LayoutFn = spineLayout): SceneGraph {
  const NC = clusters.length;
  const stops = clusters.map((_, i) => layout(i, NC));
  const nodeCount = clusters.reduce((s, c) => s + c.nodeCount, 0);
  const nodeCluster = new Uint16Array(nodeCount);
  const anchor = new Float32Array(nodeCount * 3);

  let n = 0;
  const clusterNodeStart: number[] = [];
  clusters.forEach((c, ci) => {
    clusterNodeStart.push(n);
    const center = stops[ci] ?? [0, 0, 0];
    for (let j = 0; j < c.nodeCount; j++) {
      nodeCluster[n] = ci;
      // fibonacci shell + deterministic jitter
      const shell = fibSphere(j, c.nodeCount, c.radius * (0.55 + 0.45 * hash1(j * 3.7 + ci * 91.3)));
      const jit = hash3(j * 13.1 + ci * 57.7);
      anchor[n * 3] = center[0] + shell[0] + (jit[0] - 0.5) * c.radius * 0.7;
      anchor[n * 3 + 1] = center[1] + shell[1] + (jit[1] - 0.5) * c.radius * 0.7;
      anchor[n * 3 + 2] = center[2] + shell[2] + (jit[2] - 0.5) * c.radius * 0.7;
      n++;
    }
  });

  // edges: connect each node to 2 nearest in same cluster (k-dumb: sample pairs)
  const edgeList: number[] = [];
  const edgeSeeds: number[] = [];
  for (let ci = 0; ci < NC; ci++) {
    const start = clusterNodeStart[ci] ?? 0;
    const count = clusters[ci]?.nodeCount ?? 0;
    // ring + random shortcuts inside cluster
    for (let j = 0; j < count; j++) {
      const a = start + j;
      const b = start + ((j + 1) % count);
      edgeList.push(a, b);
      edgeSeeds.push(hash1(a * 7.77 + ci));
      const partner = start + Math.floor(hash1(a * 3.33) * count);
      if (partner !== a) {
        edgeList.push(a, partner);
        edgeSeeds.push(hash1(a * 9.11 + 1.7));
      }
    }
    // spine link to next cluster hub
    if (ci < NC - 1) {
      const nextStart = clusterNodeStart[ci + 1] ?? 0;
      edgeList.push(start, nextStart);
      edgeSeeds.push(hash1(ci * 31.7));
      edgeList.push(start + 1, nextStart + 1);
      edgeSeeds.push(hash1(ci * 47.3));
    }
  }

  // camera path: weave slightly off-axis through every cluster center
  const cameraPath: Vec3[] = stops.map((s, i) => {
    const t = i / (NC - 1);
    const drift = scale(v3(Math.sin(t * 12.9), Math.cos(t * 9.4), 0), 6);
    return add(s, drift);
  });

  return {
    clusters,
    nodeCount,
    edgeCount: edgeList.length / 2,
    nodeCluster,
    anchor,
    edges: new Uint32Array(edgeList),
    edgeSeed: new Float32Array(edgeSeeds),
    stops,
    cameraPath,
  };
}

export function cameraAt(scene: SceneGraph, t: number): Vec3 {
  return catmullRom(scene.cameraPath, t);
}

export function clusterFocus(scene: SceneGraph, camT: number): number {
  // which stop (0..NC-1) is nearest to the camera parameter
  const n = scene.stops.length - 1;
  return Math.min(n, Math.max(0, Math.round(camT * n)));
}
