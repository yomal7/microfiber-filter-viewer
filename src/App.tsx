import { useState } from "react";

import "./App.css";

import Viewer3D from "./components/Viewer3D";
import ComponentTree from "./components/ComponentTree";
import DetailsPanel from "./components/DetailsPanel";
import CameraControls from "./components/CameraControls";

import { components } from "./data/components";

import type { FilterComponent } from "./types/component";

export default function App() {
  const [selectedComponent, setSelectedComponent] =
    useState<FilterComponent | null>(null);

  const [isolatedComponent, setIsolatedComponent] =
    useState<FilterComponent | null>(null);

  const [currentView, setCurrentView] = useState("Isometric");

  const handleSelectComponent = (component: FilterComponent) => {
    setSelectedComponent(component);

    // Selecting another component exits isolation.
    setIsolatedComponent(null);
  };

  const handleSelectObject = (objectName: string) => {
    const component = components.find((item) =>
      item.modelObjectNames.includes(objectName),
    );

    if (component) {
      setSelectedComponent(component);
    }
  };

  const handleIsolate = () => {
    if (selectedComponent && selectedComponent.isolatable) {
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
          <div className="brand-mark">MF</div>

          <div>
            <h1>Microfiber Filtration System</h1>

            <span>Interactive Engineering Model</span>
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
              <span className="toolbar-label">VIEW</span>

              <span className="current-view">{currentView}</span>
            </div>

            {isolatedComponent && (
              <div className="isolation-badge">
                ISOLATED: {isolatedComponent.name}
              </div>
            )}
          </div>

          <Viewer3D
            selectedComponent={selectedComponent}
            isolatedComponent={isolatedComponent}
            onSelectObject={handleSelectObject}
          />

          {/* CameraControls is now actually used */}
          <CameraControls
            currentView={currentView}
            onViewChange={setCurrentView}
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
        <span>Microfiber Filtration System</span>

        <span>FreeCAD → GLB → React Three.js</span>

        <span>40 Components</span>
      </footer>
    </div>
  );
}
