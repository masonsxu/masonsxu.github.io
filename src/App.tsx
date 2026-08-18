import { lazy, Suspense } from "react";
import { ObservatoryApp } from "./components/v3/ObservatoryApp";
import "./index.css";

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
  // default: EVENT HORIZON (black hole observatory) · ?v=obs: plain flight
  return <ObservatoryApp blackhole={v !== "obs"} />;
}

export default App;
