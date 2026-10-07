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
    title: "Stage 1 Housing",
    ids: ["stage1-housing", "inlet", "p1", "overflow"],
  },
  {
    title: "Filter Layers",
    ids: ["coarse-mesh", "rubber-ring", "plastic-ring", "fine-filter", "cloth-straps"],
  },
  {
    title: "Stage 2 Housing",
    ids: ["stage2-housing", "p2", "outlet", "flow-sensor"],
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
