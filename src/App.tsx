import { useState } from "react";

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

  const [currentView, setCurrentView] =
    useState("Isometric");

  // 0 = assembled, 1 = fully exploded.
  const [explodeAmount, setExplodeAmount] =
    useState(0);

  // Increases on every camera button press so the same view can be re-applied.
  const [cameraNonce, setCameraNonce] =
    useState(0);

  const handleSelectComponent = (
    component: FilterComponent
  ) => {
    setSelectedComponent(component);

    // Selecting another component exits isolation.
    setIsolatedComponent(null);
  };

  // Called when the 3D model is clicked (component) or empty space is clicked (null).
  const handleSelectFromViewer = (
    component: FilterComponent | null
  ) => {
    if (component) {
      setSelectedComponent(component);
      return;
    }

    // While isolating, keep the selection so the "Show All" button stays reachable.
    if (!isolatedComponent) {
      setSelectedComponent(null);
    }
  };

  const handleViewChange = (view: string) => {
    setCurrentView(view);
    setCameraNonce((n) => n + 1);
  };

  const handleIsolate = () => {
    if (
      selectedComponent &&
      selectedComponent.isolatable
    ) {
      setIsolatedComponent(selectedComponent);
    }
  };

  const handleShowAll = () => {
    setIsolatedComponent(null);
  };

  return (
    <div className="app">
      {/* =====================================================
          HEADER
      ====================================================== */}

      <header className="topbar">
        <div className="brand">
          <div className="brand-mark">
            MF
          </div>

          <div>
            <h1>
              Microfiber Filtration System
            </h1>

            <span>
              Interactive Engineering Model
            </span>
          </div>
        </div>

        <div className="status">
          <span className="status-dot" />

          MODEL READY
        </div>
      </header>

      {/* =====================================================
          MAIN LAYOUT
      ====================================================== */}

      <main className="main-layout">

        {/* ===================================================
            LEFT — COMPONENT TREE
        ==================================================== */}

        <aside className="left-panel">
          <ComponentTree
            selectedComponent={selectedComponent}
            onSelect={handleSelectComponent}
          />
        </aside>

        {/* ===================================================
            CENTER — 3D VIEWER
        ==================================================== */}

        <section className="viewer-panel">

          <div className="viewer-toolbar">
            <div>
              <span className="toolbar-label">
                VIEW
              </span>

              <span className="current-view">
                {currentView}
              </span>
            </div>

            <div className="toolbar-right">
              <div
                className={`explode-control ${
                  isolatedComponent
                    ? "disabled"
                    : ""
                }`}
              >
                <span className="toolbar-label">
                  EXPLODE
                </span>

                <input
                  type="range"
                  min={0}
                  max={100}
                  value={Math.round(
                    explodeAmount * 100
                  )}
                  disabled={
                    isolatedComponent !== null
                  }
                  onChange={(event) =>
                    setExplodeAmount(
                      Number(
                        event.target.value
                      ) / 100
                    )
                  }
                  aria-label="Exploded view amount"
                />

                <button
                  disabled={
                    isolatedComponent !== null
                  }
                  onClick={() =>
                    setExplodeAmount(
                      explodeAmount > 0.5
                        ? 0
                        : 1
                    )
                  }
                >
                  {explodeAmount > 0.5
                    ? "Assemble"
                    : "Explode"}
                </button>
              </div>

              {isolatedComponent && (
                <div className="isolation-badge">
                  ISOLATED:{" "}
                  {isolatedComponent.name}
                </div>
              )}
            </div>
          </div>

          <Viewer3D
            selectedComponent={selectedComponent}
            isolatedComponent={isolatedComponent}
            cameraView={currentView}
            cameraNonce={cameraNonce}
            explodeAmount={explodeAmount}
            onSelectComponent={handleSelectFromViewer}
          />

          {/* CameraControls is now actually used */}
          <CameraControls
            currentView={currentView}
            onViewChange={handleViewChange}
          />

        </section>

        {/* ===================================================
            RIGHT — DETAILS
        ==================================================== */}

        <DetailsPanel
          component={selectedComponent}
          onIsolate={handleIsolate}
          onShowAll={handleShowAll}
        />

      </main>

      {/* =====================================================
          FOOTER
      ====================================================== */}

      <footer className="footer">
        <span>
          Microfiber Filtration System
        </span>

        <span>
          FreeCAD → GLB → React Three.js
        </span>

        <span>
          40 Components
        </span>
      </footer>
    </div>
  );
}