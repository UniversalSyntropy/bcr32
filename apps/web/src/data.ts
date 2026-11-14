// Device data for the panel, read from the data folder at build time and checked by the schema.
import { DeviceFile, ElementsFile, FunctionsFile, GeometryFile } from "@bcr32/device-data";
import type { PanelData } from "@bcr32/panel";

import deviceJson from "../../../data/devices/bcr32/device.json" with { type: "json" };
import elementsJson from "../../../data/devices/bcr32/elements.json" with { type: "json" };
import functionsJson from "../../../data/devices/bcr32/functions.json" with { type: "json" };
import geometryJson from "../../../data/devices/bcr32/geometry.json" with { type: "json" };

const device = DeviceFile.parse(deviceJson);

export const data: PanelData = {
  geometry: GeometryFile.parse(geometryJson),
  elements: ElementsFile.parse(elementsJson).elements,
  functions: FunctionsFile.parse(functionsJson).functions,
  groupNames: new Map(device.groups.map((g) => [g.id, g.name])),
};
