import type {
  PreparedPath,
  PreparedRun,
  RawFlowPath,
  RawSimulationRun,
  SimulationIndex,
} from "../types/simulation";

const BASE = `${import.meta.env.BASE_URL}simulation/`;

/** Time step of the resampled paths (seconds). */
const DT = 0.02;

let indexPromise: Promise<SimulationIndex> | null = null;
const runCache = new Map<string, Promise<PreparedRun>>();

export function loadSimulationIndex(): Promise<SimulationIndex> {
  if (!indexPromise) {
    indexPromise = fetch(`${BASE}index.json`).then((response) => {
      if (!response.ok) {
        throw new Error(`simulation/index.json: ${response.status}`);
      }
      return response.json() as Promise<SimulationIndex>;
    });
    // allow a retry after a failed load
    indexPromise.catch(() => {
      indexPromise = null;
    });
  }
  return indexPromise;
}

export function loadSimulationRun(file: string): Promise<PreparedRun> {
  let promise = runCache.get(file);

  if (!promise) {
    promise = fetch(`${BASE}${file}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`${file}: ${response.status}`);
        }
        return response.json() as Promise<RawSimulationRun>;
      })
      .then(prepareRun);

    promise.catch(() => runCache.delete(file));
    runCache.set(file, promise);
  }

  return promise;
}

/**
 * FreeCAD (mm, Z up) -> GLB (m, Y up):  (x, y, z) -> (x, z, -y) / 1000.
 * This is the same conversion the FreeCAD glTF exporter applies.
 */
function toGlb(out: Float32Array, offset: number, x: number, y: number, z: number) {
  out[offset] = x / 1000;
  out[offset + 1] = z / 1000;
  out[offset + 2] = -y / 1000;
}

function preparePath(raw: RawFlowPath): PreparedPath | null {
  const count = raw.t.length;

  if (count < 2) {
    return null;
  }

  const t0 = raw.t[0];
  const duration = raw.t[count - 1] - t0;

  if (duration <= 0) {
    return null;
  }

  const steps = Math.max(2, Math.floor(duration / DT) + 1);
  const positions = new Float32Array(steps * 3);
  const speeds = new Float32Array(steps);

  // Walk the raw points once while stepping through time.
  let j = 0;

  for (let s = 0; s < steps; s++) {
    const time = Math.min(t0 + s * DT, raw.t[count - 1]);

    while (j < count - 2 && raw.t[j + 1] < time) {
      j++;
    }

    const ta = raw.t[j];
    const tb = raw.t[j + 1];
    const f = tb > ta ? Math.min(Math.max((time - ta) / (tb - ta), 0), 1) : 0;

    const a = j * 3;
    const b = (j + 1) * 3;

    toGlb(
      positions,
      s * 3,
      raw.p[a] + (raw.p[b] - raw.p[a]) * f,
      raw.p[a + 1] + (raw.p[b + 1] - raw.p[a + 1]) * f,
      raw.p[a + 2] + (raw.p[b + 2] - raw.p[a + 2]) * f,
    );

    speeds[s] = raw.v[j] + (raw.v[j + 1] - raw.v[j]) * f;
  }

  return { positions, speeds, steps, duration, exit: raw.exit };
}

function prepareRun(info: RawSimulationRun): PreparedRun {
  const paths = info.paths
    .map(preparePath)
    .filter((path): path is PreparedPath => path !== null);

  return { info, paths, dt: DT };
}