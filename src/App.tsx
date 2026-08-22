import { lazy, Suspense } from "react";
import { StudioApp } from "./components/v5/StudioApp";
import "./index.css";

const ObservatoryApp = lazy(() =>
  import("./components/v3/ObservatoryApp").then(m => ({ default: m.ObservatoryApp })),
);

const NeuralApp = lazy(() =>
  import("./components/v2/NeuralApp").then(m => ({ default: m.NeuralApp })),
);

export function App() {
  const v = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("v") : null;
  if (v === "spine") {
    return (
      <Suspense fallback={null}>
        <NeuralApp />
      </Suspense>
    );
  }
  if (v === "obs") {
    return (
      <Suspense fallback={null}>
        <ObservatoryApp blackhole />
      </Suspense>
    );
  }
  return <StudioApp />;
}

export default App;
