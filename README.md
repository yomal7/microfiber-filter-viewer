# Microfiber Filtration System Viewer

An interactive 3D viewer for a microfiber filtration system model. The model was designed in FreeCAD, exported to GLB, and is rendered in the browser with React Three Fiber.

## Features

- Interactive 3D model with orbit, pan and zoom
- Component tree to browse the filter parts (Stage 1 and Stage 2 housings, coarse mesh, rubber ring, fine-fibre filter, sensors, inlet, outlet and overflow)
- Exploded view that separates the two-part screw-together filter into its layers
- Click a part in the tree or directly in the 3D view to select it
- Details panel showing each component's description and purpose
- Isolate a selected component and show all parts again
- Camera presets: Front, Rear, Left, Right, Top, Bottom and Isometric
- **Flow simulation mode**: water particles moving through the filter along
  real OpenFOAM flow paths, for 5 flow rates × 3 clogging levels, with the
  20 × 4 LCD readings, a filter status light and where the water goes

## Tech Stack

- [React](https://react.dev/) + TypeScript
- [Vite](https://vite.dev/)
- [Three.js](https://threejs.org/), [@react-three/fiber](https://r3f.docs.pmnd.rs/) and [@react-three/drei](https://drei.docs.pmnd.rs/)

## Getting Started

Requires Node.js and npm.

```bash
npm install
npm run dev
```

Then open the local URL printed in the terminal.

## Scripts

| Command           | Description                       |
| ----------------- | --------------------------------- |
| `npm run dev`     | Start the development server      |
| `npm run build`   | Type-check and build for production |
| `npm run preview` | Preview the production build      |
| `npm run lint`    | Run ESLint                        |

## Project Structure

```
public/models/            GLB model of the filter (microfiber_filter_v8.glb)
public/simulation/        OpenFOAM results for the Flow simulation mode
src/
  components/
    Viewer3D.tsx          3D canvas, model loading, selection and isolation
    ComponentTree.tsx     Left panel: list of components
    DetailsPanel.tsx      Right panel: component details and isolate actions
    CameraControls.tsx    Camera preset buttons
    FlowParticles.tsx     Animated water particles (Flow simulation)
    SimulationPanel.tsx   Left panel in Flow simulation: flow, clogging, playback
    SimulationReadout.tsx Right panel in Flow simulation: LCD, status, flows
  utils/simulationData.ts Loads and prepares the simulation files
  data/components.ts      Component definitions mapped to model objects
  types/component.ts      Shared TypeScript types
  App.tsx                 Main layout and state
```

## Adding or Editing Components

Component information lives in [src/data/components.ts](src/data/components.ts). Each entry links a component to one or more object names in the GLB model through `modelObjectNames`.

## Updating the Flow simulation data

The files in `public/simulation/` come from the
[microfiber-filter-cfd](https://github.com/yomal7/microfiber-filter-cfd) repo.
After its GitHub Actions run finishes, copy its `results/viewer/` folder here:

```bash
rm -rf public/simulation
cp -r ../microfiber-filter-cfd/results/viewer public/simulation
```

Positions in those files are in FreeCAD millimetres (Z up); the viewer
converts them to the GLB axes, so the particles line up with the model.