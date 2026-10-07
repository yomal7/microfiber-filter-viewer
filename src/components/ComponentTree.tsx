import type { FilterComponent } from "../types/component";
import { componentGroups, orderedComponents } from "../data/components";

interface ComponentTreeProps {
  selectedComponent: FilterComponent | null;
  onSelect: (component: FilterComponent) => void;
}

export default function ComponentTree({
  selectedComponent,
  onSelect,
}: ComponentTreeProps) {
  return (
    <nav className="parts" aria-label="Filter parts">
      <div className="parts-header">
        <h2>Parts</h2>
        <span className="parts-count">{orderedComponents.length}</span>
      </div>

      {componentGroups.map((group) => (
        <section className="parts-group" key={group.title}>
          <h3>{group.title}</h3>

          <ul>
            {group.ids.map((id) => {
              const index = orderedComponents.findIndex(
                (item) => item.id === id,
              );
              const component = orderedComponents[index];

              if (!component) {
                return null;
              }

              const isSelected = selectedComponent?.id === component.id;

              return (
                <li key={component.id}>
                  <button
                    className={`part-item${isSelected ? " is-selected" : ""}`}
                    aria-current={isSelected ? "true" : undefined}
                    onClick={() => onSelect(component)}
                  >
                    <span className="part-number">{index + 1}</span>
                    <span className="part-name">{component.name}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </nav>
  );
}