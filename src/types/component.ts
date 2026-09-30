export type ComponentCategory =
  | "housing"
  | "stage"
  | "sensor"
  | "inlet"
  | "bypass"
  | "outlet"
  | "drain"
  | "vent"
  | "support"
  | "other";

export interface FilterComponent {
  id: string;

  name: string;

  category: ComponentCategory;

  description: string;

  purpose: string;

  modelObjectNames: string[];

  selectable: boolean;

  isolatable: boolean;

  explodeVector?: {
    x: number;
    y: number;
    z: number;
  };
}
