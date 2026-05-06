export type ShowreelId =
  | "tech-card"
  | "oss-dashboard"
  | "arch-evolution"
  | "data-lake"
  | "contribution-heatmap"
  | "portfolio-trailer";

export interface ShowreelContentItem {
  id: ShowreelId;
  titleEn: string;
  durationSeconds: number;
  techs: string[];
  preview: string;
}

export const showreelContent: ShowreelContentItem[] = [
  {
    id: "tech-card",
    titleEn: "Tech Card",
    durationSeconds: 15,
    techs: ["Go Backend", "CloudWeGo", "Observability", "Data Platform"],
    preview: "/previews/tech-card-preview.png",
  },
  {
    id: "oss-dashboard",
    titleEn: "Open Source Dashboard",
    durationSeconds: 20,
    techs: ["CloudWeGo PRs", "Contribution Facts", "Scope Topology"],
    preview: "/previews/oss-dashboard-preview.png",
  },
  {
    id: "arch-evolution",
    titleEn: "Architecture Evolution",
    durationSeconds: 25,
    techs: ["Boundary Split", "Hertz + Kitex", "Service Layering", "Trace Visibility"],
    preview: "/previews/arch-evolution-preview.png",
  },
  {
    id: "data-lake",
    titleEn: "Data Lake Platform",
    durationSeconds: 25,
    techs: ["Config-Driven ETL", "BFS Join Path", "Delivery Loop"],
    preview: "/previews/datalake-preview.png",
  },
  {
    id: "contribution-heatmap",
    titleEn: "Contribution Heatmap",
    durationSeconds: 20,
    techs: ["52-Week Timeline", "Contribution Facts", "Milestone Mapping"],
    preview: "/previews/github-heatmap-preview.png",
  },
  {
    id: "portfolio-trailer",
    titleEn: "Portfolio Trailer",
    durationSeconds: 60,
    techs: ["Narrative Excerpts", "System Proof", "Contribution Track", "Closing Statement"],
    preview: "/previews/portfolio-trailer-preview.png",
  },
];
