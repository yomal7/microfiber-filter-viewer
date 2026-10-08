import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  Color,
  LineBasicMaterial,
  PointsMaterial,
} from "three";

import type { Points } from "three";
import type { PreparedRun } from "../types/simulation";

/**
 * Water particles moving along the OpenFOAM flow paths.
 *
 * Rendered inside the model group, so positions are in GLB space
 * (metres, Y up) and line up with the 3D model exactly.
 *
 * Every path carries the same share of the inflow, and particles are
 * released along it at a fixed time spacing. Where water moves slowly
 * (or circles around) particles bunch up, as dye would.
 */

const MAX_PARTICLES = 9000;
const MIN_SPACING = 0.06; // seconds between particles on one path

/** Speed (m/s) shown as the darkest colour. */
export const SPEED_MAX = 0.3;

const FILTERED_SLOW = new Color("#8fc0ea");
const FILTERED_FAST = new Color("#0b3d91");
const OVERFLOW_SLOW = new Color("#f6b26b");
const OVERFLOW_FAST = new Color("#c2410c");

interface FlowParticlesProps {
  run: PreparedRun;
  playing: boolean;

  /** 1 = real time */
  speed: number;

  showPaths: boolean;

  /** scene units per metre of the model group (for the particle size) */
  worldScale: number;
}

function makeDotTexture(): CanvasTexture {
  const size = 64;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;

  const ctx = canvas.getContext("2d");

  if (ctx) {
    const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(0.55, "rgba(255,255,255,1)");
    g.addColorStop(0.75, "rgba(255,255,255,0.85)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
  }

  return new CanvasTexture(canvas);
}

export default function FlowParticles({
  run,
  playing,
  speed,
  showPaths,
  worldScale,
}: FlowParticlesProps) {
  const pointsRef = useRef<Points>(null);
  const clock = useRef(0);

  /* Which path each particle follows, and its head start along it. */
  const particles = useMemo(() => {
    const totalTime = run.paths.reduce((sum, path) => sum + path.duration, 0);
    const spacing = Math.max(MIN_SPACING, totalTime / MAX_PARTICLES);

    const pathOf: number[] = [];
    const phaseOf: number[] = [];

    run.paths.forEach((path, index) => {
      const count = Math.max(1, Math.floor(path.duration / spacing));
      // spread the start times so paths are not released in step
      const jitter = ((index * 0.618034) % 1) * spacing;

      for (let k = 0; k < count; k++) {
        pathOf.push(index);
        phaseOf.push(k * spacing + jitter);
      }
    });

    return {
      count: pathOf.length,
      pathOf: Int32Array.from(pathOf),
      phaseOf: Float32Array.from(phaseOf),
    };
  }, [run]);

  const geometry = useMemo(() => {
    const geo = new BufferGeometry();
    geo.setAttribute(
      "position",
      new BufferAttribute(new Float32Array(particles.count * 3), 3),
    );
    geo.setAttribute(
      "color",
      new BufferAttribute(new Float32Array(particles.count * 3), 3),
    );
    return geo;
  }, [particles]);

  const material = useMemo(
    () =>
      new PointsMaterial({
        size: 0.0026 * worldScale,
        sizeAttenuation: true,
        vertexColors: true,
        map: makeDotTexture(),
        alphaTest: 0.5,
      }),
    [worldScale],
  );

  /* Faint lines showing every flow path. */
  const pathLines = useMemo(() => {
    const segments: number[] = [];
    const colors: number[] = [];
    const stride = 4;

    for (const path of run.paths) {
      const color = path.exit === "overflow" ? OVERFLOW_SLOW : FILTERED_SLOW;

      for (let s = 0; s + stride < path.steps; s += stride) {
        const a = s * 3;
        const b = (s + stride) * 3;
        segments.push(
          path.positions[a], path.positions[a + 1], path.positions[a + 2],
          path.positions[b], path.positions[b + 1], path.positions[b + 2],
        );
        colors.push(color.r, color.g, color.b, color.r, color.g, color.b);
      }
    }

    const geo = new BufferGeometry();
    geo.setAttribute("position", new BufferAttribute(Float32Array.from(segments), 3));
    geo.setAttribute("color", new BufferAttribute(Float32Array.from(colors), 3));

    const mat = new LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.22,
      depthWrite: false,
    });

    return { geo, mat };
  }, [run]);

  useEffect(
    () => () => {
      geometry.dispose();
      material.map?.dispose();
      material.dispose();
      pathLines.geo.dispose();
      pathLines.mat.dispose();
    },
    [geometry, material, pathLines],
  );

  useFrame((_, delta) => {
    if (playing) {
      // clamp so a background tab does not jump ahead
      clock.current += Math.min(delta, 0.1) * speed;
    }

    const position = geometry.getAttribute("position") as BufferAttribute;
    const color = geometry.getAttribute("color") as BufferAttribute;
    const pos = position.array as Float32Array;
    const col = color.array as Float32Array;
    const dt = run.dt;
    const tmp = new Color();

    for (let i = 0; i < particles.count; i++) {
      const path = run.paths[particles.pathOf[i]];
      const tau = (clock.current + particles.phaseOf[i]) % path.duration;
      const x = tau / dt;
      const s = Math.min(Math.floor(x), path.steps - 2);
      const f = Math.min(x - s, 1);

      const a = s * 3;
      const b = a + 3;
      const p = path.positions;

      pos[i * 3] = p[a] + (p[b] - p[a]) * f;
      pos[i * 3 + 1] = p[a + 1] + (p[b + 1] - p[a + 1]) * f;
      pos[i * 3 + 2] = p[a + 2] + (p[b + 2] - p[a + 2]) * f;

      const v = path.speeds[s] + (path.speeds[s + 1] - path.speeds[s]) * f;
      const k = Math.min(v / SPEED_MAX, 1);

      if (path.exit === "overflow") {
        tmp.copy(OVERFLOW_SLOW).lerp(OVERFLOW_FAST, k);
      } else {
        tmp.copy(FILTERED_SLOW).lerp(FILTERED_FAST, k);
      }

      col[i * 3] = tmp.r;
      col[i * 3 + 1] = tmp.g;
      col[i * 3 + 2] = tmp.b;
    }

    position.needsUpdate = true;
    color.needsUpdate = true;
  });

  return (
    <group>
      <points
        ref={pointsRef}
        geometry={geometry}
        material={material}
        renderOrder={2}
        frustumCulled={false}
      />
      {showPaths && (
        <lineSegments
          geometry={pathLines.geo}
          material={pathLines.mat}
          renderOrder={3}
          frustumCulled={false}
        />
      )}
    </group>
  );
}
