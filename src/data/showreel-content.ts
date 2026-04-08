import type React from "react";
import { VIDEO } from "../../remotion/shared/theme";
import { ArchEvolution } from "../../remotion/ArchEvolution";
import { ContributionHeatmap } from "../../remotion/ContributionHeatmap";
import { DataLake } from "../../remotion/DataLake";
import { OSSDashboard } from "../../remotion/OSSDashboard";
import { TechCard } from "../../remotion/TechCard";
import { Trailer } from "../../remotion/Trailer";

export interface VideoConfig {
  title: string;
  titleEn: string;
  desc: string;
  duration: string;
  techs: string[];
  preview: string;
  component: React.FC;
  durationInFrames: number;
}

export const showreelVideos: VideoConfig[] = [
  {
    title: "技术身份短片",
    titleEn: "Tech Card",
    desc: "围绕真实技术身份与能力边界重构的 15 秒短叙事片。以 Go、CloudWeGo、OpenTelemetry 与数据平台栈为线索，呈现技术定位、能力域和问题边界，而非虚构 KPI。",
    duration: "15s",
    techs: ["Go Backend", "CloudWeGo", "Observability", "Data Platform"],
    preview: "/previews/tech-card-preview.png",
    component: TechCard,
    durationInFrames: 15 * VIDEO.fps,
  },
  {
    title: "开源项目看板",
    titleEn: "Open Source Dashboard",
    desc: "围绕真实 CloudWeGo 贡献重构的技术叙事片。通过终端上下文、贡献事实卡与作用域拓扑，展示 jwt 修复、可观测性稳定性与 Go 1.25+ 兼容性问题。",
    duration: "20s",
    techs: ["CloudWeGo PRs", "Contribution Facts", "Scope Topology"],
    preview: "/previews/oss-dashboard-preview.png",
    component: OSSDashboard,
    durationInFrames: 20 * VIDEO.fps,
  },
  {
    title: "架构演进历程",
    titleEn: "Architecture Evolution",
    desc: "围绕真实请求路径的架构演进叙事。展示单体职责拆分、Hertz/Kitex 调用链显式化、服务内分层组织，以及 trace 驱动的诊断闭环。",
    duration: "25s",
    techs: ["Boundary Split", "Hertz + Kitex", "Service Layering", "Trace Visibility"],
    preview: "/previews/arch-evolution-preview.png",
    component: ArchEvolution,
    durationInFrames: 25 * VIDEO.fps,
  },
  {
    title: "数据湖平台",
    titleEn: "Data Lake Platform",
    desc: "围绕真实配置驱动 ETL 重构的机制叙事片。展示多源异构入湖、mapping_rules 到 DAG 的转换、BFS 最优 JOIN 路径，以及两阶段抽取后的 api_payload 回传闭环。",
    duration: "25s",
    techs: ["Config-Driven ETL", "BFS Join Path", "Delivery Loop"],
    preview: "/previews/arch-evolution-preview.png",
    component: DataLake,
    durationInFrames: 25 * VIDEO.fps,
  },
  {
    title: "GitHub 贡献热力图",
    titleEn: "Contribution Heatmap",
    desc: "围绕真实 52 周 GitHub contribution matrix 重构的贡献轨迹叙事片。展示年度贡献墙生长、高峰格子对应的关键事件，以及总贡献数与连续贡献窗口等事实卡。",
    duration: "20s",
    techs: ["52-Week Timeline", "Contribution Facts", "Milestone Mapping"],
    preview: "/previews/github-heatmap-preview.png",
    component: ContributionHeatmap,
    durationInFrames: 20 * VIDEO.fps,
  },
  {
    title: "作品集总叙事片",
    titleEn: "Portfolio Trailer",
    desc: "围绕真实技术身份、系统机制、开源证据与长期贡献轨迹重组的 60 秒总叙事片。通过跨视频 excerpt 与全局桥接层，把作品集从片段轮播升级为完整技术画像。",
    duration: "60s",
    techs: ["Narrative Excerpts", "System Proof", "Contribution Track", "Closing Statement"],
    preview: "/previews/portfolio-trailer-preview.png",
    component: Trailer,
    durationInFrames: 60 * VIDEO.fps,
  },
];
