import * as THREE from 'three'
import { Hotspot, type HotspotData } from './Hotspot'
import type { Updatable } from '../engine/GameEngine'

const HOTSPOT_PROXIMITY = 3.0

const DEFAULT_HOTSPOTS: HotspotData[] = [
  {
    id: 'arch',
    position: new THREE.Vector3(5, 0, 5),
    title: '系统架构',
    description: '云原生微服务架构设计，基于 Go/Hertz 的高并发后端系统',
    icon: '🏗️',
  },
  {
    id: 'ai',
    position: new THREE.Vector3(-5, 0, -4),
    title: 'AI 工具链',
    description: '基于大模型的 AI Agent 开发与 MCP 协议工程化实践',
    icon: '🤖',
  },
  {
    id: 'data',
    position: new THREE.Vector3(-6, 0, 6),
    title: '数据平台',
    description: 'Trino/Iceberg 数据湖架构，万亿级实时分析系统',
    icon: '📊',
  },
  {
    id: 'cloud',
    position: new THREE.Vector3(7, 0, -5),
    title: '云原生',
    description: 'K8s/Istio 服务网格，Knative 无服务器平台设计',
    icon: '☁️',
  },
]

export type HotspotCallback = (hotspot: HotspotData | null) => void

export class HotspotSystem implements Updatable {
  readonly hotspots: Hotspot[] = []
  private playerPos = new THREE.Vector3()
  private onProximityChange: HotspotCallback
  private lastNearby: HotspotData | null = null

  constructor(
    scene: THREE.Scene,
    terrainHeightFn: (x: number, z: number) => number,
    customHotspots?: HotspotData[],
  ) {
    this.onProximityChange = () => {}

    const data = customHotspots ?? DEFAULT_HOTSPOTS
    for (const h of data) {
      const pos = h.position.clone()
      pos.y = terrainHeightFn(pos.x, pos.z)
      this.hotspots.push(new Hotspot(scene, { ...h, position: pos }))
    }
  }

  setProximityCallback(cb: HotspotCallback): void {
    this.onProximityChange = cb
  }

  setPlayerPosition(pos: THREE.Vector3): void {
    this.playerPos.copy(pos)
  }

  update(_dt: number, _time: number): void {
    let closest: Hotspot | null = null
    let closestDist = HOTSPOT_PROXIMITY

    for (const h of this.hotspots) {
      const dist = this.playerPos.distanceTo(h.data.position)
      h.isNearby = dist < HOTSPOT_PROXIMITY
      if (h.isNearby && dist < closestDist) {
        closest = h
        closestDist = dist
      }
    }

    const nearbyData = closest?.data ?? null
    if (nearbyData?.id !== this.lastNearby?.id) {
      this.lastNearby = nearbyData
      this.onProximityChange(nearbyData)
    }
  }

  dispose(): void {
    for (const h of this.hotspots) h.dispose()
    this.hotspots.length = 0
  }
}
