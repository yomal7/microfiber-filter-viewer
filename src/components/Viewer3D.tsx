import { useEffect, useRef } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import type { FilterComponent } from "../types/component";

interface Viewer3DProps {
  selectedComponent: FilterComponent | null;
  isolatedComponent: FilterComponent | null;
  onSelectObject: (objectName: string) => void;
}

export default function Viewer3D({
  selectedComponent,
  isolatedComponent,
  onSelectObject,
}: Viewer3DProps) {
  return (
    <div className="viewer-wrapper">
      <Canvas
        camera={{
          position: [650, -650, 500],
          fov: 45,
          near: 0.1,
          far: 5000,
        }}
        
        dpr={[1, 1.5]}

        gl={{
          antialias: true,
          powerPreference: "low-power",
        }}>

        {/* =================================================
            BACKGROUND
        ================================================= */}

        <color attach="background" args={["#0b1020"]} />

        {/* =================================================
            LIGHTING
        ================================================= */}

        <ambientLight intensity={1.5} />
        <directionalLight position={[500, -500, 1000]} intensity={2} />
        <directionalLight position={[-500, 300, 500]} intensity={1} />

        {/* =================================================
            MODEL
        ================================================= */}

        <Model
          selectedComponent={selectedComponent}
          isolatedComponent={isolatedComponent}
          onSelectObject={onSelectObject}
        />

        {/* =================================================
            ORBIT CONTROLS
        ================================================= */}
        <DynamicOrbitControls />

        {/* =================================================
            GRID
        ================================================= */}
        <Grid />
      </Canvas>
    </div>
  );
}

/* =========================================================
   MODEL
========================================================= */

function Model({
  selectedComponent,
  isolatedComponent,
  onSelectObject,
}: {
  selectedComponent: FilterComponent | null;
  isolatedComponent: FilterComponent | null;

  onSelectObject: (objectName: string) => void;
}) {
  const { scene } = useGLTF("/models/microfiber_filter_v5.glb");

  const model = useRef<THREE.Object3D | null>(null);

  if (!model.current) {
    model.current = scene.clone(true);

    model.current.scale.set(1000, 1000, 1000);
  }

  useEffect(() => {
    if (!model.current) {
      return;
    }

    const box = new THREE.Box3().setFromObject(model.current);
    const center = new THREE.Vector3();
    const size = new THREE.Vector3();

    box.getCenter(center);
    box.getSize(size);

    console.log("=================================");
    console.log("Microfiber Filter GLB loaded");
    console.log("Scaled model center:", center);
    console.log("Scaled model size:", size);
    console.log("Bounding box:", box);
    console.log("=================================");

    window.dispatchEvent(
      new CustomEvent("model-loaded", {
        detail: {
          center: [center.x, center.y, center.z],
          size: [size.x, size.y, size.z],
        },
      }),
    );
  }, []);

  useEffect(() => {
    if (!model.current) {
      return;
    }

    model.current.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) {
        return;
      }

      if (!object.userData.originalMaterial) {
        object.userData.originalMaterial = object.material;
      }

      object.material = object.userData.originalMaterial;

      const selected =
        selectedComponent?.modelObjectNames.includes(object.name) ?? false;

      const isolated =
        isolatedComponent?.modelObjectNames.includes(object.name) ?? false;

      if (isolatedComponent) {
        object.visible = isolated;
      } else {
        object.visible = true;
      }

      if (selected && object.visible) {
        const material = object.material.clone();

        if (material instanceof THREE.MeshStandardMaterial) {
          material.emissive.set("#00d9ff");
          material.emissiveIntensity = 0.9;
        }
        object.material = material;
      }
    });
  }, [selectedComponent, isolatedComponent]);

  return (
    <primitive
      object={model.current}

      onClick={(event: any) => {
        event.stopPropagation();
        const objectName = event.object?.name;
        if (objectName) {
          onSelectObject(objectName);
        }
      }}
    />
  );
}

/* =========================================================
   GRID
========================================================= */

function Grid() {
  return (
    <gridHelper args={[1000, 20, "#26324a", "#172033"]} position={[0, 0, 0]} />
  );
}

/* =========================================================
   DYNAMIC ORBIT CONTROLS
========================================================= */

function DynamicOrbitControls() {
  const controlsRef = useRef<any>(null);
  const { camera } = useThree();

  const target = useRef(new THREE.Vector3(0, 0, 180));

  useEffect(() => {
    const handleModelLoaded = (event: Event) => {
      const customEvent = event as CustomEvent<{
        center: [number, number, number];
        size: [number, number, number];
      }>;

      const { center, size } = customEvent.detail;
      target.current.set(center[0], center[1], center[2]);
      const maxDimension = Math.max(size[0], size[1], size[2]);
      const distance = maxDimension * 1.8;

      
      camera.position.set(
        center[0] + distance,
        center[1] - distance,
        center[2] + distance * 0.8,
      );

      camera.lookAt(target.current);
      camera.updateProjectionMatrix();

      if (controlsRef.current) {
        controlsRef.current.target.set(center[0], center[1], center[2]);
        controlsRef.current.update();
      }
      console.log("Camera centered on model:", center);
    };

    window.addEventListener("model-loaded", handleModelLoaded);
    return () => {
      window.removeEventListener("model-loaded", handleModelLoaded);
    };
  }, [camera]);

  useEffect(() => {
    const handleCameraChange = (event: Event) => {
      const customEvent = event as CustomEvent<{
        position: [number, number, number];
      }>;

      const { position } = customEvent.detail;

      
      camera.position.set(
        target.current.x + position[0],
        target.current.y + position[1],
        target.current.z + position[2],
      );

      camera.lookAt(target.current);
      camera.updateProjectionMatrix();

      if (controlsRef.current) {
        controlsRef.current.target.set(
          target.current.x,
          target.current.y,
          target.current.z,
        );

        controlsRef.current.update();
      }
    };

    window.addEventListener("viewer-camera", handleCameraChange);
    return () => {
      window.removeEventListener("viewer-camera", handleCameraChange);
    };
  }, [camera]);

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      enableDamping
      dampingFactor={0.08}
      minDistance={50}
      maxDistance={3000}
    />
  );
}

/* =========================================================
   PRELOAD
========================================================= */

useGLTF.preload("/models/microfiber_filter_v5.glb");
