interface CameraControlsProps {
  currentView: string;
  onViewChange: (view: string) => void;
}

interface CameraView {
  name: string;
  position: [number, number, number];
}

const CAMERA_VIEWS: CameraView[] = [
  {
    name: "Front",
    position: [0, -800, 0],
  },
  {
    name: "Rear",
    position: [0, 800, 0],
  },
  {
    name: "Left",
    position: [-800, 0, 0],
  },
  {
    name: "Right",
    position: [800, 0, 0],
  },
  {
    name: "Top",
    position: [0, 0, 800],
  },
  {
    name: "Bottom",
    position: [0, 0, -800],
  },
  {
    name: "Isometric",
    position: [600, -600, 500],
  },
];

export default function CameraControls({
  currentView,
  onViewChange,
}: CameraControlsProps) {
  const changeCamera = (view: CameraView) => {
    window.dispatchEvent(
      new CustomEvent("viewer-camera", {
        detail: {
          position: view.position,
        },
      }),
    );

    onViewChange(view.name);
  };

  const resetCamera = () => {
    changeCamera({
      name: "Isometric",
      position: [600, -600, 500],
    });
  };

  return (
    <div className="bottom-controls">
      <div className="camera-buttons">
        {CAMERA_VIEWS.map((view) => (
          <button
            key={view.name}
            className={currentView === view.name ? "active" : ""}
            onClick={() => changeCamera(view)}
          >
            {view.name}
          </button>
        ))}

        <button className="reset" onClick={resetCamera}>
          Reset
        </button>
      </div>
    </div>
  );
}
