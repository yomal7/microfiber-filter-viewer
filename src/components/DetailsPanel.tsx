import type { FilterComponent } from "../types/component";

interface DetailsPanelProps {
  component: FilterComponent | null;
  onIsolate: () => void;
  onShowAll: () => void;
}

export default function DetailsPanel({
  component,
  onIsolate,
  onShowAll,
}: DetailsPanelProps) {
  /*
   * Nothing selected
   */

  if (!component) {
    return (
      <aside className="details-panel empty">
        <div className="empty-icon">+</div>
        <h3>Select a component</h3>
        <p>
          Click a component in the 3D model or choose one from the component
          tree.
        </p>
      </aside>
    );
  }

  /*
   * Component selected
   */

  return (
    <aside className="details-panel">
      {/* ================================================
          COMPONENT HEADER
      ================================================= */}

      <div className="details-header">
        <span className="details-category">
          {component.category.toUpperCase()}
        </span>
        <h2>{component.name}</h2>
      </div>

      {/* ================================================
          DESCRIPTION
      ================================================= */}

      <div className="details-section">
        <h4>Description</h4>
        <p>{component.description}</p>
      </div>

      {/* ================================================
          PURPOSE
      ================================================= */}

      <div className="details-section">
        <h4>Purpose</h4>
        <p>{component.purpose}</p>
      </div>

      {/* ================================================
          CAD OBJECTS
      ================================================= */}

      <div className="details-section">
        <h4>CAD Objects</h4>
        <div className="object-list">
          {component.modelObjectNames.map((objectName) => (
            <div className="object-name" key={objectName}>
              {objectName}
            </div>
          ))}
        </div>
      </div>

      {/* ================================================
          ACTIONS
      ================================================= */}

      <div className="details-actions">
        {component.isolatable && (
          <button className="primary-action" onClick={onIsolate}>
            Isolate Component
          </button>
        )}

        <button className="secondary-action" onClick={onShowAll}>
          Show All
        </button>
      </div>
    </aside>
  );
}
