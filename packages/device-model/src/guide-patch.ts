// JSON Merge Patch (RFC 7386) for guide `after` patches. Pure.
// An object merges key by key. null removes a key. Any other value, an array too, replaces.

type Json = unknown;

const isObject = (v: Json): v is Record<string, Json> => typeof v === "object" && v !== null && !Array.isArray(v);

export function mergePatch(target: Json, patch: Json): Json {
  if (!isObject(patch)) return patch;
  const out: Record<string, Json> = isObject(target) ? { ...target } : {};
  for (const [key, value] of Object.entries(patch)) {
    if (value === null) delete out[key];
    else out[key] = mergePatch(out[key], value);
  }
  return out;
}

// The patches fold in order. The result is the view after the last patch.
export function foldPatches<T>(base: T, patches: readonly Json[]): T {
  return patches.reduce<Json>((view, p) => mergePatch(view, p), base) as T;
}

// Paths of the leaf values that a patch sets. A null leaf is a removal. An array is one leaf.
export function patchLeaves(patch: Json, prefix = ""): { path: string; value: Json }[] {
  if (!isObject(patch)) return prefix === "" ? [] : [{ path: prefix, value: patch }];
  return Object.entries(patch).flatMap(([k, v]) => (isObject(v) ? patchLeaves(v, prefix === "" ? k : `${prefix}.${k}`) : [{ path: prefix === "" ? k : `${prefix}.${k}`, value: v }]));
}

export function valueAt(obj: Json, path: string): Json {
  let cur: Json = obj;
  for (const k of path.split(".")) {
    if (!isObject(cur)) return undefined;
    cur = cur[k];
  }
  return cur;
}
