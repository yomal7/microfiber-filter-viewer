/**
 * Data for the "Flow simulation" mode.
 *
 * Each file in public/simulation/ is one OpenFOAM run, written by
 * scripts/postprocess.py in the microfiber-filter-cfd repo
 * (results/viewer/ there). Points are in FreeCAD millimetres, Z up.
 */

export interface SimulationIndexEntry {
  case: string;
  inflow_lpm: number;
  clog: number;
  file: string;
}

export interface SimulationIndex {
  description: string;
  mesh: string;
  runs: SimulationIndexEntry[];
}

export interface RawFlowPath {
  /** seconds since the water entered through the inlet */
  t: number[];

  /** x, y, z, x, y, z, ... in mm (FreeCAD axes) */
  p: number[];

  /** speed in m/s at each point */
  v: number[];

  exit: "outlet" | "overflow";
}

export interface RawSimulationRun {
  case: string;
  inflow_lpm: number;
  clog: number;
  mesh: string;
  lcd: string[];
  sensors_kpa: { P1: number; P2: number; dP: number };
  p1_submerged: boolean;
  flows_lpm: { inlet: number; outlet: number; overflow: number };
  paths: RawFlowPath[];
}

/** A path resampled at a fixed time step, ready for animation. */
export interface PreparedPath {
  /** positions in GLB space (metres, Y up), 3 numbers per step */
  positions: Float32Array;

  /** speed (m/s) per step */
  speeds: Float32Array;

  /** number of time steps */
  steps: number;

  /** total travel time in seconds */
  duration: number;

  exit: "outlet" | "overflow";
}

export interface PreparedRun {
  info: RawSimulationRun;
  paths: PreparedPath[];

  /** time step used for every path (seconds) */
  dt: number;
}