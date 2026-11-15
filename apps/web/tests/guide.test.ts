// Browser tests of the guide player (?guide=<id>): zoom, action by mouse and keyboard, hints, Show me,
// Back, Restart, banner, live region, deep link, reduced motion, axe, dev panel, 375 px with a wide font.
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { after, before, describe, test } from "node:test";

import type { Browser, BrowserContextOptions, Page } from "playwright";

import { ENGINES, open, serve } from "./harness.ts";

const axePath = createRequire(import.meta.url).resolve("axe-core/axe.min.js");
const AXE_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"];

for (const [engine, type] of ENGINES) {
  describe(`${engine} guide`, () => {
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
    const page = (query: string, opts: BrowserContextOptions = {}): Promise<Page> => open(browser, url, `view=top&theme=device&${query}`, opts);
    const progress = (p: Page) => p.textContent(".guide-progress");
    const phase = (p: Page) => p.getAttribute(".guide-layout", "data-phase");
    const target = (p: Page) => p.getAttribute(".guide-layout", "data-target-vb");
    const vb = (p: Page) => p.getAttribute(".panel-svg", "viewBox");
    const same = (a: string | null, b: string | null) => {
      const [x, y] = [a, b].map((s) => (s ?? "").split(/\s+/).map(Number));
      return x!.length === 4 && x!.every((v, i) => Math.abs(v - y![i]!) < 0.01);
    };
    const settled = (p: Page) => p.waitForFunction(() => {
      const t = document.querySelector(".guide-layout")?.getAttribute("data-target-vb")?.split(" ").map(Number) ?? [];
      const v = document.querySelector(".panel-svg")?.getAttribute("viewBox")?.split(" ").map(Number) ?? [];
      return t.length === 4 && t.every((n, i) => Math.abs(n - v[i]!) < 0.01);
    });
    const clickCtl = async (p: Page, id: string) => {
      const b = (await p.locator(`.ctl[data-id="${id}"]`).boundingBox())!;
      await p.mouse.click(b.x + b.width / 2, b.y + b.height / 2);
    };

    test("store-pattern loads at step 1 of 4 with the unverified banner and a zoom to the focus", async () => {
      const p = await page("guide=store-pattern");
      assert.equal(await progress(p), "Step 1 of 4");
      assert.match((await p.textContent(".guide-banner")) ?? "", /^Unverified: not tested on a unit\. Firmware 1\.0\.3/);
      assert.match((await p.textContent(".guide-caption")) ?? "", /^Hold .*\(B61\)\. Keep it down\.$/);
      await settled(p);
      const full = await p.evaluate(() => document.querySelector(".panel-svg")!.getAttribute("viewBox"));
      assert.ok(!same(full, "0 0 1 1"));
      const [, , w] = (full ?? "").split(" ").map(Number);
      assert.ok(w! < 120, `zoomed window ${w} mm`);
      assert.equal(await p.locator("#controls g.dim").count() > 0, true, "other controls are dimmed");
      assert.equal(await p.locator('#controls g[data-id="B61"]').getAttribute("class"), null, "a focus control is not dimmed");
      assert.equal(await p.locator("[inert]").count(), 0, "dim is a class, never inert");
      assert.equal(await p.locator("#highlight .cue").count() > 0, true, "a cue mark is drawn");
      await p.context().close();
    });

    test("Show me applies the step; the viewBox moves to the next focus box; Back and Restart work", async () => {
      const p = await page("guide=store-pattern");
      await settled(p);
      const first = await vb(p);
      await p.getByRole("button", { name: "Show me" }).click();
      assert.equal(await phase(p), "result");
      assert.match((await p.textContent(".guide-expect")) ?? "", /Choose the page with/);
      await p.getByRole("button", { name: "Next step" }).click();
      assert.equal(await progress(p), "Step 2 of 4");
      await settled(p);
      assert.ok(!same(first, await vb(p)), "viewBox changed");
      assert.equal(new URL(p.url()).searchParams.get("step"), "2");
      await p.getByRole("button", { name: "Back" }).click();
      assert.equal(await progress(p), "Step 1 of 4");
      await p.getByRole("button", { name: "Show me" }).click();
      await p.getByRole("button", { name: "Next step" }).click();
      await p.getByRole("button", { name: "Show me" }).click();
      await p.getByRole("button", { name: "Restart" }).click();
      assert.equal(await progress(p), "Step 1 of 4");
      assert.equal(await phase(p), "cue");
      assert.equal(new URL(p.url()).searchParams.get("step"), "1");
      await p.context().close();
    });

    test("the last step ends in done with Restart", async () => {
      const p = await page("guide=choose-clock");
      for (let n = 0; n < 3; n++) {
        await p.getByRole("button", { name: "Show me" }).click();
        await p.getByRole("button", { name: "Next step" }).click();
      }
      assert.equal(await phase(p), "done");
      assert.match((await progress(p)) ?? "", /^Done: 3 of 3/);
      assert.equal(await p.getByRole("button", { name: "Show me" }).count(), 0);
      await p.context().close();
    });

    test("action by mouse advances the step; a wrong control gives a hint and does not advance", async () => {
      const p = await page("guide=choose-clock");
      await settled(p);
      // B1 is outside the zoom window and dimmed, but the keyboard still reaches it.
      await p.focus('.ctl[data-id="B1"]');
      await p.keyboard.press("Enter");
      assert.equal(await phase(p), "cue");
      assert.match((await p.textContent(".guide-hint")) ?? "", /not the control/);
      await clickCtl(p, "B59");
      assert.equal(await phase(p), "result");
      assert.equal(await p.textContent(".guide-hint"), "");
      assert.match((await p.textContent(".guide-expect")) ?? "", /ZAQ Global page opens/);
      await p.getByRole("button", { name: "Next step" }).click();
      assert.equal(await progress(p), "Step 2 of 3");
      await p.context().close();
    });

    test("action by keyboard advances the step; focus starts on the first focus control", async () => {
      const p = await page("guide=all-steps-length");
      assert.equal(await p.evaluate(() => (document.activeElement as HTMLElement | null)?.dataset["id"]), "B9");
      await p.keyboard.press("Enter");
      assert.equal(await phase(p), "result");
      await p.getByRole("button", { name: "Next step" }).click();
      assert.equal(await progress(p), "Step 2 of 2");
      assert.equal(await p.evaluate(() => (document.activeElement as HTMLElement | null)?.dataset["id"]), "B9", "focus moves to the first control of the new step");
      await p.context().close();
    });

    test("a hold and a turn by mouse and keyboard complete the combo step (the clock feeds ticks)", async () => {
      const p = await page("guide=all-steps-length&step=2");
      assert.equal(await progress(p), "Step 2 of 2");
      const b = (await p.locator('.ctl[data-id="B9"]').boundingBox())!;
      await p.mouse.move(b.x + b.width / 2, b.y + b.height / 2);
      await p.mouse.down();
      await p.waitForTimeout(700);
      await p.focus('.ctl[data-id="E25"]');
      await p.keyboard.press("+");
      await p.mouse.up();
      assert.equal(await phase(p), "result");
      assert.match((await p.textContent(".guide-expect")) ?? "", /length of all 32 steps/);
      assert.match((await p.textContent(".guide-banner")) ?? "", /^This step: tested on a unit, firmware 1\.0\.3/);
      await p.context().close();
    });

    test("live region: step text first, then the expect text", async () => {
      const p = await page("guide=choose-clock");
      const live = p.locator('[data-guide-live="true"]');
      await p.waitForFunction(() => /^Step 1 of 3\./.test(document.querySelector('[data-guide-live="true"]')?.textContent ?? ""));
      assert.match((await live.textContent()) ?? "", /^Step 1 of 3\. Press .*\(B59\)\.$/);
      assert.equal(await live.getAttribute("aria-live"), "polite");
      await p.getByRole("button", { name: "Show me" }).click();
      assert.equal(await live.textContent(), "The ZAQ Global page opens.");
      await p.context().close();
    });

    test("?step=3 deep link; an unknown guide shows the error line and the normal panel", async () => {
      const p = await page("guide=store-pattern&step=3");
      assert.equal(await progress(p), "Step 3 of 4");
      assert.equal(new URL(p.url()).searchParams.get("step"), "3");
      assert.equal(await p.locator(".guide-error").count(), 0);
      await p.context().close();
      const q = await page("guide=nope");
      assert.match((await q.textContent(".guide-error")) ?? "", /^Unknown guide: nope/);
      assert.equal(await q.locator(".guide-card").count(), 0);
      assert.equal(await q.locator(".panel-svg").count(), 1);
      await q.context().close();
    });

    test("reduced motion: the zoom jumps at once and the pulse is off; with motion the zoom ends at the same box", async () => {
      const p = await page("guide=choose-clock", { reducedMotion: "reduce" });
      await p.getByRole("button", { name: "Show me" }).click();
      const r = await p.evaluate(async () => {
        const next = [...document.querySelectorAll("button")].find((b) => b.textContent === "Next step")!;
        next.click();
        await new Promise((ok) => setTimeout(ok, 0));
        return {
          target: document.querySelector(".guide-layout")!.getAttribute("data-target-vb"),
          viewBox: document.querySelector(".panel-svg")!.getAttribute("viewBox"),
        };
      });
      assert.ok(same(r.viewBox, r.target), `reduced motion: viewBox ${r.viewBox} equals target ${r.target} at once`);
      const pulse = await p.evaluate(() => [...document.querySelectorAll(".cue-pulse")].map((e) => getComputedStyle(e).animationName + "/" + getComputedStyle(e).display));
      assert.ok(pulse.every((x) => x === "none/none"), `pulse ${pulse.join(",")}`);
      await p.context().close();
      const m = await page("guide=choose-clock", { reducedMotion: "no-preference" });
      const first = await vb(m);
      await m.getByRole("button", { name: "Show me" }).click();
      await m.getByRole("button", { name: "Next step" }).click();
      await settled(m);
      assert.ok(!same(first, await vb(m)));
      await m.context().close();
    });

    test("dev panel: steps table, Go to step, gap log", async () => {
      const p = await page("guide=store-pattern&dev=1");
      assert.equal(await p.locator('[data-guide-dev] tbody tr').count(), 4);
      await p.click('button[data-step-goto="3"]');
      assert.equal(await progress(p), "Step 3 of 4");
      assert.equal(await p.locator('[data-guide-log] li').count() > 0, true, "the demo engine differs from an after patch");
      await p.context().close();
    });

    for (const dev of [false, true])
      for (const theme of ["device", "flat-light", "flat-dark"])
        test(`axe: zero violations, theme ${theme}${dev ? ", dev=1" : ""}`, async () => {
          const p = await open(browser, url, `view=top&theme=${theme}&guide=store-pattern${dev ? "&dev=1" : ""}`);
          await settled(p);
          await p.addScriptTag({ path: axePath });
          const v = await p.evaluate(async (tags) => {
            const r = await (globalThis as any).axe.run(document, { runOnly: { type: "tag", values: tags } });
            return r.violations.map((x: any) => `${x.id}: ${x.nodes.map((n: any) => n.target.join(" ")).slice(0, 3).join(" | ")}`);
          }, AXE_TAGS);
          assert.deepEqual(v, []);
          await p.context().close();
        });

    test("375 px with a wide system font: no horizontal scroll, card and buttons not clipped", async () => {
      for (const q of ["guide=store-pattern", "guide=store-pattern&dev=1"]) {
        const p = await page(q, { viewport: { width: 375, height: 800 } });
        await p.addStyleTag({ content: "body, body * { font-family: Verdana, 'DejaVu Sans', sans-serif !important; letter-spacing: 0.08em; }" });
        await p.waitForTimeout(100);
        const m = await p.evaluate(() => {
          const w = document.documentElement.clientWidth;
          const cut = [...document.querySelectorAll(".guide-buttons button, .guide-card")].filter((e) => { const r = e.getBoundingClientRect(); return r.left < -0.5 || r.right > w + 0.5; }).map((e) => e.textContent?.slice(0, 20));
          return { scroll: document.documentElement.scrollWidth - w, cut, small: [...document.querySelectorAll(".guide-buttons button")].map((e) => e.getBoundingClientRect().height).filter((h) => h < 44).length };
        });
        assert.ok(m.scroll <= 0, `${q}: horizontal scroll ${m.scroll}`);
        assert.deepEqual(m.cut, [], `${q}: clipped`);
        assert.equal(m.small, 0, "buttons keep 44 px height");
        await p.context().close();
      }
    });
  });
}
