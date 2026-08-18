import type { ClusterDef } from "../../v2/scene";

/** Ten neural clusters — one per camera stop along the spine. */
export const CLUSTERS: ClusterDef[] = [
  { id: "hero", label: "CORE", index: "00", color: [0.13, 0.83, 0.93], radius: 13, nodeCount: 90, keywords: ["Go", "Distributed", "Cloud Native"] },
  { id: "about", label: "IDENTITY", index: "01", color: [0.65, 0.55, 0.98], radius: 11, nodeCount: 70, keywords: ["5 Years", "Ownership", "Debugging"] },
  { id: "p1", label: "RADIUS", index: "02", color: [0.20, 0.85, 0.70], radius: 15, nodeCount: 100, keywords: ["Kitex", "Hertz", "Wire", "etcd", "Thrift"] },
  { id: "p2", label: "DATALAKE", index: "03", color: [0.95, 0.45, 0.71], radius: 14, nodeCount: 90, keywords: ["Iceberg", "Airflow", "Trino", "Polars"] },
  { id: "p3", label: "FORMENGINE", index: "04", color: [0.98, 0.72, 0.25], radius: 15, nodeCount: 95, keywords: ["Flask", "MongoDB", "Redis", "4000+ commits"] },
  { id: "p4", label: "OSS-TEMPLATE", index: "05", color: [0.55, 0.85, 0.40], radius: 12, nodeCount: 75, keywords: ["CloudWeGo", "AGENTS.md", "CI/CD"] },
  { id: "skills", label: "CAPABILITY", index: "06", color: [0.83, 0.35, 0.90], radius: 13, nodeCount: 85, keywords: ["RPC", "Observability", "DI"] },
  { id: "career", label: "TRAJECTORY", index: "07", color: [0.35, 0.66, 1.00], radius: 14, nodeCount: 80, keywords: ["Architect", "Lead", "8-person team"] },
  { id: "oss", label: "COMMUNITY", index: "08", color: [1.00, 0.62, 0.30], radius: 13, nodeCount: 85, keywords: ["3 merged PRs", "jwt", "otel"] },
  { id: "contact", label: "SIGNAL", index: "09", color: [0.92, 0.90, 0.55], radius: 12, nodeCount: 80, keywords: ["Connect"] },
];
