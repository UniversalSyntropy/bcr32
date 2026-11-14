// axe-core on both views, three theme sets (device, flat light, flat dark). Zero violations.
// Also: axe on a slider and a spinbutton with no value.
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { after, before, describe, test } from "node:test";

import type { Browser, Page } from "playwright";

import { ENGINES, open, serve } from "./harness.ts";

const axePath = createRequire(import.meta.url).resolve("axe-core/axe.min.js");

async function violations(p: Page, context?: string) {
  await p.addScriptTag({ path: axePath });
  return p.evaluate(async (ctx) => {
    const r = await (globalThis as any).axe.run(ctx ?? document, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"] } });
    return r.violations.map((v: any) => `${v.id}: ${v.nodes.map((n: any) => n.target.join(" ")).slice(0, 3).join(" | ")}`);
  }, context);
}

for (const [engine, type] of ENGINES) {
  describe(`${engine} axe`, () => {
    let browser: Browser;
    let url: string;
    let close: () => void;
    before(async () => {
      const s = await serve();
      url = s.url;
      close = () => s.server.close();
      browser = await type.launch();
    });
    after(async () => {
      await browser.close();
      close();
    });

    for (const view of ["top", "rear"])
      for (const theme of ["device", "flat-light", "flat-dark"])
        test(`${view} view, theme ${theme}: zero violations`, async () => {
          const p = await open(browser, url, `view=${view}&theme=${theme}`);
          assert.deepEqual(await violations(p), []);
          await p.context().close();
        });

    test("roles with no value: slider and spinbutton compared", async () => {
      const p = await open(browser, url, "view=top&theme=device");
      await p.evaluate(() => {
        document.body.insertAdjacentHTML(
          "beforeend",
          '<div id="exp"><div id="sl" role="slider" tabindex="0" aria-label="slider no value" aria-valuetext="unknown"></div><div id="sb" role="slider" tabindex="0" aria-label="slider bare"></div><div id="bad" role="slider" tabindex="0"></div><div id="sp" role="spinbutton" tabindex="0" aria-label="spinbutton no value" aria-valuetext="unknown"></div></div>',
        );
      });
      const slider = await violations(p, "#sl");
      const spin = await violations(p, "#sp");
      const bare = await violations(p, "#sb");
      const bad = await violations(p, "#bad");
      assert.ok(bad.length > 0, "control: axe must flag an unnamed slider, else the run is empty");
      console.log(`${engine} axe: slider with valuetext, no valuenow: ${JSON.stringify(slider)}; slider with no valuenow and no valuetext: ${JSON.stringify(bare)}; spinbutton with valuetext, no valuenow: ${JSON.stringify(spin)}`);
      assert.deepEqual(spin, [], "the panel uses spinbutton with no value; axe must accept it");
      await p.context().close();
    });
  });
}
