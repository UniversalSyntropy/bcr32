// Developer panel: where each fact comes from. Counts, the missing list and the unknown rings. No new data.
import type { Engine } from "@bcr32/device-model";
import type { GeometryFile } from "@bcr32/device-data";

import { useEngine } from "./useEngine.ts";

export const PROVS = ["measured", "derived", "owner", "assumed", "missing"] as const;

export function provCounts(geometry: GeometryFile) {
  const count = (list: readonly { prov: (typeof PROVS)[number] }[]) => Object.fromEntries(PROVS.map((p) => [p, list.filter((x) => x.prov === p).length])) as Record<(typeof PROVS)[number], number>;
  return {
    places: count(Object.values(geometry.place)),
    legends: count(geometry.legends),
    marks: count(geometry.marks),
  };
}

export function DevPanel({ geometry, engine }: { geometry: GeometryFile; engine: Engine }) {
  const state = useEngine(engine);
  const counts = provCounts(geometry);
  const missing = Object.entries(geometry.place).filter(([, p]) => p.prov === "missing").map(([id]) => id);
  const unknownRings = Object.entries(state.rings).filter(([, r]) => !r.known).map(([id]) => id);
  return (
    <details className="dev-panel" open>
      <summary>Provenance (developer)</summary>
      <table>
        <caption>Facts by provenance</caption>
        <thead>
          <tr>
            <th scope="col">Kind</th>
            {PROVS.map((p) => (
              <th key={p} scope="col"><span className="prov-chip" data-prov={p} /> {p}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {(["places", "legends", "marks"] as const).map((k) => (
            <tr key={k} data-kind={k}>
              <th scope="row">{k}</th>
              {PROVS.map((p) => (
                <td key={p} data-prov={p}>{counts[k][p]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <p>Missing ({missing.length}): <span data-list="missing">{missing.join(" ")}</span></p>
      <p>Unknown rings ({unknownRings.length}): <span data-list="unknown-rings">{unknownRings.join(" ")}</span></p>
    </details>
  );
}
