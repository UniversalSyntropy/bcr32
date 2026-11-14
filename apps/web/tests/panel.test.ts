// Browser tests of the panel: access layer, placement, narrow screen, motion, forced colours, storage.
import assert from "node:assert/strict";
import { after, before, describe, test } from "node:test";

import type { Browser, Page } from "playwright";

import { ENGINES, open, serve } from "./harness.ts";

const GROUPS_WITH_CONTROLS = 9;
const TOTAL_CONTROLS = 64;

for (const [engine, type] of ENGINES) {
  describe(engine, () => {
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
    const page = async (query = "view=top&theme=device", opts = {}, init?: string): Promise<Page> => open(browser, url, query, opts, init);
    const active = (p: Page) => p.evaluate(() => (document.activeElement as HTMLElement | null)?.dataset["id"] ?? "");
    const value = (p: Page, id: string) => p.getAttribute(`.ctl[data-id="${id}"]`, "aria-valuenow");

    test("the SVG is aria-hidden and the control IDs equal the SVG control IDs", async () => {
      const p = await page();
      assert.equal(await p.getAttribute("svg.panel-svg", "aria-hidden"), "true");
      const svg = await p.$$eval('#controls g[data-kind="button"], #controls g[data-kind="encoder"]', (n) => n.map((e) => (e as SVGElement).dataset["id"]).sort());
      const html = await p.$$eval(".ctl", (n) => n.map((e) => (e as HTMLElement).dataset["id"]).sort());
      assert.equal(html.length, TOTAL_CONTROLS);
      assert.deepEqual(html, svg);
      await p.context().close();
    });

    test("rear view: the note is read once", async () => {
      const p = await page("view=rear&theme=device");
      const snap = await p.locator("main").ariaSnapshot();
      assert.equal(snap.split("positions not measured").length - 1, 1, snap);
      await p.context().close();
    });

    test("one tab stop per group; roving tabindex inside a group", async () => {
      const p = await page();
      assert.equal(await p.locator('.ctl[tabindex="0"]').count(), GROUPS_WITH_CONTROLS);
      assert.equal(await p.locator(".ctl-group").count(), GROUPS_WITH_CONTROLS);
      await p.focus(".layers label:last-of-type input");
      const seen: string[] = [];
      for (let i = 0; i < GROUPS_WITH_CONTROLS; i++) {
        await p.keyboard.press("Tab");
        seen.push(await p.evaluate(() => (document.activeElement as HTMLElement).closest(".ctl-group")?.getAttribute("data-group") ?? "none"));
      }
      assert.equal(new Set(seen).size, GROUPS_WITH_CONTROLS, seen.join(","));
      assert.ok(!seen.includes("none"));
      await p.keyboard.press("Tab");
      assert.equal(await p.evaluate(() => document.activeElement?.closest(".ctl-group") === null), true, "the tenth Tab leaves the panel");
      await p.context().close();
    });

    test("keys: left and right in a group, ctrl+down between rows, up and down turn, page up turns eight", async () => {
      const p = await page();
      await p.focus('.ctl[data-id="E25"]');
      await p.keyboard.press("ArrowRight");
      assert.equal(await active(p), "E26");
      await p.keyboard.press("ArrowLeft");
      assert.equal(await active(p), "E25");
      await p.keyboard.press("ArrowDown");
      assert.equal(await active(p), "E33");
      await p.keyboard.press("ArrowUp");
      assert.equal(await active(p), "E25");
      await p.keyboard.press("End");
      assert.equal(await active(p), "E56");
      await p.keyboard.press("Home");
      assert.equal(await active(p), "E25");
      await p.focus('.ctl[data-id="E26"]');
      assert.equal(await value(p, "E26"), "64");
      await p.keyboard.press("Shift+ArrowUp");
      assert.equal(await value(p, "E26"), "65");
      await p.keyboard.press("Shift+ArrowDown");
      await p.keyboard.press("Shift+ArrowDown");
      assert.equal(await value(p, "E26"), "63");
      await p.keyboard.press("PageUp");
      assert.equal(await value(p, "E26"), "71");
      await p.keyboard.press("PageDown");
      assert.equal(await value(p, "E26"), "63");
      assert.match(await p.locator('[role="status"]').innerText(), /E26 .* 63 of 127/);
      await p.context().close();
    });

    test("space on a button: press on key down, release on key up, one announcement", async () => {
      const p = await page();
      await p.focus('.ctl[data-id="B5"]');
      await p.keyboard.down(" ");
      assert.equal(await p.getAttribute('#controls g[data-id="B5"]', "data-pressed"), "true");
      assert.equal(await p.locator('#marks g[data-id="B5"]').count(), 1);
      assert.match(await p.locator('[role="status"]').innerText(), /^B5 .* pressed$/);
      await p.keyboard.up(" ");
      assert.equal(await p.getAttribute('#controls g[data-id="B5"]', "data-pressed"), null);
      assert.equal(await p.locator('#marks g[data-id="B5"]').count(), 0);
      await p.context().close();
    });

    test("ring LEDs: lit count follows the ring model; unknown rings carry no data-lit", async () => {
      const p = await page();
      const lit = (id: string) => p.locator(`#lights g.ring[data-id="${id}"] rect[data-lit="true"]`).count();
      assert.equal(await lit("E25"), 1, "1dot at 0 is one LED");
      assert.equal(await lit("E26"), 8, "bar at 64 lights LEDs 0 to 7");
      assert.equal(await lit("E27"), 15, "spread at 127 lights all");
      assert.equal(await p.locator('#lights g.ring[data-id="E28"] rect[data-lit]').count(), 0);
      assert.equal(await p.locator("#lights g.ring rect").count(), 480);
      assert.equal(await p.locator('#lights g.ring[data-id="SEL"]').count(), 0);
      await p.focus('.ctl[data-id="E25"]');
      for (let i = 0; i < 4; i++) await p.keyboard.press("PageUp"); // 0 to 32
      assert.equal(await lit("E25"), 1);
      assert.equal(await p.locator('#lights g.ring[data-id="E25"] rect[data-lit="true"]').getAttribute("data-i"), "3", "floor(32 * 14 / 127)");
      await p.context().close();
    });

    for (const width of [1280, 375]) {
      test(`each control box matches its part box within 0.5 px at ${width} px`, async () => {
        const p = await page("view=top&theme=device", { viewport: { width, height: 900 } });
        const boxes = await p.evaluate(() =>
          [...document.querySelectorAll<HTMLElement>(".ctl")].map((c) => {
            const id = c.dataset["id"]!;
            const part = document.querySelector(`#controls g[data-id="${id}"] .part`)!.getBoundingClientRect();
            const r = c.getBoundingClientRect();
            return { id, d: Math.max(Math.abs(r.left - part.left), Math.abs(r.top - part.top), Math.abs(r.width - part.width), Math.abs(r.height - part.height)) };
          }),
        );
        assert.ok(boxes.length > 0);
        for (const b of boxes) assert.ok(b.d <= 0.5, `${b.id} differs by ${b.d.toFixed(2)} px`);
        await p.context().close();
      });
    }

    test("375 px: no horizontal scroll; a button is at least 24 CSS pixels wide; one group shows", async () => {
      const p = await page("view=top&theme=device", { viewport: { width: 375, height: 800 } });
      assert.equal(await p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true);
      assert.equal(await p.locator(".ctl-group").count(), 1);
      const w = await p.locator('.ctl[data-id="B1"]').evaluate((e) => e.getBoundingClientRect().width);
      assert.ok(w >= 24, `button width ${w}`);
      await p.selectOption('select[aria-label="Group"], .tools label:has-text("Group") select', "steps");
      assert.equal(await p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true);
      const k = await p.locator('.ctl[data-id="E25"]').evaluate((e) => e.getBoundingClientRect().width);
      assert.ok(k >= 24, `knob width ${k}`);
      await p.context().close();
    });

    test("reduced motion: a blinking LED has no running animation", async () => {
      const anim = (p: Page) => p.evaluate(() => document.querySelector('.light[data-blink="slow"]')!.getAnimations().length);
      const on = await page();
      assert.ok((await anim(on)) >= 1, "a blinking LED animates by default");
      await on.context().close();
      const off = await page("view=top&theme=device", { reducedMotion: "reduce" });
      assert.equal(await anim(off), 0);
      assert.match((await off.locator('.ctl[data-id="B9"]').getAttribute("aria-label")) ?? "", /blinks/);
      await off.context().close();
    });

    test("1280 x 800: the stage is fully inside the viewport, both views", async () => {
      for (const view of ["top", "rear"]) {
        const p = await page(`view=${view}&theme=device`, { viewport: { width: 1280, height: 800 } });
        const r = await p.locator(".stage").evaluate((e) => {
          const b = e.getBoundingClientRect();
          return { top: b.top, bottom: b.bottom, left: b.left, right: b.right, h: window.innerHeight, w: window.innerWidth };
        });
        assert.ok(r.top >= 0 && r.bottom <= r.h && r.left >= 0 && r.right <= r.w, `${view}: ${JSON.stringify(r)}`);
        await p.context().close();
      }
    });

    test("legends: B1 shows text from data; one text per label with placement on", async () => {
      const p = await page();
      assert.equal(await p.locator('#legends text[data-id="B1"]').textContent(), "ZQR/CTRL");
      assert.equal(await p.locator('#legends text[data-on="true"]').count(), 31);
      assert.equal(await p.locator("#legends text.legend").count(), 128, "all printed text of the top view: 164 labels less rear and shared");
      await p.context().close();
    });

    test("ring LEDs are rotated rectangles, 15 for each knob", async () => {
      const p = await page();
      assert.equal(await p.locator('#lights g.ring[data-id="E25"] rect.ring-led').count(), 15);
      assert.equal(await p.locator("#lights g.ring circle").count(), 0);
      assert.match((await p.locator('#lights g.ring[data-id="E25"] rect[data-i="14"]').getAttribute("transform")) ?? "", /^rotate\(150 /);
      await p.context().close();
    });

    test("storage blocked: the page still renders", async () => {
      const p = await page("view=top&theme=device", {}, 'Object.defineProperty(window, "localStorage", { get() { throw new Error("blocked"); } });');
      assert.equal(await p.locator(".ctl").count(), TOTAL_CONTROLS);
      await p.context().close();
    });

    test("URL state: the query sets view and theme and a click updates it", async () => {
      const p = await page("view=rear&theme=flat-light");
      assert.equal(await p.getAttribute("html", "data-theme"), "flat");
      assert.equal(await p.getAttribute("html", "data-scheme"), "light");
      assert.equal(await p.getAttribute(".panel", "data-view"), "rear");
      await p.click('button:has-text("Top view")');
      assert.match(p.url(), /view=top&theme=flat-light/);
      await p.context().close();
    });

    test("no request leaves the local origin; the hosted font loads", async () => {
      const urls: string[] = [];
      const ctx = await browser.newContext();
      const p = await ctx.newPage();
      p.on("request", (r) => urls.push(r.url()));
      await p.goto(`${url}?view=top`);
      await p.waitForSelector(".panel-svg");
      assert.equal(await p.evaluate(async () => { await document.fonts.ready; return document.fonts.check('16px "Atkinson Hyperlegible"'); }), true);
      assert.ok(urls.every((u) => u.startsWith(url)), urls.join("\n"));
      assert.ok(urls.some((u) => u.endsWith(".woff2")));
      await ctx.close();
    });

    if (engine === "chromium")
      test("forced colours: a lit LED keeps a border", async () => {
        const p = await page("view=top&theme=device", { forcedColors: "active" });
        const s = await p.locator('#lights g[data-id="B5"] .light-shape').evaluate((e) => {
          const c = getComputedStyle(e);
          return { stroke: c.stroke, width: parseFloat(c.strokeWidth) };
        });
        assert.notEqual(s.stroke, "none");
        assert.ok(s.width >= 1, `stroke width ${s.width}`);
        await p.context().close();
      });
  });
}
