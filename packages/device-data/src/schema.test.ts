import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";

import { jsonSchemas, validateDevice, type FileName } from "./index.ts";

const manual = { source: "manual", ref: "p. 1" };

// Smallest valid device: two callouts, three elements (callout 2 covers two LEDs).
function fixture(): Record<FileName, any> {
  return {
    "device.json": {
      schemaVersion: 1,
      dataVersion: "0.1.0",
      id: "test-device",
      name: "Test device",
      manufacturer: "Test",
      manual: { title: "Manual", version: "1.0" },
      counts: { callouts: 2, elements: 3 },
      views: [{ id: "top", name: "Top panel" }],
      groups: [{ id: "main", name: "Main", view: "top" }],
      ledColours: ["off", "pink"],
      labelColours: ["white"],
    },
    "elements.json": {
      elements: [
        { id: "B1", callout: 1, kind: "button", view: "top", group: "main", colours: ["off", "pink"],
          labels: [{ text: "MODE", placement: "below", colour: "white" }], source: manual },
        { id: "L2.a", callout: 2, kind: "led", view: "top", group: "main", labels: [], source: manual },
        { id: "L2.b", callout: 2, kind: "led", view: "top", group: "main", labels: [],
          source: { source: "unit", firmware: "1.0.3" } },
      ],
    },
    "modes.json": {
      modes: [
        { id: "seq", name: "Sequencer", kind: "mode", enter: [{ action: "tap B1" }], exit: [{ action: "tap B1" }],
          lit: [{ elements: ["B1"], colour: "pink" }], source: manual },
      ],
    },
    "values.json": {
      valueSets: [
        { id: "off-or-level", name: "Level", options: [{ value: "Off" }], range: { min: 1, max: 127 }, source: manual },
      ],
    },
    "functions.json": {
      functions: [
        { id: "seq.level", mode: "seq", elements: ["B1"], name: "Level", values: "off-or-level", default: 100,
          source: manual },
      ],
    },
    "glossary.json": { terms: [{ term: "Step", definition: "One position in a pattern." }] },
  };
}

test("the valid fixture passes", () => {
  const result = validateDevice(fixture());
  assert.deepEqual(result.issues, []);
  assert.equal(result.ok, true);
});

test("optional files can be absent", () => {
  const f = fixture();
  const result = validateDevice({ "device.json": f["device.json"], "elements.json": f["elements.json"] });
  assert.equal(result.ok, true);
});

// Each case breaks the fixture in one way and names the message that must appear.
const broken: [string, (f: Record<FileName, any>) => void, RegExp][] = [
  ["missing required file", (f) => delete f["elements.json"], /required file is missing/],
  ["unknown key", (f) => (f["device.json"].colour = "x"), /[Uu]nrecognized key/],
  ["wrong schema version", (f) => (f["device.json"].schemaVersion = 2), /expected 1/],
  ["bad element ID", (f) => (f["elements.json"].elements[0].id = "b1"), /pattern/],
  ["bad element kind", (f) => (f["elements.json"].elements[0].kind = "knob"), /Invalid option/],
  ["unit source without firmware", (f) => delete f["elements.json"].elements[2].source.firmware, /needs a firmware version/],
  ["missing source", (f) => delete f["elements.json"].elements[0].source, /expected object/],
  ["duplicate element ID", (f) => (f["elements.json"].elements[2].id = "L2.a"), /duplicate element ID/],
  ["element count mismatch", (f) => f["elements.json"].elements.pop(), /2 elements, device.json counts 3/],
  ["callout without element", (f) => (f["device.json"].counts.callouts = 3), /callout 3 has no element/],
  ["unknown group", (f) => (f["elements.json"].elements[0].group = "nope"), /unknown group 'nope'/],
  ["unknown view", (f) => (f["device.json"].groups[0].view = "rear"), /unknown view 'rear'/],
  ["unknown LED colour", (f) => (f["elements.json"].elements[0].colours = ["teal"]), /unknown LED colour 'teal'/],
  ["unknown label colour", (f) => (f["elements.json"].elements[0].labels[0].colour = "gold"), /unknown label colour 'gold'/],
  ["mode lights unknown element", (f) => (f["modes.json"].modes[0].lit[0].elements = ["B9"]), /unknown element 'B9'/],
  ["mode with unknown parent", (f) => (f["modes.json"].modes[0].parent = "ctrl"), /unknown parent 'ctrl'/],
  ["value set with neither options nor range", (f) => {
    delete f["values.json"].valueSets[0].options;
    delete f["values.json"].valueSets[0].range;
  }, /needs options, a range, or both/],
  ["range with min above max", (f) => (f["values.json"].valueSets[0].range = { min: 5, max: 1 }), /min is above max/],
  ["function in unknown mode", (f) => (f["functions.json"].functions[0].mode = "ctrl"), /unknown mode 'ctrl'/],
  ["function on unknown element", (f) => (f["functions.json"].functions[0].elements = ["E25"]), /unknown element 'E25'/],
  ["function with unknown value set", (f) => (f["functions.json"].functions[0].values = "nope"), /unknown value set 'nope'/],
  ["default outside the value set", (f) => (f["functions.json"].functions[0].default = 200), /default '200' is not in value set/],
];

for (const [name, mutate, expected] of broken)
  test(`broken data fails: ${name}`, () => {
    const f = fixture();
    mutate(f);
    const result = validateDevice(f);
    assert.equal(result.ok, false);
    assert.match(result.issues.map((i) => `${i.file} [${i.path}] ${i.message}`).join("\n"), expected);
  });

test("a default that names an option passes", () => {
  const f = fixture();
  f["functions.json"].functions[0].default = "Off";
  assert.equal(validateDevice(f).ok, true);
});

const CLI = join(import.meta.dirname, "cli.ts");

function writeDevice(files: Record<string, unknown>): string {
  const dir = mkdtempSync(join(tmpdir(), "device-data-"));
  for (const [name, value] of Object.entries(files))
    writeFileSync(join(dir, name), typeof value === "string" ? value : JSON.stringify(value));
  return dir;
}

test("the validate command exits 0 on a valid folder and 1 on a broken one", () => {
  const good = spawnSync(process.execPath, [CLI, "validate", writeDevice(fixture())], { encoding: "utf8" });
  assert.equal(good.status, 0, good.stderr);

  const f = fixture();
  f["elements.json"].elements[0].group = "nope";
  const bad = spawnSync(process.execPath, [CLI, "validate", writeDevice(f)], { encoding: "utf8" });
  assert.equal(bad.status, 1);
  assert.match(bad.stderr, /unknown group 'nope'/);

  const notJson = spawnSync(process.execPath, [CLI, "validate", writeDevice({ ...fixture(), "device.json": "{ nope" })], {
    encoding: "utf8",
  });
  assert.equal(notJson.status, 1);
  assert.match(notJson.stderr, /not valid JSON/);
});

test("JSON Schema is generated for every data file and rejects unknown keys", () => {
  const schemas = jsonSchemas();
  assert.deepEqual([...schemas.keys()].sort(), [
    "device.schema.json", "elements.schema.json", "functions.schema.json",
    "glossary.schema.json", "modes.schema.json", "values.schema.json",
  ]);
  const elements = JSON.parse(schemas.get("elements.schema.json")!);
  assert.equal(elements.additionalProperties, false);
  assert.ok(elements.properties.elements.items.required.includes("source"));
});
