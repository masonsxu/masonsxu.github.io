import { Hero } from "./components/sections/Hero";
import { About } from "./components/sections/About";
import { Projects } from "./components/sections/Projects";
import { Architecture } from "./components/sections/Architecture";
import { Timeline } from "./components/sections/Timeline";
import { Essence } from "./components/sections/Essence";
import { Showreel } from "./components/sections/Showreel";
import { Community } from "./components/sections/Community";
import { Contact } from "./components/sections/Contact";
import { GoldDivider } from "./components/ScrollReveal";
import { ScrollProgressBar } from "./components/ScrollProgressBar";
import "./index.css";

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
      <Showreel />
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
