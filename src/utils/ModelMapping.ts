import type { Mesh, Object3D } from "three";

import type { FilterComponent } from "../types/component";

/**
 * GLTFLoader splits a CAD object with several faces into child meshes named
 * "<Name>_0", "<Name>_1", ... so we strip one trailing "_<number>" before comparing.
 *   "Stage1_Vertical_Mesh_12" -> "stage1_vertical_mesh"
 */
export function normaliseName(name: string): string {
  return name.trim().toLowerCase().replace(/_\d+$/, "");
}

function namesOf(object: Object3D): string[] {
  const names: string[] = [];

  // GLTFLoader keeps the original (unsanitised) node name here.
  const original: unknown = object.userData?.name;

  if (typeof original === "string" && original) {
    names.push(original);
  }

  if (object.name) {
    names.push(object.name);
  }

  return names;
}

export function buildNameLookup(
  components: FilterComponent[],
): Map<string, string> {
  const lookup = new Map<string, string>();

  for (const component of components) {
    for (const objectName of component.modelObjectNames) {
      lookup.set(normaliseName(objectName), component.id);
    }
  }

  return lookup;
}

/**
 * Walk from a mesh up through its parents until a node name matches a
 * component. This is what makes multi-face CAD objects work.
 */
export function resolveOwner(
  object: Object3D,
  lookup: Map<string, string>,
): string | null {
  let current: Object3D | null = object;

  while (current) {
    for (const name of namesOf(current)) {
      const id = lookup.get(normaliseName(name));

      if (id) {
        return id;
      }
    }

    current = current.parent;
  }

  return null;
}

function describe(object: Object3D): string {
  const chain: string[] = [];
  let current: Object3D | null = object;

  while (current) {
    chain.push(current.name || "(unnamed)");
    current = current.parent;
  }

  return chain.join(" < ");
}

export interface ModelIndex {
  /** every mesh -> owning component id (null = belongs to no component) */
  meshOwner: Map<Mesh, string | null>;

  /** component id -> all of its meshes */
  byComponent: Map<string, Mesh[]>;

  /** meshes that matched no component (debugging) */
  unmatched: string[];

  /** names listed in components.ts that are not in the GLB (debugging) */
  missingNames: string[];
}

export function indexModel(
  root: Object3D,
  components: FilterComponent[],
): ModelIndex {
  const lookup = buildNameLookup(components);

  const meshOwner = new Map<Mesh, string | null>();
  const byComponent = new Map<string, Mesh[]>();
  const unmatched: string[] = [];
  const seen = new Set<string>();

  root.traverse((object) => {
    namesOf(object).forEach((name) => seen.add(normaliseName(name)));

    const mesh = object as Mesh;

    if (!mesh.isMesh) {
      return;
    }

    const owner = resolveOwner(mesh, lookup);
    meshOwner.set(mesh, owner);

    if (owner) {
      const list = byComponent.get(owner) ?? [];
      list.push(mesh);
      byComponent.set(owner, list);
    } else {
      unmatched.push(describe(mesh));
    }
  });

  const missingNames = components.flatMap((component) =>
    component.modelObjectNames.filter(
      (name) => !seen.has(normaliseName(name)),
    ),
  );

  return { meshOwner, byComponent, unmatched, missingNames };
}