import type { FilterComponent } from "../types/component";

/*
 * explodeVector
 * -------------
 * How far a component moves in the exploded view, in FreeCAD coordinates
 * (millimetres, Z is up, X is right, -Y is the front of the model).
 * The viewer converts this to the GLB's Y-up metre space automatically.
 *
 * Both filter stages lift out through the top (like removing the lid in
 * real life), so Stage 2 must clear the lid at z = 360 mm.
 *
 * Parts that share a pipe run (outlet / flow sensor / vent) move together
 * in Y so they stay lined up, then separate along their own extra axis.
 */

export const components: FilterComponent[] = [
  {
    id: "housing",
    name: "Housing",
    category: "housing",
    description:
      "Main cylindrical enclosure containing the filtration stages.",
    purpose:
      "Provides structural containment for the filtration system.",
    modelObjectNames: [
      "Housing_Wall",
      "Housing_Base",
      "Housing_Lid",
      "Lid_O_Ring",
    ],
    selectable: true,
    isolatable: true,
    explodeVector: { x: 0, y: 0, z: 0 },
  },

  {
    id: "stage1",
    name: "Stage 1 — Coarse Filtration",
    category: "stage",
    description:
      "First filtration stage designed to capture larger debris and fibers.",
    purpose:
      "Initial microfiber/debris capture and flow conditioning.",
    modelObjectNames: [
      "Stage1_Basket_Ring",
      "Stage1_Vertical_Mesh",
      "Stage1_Horizontal_Mesh",
      "Stage1_Support",
      "Stage1_Top_O_Ring",
      "Stage1_Bottom_O_Ring",
    ],
    selectable: true,
    isolatable: true,
    explodeVector: { x: 0, y: 0, z: 390 },
  },

  {
    id: "stage2",
    name: "Stage 2 — Fine Filtration",
    category: "stage",
    description:
      "Fine filtration cartridge containing the porous filtration medium.",
    purpose:
      "Captures smaller microfiber particles after Stage 1.",
    modelObjectNames: [
      "Stage2_Cartridge_Wall",
      "Stage2_Porous_Media",
      "Stage2_Bottom_Support",
      "Stage2_Top_Support",
      "Stage2_Top_O_Ring",
      "Stage2_Bottom_O_Ring",
    ],
    selectable: true,
    isolatable: true,
    explodeVector: { x: 0, y: 0, z: 310 },
  },

  {
    id: "p1",
    name: "P1 Pressure Sensor",
    category: "sensor",
    description:
      "Pressure measurement point upstream of the filtration stages.",
    purpose:
      "Measures pressure before the filtration stages.",
    modelObjectNames: [
      "P1_Pressure_Port",
    ],
    selectable: true,
    isolatable: true,
    explodeVector: { x: 120, y: 0, z: 0 },
  },

  {
    id: "p2",
    name: "P2 Pressure Sensor",
    category: "sensor",
    description:
      "Pressure measurement point downstream of the filtration stages.",
    purpose:
      "Measures downstream pressure and helps determine pressure drop.",
    modelObjectNames: [
      "P2_Pressure_Port",
    ],
    selectable: true,
    isolatable: true,
    explodeVector: { x: -120, y: 0, z: 0 },
  },

  {
    id: "spare",
    name: "Spare Pressure Port",
    category: "sensor",
    description:
      "Reserved pressure measurement connection.",
    purpose:
      "Provides an additional connection point for future instrumentation.",
    modelObjectNames: [
      "Spare_Port",
    ],
    selectable: true,
    isolatable: true,
    explodeVector: { x: 0, y: 90, z: 0 },
  },

  {
    id: "inlet",
    name: "Main Inlet",
    category: "inlet",
    description:
      "Main wastewater inlet and diffuser assembly.",
    purpose:
      "Introduces wastewater into the filtration system.",
    modelObjectNames: [
      "Main_Inlet_Pipe",
      "Inlet_Downturned_Diffuser",
      "Inlet_Diffuser_Head",
    ],
    selectable: true,
    isolatable: true,
    explodeVector: { x: -160, y: 0, z: 0 },
  },

  {
    id: "bypass",
    name: "Bypass System",
    category: "bypass",
    description:
      "Bypass flow path around the main filtration stages.",
    purpose:
      "Provides an alternative flow route when required.",
    modelObjectNames: [
      "Bypass_Entrance",
      "Bypass_Vertical",
      "Bypass_Relief_Valve",
      "Bypass_Lower_Pipe",
      "Bypass_Return_Vertical",
      "Bypass_Return_After_Sensor",
      "Bypass_Return_Tee",
    ],
    selectable: true,
    isolatable: true,
    explodeVector: { x: 0, y: 130, z: 0 },
  },

  {
    id: "outlet",
    name: "Outlet / Goose Neck",
    category: "outlet",
    description:
      "Outlet transfer and raised goose-neck assembly.",
    purpose:
      "Transfers filtered water toward the final outlet.",
    modelObjectNames: [
      "Outlet_Low_Section",
      "Gooseneck_Transfer",
      "Gooseneck_Rising_Leg",
      "Final_Outlet",
    ],
    selectable: true,
    isolatable: true,
    explodeVector: { x: 0, y: -100, z: 0 },
  },

  {
    id: "flow-sensor",
    name: "Flow Sensor",
    category: "sensor",
    description:
      "Inline flow measurement assembly downstream of the bypass return.",
    purpose:
      "Measures the system flow rate.",
    modelObjectNames: [
      "Flow_Sensor_Body",
      "Flow_Sensor_Electronics",
      "Flow_Sensor_Downstream_Straight",
    ],
    selectable: true,
    isolatable: true,
    explodeVector: { x: 100, y: -100, z: 0 },
  },

  {
    id: "drain",
    name: "Bottom Drain",
    category: "drain",
    description:
      "Drain connection located at the bottom of the housing.",
    purpose:
      "Allows accumulated water or material to be removed.",
    modelObjectNames: [
      "Bottom_Drain",
      "Drain_Plug_Valve",
    ],
    selectable: true,
    isolatable: true,
    explodeVector: { x: 0, y: 0, z: -90 },
  },

  {
    id: "vent",
    name: "Vent",
    category: "vent",
    description:
      "Vent and siphon-breaker assembly.",
    purpose:
      "Allows air management and prevents unwanted siphoning.",
    modelObjectNames: [
      "Vent_Siphon_Breaker",
      "Vent_Cap",
    ],
    selectable: true,
    isolatable: true,
    explodeVector: { x: 0, y: -100, z: 80 },
  },
];