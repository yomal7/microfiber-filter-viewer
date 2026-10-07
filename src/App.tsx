import { useEffect, useState } from "react";

import "./App.css";

import Viewer3D from "./components/Viewer3D";
import ComponentTree from "./components/ComponentTree";
import DetailsPanel from "./components/DetailsPanel";
import CameraControls from "./components/CameraControls";

import type { FilterComponent } from "./types/component";

export default function App() {
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
      </header>

      <main className="layout">
        <aside className="sidebar">
          <ComponentTree
            selectedComponent={selectedComponent}
            onSelect={handleSelectComponent}
          />
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
          </div>

          <div className="canvas-area">
            <Viewer3D
              selectedComponent={selectedComponent}
              isolatedComponent={isolatedComponent}
              cameraView={currentView}
              cameraNonce={cameraNonce}
              explodeAmount={explodeAmount}
              onSelectComponent={handleSelectFromViewer}
            />

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
              Drag to rotate · Scroll to zoom · Right-drag to pan · Click a
              part to select it
            </p>
          </div>
        </section>

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
      </main>
    </div>
  );
}