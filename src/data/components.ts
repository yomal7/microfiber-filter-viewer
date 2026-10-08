import type { ComponentGroup, FilterComponent } from "../types/component";

/*
 * Model: microfiber_filter_v8.glb  (two-part screw-together filter, 20 mm outlet)
 *
 * modelObjectNames must match the FreeCAD object names exactly
 * (they become the node names in the GLB).
 *
 * specs: dimensions come from microfiber_filter_v8.py. Heights are
 * measured from the bottom of the Stage 2 housing.
 *
 * explodeVector
 * -------------
 * How far a component moves in the exploded view, in FreeCAD coordinates
 * (millimetres, Z is up, X is right, -Y is the front of the model).
 * The viewer converts this to the GLB's Y-up metre space automatically.
 *
 * The values match EXPLODE_OFFSETS in microfiber_filter_v8.py, so the web
 * exploded view looks the same as set_exploded(True) in FreeCAD:
 *
 *   Stage 2 housing (+ P2, outlet, flow sensor)   z =   0
 *   Fine-fibre filter (ring, bucket, straps)       z = 130
 *   Rubber sealing ring                            z = 155
 *   Coarse mesh                                    z = 180
 *   Stage 1 housing (+ inlet, P1, overflow)        z = 230
 *
 * Parts fixed to a housing use the same vector as that housing, so they
 * stay attached to it when the model explodes.
 */

const STAGE1_Z = 230;
const MESH_Z = 180;
const RUBBER_Z = 155;
const FILTER_Z = 130;
const STAGE2_Z = 0;

export const components: FilterComponent[] = [
  /* ---------------- Stage 1 top housing ---------------- */

  {
    id: "stage1-housing",
    name: "Stage 1 Housing",
    category: "housing",
    description:
      "Transparent upper housing with a closed top. Internal threads at its open bottom screw onto the Stage 2 housing, and a small ledge inside clamps the coarse mesh.",
    purpose:
      "Receives the wastewater and holds the inlet, pressure sensor P1 and the overflow pipe. Unscrews from Stage 2 for cleaning.",
    specs: [
      { label: "Outer diameter", value: "110 mm" },
      { label: "Inner diameter", value: "102 mm" },
      { label: "Height", value: "100 mm" },
      { label: "Wall thickness", value: "4 mm" },
      { label: "Thread", value: "Internal, 4 mm pitch, 15 mm long" },
      { label: "Material", value: "Clear polycarbonate or polypropylene" },
    ],
    modelObjectNames: ["Stage1_Top_Housing"],
    selectable: true,
    isolatable: true,
    explodeVector: { x: 0, y: 0, z: STAGE1_Z },
  },

  {
    id: "inlet",
    name: "Water Inlet",
    category: "inlet",
    description:
      "Inlet pipe through a bulkhead fitting in the Stage 1 wall, near the top.",
    purpose:
      "Brings wastewater from the washing machine drain hose into the filter.",
    specs: [
      { label: "Pipe size", value: "25 mm OD / 21 mm ID" },
      { label: "Height above base", value: "210 mm" },
      { label: "Fitting", value: "Bulkhead through the wall" },
    ],
    modelObjectNames: ["Water_Inlet"],
    selectable: true,
    isolatable: true,
    explodeVector: { x: 0, y: 0, z: STAGE1_Z },
  },

  {
    id: "p1",
    name: "Pressure Sensor P1",
    category: "sensor",
    description:
      "Pressure sensor on a port in the Stage 1 wall, below the inlet and above the coarse mesh.",
    purpose:
      "Measures the upstream pressure before any filtering. P1 minus P2 shows how clogged the filters are.",
    specs: [
      { label: "Port", value: "G1/4 bulkhead (13 mm hole)" },
      { label: "Height above base", value: "180 mm" },
      { label: "Sensor", value: "0-100 kPa, 0.5-4.5 V output" },
    ],
    modelObjectNames: ["P1_Pressure_Port", "P1_Pressure_Sensor"],
    selectable: true,
    isolatable: true,
    explodeVector: { x: 0, y: 0, z: STAGE1_Z },
  },

  {
    id: "overflow",
    name: "Overflow Pipe",
    category: "overflow",
    description:
      "Pipe that leaves through the top of the Stage 1 housing and bends sideways. It is kept separate from the outlet.",
    purpose:
      "Carries water away if Stage 1 backs up, so the washing machine is never blocked. This water is unfiltered, so it never mixes with the filtered outlet. It also lets trapped air escape.",
    specs: [
      { label: "Pipe size", value: "20 mm OD / 16 mm ID" },
      { label: "Rise above lid", value: "25 mm" },
      { label: "Side run", value: "60 mm" },
    ],
    modelObjectNames: ["Overflow_Pipe"],
    selectable: true,
    isolatable: true,
    explodeVector: { x: 0, y: 0, z: STAGE1_Z },
  },

  /* ---------------- Filter layers at the joint ---------------- */

  {
    id: "coarse-mesh",
    name: "Coarse Mesh",
    category: "stage",
    description:
      "Stainless steel woven mesh disc at the threaded joint. The wire grid in the model is drawn at display scale.",
    purpose:
      "First filter stage. Catches lint and large fibres so the fine filter does not clog early. Washable and reusable.",
    specs: [
      { label: "Diameter", value: "98 mm" },
      { label: "Aperture", value: "About 300-500 µm" },
      { label: "Material", value: "316 stainless steel" },
      { label: "Filter stage", value: "Stage 1 (coarse)" },
    ],
    modelObjectNames: ["Coarse_Mesh_Disc"],
    selectable: true,
    isolatable: true,
    explodeVector: { x: 0, y: 0, z: MESH_Z },
  },

  {
    id: "rubber-ring",
    name: "Rubber Sealing Ring",
    category: "seal",
    description:
      "Flat gasket sitting under the coarse mesh at the threaded joint.",
    purpose:
      "Compressed when the two housings are screwed together, so water cannot leak out at the joint.",
    specs: [
      { label: "Size", value: "98 mm OD / 84 mm ID" },
      { label: "Thickness", value: "3 mm" },
      { label: "Material", value: "EPDM rubber" },
    ],
    modelObjectNames: ["Rubber_Sealing_Ring"],
    selectable: true,
    isolatable: true,
    explodeVector: { x: 0, y: 0, z: RUBBER_Z },
  },

  {
    id: "plastic-ring",
    name: "Plastic Support Ring",
    category: "support",
    description:
      "Plastic ring with a flange that rests on the Stage 2 rim and a short collar below it.",
    purpose:
      "Carries the fine-fibre bucket: the bucket's rim is fixed to the collar, which keeps its mouth open.",
    specs: [
      { label: "Flange", value: "98 mm OD / 84 mm ID, 3 mm thick" },
      { label: "Collar", value: "88 mm OD / 82 mm ID, 8 mm tall" },
    ],
    modelObjectNames: ["Plastic_Support_Ring"],
    selectable: true,
    isolatable: true,
    explodeVector: { x: 0, y: 0, z: FILTER_Z },
  },

  {
    id: "fine-filter",
    name: "Fine-Fibre Filter",
    category: "stage",
    description:
      "Bucket-shaped bag of fine fibre media hanging inside the Stage 2 housing, with a gap around and below it for filtered water.",
    purpose:
      "Second filter stage. Captures the smaller microfibres that pass the coarse mesh.",
    specs: [
      { label: "Size", value: "82 mm diameter, 102 mm deep" },
      { label: "Rating", value: "About 50-100 µm" },
      { label: "Media", value: "Alkali-treated luffa or PP fibre" },
      { label: "Filter stage", value: "Stage 2 (fine)" },
    ],
    modelObjectNames: ["Fine_Fibre_Basket"],
    selectable: true,
    isolatable: true,
    explodeVector: { x: 0, y: 0, z: FILTER_Z },
  },

  {
    id: "cloth-straps",
    name: "Cloth Support Straps",
    category: "support",
    description:
      "Two cloth straps fixed to opposite sides of the plastic ring, crossing under the bucket like gift ribbon.",
    purpose:
      "Hold the bucket's shape so it does not sag or balloon out under water pressure.",
    specs: [
      { label: "Count", value: "2, crossed at 90°" },
      { label: "Width", value: "12 mm" },
    ],
    modelObjectNames: ["Cloth_Strap_1", "Cloth_Strap_2"],
    selectable: true,
    isolatable: true,
    explodeVector: { x: 0, y: 0, z: FILTER_Z },
  },

  /* ---------------- Stage 2 bottom housing ---------------- */

  {
    id: "stage2-housing",
    name: "Stage 2 Housing",
    category: "housing",
    description:
      "Narrower transparent lower housing with external threads at the top. Its domed floor is raised in the centre and lowest at the outer rim.",
    purpose:
      "Holds the fine-fibre filter and collects the filtered water. The domed floor guides water to the wall and out of the outlet, so the housing drains completely.",
    specs: [
      { label: "Outer diameter", value: "98.5 mm" },
      { label: "Inner diameter", value: "90.5 mm" },
      { label: "Height", value: "150 mm" },
      { label: "Dome height", value: "15 mm" },
      { label: "Thread", value: "External, 4 mm pitch, 15 mm long" },
      { label: "Material", value: "Clear polycarbonate or polypropylene" },
    ],
    modelObjectNames: ["Stage2_Bottom_Housing"],
    selectable: true,
    isolatable: true,
    explodeVector: { x: 0, y: 0, z: STAGE2_Z },
  },

  {
    id: "p2",
    name: "Pressure Sensor P2",
    category: "sensor",
    description:
      "Pressure sensor on a port in the Stage 2 wall, opposite the outlet, in the gap between the domed floor and the filter bucket.",
    purpose:
      "Measures the downstream (filtered) pressure. P1 minus P2 is the pressure drop used to detect clogging.",
    specs: [
      { label: "Port", value: "G1/4 bulkhead (13 mm hole)" },
      { label: "Height above base", value: "28 mm" },
      { label: "Sensor", value: "0-100 kPa, 0.5-4.5 V output" },
    ],
    modelObjectNames: ["P2_Pressure_Port", "P2_Pressure_Sensor"],
    selectable: true,
    isolatable: true,
    explodeVector: { x: 0, y: 0, z: STAGE2_Z },
  },

  {
    id: "outlet",
    name: "Outlet",
    category: "outlet",
    description:
      "Outlet pipe leaving the Stage 2 wall at the rim of the domed floor. The bottom of its bore is level with the lowest point of the floor.",
    purpose: "Carries the filtered water to the drain.",
    specs: [
      { label: "Pipe size", value: "24 mm OD / 20 mm ID" },
      { label: "Centre height", value: "15 mm above base" },
      { label: "Bore bottom", value: "Level with floor rim (5 mm)" },
    ],
    modelObjectNames: ["Outlet_Pipe", "Final_Outlet"],
    selectable: true,
    isolatable: true,
    explodeVector: { x: 0, y: 0, z: STAGE2_Z },
  },

  {
    id: "flow-sensor",
    name: "Flow Rate Sensor",
    category: "sensor",
    description:
      "YF-B6 brass hall-effect flow sensor on the outlet pipe, with G3/4 threads to match the 20 mm pipe.",
    purpose:
      "Measures the flow rate. Pressure drop rises with flow on its own, so flow is needed to compare readings fairly.",
    specs: [
      { label: "Model", value: "YF-B6, G3/4 brass" },
      { label: "Range", value: "1–30 L/min, ±3 %" },
      { label: "Signal", value: "Pulses: Hz = 6.6 × L/min" },
      { label: "Body (model)", value: "34 mm OD, 60 mm long" },
    ],
    modelObjectNames: ["Flow_Rate_Sensor"],
    selectable: true,
    isolatable: true,
    explodeVector: { x: 0, y: 0, z: STAGE2_Z },
  },
];

/** Sidebar groups. Their order is also the order of the part walkthrough. */
export const componentGroups: ComponentGroup[] = [
  {
    title: "Stage 1 housing",
    ids: ["stage1-housing", "inlet", "p1", "overflow"],
  },
  {
    title: "Filter layers",
    ids: [
      "coarse-mesh",
      "rubber-ring",
      "plastic-ring",
      "fine-filter",
      "cloth-straps",
    ],
  },
  {
    title: "Stage 2 housing",
    ids: ["stage2-housing", "p2", "outlet", "flow-sensor"],
  },
];

/** All components in walkthrough order (top of the filter to the bottom). */
export const orderedComponents: FilterComponent[] = componentGroups
  .flatMap((group) => group.ids)
  .map((id) => components.find((item) => item.id === id))
  .filter((item): item is FilterComponent => item !== undefined);

export const categoryLabels: Record<FilterComponent["category"], string> = {
  housing: "Housing",
  stage: "Filter stage",
  sensor: "Sensor",
  inlet: "Inlet",
  outlet: "Outlet",
  overflow: "Overflow",
  seal: "Seal",
  support: "Support",
  other: "Other",
};