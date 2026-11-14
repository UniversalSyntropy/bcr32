// Browser tests of the demo engine (?engine=demo): mode change, hold by the clock, "Go to", click sounds, axe.
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { after, before, describe, test } from "node:test";

import type { Browser, Page } from "playwright";

import { ENGINES, open, serve } from "./harness.ts";

const axePath = createRequire(import.meta.url).resolve("axe-core/axe.min.js");

// Counts each AudioContext that the page makes.
const SPY = `(() => {
  const O = window.AudioContext || window.webkitAudioContext;
  window.__ac = 0;
  if (!O) return;
  const S = class extends O { constructor(...a) { super(...a); window.__ac++; } };
  window.AudioContext = S;
  window.webkitAudioContext = S;
})();`;

for (const [engine, type] of ENGINES) {
  describe(`${engine} demo`, () => {
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
    const page = (query = "engine=demo&view=top&theme=device", init?: string): Promise<Page> => open(browser, url, query, {}, init);
    const readout = (p: Page) => p.getAttribute(".mode-readout", "data-mode");
    const colour = (p: Page, id: string) => p.getAttribute(`#lights g.light[data-id="${id}"]`, "data-colour");
    const audio = (p: Page) => p.evaluate(() => (window as unknown as { __ac: number }).__ac);

    test("click B1 changes the mode readout and the B1 colour", async () => {
      const p = await page();
      assert.equal(await readout(p), "zaq");
      assert.equal(await colour(p, "B1"), "pink");
      assert.match((await p.textContent(".mode-readout")) ?? "", /^Mode: ZAQ/);
      await p.click('.ctl[data-id="B1"]');
      assert.equal(await readout(p), "ctrl");
      assert.equal(await colour(p, "B1"), "amber");
      await p.click('.ctl[data-id="B1"]');
      assert.equal(await readout(p), "zaq");
      assert.equal(await colour(p, "B1"), "pink");
      await p.context().close();
    });

    test("the default engine stays static: no mode readout", async () => {
      const p = await page("view=top&theme=device");
      assert.equal(await p.locator(".mode-readout").count(), 0);
      await p.click('.ctl[data-id="B1"]');
      assert.equal(await p.locator(".mode-readout").count(), 0);
      await p.context().close();
    });

    test("hold B1 for 3 s opens Global Settings; the clock stops when nothing is held", async () => {
      const p = await page();
      const box = (await p.locator('.ctl[data-id="B1"]').boundingBox())!;
      await p.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await p.mouse.down();
      await p.waitForTimeout(2500);
      assert.equal(await readout(p), "zaq");
      await p.waitForTimeout(1000);
      assert.equal(await readout(p), "global-settings");
      await p.mouse.up();
      assert.equal(await readout(p), "global-settings");
      await p.click('.ctl[data-id="B1"]');
      assert.equal(await readout(p), "zaq");
      await p.context().close();
    });

    test("the dev list: Go to reaches each mode", async () => {
      const p = await page("engine=demo&view=top&theme=device&dev=1");
      const ids = await p.$$eval("button[data-goto]", (n) => n.map((e) => (e as HTMLElement).dataset["goto"]!));
      assert.equal(ids.length, 14);
      for (const id of ids) {
        await p.click(`button[data-goto="${id}"]`);
        assert.equal(await readout(p), id, id);
      }
      assert.match((await p.textContent("[data-demo-dev]")) ?? "", /Not simulated/);
      await p.context().close();
    });

    test("click sounds: off makes no AudioContext; on makes one at the first press", async () => {
      const p = await page("engine=demo&view=top&theme=device", SPY);
      assert.equal(await audio(p), 0);
      await p.click('.ctl[data-id="B1"]');
      assert.equal(await audio(p), 0, "toggle off");
      await p.getByLabel(/Click sounds/).check();
      assert.equal(await audio(p), 0, "toggle on, no gesture on the panel yet");
      assert.match(p.url(), /sound=1/);
      await p.click('.ctl[data-id="B1"]');
      assert.equal(await audio(p), 1, "toggle on, press");
      await p.context().close();
    });

    test("click sounds: sound=1 in the URL still waits for a press", async () => {
      const p = await page("engine=demo&view=top&theme=device&sound=1", SPY);
      assert.equal(await audio(p), 0);
      await p.click('.ctl[data-id="B5"]');
      assert.equal(await audio(p), 1);
      await p.context().close();
    });

    test("axe: zero violations with ?engine=demo&dev=1", async () => {
      const p = await page("engine=demo&view=top&theme=device&dev=1");
      await p.addScriptTag({ path: axePath });
      const v = await p.evaluate(async () => {
        const r = await (globalThis as any).axe.run(document, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"] } });
        return r.violations.map((x: any) => `${x.id}: ${x.nodes.map((n: any) => n.target.join(" ")).slice(0, 3).join(" | ")}`);
      });
      assert.deepEqual(v, []);
      await p.context().close();
    });
  });
}
