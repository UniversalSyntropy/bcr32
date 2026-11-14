// Browser test harness: serves the built app and opens it in Chromium and WebKit.
// Run through `npm run test:browser`, which builds first.
import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer, type Server } from "node:http";
import { extname, join, normalize } from "node:path";

import { chromium, webkit, type Browser, type BrowserContextOptions, type BrowserType, type Page } from "playwright";

const DIST = join(import.meta.dirname, "..", "dist");
const TYPES: Record<string, string> = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".woff2": "font/woff2", ".txt": "text/plain" };

export const ENGINES: [string, BrowserType][] = [["chromium", chromium], ["webkit", webkit]];

export async function serve(): Promise<{ url: string; server: Server }> {
  assertBuilt();
  const server = createServer((req, res) => {
    const path = normalize(decodeURIComponent((req.url ?? "/").split("?")[0]!)).replace(/^(\.\.[/\\])+/, "");
    let file = join(DIST, path === "/" ? "index.html" : path);
    if (!existsSync(file) || statSync(file).isDirectory()) file = join(DIST, "index.html");
    res.setHeader("content-type", TYPES[extname(file)] ?? "application/octet-stream");
    createReadStream(file).pipe(res);
  });
  await new Promise<void>((ok) => server.listen(0, "127.0.0.1", ok));
  const addr = server.address();
  return { url: `http://127.0.0.1:${typeof addr === "object" && addr !== null ? addr.port : 0}/`, server };
}

function assertBuilt() {
  if (!existsSync(join(DIST, "index.html"))) throw new Error("apps/web/dist is missing: run npm run build:web");
}

export async function open(browser: Browser, url: string, query: string, opts: BrowserContextOptions = {}, init?: string): Promise<Page> {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, ...opts });
  if (init !== undefined) await ctx.addInitScript(init);
  const page = await ctx.newPage();
  page.on("pageerror", (e) => {
    throw e;
  });
  await page.goto(`${url}?${query}`);
  await page.waitForSelector(".panel-svg");
  return page;
}
