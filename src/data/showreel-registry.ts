import type React from "react";
import { ArchEvolution } from "../../remotion/ArchEvolution";
import { ContributionHeatmap } from "../../remotion/ContributionHeatmap";
import { DataLake } from "../../remotion/DataLake";
import { OSSDashboard } from "../../remotion/OSSDashboard";
import { TechCard } from "../../remotion/TechCard";
import { Trailer } from "../../remotion/Trailer";
import { VIDEO } from "../../remotion/shared/theme";
import {
  showreelContent,
  type ShowreelContentItem,
  type ShowreelId,
} from "./showreel-content";

const showreelComponents: Record<ShowreelId, React.FC> = {
  "tech-card": TechCard,
  "oss-dashboard": OSSDashboard,
  "arch-evolution": ArchEvolution,
  "data-lake": DataLake,
  "contribution-heatmap": ContributionHeatmap,
  "portfolio-trailer": Trailer,
};

export interface ShowreelVideo extends ShowreelContentItem {
  component: React.FC;
  durationInFrames: number;
}

export const showreelVideos: ShowreelVideo[] = showreelContent.map((item) => ({
  ...item,
  component: showreelComponents[item.id],
  durationInFrames: item.durationSeconds * VIDEO.fps,
}));
