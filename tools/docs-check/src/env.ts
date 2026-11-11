// The real environment: files on disk and element IDs from the device data.
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { loadDevice } from "@bcr32/device-data";

import type { Env } from "./types.ts";

export function fsEnv(root: string, deviceDir: string): Env {
  const device = loadDevice(deviceDir);
  if (!device.ok) {
    const first = device.issues[0];
    throw new Error(`device data in ${deviceDir} is not valid (${device.issues.length} issue(s); first: ${first?.file} ${first?.message})`);
  }
  return {
    exists: (path) => existsSync(join(root, path)),
    read: (path) => {
      try {
        return readFileSync(join(root, path), "utf8");
      } catch {
        return undefined;
      }
    },
    controlIds: new Set(device.data.elements.map((e) => e.id)),
  };
}
