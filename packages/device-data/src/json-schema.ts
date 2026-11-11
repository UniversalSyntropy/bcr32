// JSON Schema (draft 2020-12) generated from the Zod schemas. Cross-file checks and
// refinements are not expressible there; loadDevice is the full validator.
import { z } from "zod";

import { FILES, SCHEMA_VERSION, type FileName } from "./schema.ts";

// Output file name → schema text, e.g. "elements.schema.json".
export function jsonSchemas(): Map<string, string> {
  const out = new Map<string, string>();
  for (const name of Object.keys(FILES) as FileName[]) {
    const file = name.replace(/\.json$/, ".schema.json");
    const schema = {
      ...z.toJSONSchema(FILES[name].schema, { target: "draft-2020-12" }),
      $id: file,
      title: `${name} (schema version ${SCHEMA_VERSION})`,
    };
    out.set(file, `${JSON.stringify(schema, null, 2)}\n`);
  }
  return out;
}
