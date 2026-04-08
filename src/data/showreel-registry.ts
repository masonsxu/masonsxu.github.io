import type React from "react";
import { ArchEvolution } from "../../remotion/ArchEvolution";
import { ContributionHeatmap } from "../../remotion/ContributionHeatmap";
import { DataLake } from "../../remotion/DataLake";
import { OSSDashboard } from "../../remotion/OSSDashboard";
import { TechCard } from "../../remotion/TechCard";
import { Trailer } from "../../remotion/Trailer";
import { VIDEO } from "../../remotion/shared/theme";
import { showreelContent, type ShowreelContentItem } from "./showreel-content";

type ShowreelRuntimeConfig = {
  component: React.FC;
  durationInFrames: number;
};

const showreelRuntimeRegistry: Record<ShowreelContentItem["id"], ShowreelRuntimeConfig> = {
  "tech-card": {
    component: TechCard,
    durationInFrames: 15 * VIDEO.fps,
  },
  "oss-dashboard": {
    component: OSSDashboard,
    durationInFrames: 20 * VIDEO.fps,
  },
  "arch-evolution": {
    component: ArchEvolution,
    durationInFrames: 25 * VIDEO.fps,
  },
  "data-lake": {
    component: DataLake,
    durationInFrames: 25 * VIDEO.fps,
  },
  "contribution-heatmap": {
    component: ContributionHeatmap,
    durationInFrames: 20 * VIDEO.fps,
  },
  "portfolio-trailer": {
    component: Trailer,
    durationInFrames: 60 * VIDEO.fps,
  },
};

export interface ShowreelVideo extends ShowreelContentItem {
  component: React.FC;
  durationInFrames: number;
}

export const showreelVideos: ShowreelVideo[] = showreelContent.map((item) => ({
  ...item,
  ...showreelRuntimeRegistry[item.id],
}));
