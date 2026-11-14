// Browser tests of the printed layer, label layers, lit button, knob pointer and dev panel.
// Text width is measured with getBBox in Chromium and WebKit. Height is the font cap height around the
// box centre (getBBox gives the em box). getBBox ignores rotation; no legend has a rotation today.
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { after, before, describe, test } from "node:test";

import type { Browser, Page } from "playwright";

import { ENGINES, open, serve } from "./harness.ts";

const axePath = createRequire(import.meta.url).resolve("axe-core/axe.min.js");
const ALL = "printed,callout,id,function";

// Text that may overlap another box, by legend key, with the reason. Empty is the goal.
const OVERLAP_EXCEPTIONS: Record<string, string> = {};

type Box = { key: string; x0: number; x1: number; y0: number; y1: number };

// Measured boxes in mm: horizontal extent of the real text, vertical extent of one cap height around its centre.
async function textBoxes(p: Page): Promise<{ texts: Box[]; parts: Box[] }> {
  return p.evaluate(() => {
    const texts = [...document.querySelectorAll<SVGTextElement>("#legends text")].map((t) => {
      const b = t.getBBox();
      const fs = parseFloat(t.getAttribute("font-size")!);
      const cy = b.y + b.height / 2;
      const brand = t.id === "brand";
      const h = fs * 0.7;
      return { key: brand ? "brand" : `${t.dataset["id"]}#${t.dataset["label"]}`, x0: b.x, x1: b.x + b.width, y0: cy - h / 2, y1: cy + h / 2 };
    });
    const parts = [...document.querySelectorAll<SVGGElement>("#controls > g[data-id]")].map((g) => {
      const ring = document.querySelector<SVGGElement>(`#lights g.ring[data-id="${g.dataset["id"]}"]`);
      const b = (ring ?? g.querySelector<SVGGraphicsElement>(".part")!).getBBox();
      return { key: g.dataset["id"]!, x0: b.x, x1: b.x + b.width, y0: b.y, y1: b.y + b.height };
    });
    return { texts, parts };
  });
}

const hit = (a: Box, b: Box) => a.x0 < b.x1 - 1e-6 && b.x0 < a.x1 - 1e-6 && a.y0 < b.y1 - 1e-6 && b.y0 < a.y1 - 1e-6;

export function overlapIssues(texts: Box[], parts: Box[], onPartOf: (key: string) => string | undefined): string[] {
  const out: string[] = [];
  for (let i = 0; i < texts.length; i++) {
    for (let j = i + 1; j < texts.length; j++) if (hit(texts[i]!, texts[j]!)) out.push(`${texts[i]!.key} overlaps ${texts[j]!.key}`);
    for (const p of parts) if (onPartOf(texts[i]!.key) !== p.key && hit(texts[i]!, p)) out.push(`${texts[i]!.key} overlaps part ${p.key}`);
  }
  return out.filter((m) => !(m.split(" ")[0]! in OVERLAP_EXCEPTIONS));
}

const rgb = (c: string) => c.match(/[\d.]+/g)!.slice(0, 3).map(Number);
const lum = (c: string) => {
  const v = rgb(c).map((x) => x / 255).map((x) => (x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4));
  return 0.2126 * v[0]! + 0.7152 * v[1]! + 0.0722 * v[2]!;
};
const ratio = (a: string, b: string) => {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x! + 0.05) / (y! + 0.05);
};

for (const [engine, type] of ENGINES) {
  describe(`${engine} labels`, () => {
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

    test("overlap gate: real text boxes do not overlap each other or a part (both themes of fonts, one view)", async () => {
      for (const theme of ["device", "flat-light"]) {
        const p = await open(browser, url, `view=top&theme=${theme}`);
        await p.evaluate(() => document.fonts.ready);
        const { texts, parts } = await textBoxes(p);
        assert.ok(texts.length > 100, `${texts.length} texts`);
        const onPart = new Map<string, string>(
          await p.$$eval("#legends text.legend", (n) => n.map((t) => [`${(t as SVGElement).dataset["id"]}#${(t as SVGElement).dataset["label"]}`, (t as SVGElement).dataset["id"]!] as [string, string])),
        );
        // A label with placement 'on' sits on its own part: the layout marks it with data-on.
        const own = await p.$$eval('#legends text[data-on="true"]', (n) => n.map((t) => `${(t as SVGElement).dataset["id"]}#${(t as SVGElement).dataset["label"]}`));
        const ownSet = new Set(own);
        assert.equal(ownSet.size, 31);
        const issues = overlapIssues(texts, parts, (k) => (ownSet.has(k) ? onPart.get(k) : undefined));
        assert.deepEqual(issues, [], `${engine} ${theme}`);
        await p.context().close();
      }
    });

    test("overlap gate catches a label moved onto its neighbour (control: the measure is live)", async () => {
      const p = await open(browser, url, "view=top&theme=device");
      await p.evaluate(() => document.fonts.ready);
      await p.evaluate(() => {
        const a = document.querySelector('#legends text[data-id="B5"][data-label="1"]')!;
        const b = document.querySelector('#legends text[data-id="B6"][data-label="1"]')!;
        a.setAttribute("x", b.getAttribute("x")!);
        a.setAttribute("y", b.getAttribute("y")!);
      });
      const { texts, parts } = await textBoxes(p);
      assert.ok(overlapIssues(texts, parts, () => undefined).some((m) => m.startsWith("B5#1 ")));
      await p.context().close();
    });

    test("layers: each switch shows and hides its text and writes the URL", async () => {
      const p = await open(browser, url, "view=top&theme=device");
      const n = (layer: string) => p.locator(`#labels text[data-layer="${layer}"]`).count();
      assert.equal(await n("callout"), 0);
      assert.ok((await p.locator("#legends text").count()) > 100);
      for (const [layer, label] of [["callout", "Callout numbers"], ["id", "Control IDs"], ["function", "Function (mode text)"]] as const) {
        await p.getByLabel(label).check();
        assert.ok((await n(layer)) > 0, `${layer} on`);
        assert.match(p.url(), new RegExp(`layers=[a-z,]*${layer}`));
        await p.getByLabel(label).uncheck();
        assert.equal(await n(layer), 0, `${layer} off`);
      }
      await p.getByLabel("Printed legends").uncheck();
      assert.equal(await p.locator("#legends text.legend").count(), 0);
      assert.match(p.url(), /layers=none/);
      await p.context().close();
    });

    for (const wide of [false, true])
    test(`layers from the URL; all layers on keep every part and text apart${wide ? " (wide system font)" : ""}`, async () => {
      const p = await open(browser, url, `view=top&theme=device&layers=${ALL}`);
      if (wide) await p.addStyleTag({ content: ".panel-svg text { font-family: Verdana, 'DejaVu Sans', sans-serif !important; letter-spacing: 0.15em; }" });
      await p.evaluate(() => document.fonts.ready);
      assert.equal(await p.getByLabel("Control IDs").isChecked(), true);
      const boxes = await p.$$eval("#labels text", (n) => n.map((t) => { const b = (t as SVGTextElement).getBBox(); return { key: `${(t as SVGElement).dataset["layer"]}:${(t as SVGElement).dataset["id"]}`, x0: b.x, x1: b.x + b.width, y0: b.y, y1: b.y + b.height }; }));
      assert.ok(boxes.length > 150);
      const { parts } = await textBoxes(p);
      const bad: string[] = [];
      for (const b of boxes) for (const q of parts) if (q.key !== b.key.split(":")[1] && hit(b, q)) bad.push(`${b.key} over part ${q.key}`);
      assert.deepEqual(bad, []);
      await p.context().close();
    });

    test("lit button: the fill covers the whole button and the legend colour is the contrast partner", async () => {
      for (const theme of ["device", "flat-light", "flat-dark"]) {
        const p = await open(browser, url, `view=top&theme=${theme}`);
        for (const id of ["B1", "B5", "B6", "B9"]) {
          const r = await p.evaluate((i) => {
            const part = document.querySelector<SVGGraphicsElement>(`#controls g[data-id="${i}"] .part`)!.getBBox();
            const lit = document.querySelector<SVGGraphicsElement>(`#lights g[data-id="${i}"] .light-shape`)!;
            const lb = lit.getBBox();
            const text = document.querySelector<SVGElement>(`#legends text[data-id="${i}"]`)!;
            return { part: [part.x, part.y, part.width, part.height], lit: [lb.x, lb.y, lb.width, lb.height], fill: getComputedStyle(lit).fill, text: getComputedStyle(text).fill, anim: getComputedStyle(text).animationName };
          }, id);
          for (let k = 0; k < 4; k++) assert.ok(Math.abs(r.part[k]! - r.lit[k]!) < 0.01, `${id} ${theme}: lit box ${r.lit} part box ${r.part}`);
          if (r.anim === "none") assert.ok(ratio(r.text, r.fill) >= 4.5, `${theme} ${id}: ${r.text} on ${r.fill} is ${ratio(r.text, r.fill).toFixed(2)}`);
        }
        // Only the four buttons of the fixture are lit.
        assert.deepEqual(await p.$$eval("#lights g.light", (n) => n.map((e) => (e as SVGElement).dataset["id"]).sort()), ["B1", "B5", "B6", "B9"]);
        await p.context().close();
      }
    });

    test("legend contrast by computed colour: every printed text at least 4.5 to 1 on its ground", async () => {
      for (const theme of ["device", "flat-light", "flat-dark"]) {
        const p = await open(browser, url, `view=top&theme=${theme}`);
        const rows = await p.$$eval("#legends text.legend", (n) =>
          n.map((t) => {
            const el = t as SVGElement;
            const own = el.dataset["on"] === "true";
            const bar = el.dataset["colour"] === "bar";
            const root = getComputedStyle(document.querySelector(".case-face")!);
            const part = document.querySelector(`#controls g[data-id="${el.dataset["id"]}"] .part`);
            const ground = bar ? getComputedStyle(document.querySelector(".mark-bar")!).fill : own && part !== null ? getComputedStyle(part).fill : root.fill;
            return { key: `${el.dataset["id"]}#${el.dataset["label"]}`, fill: getComputedStyle(el).fill, ground, lit: el.classList.contains("legend-lit") };
          }),
        );
        for (const r of rows.filter((x) => !x.lit)) assert.ok(ratio(r.fill, r.ground) >= 4.5, `${theme} ${r.key}: ${r.fill} on ${r.ground} is ${ratio(r.fill, r.ground).toFixed(2)}`);
        await p.context().close();
      }
    });

    test("knob: three circles and a pointer from the value; unknown rings have no pointer", async () => {
      const p = await open(browser, url, "view=top&theme=device");
      assert.equal(await p.locator('#controls g[data-id="E25"] circle.part-crown').count(), 2);
      assert.equal(await p.locator("#lights .pointer").count(), 3);
      assert.equal(await p.getAttribute('#lights g.ring[data-id="E25"] .pointer', "data-deg"), "-150.000");
      assert.equal(await p.getAttribute('#lights g.ring[data-id="E26"] .pointer', "data-deg"), "1.181");
      assert.equal(await p.getAttribute('#lights g.ring[data-id="E27"] .pointer', "data-deg"), "150.000");
      assert.equal(await p.locator('#lights g.ring[data-id="E28"] .pointer').count(), 0);
      await p.focus('.ctl[data-id="E26"]');
      await p.keyboard.press("Shift+ArrowUp");
      assert.equal(await p.getAttribute('#lights g.ring[data-id="E26"] .pointer', "data-deg"), (-150 + (300 * 65) / 127).toFixed(3));
      await p.context().close();
    });

    test("dev panel: ?dev=1 shows counts, 17 missing jacks and the unknown rings", async () => {
      const p = await open(browser, url, "view=top&theme=device&dev=1");
      assert.equal(await p.locator(".dev-panel").count(), 1);
      assert.equal((await p.locator('[data-list="missing"]').innerText()).trim().split(/\s+/).length, 17);
      assert.equal((await p.locator('[data-list="unknown-rings"]').innerText()).trim().split(/\s+/).length, 29);
      assert.equal(await p.getAttribute(".panel", "data-dev"), "true");
      const fill = await p.evaluate(() => getComputedStyle(document.querySelector('#controls g[data-id="B1"] .part')!).fill);
      assert.notEqual(fill, await p.evaluate(() => getComputedStyle(document.querySelector('#controls g[data-id="B5"] .part')!).fill));
      assert.equal(await open(browser, url, "view=top&theme=device").then(async (q) => { const c = await q.locator(".dev-panel").count(); await q.context().close(); return c; }), 0);
      await p.context().close();
    });

    test("axe: zero violations with all layers on, both views, both theme families", async () => {
      for (const view of ["top", "rear"])
        for (const theme of ["device", "flat-light"]) {
          const p = await open(browser, url, `view=${view}&theme=${theme}&layers=${ALL}&dev=1`);
          await p.addScriptTag({ path: axePath });
          const v = await p.evaluate(async () => {
            const r = await (globalThis as any).axe.run(document, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"] } });
            return r.violations.map((x: any) => `${x.id}: ${x.nodes.map((n: any) => n.target.join(" ")).slice(0, 3).join(" | ")}`);
          });
          assert.deepEqual(v, [], `${view} ${theme}`);
          await p.context().close();
        }
    });
  });
}
