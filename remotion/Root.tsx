import { Composition, Folder, registerRoot } from "remotion";
import { TechCard } from "./TechCard";
import { OSSDashboard } from "./OSSDashboard";
import { ArchEvolution } from "./ArchEvolution";
import { ContributionHeatmap } from "./ContributionHeatmap";
import { DataLake } from "./DataLake";
import { Trailer } from "./Trailer";
import { VIDEO } from "./shared/theme";

const F = VIDEO.fps;

export const RemotionRoot = () => {
  return (
    <>
      <Folder name="Showreel">
        <Composition
          id="TechCard"
          component={TechCard}
          durationInFrames={15 * F}
          fps={F}
          width={VIDEO.width}
          height={VIDEO.height}
        />
        <Composition
          id="OSSDashboard"
          component={OSSDashboard}
          durationInFrames={20 * F}
          fps={F}
          width={VIDEO.width}
          height={VIDEO.height}
        />
        <Composition
          id="ArchEvolution"
          component={ArchEvolution}
          durationInFrames={25 * F}
          fps={F}
          width={VIDEO.width}
          height={VIDEO.height}
        />
        <Composition
          id="ContributionHeatmap"
          component={ContributionHeatmap}
          durationInFrames={20 * F}
          fps={F}
          width={VIDEO.width}
          height={VIDEO.height}
        />
        <Composition
          id="DataLake"
          component={DataLake}
          durationInFrames={25 * F}
          fps={F}
          width={VIDEO.width}
          height={VIDEO.height}
        />
        <Composition
          id="Trailer"
          component={Trailer}
          durationInFrames={TOTAL_DURATION}
          fps={F}
          width={VIDEO.width}
          height={VIDEO.height}
        />
      </Folder>
    </>
  );
};

registerRoot(RemotionRoot);
