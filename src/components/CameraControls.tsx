interface CameraControlsProps {
  currentView: string;

  /** Called with the view name every time a camera button is pressed. */
  onViewChange: (view: string) => void;
}

/** value = name Viewer3D understands, label = what the button shows */
const CAMERA_VIEWS = [
  { value: "Isometric", label: "3D" },
  { value: "Front", label: "Front" },
  { value: "Rear", label: "Back" },
  { value: "Left", label: "Left" },
  { value: "Right", label: "Right" },
  { value: "Top", label: "Top" },
  { value: "Bottom", label: "Bottom" },
];

export default function CameraControls({
  currentView,
  onViewChange,
}: CameraControlsProps) {
  return (
    <div className="segmented" role="group" aria-label="Camera view">
      {CAMERA_VIEWS.map((view) => (
        <button
          key={view.value}
          className={currentView === view.value ? "is-active" : ""}
          aria-pressed={currentView === view.value}
          onClick={() => onViewChange(view.value)}
        >
          {view.label}
        </button>
      ))}
    </div>
  );
}