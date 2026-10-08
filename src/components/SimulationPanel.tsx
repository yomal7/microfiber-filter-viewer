import type { SimulationIndexEntry } from "../types/simulation";

const FLOW_OPTIONS = [5, 10, 15, 20, 25];
const CLOG_OPTIONS = [
  { value: 0, label: "Clean" },
  { value: 0.5, label: "50 %" },
  { value: 0.8, label: "80 %" },
];
const SPEED_OPTIONS = [
  { value: 0.25, label: "¼×" },
  { value: 0.5, label: "½×" },
  { value: 1, label: "1×" },
  { value: 2, label: "2×" },
];

interface SimulationPanelProps {
  runs: SimulationIndexEntry[];
  mesh: string | null;
  flow: number;
  clog: number;
  playing: boolean;
  speed: number;
  showPaths: boolean;
  onFlow: (value: number) => void;
  onClog: (value: number) => void;
  onPlaying: (value: boolean) => void;
  onSpeed: (value: number) => void;
  onShowPaths: (value: boolean) => void;
}

function hasRun(runs: SimulationIndexEntry[], flow: number, clog: number) {
  return runs.some(
    (run) => Math.abs(run.inflow_lpm - flow) < 1e-6 && Math.abs(run.clog - clog) < 1e-6,
  );
}

export default function SimulationPanel({
  runs,
  mesh,
  flow,
  clog,
  playing,
  speed,
  showPaths,
  onFlow,
  onClog,
  onPlaying,
  onSpeed,
  onShowPaths,
}: SimulationPanelProps) {
  return (
    <div className="parts sim-panel">
      <div className="parts-header">
        <h2>Flow simulation</h2>
      </div>

      <p className="sim-intro">
        Water from the washing machine, computed with OpenFOAM. Each
        setting below is a separate simulation of the v8 filter.
      </p>

      <div className="sim-field">
        <h3 id="flow-label">Inflow from the washing machine</h3>
        <div className="segmented segmented-wide" role="group" aria-labelledby="flow-label">
          {FLOW_OPTIONS.map((value) => (
            <button
              key={value}
              className={flow === value ? "is-active" : ""}
              aria-pressed={flow === value}
              disabled={!hasRun(runs, value, clog)}
              onClick={() => onFlow(value)}
            >
              {value}
            </button>
          ))}
        </div>
        <p className="sim-unit">L/min · 15 is the design flow</p>
      </div>

      <div className="sim-field">
        <h3 id="clog-label">Filter clogging</h3>
        <div className="segmented segmented-wide" role="group" aria-labelledby="clog-label">
          {CLOG_OPTIONS.map((option) => (
            <button
              key={option.value}
              className={clog === option.value ? "is-active" : ""}
              aria-pressed={clog === option.value}
              disabled={!hasRun(runs, flow, option.value)}
              onClick={() => onClog(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
        <p className="sim-unit">share of the filter area blocked by fibres</p>
      </div>

      <div className="sim-field">
        <h3 id="speed-label">Playback</h3>
        <div className="sim-playback">
          <button className="btn btn-secondary sim-play" onClick={() => onPlaying(!playing)}>
            {playing ? "Pause" : "Play"}
          </button>
          <div className="segmented" role="group" aria-labelledby="speed-label">
            {SPEED_OPTIONS.map((option) => (
              <button
                key={option.value}
                className={speed === option.value ? "is-active" : ""}
                aria-pressed={speed === option.value}
                onClick={() => onSpeed(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
        <p className="sim-unit">1× = real time</p>
      </div>

      <label className="sim-check">
        <input
          type="checkbox"
          checked={showPaths}
          onChange={(event) => onShowPaths(event.target.checked)}
        />
        Show flow paths
      </label>

      <div className="sim-legend">
        <h3>Colours</h3>
        <div className="sim-legend-row">
          <span className="sim-ramp sim-ramp-blue" aria-hidden="true" />
          <span>Water going through the filter (darker = faster)</span>
        </div>
        <div className="sim-legend-row">
          <span className="sim-ramp sim-ramp-orange" aria-hidden="true" />
          <span>Unfiltered water leaving by the overflow</span>
        </div>
        <p className="sim-unit">Speed scale 0 to 0.3 m/s</p>
      </div>

      {mesh && (
        <p className="sim-source">
          OpenFOAM simpleFoam, k-ω SST, {mesh} mesh. Inputs and limitations
          are in the simulation report.
        </p>
      )}
    </div>
  );
}
