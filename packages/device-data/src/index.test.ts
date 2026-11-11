import assert from "node:assert/strict";
import { test } from "node:test";

import { DATA_FORMAT_VERSION } from "./index.ts";

test("workspace runs TypeScript tests", () => {
  assert.equal(DATA_FORMAT_VERSION, 0);
});
