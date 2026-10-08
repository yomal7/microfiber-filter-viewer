import type { RawSimulationRun } from "../types/simulation";

interface SimulationReadoutProps {
  info: RawSimulationRun | null;
  loading: boolean;
  error: string | null;
}

type Status = { tone: "ok" | "warn" | "alert"; title: string; text: string };

function statusFor(info: RawSimulationRun): Status {
  const overflow = info.flows_lpm.overflow;

  if (overflow > 0.05) {
    return {
      tone: "alert",
      title: "Overflowing",
      text: `${overflow.toFixed(1)} L/min leaves through the overflow without being filtered. Clean the filter.`,
    };
  }

  if (info.p1_submerged && info.clog > 0) {
    return {
      tone: "warn",
      title: "Clean the filter soon",
      text: "The water has risen above P1, so the filter is resisting the flow. dP shows how much.",
    };
  }

  return {
    tone: "ok",
    title: "Filter OK",
    text: info.p1_submerged
      ? "All the water passes through the filter."
      : "All the water passes through the filter. The water level is below P1, so P1 and dP show dashes.",
  };
}

export default function SimulationReadout({ info, loading, error }: SimulationReadoutProps) {
  if (error) {
    return (
      <aside className="details" aria-label="Simulation readings">
        <div className="details-body">
          <p className="eyebrow">Flow simulation</p>
          <h2 className="details-title">Simulation data not found</h2>
          <p className="lead">
            Copy the <code>results/viewer</code> folder from the
            microfiber-filter-cfd repo into <code>public/simulation</code>.
          </p>
          <p className="cad-ref">{error}</p>
        </div>
      </aside>
    );
  }

  const status = info ? statusFor(info) : null;

  return (
    <aside className="details" aria-label="Simulation readings">
      <div className="details-body">
        <p className="eyebrow">Sensor readings</p>
        <h2 className="details-title">
          {info ? `${info.inflow_lpm} L/min, ${info.clog === 0 ? "clean filter" : `${Math.round(info.clog * 100)} % clogged`}` : "Loading…"}
        </h2>

        <div className={`lcd${loading ? " is-loading" : ""}`} role="img"
             aria-label={info ? `LCD: ${info.lcd.join(", ")}` : "LCD"}>
          {(info?.lcd ?? ["", "", "", ""]).map((line, index) => (
            <div className="lcd-line" key={index}>
              {line.padEnd(20, " ")}
            </div>
          ))}
        </div>
        <p className="lcd-caption">20 × 4 LCD on the filter, as it would read</p>

        {status && (
          <div className={`status status-${status.tone}`} role="status">
            <span className="status-dot" aria-hidden="true" />
            <div>
              <strong>{status.title}</strong>
              <p>{status.text}</p>
            </div>
          </div>
        )}

        {info && (
          <>
            <h3 className="section-title">Where the water goes</h3>
            <dl className="spec-table">
              <div>
                <dt>Into the filter</dt>
                <dd>{info.inflow_lpm.toFixed(1)} L/min</dd>
              </div>
              <div>
                <dt>Filtered (flow sensor)</dt>
                <dd>{info.flows_lpm.outlet.toFixed(1)} L/min</dd>
              </div>
              <div>
                <dt>Overflow (unfiltered)</dt>
                <dd>{info.flows_lpm.overflow.toFixed(1)} L/min</dd>
              </div>
            </dl>
          </>
        )}

        <h3 className="section-title">How to read it</h3>
        <ul className="sim-notes">
          <li>Each dot is a drop of water released at the inlet, moving at its real speed.</li>
          <li>Dots bunch up where water moves slowly or swirls.</li>
          <li>dP is P1 − P2 with the 152 mm height difference removed: the pressure lost in the filter.</li>
        </ul>
      </div>
    </aside>
  );
}
