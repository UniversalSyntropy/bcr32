// Generated blocks: text between `<!-- gen:<name> key=value -->` and `<!-- gen:end -->`
// comes from device data. Pure functions: document text and data in, new text or issues out.
import type { DeviceData } from "@bcr32/device-data";

export interface Issue {
  line: number;
  message: string;
}

export interface Result {
  text: string; // document with every block regenerated
  blocks: number;
  drift: Issue[]; // blocks whose present content differs from the data
  errors: Issue[]; // marker faults; the text is not safe to write
}

type Params = Record<string, string>;
type Generator = (d: DeviceData, p: Params) => string;

const OPEN = /^<!-- gen:([a-z][a-z0-9-]*)((?: [a-z]+=[^\s>]+)*) -->$/;
const END = "<!-- gen:end -->";

const cell = (s: string | number | undefined) => String(s ?? "—").replaceAll("|", "\\|").replaceAll("\n", " ");
const code = (s: string) => `\`${s}\``;

function table(head: string[], rows: (string | number | undefined)[][]): string {
  const line = (cells: (string | number | undefined)[]) => `| ${cells.map(cell).join(" | ")} |`;
  return [line(head), line(head.map(() => "---")), ...rows.map(line)].join("\n");
}

// B5, B6, B7, B9 → `B5`–`B7`, `B9`. IDs without a number stay as they are.
export function idRanges(ids: string[]): string {
  const out: string[] = [];
  for (let i = 0; i < ids.length; ) {
    const m = /^([A-Z]+)(\d+)$/.exec(ids[i]!);
    let j = i;
    if (m) while (ids[j + 1] === `${m[1]}${Number(m[2]) + (j + 1 - i)}`) j++;
    out.push(j - i >= 2 ? `${code(ids[i]!)}–${code(ids[j]!)}` : ids.slice(i, j + 1).map(code).join(", "));
    i = j + 1;
  }
  return out.join(", ");
}

function need(p: Params, key: string): string {
  const v = p[key];
  if (v === undefined) throw new Error(`parameter '${key}' is missing`);
  return v;
}

// "1–8, 81–86": runs of two or more consecutive numbers collapse.
export function numRanges(nums: number[]): string {
  const s = [...new Set(nums)].sort((a, b) => a - b);
  const out: string[] = [];
  for (let i = 0; i < s.length; ) {
    let j = i;
    while (j + 1 < s.length && s[j + 1]! === s[j]! + 1) j++;
    out.push(j > i ? `${s[i]}–${s[j]}` : `${s[i]}`);
    i = j + 1;
  }
  return out.join(", ");
}

// MIDI the unit sent for the controls of one function (messages seen, not a promise).
function midiSeen(d: DeviceData, mode: string, elements: string[]): string | undefined {
  const ms = (d.midi?.messages ?? []).filter((m) => m.direction === "out" && m.mode === mode && m.trigger?.elements.some((e) => elements.includes(e)));
  if (ms.length === 0) return undefined;
  const byChannel = new Map<string, string[]>();
  for (const m of ms) {
    const key = m.channel === undefined ? "" : `ch ${m.channel}`;
    const cc = m.type === "cc" ? m.number : undefined;
    byChannel.set(key, [...(byChannel.get(key) ?? []), cc === undefined ? `${m.type}` : `${cc}`]);
  }
  return [...byChannel.entries()]
    .map(([ch, items]) => {
      const nums = items.filter((x) => /^\d+$/.test(x)).map(Number);
      const other = [...new Set(items.filter((x) => !/^\d+$/.test(x)))];
      return `${ch}${ch ? ": " : ""}${[nums.length ? `CC ${numRanges(nums)}` : "", ...other].filter(Boolean).join(", ")}`;
    })
    .join("; ");
}

const KIND_NAMES: Record<string, string> = { button: "Button", encoder: "Encoder", led: "LED", display: "Display", jack: "Jack" };

export const GENERATORS: Record<string, Generator> = {
  // Element count and IDs per kind.
  "element-kinds": (d) =>
    table(
      ["Kind", "Count", "IDs"],
      Object.entries(KIND_NAMES).map(([kind, name]) => {
        const ids = d.elements.filter((e) => e.kind === kind).map((e) => e.id);
        return [name, ids.length, idRanges(ids)];
      }),
    ),

  // Modes and menus: how to enter and exit, which buttons light.
  modes: (d) =>
    table(
      ["Mode or menu", "Enter", "Exit", "Lit buttons"],
      d.modes.map((m) => [
        m.name,
        m.enter.map((s) => code(s.action)).join(", then "),
        m.exit.map((s) => code(s.action)).join(" or "),
        m.lit.map((l) => `${idRanges(l.elements)} ${l.blink ? "flash " : ""}${l.colour}${l.when ? ` when ${l.when}` : ""}`).join("; ") || undefined,
      ]),
    ),

  // Functions of one mode. Parameter: mode=<mode ID>.
  functions: (d, p) => {
    const mode = need(p, "mode");
    if (!d.modes.some((m) => m.id === mode)) throw new Error(`unknown mode '${mode}'`);
    return table(
      ["Controls", "Function", "Action", "Values", "Default", "MIDI seen (firmware 1.0.3)", "Source"],
      d.functions
        .filter((f) => f.mode === mode)
        .map((f) => [
          idRanges(f.elements),
          f.name,
          f.action === undefined ? undefined : code(f.action),
          f.values === undefined ? undefined : d.valueSets.find((v) => v.id === f.values)?.name,
          f.default,
          midiSeen(d, f.mode, f.elements),
          f.source.source === "unit" ? `unit, firmware ${f.source.firmware}` : f.source.source,
        ]),
    );
  },

  // Index by control: every element, the functions that use it, with the mode of each.
  "index-controls": (d) => {
    const modeName = new Map(d.modes.map((m) => [m.id, m.name]));
    return table(
      ["Control", "Kind", "Functions (mode: function)"],
      d.elements.map((e) => {
        const uses = d.functions.filter((f) => f.elements.includes(e.id));
        return [code(e.id), KIND_NAMES[e.kind] ?? e.kind, uses.map((f) => `${modeName.get(f.mode)}: ${f.name}`).join("; ") || undefined];
      }),
    );
  },

  // Index by function: every function by name, with its mode, controls and action.
  "index-functions": (d) => {
    const modeName = new Map(d.modes.map((m) => [m.id, m.name]));
    return table(
      ["Function", "Mode", "Controls", "Action"],
      [...d.functions]
        .sort((a, b) => a.name.localeCompare(b.name, "en") || a.mode.localeCompare(b.mode))
        .map((f) => [f.name, modeName.get(f.mode), idRanges(f.elements), f.action === undefined ? undefined : code(f.action)]),
    );
  },

  // Every outbound message seen, one row per control and preset.
  "midi-messages": (d) =>
    table(
      ["ID", "Port", "Mode", "Controls", "Type", "Channel", "Number", "Values", "Trigger"],
      (d.midi?.messages ?? []).map((m) => [
        code(m.id),
        d.midi?.ports.find((p) => p.id === m.port)?.name,
        m.mode,
        m.trigger === undefined ? undefined : idRanges(m.trigger.elements),
        m.type,
        m.channel,
        m.number,
        m.values?.join(", "),
        m.trigger?.confidence,
      ]),
    ),

  // Tests that produced no message or no effect. Silence is a result.
  "midi-silences": (d) =>
    table(
      ["ID", "Port", "Mode", "Action", "Result"],
      (d.midi?.silences ?? []).map((s) => [code(s.id), d.midi?.ports.find((p) => p.id === s.port)?.name, s.mode, s.action, s.result]),
    ),

  // One value set. Parameter: set=<value set ID>.
  values: (d, p) => {
    const id = need(p, "set");
    const set = d.valueSets.find((v) => v.id === id);
    if (!set) throw new Error(`unknown value set '${id}'`);
    const rows: (string | undefined)[][] = (set.options ?? []).map((o) => [o.value, o.note]);
    if (set.range) rows.push([`${set.range.min}–${set.range.max}`, set.range.unit]);
    return table(["Value", "Note"], rows);
  },
};

// Regenerates every block of one document.
export function generate(text: string, data: DeviceData): Result {
  const lines = text.split("\n");
  const out: string[] = [];
  const drift: Issue[] = [];
  const errors: Issue[] = [];
  let blocks = 0;
  let fence: string | undefined;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!;
    const mark = /^\s*(```+|~~~+)/.exec(line)?.[1];
    if (mark && (fence === undefined || mark.startsWith(fence))) fence = fence === undefined ? mark : undefined;
    out.push(line);
    if (fence !== undefined) continue;

    if (line.trim() === END) {
      errors.push({ line: i + 1, message: "end marker without a start marker" });
      continue;
    }
    if (!line.startsWith("<!-- gen:")) continue;
    const open = OPEN.exec(line);
    if (!open) {
      errors.push({ line: i + 1, message: "start marker is not valid" });
      continue;
    }
    const end = lines.findIndex((l, j) => j > i && (l.trim() === END || l.startsWith("<!-- gen:")));
    if (end === -1 || lines[end]!.trim() !== END) {
      errors.push({ line: i + 1, message: "start marker without an end marker" });
      continue;
    }
    const generator = GENERATORS[open[1]!];
    if (!generator) {
      errors.push({ line: i + 1, message: `unknown generator '${open[1]}'` });
      continue;
    }
    const params = Object.fromEntries(open[2]!.trim().split(" ").filter(Boolean).map((kv) => kv.split("=") as [string, string]));
    let body: string;
    try {
      body = generator(data, params);
    } catch (error) {
      errors.push({ line: i + 1, message: `${open[1]}: ${(error as Error).message}` });
      continue;
    }
    blocks++;
    // Blank lines round the table keep markdownlint and the renderers satisfied.
    const fresh = ["", ...body.split("\n"), ""];
    if (lines.slice(i + 1, end).join("\n") !== fresh.join("\n")) drift.push({ line: i + 1, message: `block '${open[1]}' differs from the device data` });
    out.push(...fresh, lines[end]!);
    i = end;
  }
  return { text: out.join("\n"), blocks, drift, errors };
}
