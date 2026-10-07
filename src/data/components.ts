import type { FilterComponent } from "../types/component";

/*
 * Model: microfiber_filter_v7.glb  (two-part screw-together filter)
 *
 * modelObjectNames must match the FreeCAD object names exactly
 * (they become the node names in the GLB).
 *
 * explodeVector
 * -------------
 * How far a component moves in the exploded view, in FreeCAD coordinates
 * (millimetres, Z is up, X is right, -Y is the front of the model).
 * The viewer converts this to the GLB's Y-up metre space automatically.
 *
 * The values match EXPLODE_OFFSETS in microfiber_filter_v7.py, so the web
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
      "Transparent upper housing, 110 mm outer diameter and 100 mm tall, with a closed top. Internal threads at its open bottom screw onto the Stage 2 housing, and a small ledge inside clamps the coarse mesh.",
    purpose:
      "Receives the wastewater and holds the inlet, pressure sensor P1 and the overflow pipe. Unscrews from Stage 2 for cleaning.",
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
      "25 mm inlet pipe through a bulkhead fitting in the Stage 1 wall, near the top.",
    purpose:
      "Brings wastewater from the washing machine drain hose into the filter.",
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
      "Pressure sensor on a G1/4 port in the Stage 1 wall, below the inlet and above the coarse mesh.",
    purpose:
      "Measures the upstream pressure before any filtering. P1 minus P2 shows how clogged the filters are.",
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
    modelObjectNames: ["Overflow_Pipe"],
    selectable: true,
    isolatable: true,
    explodeVector: { x: 0, y: 0, z: STAGE1_Z },
  },

  /* ---------------- Filter layers at the joint ---------------- */

  {
    id: "coarse-mesh",
    name: "Coarse Mesh (Stage 1 Filter)",
    category: "stage",
    description:
      "316 stainless steel woven mesh disc, 98 mm across, with roughly 300-500 micron openings. The wire grid is shown at display scale.",
    purpose:
      "First filter stage. Catches lint and large fibres so the fine filter does not clog early. Washable and reusable.",
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
      "Flat EPDM gasket, 98 mm across, sitting under the coarse mesh at the threaded joint.",
    purpose:
      "Compressed when the two housings are screwed together, so water cannot leak out at the joint.",
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
    modelObjectNames: ["Plastic_Support_Ring"],
    selectable: true,
    isolatable: true,
    explodeVector: { x: 0, y: 0, z: FILTER_Z },
  },

  {
    id: "fine-filter",
    name: "Fine-Fibre Filter (Stage 2 Filter)",
    category: "stage",
    description:
      "Bucket-shaped bag of fine fibre media (about 50-100 micron, alkali-treated luffa or PP) hanging inside the Stage 2 housing, with a gap around and below it.",
    purpose:
      "Second filter stage. Captures the smaller microfibres that pass the coarse mesh.",
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
      "Narrower transparent lower housing, 98.5 mm outer diameter and 150 mm tall, with external threads at the top. Its domed floor is raised in the centre and lowest at the outer rim.",
    purpose:
      "Holds the fine-fibre filter and collects the filtered water. The domed floor guides water to the wall and out of the outlet, so the housing drains completely.",
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
      "Pressure sensor on a G1/4 port in the Stage 2 wall, opposite the outlet, in the gap between the domed floor and the filter bucket.",
    purpose:
      "Measures the downstream (filtered) pressure. P1 minus P2 is the pressure drop used to detect clogging.",
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
      "20 mm outlet pipe leaving the Stage 2 wall at the rim of the domed floor. The bottom of its bore is level with the lowest point of the floor.",
    purpose:
      "Carries the filtered water to the drain.",
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
      "In-line hall-effect flow sensor on the outlet pipe, with its bore matched to the pipe.",
    purpose:
      "Measures the flow rate. Pressure drop rises with flow on its own, so flow is needed to compare readings fairly.",
    modelObjectNames: ["Flow_Rate_Sensor"],
    selectable: true,
    isolatable: true,
    explodeVector: { x: 0, y: 0, z: STAGE2_Z },
  },
];
