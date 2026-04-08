import { lazy, Suspense } from "react";
import { Hero } from "./components/sections/Hero";
import { About } from "./components/sections/About";
import { Projects } from "./components/sections/Projects";
import { Architecture } from "./components/sections/Architecture";
import { Timeline } from "./components/sections/Timeline";
import { Essence } from "./components/sections/Essence";
import { Community } from "./components/sections/Community";
import { Contact } from "./components/sections/Contact";
import { GoldDivider } from "./components/ScrollReveal";
import { ScrollProgressBar } from "./components/ScrollProgressBar";
import "./index.css";

// 懒加载重型组件：Showreel（含 @remotion/player ~100KB）
const Showreel = lazy(() =>
  import("./components/sections/Showreel").then(m => ({
    default: m.Showreel,
  }))
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
  return (
    <div className="relative">
      <ScrollProgressBar />

      <Hero />
      <GoldDivider />
      <About />
      <GoldDivider />
      <Projects />
      <GoldDivider />
      <Architecture />
      <GoldDivider />
      <Essence />
      <GoldDivider />
      <Suspense fallback={<ShowreelSkeleton />}>
        <Showreel />
      </Suspense>
      <GoldDivider />
      <Timeline />
      <GoldDivider />
      <Community />
      <GoldDivider />
      <Contact />
    </div>
  );
}

export default App;
