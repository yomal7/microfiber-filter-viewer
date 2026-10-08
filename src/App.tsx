import { useEffect, useMemo, useState } from "react";

import "./App.css";

import Viewer3D from "./components/Viewer3D";
import ComponentTree from "./components/ComponentTree";
import DetailsPanel from "./components/DetailsPanel";
import CameraControls from "./components/CameraControls";
import SimulationPanel from "./components/SimulationPanel";
import SimulationReadout from "./components/SimulationReadout";

import type { SimulationView } from "./components/Viewer3D";
import type { FilterComponent } from "./types/component";
import type { PreparedRun, SimulationIndex } from "./types/simulation";
import { loadSimulationIndex, loadSimulationRun } from "./utils/simulationData";

type Mode = "explore" | "simulation";

export default function App() {
  const [mode, setMode] = useState<Mode>("explore");

  /* ---------- flow simulation state ---------- */
  const [simIndex, setSimIndex] = useState<SimulationIndex | null>(null);
  const [simRun, setSimRun] = useState<PreparedRun | null>(null);
  const [simError, setSimError] = useState<string | null>(null);
  const [flow, setFlow] = useState(15);
  const [clog, setClog] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [showPaths, setShowPaths] = useState(false);

  const simulating = mode === "simulation";

  // Load the list of runs the first time the simulation is opened.
  useEffect(() => {
    if (!simulating || simIndex) {
      return;
    }

    loadSimulationIndex()
      .then(setSimIndex)
      .catch((error: unknown) => setSimError(String(error)));
  }, [simulating, simIndex]);

  // The run for the chosen flow and clogging.
  const wantedEntry = useMemo(
    () =>
      simIndex?.runs.find(
        (run) =>
          Math.abs(run.inflow_lpm - flow) < 1e-6 &&
          Math.abs(run.clog - clog) < 1e-6,
      ) ?? null,
    [simIndex, flow, clog],
  );

  useEffect(() => {
    if (!simulating || !wantedEntry) {
      return;
    }

    let cancelled = false;

    loadSimulationRun(wantedEntry.file)
      .then((run) => {
        if (!cancelled) {
          setSimRun(run);
          setSimError(null);
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setSimError(String(error));
        }
      });

    return () => {
      cancelled = true;
    };
  }, [simulating, wantedEntry]);

  const simLoading =
    simulating &&
    simError === null &&
    (simIndex === null ||
      (wantedEntry !== null && simRun?.info.case !== wantedEntry.case));

  const simulationView = useMemo<SimulationView | null>(
    () => (simulating ? { run: simRun, playing, speed, showPaths } : null),
    [simulating, simRun, playing, speed, showPaths],
  );

  const [selectedComponent, setSelectedComponent] =
    useState<FilterComponent | null>(null);

  const [isolatedComponent, setIsolatedComponent] =
    useState<FilterComponent | null>(null);

  const [currentView, setCurrentView] = useState("Isometric");

  // 0 = assembled, 1 = fully exploded.
  const [explodeAmount, setExplodeAmount] = useState(0);

  // Increases on every camera button press so the same view can be re-applied.
  const [cameraNonce, setCameraNonce] = useState(0);

  const isExploded = explodeAmount > 0.5;

  /** Select a part from the list or the walkthrough buttons. */
  const handleSelectComponent = (component: FilterComponent) => {
    setSelectedComponent(component);

    // While a part is shown on its own, stepping to another part
    // shows that part on its own too.
    if (isolatedComponent) {
      setIsolatedComponent(component.isolatable ? component : null);
    }
  };

  // Called when the 3D model is clicked (component) or empty space is clicked (null).
  const handleSelectFromViewer = (component: FilterComponent | null) => {
    if (component) {
      setSelectedComponent(component);
      return;
    }

    // While isolating, keep the selection so the details stay visible.
    if (!isolatedComponent) {
      setSelectedComponent(null);
    }
  };

  const handleViewChange = (view: string) => {
    setCurrentView(view);
    setCameraNonce((n) => n + 1);
  };

  const handleIsolate = () => {
    if (selectedComponent?.isolatable) {
      setIsolatedComponent(selectedComponent);
    }
  };

  const handleShowAll = () => {
    setIsolatedComponent(null);
  };

  const handleClose = () => {
    setIsolatedComponent(null);
    setSelectedComponent(null);
  };

  const switchMode = (next: Mode) => {
    setMode(next);
    if (next === "simulation") {
      setIsolatedComponent(null);
      setSelectedComponent(null);
    }
  };

  // Esc: first leaves "show only this part", then clears the selection.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") {
        return;
      }

      if (isolatedComponent) {
        setIsolatedComponent(null);
      } else {
        setSelectedComponent(null);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isolatedComponent]);

  return (
    <div className="app">
      <header className="topbar">
        <div>
          <h1>Microfiber Filtration System</h1>
          <p className="subtitle">
            Two-stage filter for laundry wastewater · interactive 3D model
          </p>
        </div>

        <div className="segmented mode-switch" role="tablist" aria-label="Mode">
          <button
            role="tab"
            aria-selected={!simulating}
            className={!simulating ? "is-active" : ""}
            onClick={() => switchMode("explore")}
          >
            Explore parts
          </button>
          <button
            role="tab"
            aria-selected={simulating}
            className={simulating ? "is-active" : ""}
            onClick={() => switchMode("simulation")}
          >
            Flow simulation
          </button>
        </div>
      </header>

      <main className="layout">
        <aside className="sidebar">
          {simulating ? (
            <SimulationPanel
              runs={simIndex?.runs ?? []}
              mesh={simIndex?.mesh ?? null}
              flow={flow}
              clog={clog}
              playing={playing}
              speed={speed}
              showPaths={showPaths}
              onFlow={setFlow}
              onClog={setClog}
              onPlaying={setPlaying}
              onSpeed={setSpeed}
              onShowPaths={setShowPaths}
            />
          ) : (
            <ComponentTree
              selectedComponent={selectedComponent}
              onSelect={handleSelectComponent}
            />
          )}
        </aside>

        <section className="stage" aria-label="3D model">
          <div className="toolbar">
            <div className="toolbar-group">
              <span className="toolbar-label">View</span>
              <CameraControls
                currentView={currentView}
                onViewChange={handleViewChange}
              />
            </div>

            {!simulating && (
            <div
              className={`toolbar-group${isolatedComponent ? " is-disabled" : ""}`}
              title={
                isolatedComponent
                  ? "Show the whole filter to use the exploded view"
                  : undefined
              }
            >
              <span className="toolbar-label">Layout</span>

              <div className="segmented" role="group" aria-label="Layout">
                <button
                  className={!isExploded ? "is-active" : ""}
                  aria-pressed={!isExploded}
                  disabled={isolatedComponent !== null}
                  onClick={() => setExplodeAmount(0)}
                >
                  Assembled
                </button>
                <button
                  className={isExploded ? "is-active" : ""}
                  aria-pressed={isExploded}
                  disabled={isolatedComponent !== null}
                  onClick={() => setExplodeAmount(1)}
                >
                  Exploded
                </button>
              </div>

              <input
                className="slider"
                type="range"
                min={0}
                max={100}
                value={Math.round(explodeAmount * 100)}
                disabled={isolatedComponent !== null}
                onChange={(event) =>
                  setExplodeAmount(Number(event.target.value) / 100)
                }
                aria-label="Exploded view amount"
              />
            </div>
            )}
          </div>

          <div className="canvas-area">
            <Viewer3D
              selectedComponent={selectedComponent}
              isolatedComponent={isolatedComponent}
              cameraView={currentView}
              cameraNonce={cameraNonce}
              explodeAmount={explodeAmount}
              onSelectComponent={handleSelectFromViewer}
              simulation={simulationView}
            />

            {simulating && simLoading && (
              <div className="isolation-banner" role="status">
                <span>Loading simulation…</span>
              </div>
            )}

            {isolatedComponent && (
              <div className="isolation-banner" role="status">
                <span>
                  Showing only <strong>{isolatedComponent.name}</strong>
                </span>
                <button className="btn btn-small" onClick={handleShowAll}>
                  Show whole filter
                </button>
              </div>
            )}

            <p className="canvas-hint">
              {simulating
                ? "Drag to rotate · Scroll to zoom · Right-drag to pan"
                : "Drag to rotate · Scroll to zoom · Right-drag to pan · Click a part to select it"}
            </p>
          </div>
        </section>

        {simulating ? (
          <SimulationReadout
            info={simRun?.info ?? null}
            loading={simLoading}
            error={simError}
          />
        ) : (
        <DetailsPanel
          component={selectedComponent}
          isIsolated={
            isolatedComponent !== null &&
            isolatedComponent.id === selectedComponent?.id
          }
          onIsolate={handleIsolate}
          onShowAll={handleShowAll}
          onSelect={handleSelectComponent}
          onClose={handleClose}
        />
        )}
      </main>
    </div>
  );
}