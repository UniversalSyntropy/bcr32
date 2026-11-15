// The checks of guide-check (B6 brief 5.4, D3 section 8). Pure over data in memory, apart from the Drift check,
// which reads the guide document through `ctx.readDoc`.
import { checkGuide, GuideFile, type DeviceData } from "@bcr32/device-data";
import {
  checkGuideActions,
  checkGuideAfter,
  demoEngine,
  elementIndex,
  guideEngine,
  NOT_SIMULATED,
  parseAction,
  withoutTokens,
  type Action,
} from "@bcr32/device-model";

export type Level = "error" | "warning";
export type CheckName = "Schema" | "IDs" | "Grammar" | "After" | "Ring" | "Focus" | "Tokens" | "Text" | "Status" | "Mode path" | "Unknown lit" | "Drift" | "Not simulated";

export interface Finding {
  level: Level;
  check: CheckName;
  file: string;
  message: string;
}

export interface Ctx {
  device: DeviceData;
  readDoc: (path: string) => string | undefined; // path relative to the repo root; undefined: no such file
}

export const CAPTION_LIMIT = 20;
export const EXPECT_LIMIT = 25;
const VERBS = new Set(["press", "hold", "turn", "push", "tap", "release"]);
const CONTRACTION = /\b\w+n['’]t\b|\b\w+['’](?:re|ve|ll)\b|\b(?:it|that|there|here|what|let|who)['’]s\b/i;
// These ring styles have no "/off" row in rings.json, so the unit rejects the combination.
const RING_BASES = ["pan", "spread", "qual"];

const wordsOf = (text: string) => withoutTokens(text, " T ").split(/\s+/).filter((w) => w !== "");

export function checkGuideData(name: string, raw: unknown, ctx: Ctx): Finding[] {
  const file = `${name}.json`;
  const out: Finding[] = [];
  const add = (check: CheckName, level: Level, where: string, message: string) => out.push({ level, check, file, message: where === "" ? message : `${where}: ${message}` });

  const parsed = GuideFile.safeParse(raw);
  if (!parsed.success) {
    for (const i of parsed.error.issues) add("Schema", "error", `guide '${name}'`, `${i.path.join(".") || "(file)"}: ${i.message}`);
    return out;
  }
  const guide = parsed.data;
  const where = (step: string) => `guide '${guide.id}', step '${step}'`;
  const device = ctx.device;
  const ids = new Set(device.elements.map((e) => e.id));
  const els = elementIndex(device);
  const modeIds = new Set(device.modes.map((m) => m.id));

  // Schema and IDs from device-data (B1).
  for (const i of checkGuide(guide, device, name)) {
    if (i.message.includes("malformed token")) add("Tokens", "error", "", i.message);
    else if (i.message.includes("unknown element")) add("IDs", "error", "", i.message);
    else add("Schema", "error", "", i.message);
  }
  if (!modeIds.has(guide.start.mode)) add("IDs", "error", `guide '${guide.id}'`, `start.mode '${guide.start.mode}' is not a mode in modes.json`);

  // Grammar (B2). An unknown element in an action is an ID fault.
  for (const i of checkGuideActions(guide, els)) add(i.message.includes("unknown element") ? "IDs" : "Grammar", "error", "", i.message);

  // After (B2): ViewPatch, encoder keys, style names. A `pressed` key fails here.
  for (const i of checkGuideAfter(guide, device)) add("After", "error", "", i.message);

  for (const step of guide.steps) {
    const w = where(step.id);
    const after = (step.after ?? {}) as Record<string, unknown>;
    for (const part of ["buttons", "rings", "leds"]) {
      const group = after[part];
      if (typeof group !== "object" || group === null) continue;
      for (const id of Object.keys(group)) if (!ids.has(id)) add("IDs", "error", w, `unknown element '${id}' in after.${part}`);
    }
    const mode = after["mode"];
    if (typeof mode === "string" && !modeIds.has(mode)) add("IDs", "error", w, `after.mode '${mode}' is not a mode in modes.json`);

    // Ring: the unit rejects pan, spread and qual with "/off".
    const rings = typeof after["rings"] === "object" && after["rings"] !== null ? (after["rings"] as Record<string, unknown>) : {};
    const known = new Set(device.rings.map((r) => r.id));
    for (const [id, ring] of Object.entries(rings)) {
      const style = typeof ring === "object" && ring !== null ? (ring as { style?: unknown }).style : undefined;
      if (typeof style !== "string") continue;
      for (const base of RING_BASES) if (style === `${base}/off` && !known.has(style)) add("Ring", "error", w, `after.rings.${id}.style '${style}': the unit rejects '${base}' with '/off'`);
    }

    // Focus: each control of the action is in focus.
    const r = step.action === undefined ? undefined : parseAction(step.action, els);
    if (r !== undefined && r.ok) {
      for (const id of actionIds(r.action)) if (!step.focus.includes(id)) add("Focus", "error", w, `action '${step.action}' names '${id}', which is not in focus`);
    }

    // Tokens: a control named in the text must be a token.
    for (const [field, m] of [["caption", step.caption], ["expect", step.expect], ["warn", step.warn]] as const) {
      if (m === undefined) continue;
      const bare = withoutTokens(m.en).split(/[^A-Za-z0-9.]+/).map((x) => x.replace(/\.+$/, "")).filter((x) => ids.has(x));
      for (const id of new Set(bare)) add("Tokens", "error", w, `${field} names '${id}' without a token; write {${id}}`);
    }

    // Text: length limits, one action verb, no contraction.
    const verbCount = wordsOf(step.caption.en).filter((x) => VERBS.has(x.toLowerCase())).length;
    const allowed = r !== undefined && r.ok && r.action.kind === "combo" ? 2 : 1;
    if (wordsOf(step.caption.en).length > CAPTION_LIMIT) add("Text", "error", w, `caption has ${wordsOf(step.caption.en).length} words; the limit is ${CAPTION_LIMIT}`);
    if (verbCount > allowed) add("Text", "error", w, `caption has ${verbCount} action verbs; the action allows ${allowed}`);
    for (const [field, m] of [["expect", step.expect], ["warn", step.warn]] as const)
      if (m !== undefined && wordsOf(m.en).length > EXPECT_LIMIT) add("Text", "error", w, `${field} has ${wordsOf(m.en).length} words; the limit is ${EXPECT_LIMIT}`);
    for (const [field, m] of [["caption", step.caption], ["expect", step.expect], ["warn", step.warn]] as const)
      if (m !== undefined && CONTRACTION.test(m.en)) add("Text", "error", w, `${field} holds a contraction; write the full words`);

    // Status.
    if (guide.status === "verified" && step.source !== undefined && step.source.source !== "unit")
      add("Status", "error", w, `the guide is verified but the step source is '${step.source.source}'; set the guide to unverified or give the step a unit source`);
  }
  if (guide.status === "verified" && !/^\d+\.\d+\.\d+$/.test(guide.firmware)) add("Status", "error", `guide '${guide.id}'`, `status 'verified' needs a firmware version like 1.0.3, got '${guide.firmware}'`);

  // Drift: the guide document links this guide with the same step count.
  if (guide.doc !== undefined) {
    const text = ctx.readDoc(guide.doc);
    if (text === undefined) add("Drift", "error", `guide '${guide.id}'`, `doc '${guide.doc}' does not exist`);
    else {
      const link = [...text.matchAll(/`\?guide=([a-z0-9-]+)`\s*\((\d+) steps?\)/g)].find((m) => m[1] === guide.id);
      if (link === undefined) add("Drift", "error", `guide '${guide.id}'`, `doc '${guide.doc}' does not link '?guide=${guide.id}' with a step count`);
      else if (Number(link[2]) !== guide.steps.length) add("Drift", "error", `guide '${guide.id}'`, `doc '${guide.doc}' says ${link[2]} steps; the guide has ${guide.steps.length}`);
    }
  }

  // Warnings. Mode path: replay each step on the demo engine and read the mode gaps.
  if (device.timing !== undefined && modeIds.has(guide.start.mode)) {
    const demo = { elements: device.elements, modes: device.modes, timing: device.timing };
    try {
      const engine = guideEngine(guide, () => demoEngine(demo, { mode: guide.start.mode }), demo);
      for (let i = 0; i < guide.steps.length * 3 && engine.getStep().phase !== "done"; i++) engine.next();
      for (const g of engine.getLog()) if (g.field === "mode") add("Mode path", "warning", where(g.step), `after.mode is '${String(g.patch)}'; the demo engine gives '${String(g.engine)}' after the action`);
    } catch (e) {
      add("Mode path", "warning", `guide '${guide.id}'`, `the demo engine cannot replay the guide: ${(e as Error).message}`);
    }
  }
  const modes = new Map<string, string>([[guide.start.mode, `guide '${guide.id}' start`]]);
  for (const step of guide.steps) {
    const m = (step.after as { mode?: unknown } | undefined)?.mode;
    if (typeof m === "string" && !modes.has(m)) modes.set(m, where(step.id));
  }
  for (const [mode, at] of modes) {
    if (NOT_SIMULATED[mode] !== undefined) add("Not simulated", "warning", at, `mode '${mode}' is not simulated: ${NOT_SIMULATED[mode]}`);
    const m = device.modes.find((x) => x.id === mode);
    m?.lit.forEach((rule, i) => {
      if (rule.cond === undefined) add("Unknown lit", "warning", at, `mode '${mode}' lit[${i}] has no cond (${rule.elements.join(" ")}); the lights are unknown`);
    });
  }
  return out;
}

function actionIds(a: Action): string[] {
  switch (a.kind) {
    case "simple":
    case "timed":
      return "id" in a.target ? [a.target.id] : [];
    case "combo":
      return [...("id" in a.hold ? [a.hold.id] : []), ...("id" in a.then.target ? [a.then.target.id] : [])];
    case "chord":
      return a.targets.flatMap((t) => ("id" in t ? [t.id] : []));
    case "sequence":
      return [...actionIds(a.first), ...actionIds(a.then)];
  }
}
