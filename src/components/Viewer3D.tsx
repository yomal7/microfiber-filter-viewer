import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { Canvas, useFrame, useThree } from "@react-three/fiber";

import {
  Environment,
  Grid,
  Lightformer,
  OrbitControls,
  useGLTF,
} from "@react-three/drei";

import {
  Box3,
  Color,
  MathUtils,
  MeshStandardMaterial,
  PerspectiveCamera,
  Vector3,
} from "three";

import type { Group, Intersection, Material, Mesh } from "three";

import { components } from "../data/components";
import { indexModel } from "../utils/ModelMapping";

import type { FilterComponent } from "../types/component";

/* =====================================================
   CONFIG
===================================================== */

// BASE_URL keeps this working when the site is hosted under a sub-path
// (for example GitHub Pages: https://user.github.io/repo-name/).
const MODEL_URL = `${import.meta.env.BASE_URL}models/microfiber_filter_v7.glb`;

/** The model is scaled so that its largest dimension is this many scene units. */
const TARGET_SIZE = 4;

const HIGHLIGHT = new Color("#22d3ee");

/** Clicking these "sees through" to the parts behind them. */
const SEE_THROUGH_IDS = new Set(["stage1-housing", "stage2-housing"]);

/* =====================================================
   TYPES
===================================================== */

interface Viewer3DProps {
  selectedComponent: FilterComponent | null;
  isolatedComponent: FilterComponent | null;

  /** "Front" | "Rear" | "Left" | "Right" | "Top" | "Bottom" | "Isometric" */
  cameraView: string;

  /** Changes every time a camera button is pressed (so the same view can be re-applied). */
  cameraNonce: number;

  /** false = hide other parts when isolating, true = show them faintly. */
  ghostOthers?: boolean;

  /** 0 = assembled, 1 = fully exploded (animated smoothly). */
  explodeAmount: number;

  /** Called with the clicked component, or null when empty space is clicked. */
  onSelectComponent: (component: FilterComponent | null) => void;
}

interface ExplodeState {
  /** the value currently shown (animated) */
  current: number;

  /** the value we are animating towards */
  target: number;
}

interface ModelRegistry {
  group: Group;
  byComponent: Map<string, Mesh[]>;
}

interface RegistryHolder {
  current: ModelRegistry | null;
}

interface ControlsLike {
  target: Vector3;
  update: () => void;
  addEventListener: (type: string, listener: () => void) => void;
  removeEventListener: (type: string, listener: () => void) => void;
}

interface OriginalMaterialState {
  opacity: number;
  transparent: boolean;
  depthWrite: boolean;
  emissive: Color | null;
  emissiveIntensity: number;
}

type EmissiveMaterial = Material & {
  emissive: Color;
  emissiveIntensity: number;
};

function hasEmissive(material: Material): material is EmissiveMaterial {
  return "emissive" in material;
}

function forEachMaterial(mesh: Mesh, fn: (material: Material) => void) {
  const materials = Array.isArray(mesh.material)
    ? mesh.material
    : [mesh.material];

  materials.forEach(fn);
}

/**
 * Viewing directions. The GLB is Y-up (the exporter converted from
 * FreeCAD's Z-up), and FreeCAD's "front" looks from -Y, which is +Z here.
 */
function directionFor(view: string): Vector3 {
  switch (view.toLowerCase()) {
    case "front":
      return new Vector3(0, 0.1, 1);

    case "rear":
      return new Vector3(0, 0.1, -1);

    case "left":
      return new Vector3(-1, 0.1, 0);

    case "right":
      return new Vector3(1, 0.1, 0);

    case "top":
      return new Vector3(0, 1, 0.001);

    case "bottom":
      return new Vector3(0, -1, 0.001);

    default:
      return new Vector3(1, 0.8, 1); // Isometric
  }
}

/* =====================================================
   VIEWER
===================================================== */

export default function Viewer3D({
  selectedComponent,
  isolatedComponent,
  cameraView,
  cameraNonce,
  ghostOthers = false,
  explodeAmount,
  onSelectComponent,
}: Viewer3DProps) {
  const registryRef = useRef<ModelRegistry | null>(null);

  const explodeRef = useRef<ExplodeState>({ current: 0, target: 0 });

  useEffect(() => {
    explodeRef.current.target = explodeAmount;
  }, [explodeAmount]);

  return (
    <div className="viewer-wrapper">
      <Canvas
        dpr={[1, 2]}
        camera={{ fov: 40, near: 0.01, far: 200, position: [4, 3, 6] }}
        gl={{ antialias: true }}
        onPointerMissed={() => onSelectComponent(null)}
      >
        <color attach="background" args={["#0b1020"]} />

        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 8, 6]} intensity={1.8} />
        <directionalLight position={[-6, 4, -5]} intensity={0.7} />

        {/* Offline studio lighting: nothing is downloaded */}
        <Environment resolution={256} frames={1}>
          <Lightformer
            form="rect"
            intensity={2}
            position={[0, 6, 0]}
            rotation-x={Math.PI / 2}
            scale={[10, 10, 1]}
          />
          <Lightformer
            form="rect"
            intensity={1.2}
            position={[6, 2, 4]}
            rotation-y={-Math.PI / 3}
            scale={[6, 4, 1]}
          />
          <Lightformer
            form="rect"
            intensity={0.8}
            position={[-6, 2, -4]}
            rotation-y={Math.PI / 3}
            scale={[6, 4, 1]}
          />
        </Environment>

        <Grid
          position={[0, -0.002, 0]}
          args={[20, 20]}
          cellSize={0.25}
          cellThickness={0.6}
          cellColor="#1b2b4a"
          sectionSize={1}
          sectionThickness={1}
          sectionColor="#27406b"
          fadeDistance={14}
          fadeStrength={1.5}
          infiniteGrid
        />

        <OrbitControls
          makeDefault
          enableDamping
          dampingFactor={0.08}
          minDistance={0.05}
          maxDistance={25}
          target={[0, 2, 0]}
        />

        <Suspense fallback={null}>
          <FilterModel
            selectedId={selectedComponent?.id ?? null}
            isolatedId={isolatedComponent?.id ?? null}
            ghostOthers={ghostOthers}
            registryRef={registryRef}
            explodeRef={explodeRef}
            onSelectComponent={onSelectComponent}
          />

          <CameraRig
            registryRef={registryRef}
            explodeRef={explodeRef}
            view={cameraView}
            nonce={cameraNonce}
            isolatedId={isolatedComponent?.id ?? null}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}

/* =====================================================
   MODEL
===================================================== */

interface FilterModelProps {
  selectedId: string | null;
  isolatedId: string | null;
  ghostOthers: boolean;
  registryRef: RegistryHolder;
  explodeRef: { current: ExplodeState };
  onSelectComponent: (component: FilterComponent | null) => void;
}

function FilterModel({
  selectedId,
  isolatedId,
  ghostOthers,
  registryRef,
  explodeRef,
  onSelectComponent,
}: FilterModelProps) {
  const { scene } = useGLTF(MODEL_URL);

  const groupRef = useRef<Group>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  /*
   * Clone the scene, give every mesh its own materials, work out which
   * component each mesh belongs to, and compute the centring transform.
   */
  const prepared = useMemo(() => {
    const root = scene.clone(true);

    root.traverse((object) => {
      const mesh = object as Mesh;

      if (!mesh.isMesh) {
        return;
      }

      mesh.material = Array.isArray(mesh.material)
        ? mesh.material.map((material) => material.clone())
        : mesh.material.clone();

      forEachMaterial(mesh, (material) => {
        // glTF defaults to fully metallic, which looks black without a
        // reflective environment. Make it a plastic / brushed-metal look.
        if (material instanceof MeshStandardMaterial) {
          material.metalness = 0.15;
          material.roughness = 0.45;
        }

        const original: OriginalMaterialState = {
          opacity: material.opacity,
          transparent: material.transparent,
          depthWrite: material.depthWrite,
          emissive: hasEmissive(material) ? material.emissive.clone() : null,
          emissiveIntensity: hasEmissive(material)
            ? material.emissiveIntensity
            : 0,
        };

        material.userData.original = original;
      });
    });

    const box = new Box3().setFromObject(root);
    const size = box.getSize(new Vector3());
    const center = box.getCenter(new Vector3());

    const scale = TARGET_SIZE / Math.max(size.x, size.y, size.z);

    // Centre horizontally and stand the model on the grid (y = 0).
    const position = new Vector3(
      -center.x * scale,
      -box.min.y * scale,
      -center.z * scale,
    );

    const index = indexModel(root, components);

    /*
     * Exploded view data. components.ts stores vectors in FreeCAD space
     * (mm, Z-up); the GLB is metres, Y-up:  (x, y, z)_cad -> (x, z, -y)_glb.
     */
    const explodeItems: { mesh: Mesh; base: Vector3; offset: Vector3 }[] = [];

    index.meshOwner.forEach((owner, mesh) => {
      const vector = components.find((item) => item.id === owner)?.explodeVector;

      if (!vector) {
        return;
      }

      explodeItems.push({
        mesh,
        base: mesh.position.clone(),
        offset: new Vector3(vector.x, vector.z, -vector.y).multiplyScalar(0.001),
      });
    });

    return { root, scale, position, index, explodeItems };
  }, [scene]);

  /* Animate the exploded view. */
  useFrame((_, delta) => {
    const state = explodeRef.current;

    // Isolating always shows the part assembled.
    const target = isolatedId ? 0 : state.target;
    const difference = target - state.current;

    if (Math.abs(difference) < 0.0005) {
      if (state.current === target) {
        return;
      }

      state.current = target;
    } else {
      state.current += difference * (1 - Math.exp(-6 * delta));
    }

    for (const item of prepared.explodeItems) {
      item.mesh.position
        .copy(item.base)
        .addScaledVector(item.offset, state.current);
    }
  });

  const selectable = useMemo(
    () =>
      new Set(
        components.filter((item) => item.selectable).map((item) => item.id),
      ),
    [],
  );

  /* Debug output: open the browser console to check the mapping. */
  useEffect(() => {
    const { byComponent, unmatched, missingNames } = prepared.index;

    console.groupCollapsed("[Viewer3D] GLB -> component mapping");

    components.forEach((item) =>
      console.log(`${item.id}: ${byComponent.get(item.id)?.length ?? 0} meshes`),
    );

    if (missingNames.length) {
      console.warn("Names in components.ts NOT found in the GLB:", missingNames);
    }

    if (unmatched.length) {
      console.warn("Meshes not assigned to any component:", unmatched);
    }

    console.groupEnd();
  }, [prepared]);

  /* Let the camera rig know about the model. */
  useEffect(() => {
    if (!groupRef.current) {
      return;
    }

    registryRef.current = {
      group: groupRef.current,
      byComponent: prepared.index.byComponent,
    };

    return () => {
      registryRef.current = null;
    };
  }, [prepared, registryRef]);

  /* Isolation, ghosting, selection and hover looks. */
  useEffect(() => {
    const isolating = isolatedId !== null;

    prepared.index.meshOwner.forEach((owner, mesh) => {
      const inScope = !isolating || owner === isolatedId;
      const ghost = isolating && !inScope;

      mesh.visible = inScope || ghostOthers;

      const highlight =
        ghost || owner === null
          ? 0
          : owner === selectedId
            ? 1
            : owner === hoveredId
              ? 0.5
              : 0;

      forEachMaterial(mesh, (material) => {
        const original = material.userData.original as
          | OriginalMaterialState
          | undefined;

        if (!original) {
          return;
        }

        if (ghost) {
          material.transparent = true;
          material.opacity = Math.min(original.opacity, 0.08);
          material.depthWrite = false;
        } else {
          material.transparent = original.transparent;
          material.opacity = original.opacity;
          material.depthWrite = original.depthWrite;
        }

        if (hasEmissive(material) && original.emissive) {
          if (highlight > 0) {
            material.emissive.copy(HIGHLIGHT);
            material.emissiveIntensity = 0.5 * highlight;
          } else {
            material.emissive.copy(original.emissive);
            material.emissiveIntensity = original.emissiveIntensity;
          }
        }

        material.needsUpdate = true;
      });
    });
  }, [prepared, selectedId, isolatedId, hoveredId, ghostOthers]);

  useEffect(() => {
    document.body.style.cursor = hoveredId ? "pointer" : "auto";

    return () => {
      document.body.style.cursor = "auto";
    };
  }, [hoveredId]);

  /* Decide which component a click / hover should target. */
  const pick = useCallback(
    (hits: Intersection[]): string | null => {
      let fallback: string | null = null;

      for (const hit of hits) {
        const owner = prepared.index.meshOwner.get(hit.object as Mesh);

        if (!owner || !hit.object.visible || !selectable.has(owner)) {
          continue;
        }

        // Faint "ghost" parts are not clickable.
        if (isolatedId && owner !== isolatedId) {
          continue;
        }

        if (SEE_THROUGH_IDS.has(owner)) {
          fallback = fallback ?? owner;
          continue;
        }

        return owner;
      }

      return fallback;
    },
    [prepared, selectable, isolatedId],
  );

  const toComponent = (id: string | null) =>
    id ? (components.find((item) => item.id === id) ?? null) : null;

  return (
    <group
      ref={groupRef}
      scale={prepared.scale}
      position={prepared.position}
      onClick={(event) => {
        event.stopPropagation();
        onSelectComponent(toComponent(pick(event.intersections)));
      }}
      onPointerMove={(event) => {
        event.stopPropagation();
        setHoveredId(pick(event.intersections));
      }}
      onPointerOut={() => setHoveredId(null)}
    >
      <primitive object={prepared.root} />
    </group>
  );
}

useGLTF.preload(MODEL_URL);

/* =====================================================
   CAMERA RIG
   Camera presets + auto-framing of the isolated part.
===================================================== */

interface CameraRigProps {
  registryRef: RegistryHolder;
  explodeRef: { current: ExplodeState };
  view: string;
  nonce: number;
  isolatedId: string | null;
}

interface CameraGoal {
  position: Vector3;
  target: Vector3;
}

function CameraRig({
  registryRef,
  explodeRef,
  view,
  nonce,
  isolatedId,
}: CameraRigProps) {
  const camera = useThree((state) => state.camera) as PerspectiveCamera;

  const controls = useThree(
    (state) => state.controls,
  ) as unknown as ControlsLike | null;

  const goal = useRef<CameraGoal | null>(null);
  const initialised = useRef(false);
  const interacting = useRef(false);
  const wasExploding = useRef(false);
  const previous = useRef({ view, nonce, isolatedId });

  /* Where must the camera be to frame the model (or one component)? */
  const computeFit = useCallback(
    (direction: Vector3, componentId: string | null): CameraGoal | null => {
      const registry = registryRef.current;

      if (!registry) {
        return null;
      }

      registry.group.updateWorldMatrix(true, true);

      const box = new Box3();
      const meshes = componentId
        ? registry.byComponent.get(componentId)
        : undefined;

      if (meshes && meshes.length > 0) {
        meshes.forEach((mesh) => box.expandByObject(mesh));
      } else {
        box.setFromObject(registry.group);
      }

      if (box.isEmpty()) {
        return null;
      }

      /*
       * Find the distance at which every corner of the bounding box fits
       * inside the camera's view for this viewing direction.
       */
      const center = box.getCenter(new Vector3());
      const unit = direction.clone().normalize();

      const probe = new PerspectiveCamera();
      probe.position.copy(center).add(unit); // 1 unit away
      probe.up.set(0, 1, 0);
      probe.lookAt(center);
      probe.updateMatrixWorld(true);

      const tanV = Math.tan(MathUtils.degToRad(camera.fov) / 2);
      const tanH = tanV * camera.aspect;

      let distance = 0;

      for (let i = 0; i < 8; i++) {
        const corner = new Vector3(
          i & 1 ? box.max.x : box.min.x,
          i & 2 ? box.max.y : box.min.y,
          i & 4 ? box.max.z : box.min.z,
        ).applyMatrix4(probe.matrixWorldInverse);

        // corner.z is negative in front of the probe camera.
        distance = Math.max(
          distance,
          1 + Math.abs(corner.x) / tanH + corner.z,
          1 + Math.abs(corner.y) / tanV + corner.z,
        );
      }

      distance *= 1.15;

      return {
        target: center,
        position: center.clone().add(unit.multiplyScalar(distance)),
      };
    },
    [camera, registryRef],
  );

  useEffect(() => {
    if (!controls) {
      return;
    }

    /* First frame: show the whole model from the current view. */
    if (!initialised.current) {
      const fit = computeFit(directionFor(view), isolatedId);

      if (!fit) {
        return;
      }

      initialised.current = true;
      camera.position.copy(fit.position);
      controls.target.copy(fit.target);
      controls.update();

      previous.current = { view, nonce, isolatedId };
      return;
    }

    const last = previous.current;
    let direction: Vector3 | null = null;

    if (last.view !== view || last.nonce !== nonce) {
      direction = directionFor(view);
    } else if (last.isolatedId !== isolatedId) {
      // Keep the current viewing angle, just re-frame.
      direction = camera.position.clone().sub(controls.target);
    }

    previous.current = { view, nonce, isolatedId };

    if (!direction) {
      return;
    }

    const fit = computeFit(direction, isolatedId);

    if (fit) {
      goal.current = fit;
    }
  }, [controls, view, nonce, isolatedId, camera, computeFit]);

  /* If the user grabs the model, cancel the animation. */
  useEffect(() => {
    if (!controls) {
      return;
    }

    const stop = () => {
      goal.current = null;
      interacting.current = true;
    };

    const release = () => {
      interacting.current = false;
    };

    controls.addEventListener("start", stop);
    controls.addEventListener("end", release);

    return () => {
      controls.removeEventListener("start", stop);
      controls.removeEventListener("end", release);
    };
  }, [controls]);

  /* Smooth camera animation. */
  useFrame((_, delta) => {
    if (!controls) {
      return;
    }

    /*
     * While the model is exploding / assembling its size changes, so keep
     * re-framing it (unless the user is orbiting it).
     */
    const explodeTarget = isolatedId ? 0 : explodeRef.current.target;
    const exploding =
      Math.abs(explodeTarget - explodeRef.current.current) > 0.0005;

    if (
      (exploding || wasExploding.current) &&
      initialised.current &&
      !interacting.current
    ) {
      const fit = computeFit(
        camera.position.clone().sub(controls.target),
        isolatedId,
      );

      if (fit) {
        goal.current = fit;
      }
    }

    wasExploding.current = exploding;

    const target = goal.current;

    if (!target) {
      return;
    }

    const k = 1 - Math.exp(-7 * delta);

    camera.position.lerp(target.position, k);
    controls.target.lerp(target.target, k);
    controls.update();

    if (
      camera.position.distanceTo(target.position) < 0.002 &&
      controls.target.distanceTo(target.target) < 0.002
    ) {
      camera.position.copy(target.position);
      controls.target.copy(target.target);
      controls.update();
      goal.current = null;
    }
  });

  return null;
}