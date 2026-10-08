import type { FilterComponent } from "../types/component";
import { categoryLabels, orderedComponents } from "../data/components";

interface DetailsPanelProps {
  component: FilterComponent | null;
  isIsolated: boolean;
  onIsolate: () => void;
  onShowAll: () => void;
  onSelect: (component: FilterComponent) => void;
  onClose: () => void;
}

const FLOW_STEPS = [
  "Wastewater from the washing machine enters Stage 1 through the inlet.",
  "P1 reads the pressure before any filtering.",
  "The coarse mesh catches lint and large fibres.",
  "The fine-fibre bucket in Stage 2 catches the smaller microfibres.",
  "Filtered water collects on the domed floor and runs to the rim.",
  "P2 reads the filtered-side pressure; water leaves through the outlet and flow sensor.",
];

export default function DetailsPanel({
  component,
  isIsolated,
  onIsolate,
  onShowAll,
  onSelect,
  onClose,
}: DetailsPanelProps) {
  /* ---------------- Nothing selected: system overview ---------------- */

  if (!component) {
    return (
      <aside className="details" aria-label="Overview">
        <div className="details-body">
          <p className="eyebrow">Overview</p>
          <h2 className="details-title">Two-stage microfiber filter</h2>

          <p className="lead">
            A low-cost filter for laundry wastewater. Two transparent housings
            screw together like a bottle and cap, with a coarse mesh and a
            fine-fibre filter between them. It unscrews for cleaning.
          </p>

          <h3 className="section-title">How water flows</h3>
          <ol className="flow-steps">
            {FLOW_STEPS.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>

          <h3 className="section-title">Key figures</h3>
          <dl className="spec-table">
            <div>
              <dt>Housing diameter</dt>
              <dd>110 mm</dd>
            </div>
            <div>
              <dt>Assembled height</dt>
              <dd>235 mm</dd>
            </div>
            <div>
              <dt>Coarse stage</dt>
              <dd>300-500 µm SS mesh</dd>
            </div>
            <div>
              <dt>Fine stage</dt>
              <dd>50-100 µm fibre media</dd>
            </div>
            <div>
              <dt>Outlet</dt>
              <dd>20 mm bore, YF-B6 flow sensor</dd>
            </div>
            <div>
              <dt>Sensors</dt>
              <dd>P1, P2 and flow rate</dd>
            </div>
          </dl>
        </div>

        <div className="details-footer">
          <button
            className="btn btn-primary btn-block"
            onClick={() => onSelect(orderedComponents[0])}
          >
            Walk through the parts
          </button>
          <p className="hint">Or click any part in the model or the list.</p>
        </div>
      </aside>
    );
  }

  /* ---------------- A part is selected ---------------- */

  const index = orderedComponents.findIndex((item) => item.id === component.id);
  const previous = index > 0 ? orderedComponents[index - 1] : null;
  const next =
    index >= 0 && index < orderedComponents.length - 1
      ? orderedComponents[index + 1]
      : null;

  return (
    <aside className="details" aria-label={`${component.name} details`}>
      <div className="details-body">
        <div className="details-topline">
          <p className="eyebrow">
            Part {index + 1} of {orderedComponents.length} ·{" "}
            {categoryLabels[component.category]}
          </p>
          <button
            className="btn-icon"
            onClick={onClose}
            aria-label="Back to overview"
            title="Back to overview"
          >
            ✕
          </button>
        </div>

        <h2 className="details-title">{component.name}</h2>

        <p className="lead">{component.description}</p>

        <h3 className="section-title">Purpose</h3>
        <p>{component.purpose}</p>

        {component.specs && component.specs.length > 0 && (
          <>
            <h3 className="section-title">Specifications</h3>
            <dl className="spec-table">
              {component.specs.map((spec) => (
                <div key={spec.label}>
                  <dt>{spec.label}</dt>
                  <dd>{spec.value}</dd>
                </div>
              ))}
            </dl>
          </>
        )}

        <p className="cad-ref">
          FreeCAD object{component.modelObjectNames.length > 1 ? "s" : ""}:{" "}
          {component.modelObjectNames.map((name, i) => (
            <span key={name}>
              {i > 0 && ", "}
              <code>{name}</code>
            </span>
          ))}
        </p>
      </div>

      <div className="details-footer">
        {component.isolatable &&
          (isIsolated ? (
            <button className="btn btn-primary btn-block" onClick={onShowAll}>
              Show the whole filter
            </button>
          ) : (
            <button className="btn btn-primary btn-block" onClick={onIsolate}>
              Show only this part
            </button>
          ))}

        <div className="pager">
          <button
            className="btn btn-secondary"
            disabled={!previous}
            onClick={() => previous && onSelect(previous)}
          >
            ← Previous
          </button>
          <button
            className="btn btn-secondary"
            disabled={!next}
            onClick={() => next && onSelect(next)}
          >
            Next →
          </button>
        </div>
      </div>
    </aside>
  );
}