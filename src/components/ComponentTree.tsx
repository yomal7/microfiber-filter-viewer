import type { FilterComponent } from "../types/component";
import { components } from "../data/components";

interface ComponentTreeProps {
  selectedComponent: FilterComponent | null;
  onSelect: (component: FilterComponent) => void;
}

interface ComponentGroup {
  title: string;
  ids: string[];
}

const GROUPS: ComponentGroup[] = [
  {
    title: "Housing",
    ids: ["housing"],
  },
  {
    title: "Filtration Stages",
    ids: ["stage1", "stage2"],
  },
  {
    title: "Pressure Sensors",
    ids: ["p1", "p2", "spare"],
  },
  {
    title: "Flow System",
    ids: ["inlet", "bypass", "outlet"],
  },
  {
    title: "Instrumentation",
    ids: ["flow-sensor"],
  },
  {
    title: "Maintenance",
    ids: ["drain", "vent"],
  },
];

export default function ComponentTree({
  selectedComponent,
  onSelect,
}: ComponentTreeProps) {
  return (
    <div className="component-tree">
      {/* HEADER */}

      <div className="panel-title">
        <span>COMPONENTS</span>

        <span className="component-count">{components.length}</span>
      </div>

      {/* GROUPS */}

      {GROUPS.map((group) => (
        <div className="component-group" key={group.title}>
          <div className="group-title">{group.title}</div>

          {group.ids.map((id) => {
            const component = components.find((item) => item.id === id);

            if (!component) {
              return null;
            }

            const isSelected = selectedComponent?.id === component.id;

            return (
              <button
                key={component.id}
                className={`component-item ${isSelected ? "selected" : ""}`}
                onClick={() => onSelect(component)}
              >
                <span className="component-dot" />

                <span>{component.name}</span>
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
