// Developer list of the demo: each mode with a "Go to" button, the modes not simulated, and the lit rules with no condition.
import { NOT_SIMULATED, type DemoData } from "@bcr32/device-model";

export function DemoDev({ data, onGo }: { data: DemoData; onGo: (mode: string) => void }) {
  const open = data.modes.filter((m) => NOT_SIMULATED[m.id] === undefined);
  const skipped = data.modes.filter((m) => NOT_SIMULATED[m.id] !== undefined);
  const noCond = data.modes.flatMap((m) => m.lit.filter((l) => l.cond === undefined).map((l) => `${m.id}: ${l.elements[0]}${l.elements.length > 1 ? ` to ${l.elements[l.elements.length - 1]}` : ""}`));
  return (
    <details className="dev-panel" open data-demo-dev="true">
      <summary>Demo modes (developer)</summary>
      <ul className="mode-list">
        {open.map((m) => (
          <li key={m.id}>
            {m.name} <button type="button" data-goto={m.id} aria-label={`Go to ${m.name}`} onClick={() => onGo(m.id)}>Go to</button>
          </li>
        ))}
      </ul>
      <p>Not simulated:</p>
      <ul>
        {skipped.map((m) => (
          <li key={m.id}>{m.name}: {NOT_SIMULATED[m.id]}</li>
        ))}
      </ul>
      <p>Lit rules with no condition, drawn as unknown:</p>
      <ul>
        {noCond.map((t) => (
          <li key={t}>{t}</li>
        ))}
      </ul>
    </details>
  );
}
