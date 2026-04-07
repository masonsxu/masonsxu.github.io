import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { BackgroundGlow, SceneHeader, VignetteOverlay } from "../shared/components";
import { THEME } from "../shared/theme";
import { sec } from "../shared/utils";
import { LayeredServiceStage } from "./LayeredServiceStage";
import { MonolithStage } from "./MonolithStage";
import { OutcomeStage } from "./OutcomeStage";
import { ServicePathStage } from "./ServicePathStage";
import { TraceStage } from "./TraceStage";

export const ArchEvolution: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        backgroundColor: THEME.obsidian,
        fontFamily: THEME.fontSans,
        color: THEME.pearl,
        overflow: "hidden",
      }}
    >
      <BackgroundGlow color="rgba(212,175,55,0.04)" bottom="18%" left="18%" size={520} />
      <VignetteOverlay />
      <SceneHeader title="架构演进历程" subtitle="Architecture Evolution: Request Path → Service Boundaries → Trace Visibility" />

      <Sequence from={0} durationInFrames={sec(4.5)}>
        <MonolithStage />
      </Sequence>
      <Sequence from={sec(4)} durationInFrames={sec(5.5)}>
        <ServicePathStage />
      </Sequence>
      <Sequence from={sec(9)} durationInFrames={sec(5.5)}>
        <LayeredServiceStage />
      </Sequence>
      <Sequence from={sec(14)} durationInFrames={sec(5.5)}>
        <TraceStage />
      </Sequence>
      <Sequence from={sec(19)} durationInFrames={sec(6)}>
        <OutcomeStage />
      </Sequence>
    </AbsoluteFill>
  );
};
