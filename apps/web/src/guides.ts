// Guide files from docs/guides/data/, read at build time and checked by the schema.
import { GuideFile } from "@bcr32/device-data";

const files = import.meta.glob("../../../docs/guides/data/*.json", { eager: true, import: "default" }) as Record<string, unknown>;

export const guides: ReadonlyMap<string, GuideFile> = new Map(
  Object.values(files).map((json) => {
    const g = GuideFile.parse(json);
    return [g.id, g] as const;
  }),
);
