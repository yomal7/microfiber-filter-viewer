export type ComponentCategory =
  | "housing"
  | "stage"
  | "sensor"
  | "inlet"
  | "outlet"
  | "overflow"
  | "seal"
  | "support"
  | "other";

/** One row in the "Specifications" table of the details panel. */
export interface ComponentSpec {
  label: string;
  value: string;
}

export interface FilterComponent {
  id: string;
  name: string;
  category: ComponentCategory;
  description: string;
  purpose: string;

  /** Key dimensions and materials, shown as a small table. */
  specs?: ComponentSpec[];
  modelObjectNames: string[];
  selectable: boolean;
  isolatable: boolean;
  explodeVector?: {
    x: number;
    y: number;
    z: number;
  };
}

export interface ComponentGroup {
  title: string;
  ids: string[];
}