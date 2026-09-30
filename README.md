# Microfiber Filtration System Viewer

An interactive 3D viewer for a microfiber filtration system model. The model was designed in FreeCAD, exported to GLB, and is rendered in the browser with React Three Fiber.

## Features

- Interactive 3D model with orbit, pan and zoom
- Component tree to browse the filter parts (housing, filtration stages, sensors, inlet, outlet, drain, vent, etc.)
- Click a part in the tree or directly in the 3D view to select it
- Details panel showing each component's description and purpose
- Isolate a selected component and show all parts again
- Camera presets: Front, Rear, Left, Right, Top, Bottom and Isometric

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
public/models/            GLB model of the filter
src/
  components/
    Viewer3D.tsx          3D canvas, model loading, selection and isolation
    ComponentTree.tsx     Left panel: list of components
    DetailsPanel.tsx      Right panel: component details and isolate actions
    CameraControls.tsx    Camera preset buttons
  data/components.ts      Component definitions mapped to model objects
  types/component.ts      Shared TypeScript types
  App.tsx                 Main layout and state
```

## Adding or Editing Components

Component information lives in [src/data/components.ts](src/data/components.ts). Each entry links a component to one or more object names in the GLB model through `modelObjectNames`.
