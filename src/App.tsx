import { lazy, Suspense, useState } from "react";
import { Hero } from "./components/sections/Hero";
import { About } from "./components/sections/About";
import { Projects } from "./components/sections/Projects";
import { Architecture } from "./components/sections/Architecture";
import { Timeline } from "./components/sections/Timeline";
import { Essence } from "./components/sections/Essence";
import { Community } from "./components/sections/Community";
import { Contact } from "./components/sections/Contact";
import { ScrollProgressBar } from "./components/ScrollProgressBar";
import { ChipFabricBG } from "./components/ChipFabricBG";
import { ClockBar } from "./components/chip/ClockBar";
import { BootSequence } from "./components/chip/BootSequence";
import { PcbTrace } from "./components/chip/PcbTrace";
import { TerminalLauncher } from "./components/terminal/TerminalLauncher";
import { CommandPalette } from "./components/palette/CommandPalette";
import "./index.css";

const Showreel = lazy(() =>
  import("./components/sections/Showreel").then(m => ({ default: m.Showreel })),
);

function ShowreelSkeleton() {
  return (
    <section className="section-padding">
      <div className="section-container">
        <div className="space-y-8">
          <div className="space-y-3">
            <div className="h-5 w-32 bg-surface-elevated/50 rounded animate-pulse" />
            <div className="h-10 w-72 bg-surface-elevated/50 rounded animate-pulse" />
            <div className="h-4 w-96 bg-surface-elevated/30 rounded animate-pulse" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map(i => (
              <div key={i} className="rounded-2xl bg-surface-elevated/20 h-64 animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function App() {
  const [bootDone, setBootDone] = useState(false);

  return (
    <>
      <BootSequence onDone={() => setBootDone(true)} />
      <ChipFabricBG />
      <ScrollProgressBar />
      <ClockBar />
      <TerminalLauncher />
      <CommandPalette />

      <main
        className="relative z-10 pt-12"
        style={{
          opacity: bootDone ? 1 : 0,
          transition: "opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        <div id="hero">
          <Hero />
        </div>
        <PcbTrace variant="straight" height={64} />

        <div id="about">
          <About />
        </div>
        <PcbTrace variant="elbow-r" height={88} />

        <div id="projects">
          <Projects />
        </div>
        <PcbTrace variant="double" height={88} />

        <div id="architecture">
          <Architecture />
        </div>
        <PcbTrace variant="elbow-l" height={88} />

        <div id="essence">
          <Essence />
        </div>
        <PcbTrace variant="straight" height={64} />

        <div id="showreel">
          <Suspense fallback={<ShowreelSkeleton />}>
            <Showreel />
          </Suspense>
        </div>
        <PcbTrace variant="elbow-r" height={88} />

        <div id="timeline">
          <Timeline />
        </div>
        <PcbTrace variant="straight" height={64} />

        <div id="community">
          <Community />
        </div>
        <PcbTrace variant="elbow-l" height={88} />

        <div id="contact">
          <Contact />
        </div>
      </main>
    </>
  );
}

export default App;
