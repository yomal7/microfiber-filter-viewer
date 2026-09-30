interface CameraControlsProps {
  currentView: string;

  /** Called with the view name every time a camera button is pressed. */
  onViewChange: (view: string) => void;
}

const CAMERA_VIEWS = [
  "Front",
  "Rear",
  "Left",
  "Right",
  "Top",
  "Bottom",
  "Isometric",
];

export default function CameraControls({
  currentView,
  onViewChange,
}: CameraControlsProps) {
  return (
    <div className="bottom-controls">
      <div className="camera-buttons">
        {CAMERA_VIEWS.map((view) => (
          <button
            key={view}
            className={currentView === view ? "active" : ""}
            onClick={() => onViewChange(view)}
          >
            {view}
          </button>
        ))}

        <button
          className="reset"
          onClick={() => onViewChange("Isometric")}
        >
          Reset
        </button>
      </div>
    </div>
  );
}