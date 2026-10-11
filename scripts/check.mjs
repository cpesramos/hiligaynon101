import assert from "node:assert/strict";
import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { purchaseLinks, previewLink } from "./lib/books.mjs";
import { escapeHtml } from "./lib/html.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");
const readJson = async (file) => JSON.parse(await readFile(path.join(root, "src", file), "utf8"));
const outputFile = (route) => route === "/" ? "index.html" : `${route.slice(1)}index.html`;

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const nested = await Promise.all(entries.map(entry => entry.isDirectory() ? walk(path.join(dir, entry.name)) : path.join(dir, entry.name)));
  return nested.flat();
}

async function check() {
  const [site, books, words, phrases, config] = await Promise.all([
    readJson("data/site.json"), readJson("content/books.json"), readJson("content/words.json"), readJson("content/phrases.json"),
    readFile(path.join(root, "wrangler.jsonc"), "utf8").then(JSON.parse)
  ]);
  assert.equal(config.assets.directory, "dist");
  assert.equal(config.assets.not_found_handling, "404-page");
  assert.equal(config.assets.run_worker_first, true, "Canonical redirects must run before matching assets");
  assert.equal(config.assets.binding, "ASSETS");
  await stat(path.join(root, config.main));

  const routes = ["/", ...books.map(book => book.path), "/affiliate-disclosure/", "/contact/", "/privacy/", "/samples/"];
  const expected = [...routes.map(outputFile), "404.html"].sort();
  const files = await walk(dist);
  assert.deepEqual(files.filter(file => file.endsWith(".html")).map(file => path.relative(dist, file)).sort(), expected);
  const pages = new Map(await Promise.all(expected.map(async file => [file, await readFile(path.join(dist, file), "utf8")])));
  const sitemap = await readFile(path.join(dist, "sitemap.xml"), "utf8");
  const locations = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(match => match[1]).sort();
  assert.deepEqual(locations, routes.map(route => `${site.url}${route}`).sort());
  assert(sitemap.includes(`<lastmod>${site.lastModified}</lastmod>`));
  assert((await readFile(path.join(dist, "robots.txt"), "utf8")).includes(`Sitemap: ${site.url}/sitemap.xml`));

  for (const [file, html] of pages) {
    assert(html.includes('<a class="skip-link" href="#main-content">'), `${file}: missing skip link`);
    assert.equal((html.match(/<h1\b/g) || []).length, 1, `${file}: expected one page heading`);
    for (const marker of ["<title>", 'name="description"', 'rel="canonical"', 'name="viewport"', 'aria-label="Primary navigation"']) {
      assert(html.includes(marker), `${file}: missing ${marker}`);
    }
    for (const marker of ["TODO", "Lorem ipsum", "FIXME", "schema.org/InStock"]) assert(!html.includes(marker), `${file}: unsupported or unfinished content: ${marker}`);
    for (const match of html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)) {
      const checkLanguage = (node) => {
        if (!node || typeof node !== "object") return;
        if (["Book", "DefinedTermSet"].includes(node["@type"])) assert.deepEqual(node.inLanguage, site.contentLanguages, `${file}: bilingual content languages are missing`);
        Object.values(node).forEach(value => Array.isArray(value) ? value.forEach(checkLanguage) : checkLanguage(value));
      };
      checkLanguage(JSON.parse(match[1]));
    }
    for (const match of html.matchAll(/\b(?:href|src)="([^"]+)"/g)) {
      const reference = match[1].replaceAll("&amp;", "&");
      if (!reference.startsWith("/") && !reference.startsWith("#")) continue;
      const base = file === "404.html" ? `${site.url}/404.html` : `${site.url}/${file.replace(/index\.html$/, "")}`;
      const url = new URL(reference, base);
      const target = url.pathname.endsWith("/") ? outputFile(url.pathname) : url.pathname.slice(1);
      assert(files.includes(path.join(dist, target)), `${file}: broken local target ${reference}`);
      if (url.hash) {
        const targetHtml = pages.get(target);
        assert(targetHtml?.includes(`id="${decodeURIComponent(url.hash.slice(1))}"`), `${file}: missing anchor ${reference}`);
      }
    }
    for (const match of html.matchAll(/<a\b([^>]*\bhref="https:\/\/amzn\.to\/[^>]+)>/g)) {
      assert(/\brel="[^"]*sponsored/.test(match[1]), `${file}: Amazon affiliate link lacks disclosure attribute`);
    }
  }
  const samples = pages.get("samples/index.html");
  for (const phrase of phrases) assert(samples.includes(escapeHtml(phrase.phrase)), "Missing phrase on full samples page");
  for (const word of words) assert(samples.includes(escapeHtml(word.word)), "Missing word on full samples page");
  for (const book of books) {
    const html = pages.get(outputFile(book.path));
    assert(html.includes(String(book.details.paperbackPages)) && html.includes(book.details.isbn), `Missing paperback facts for ${book.id}`);
    for (const edition of book.editions) {
      const preview = previewLink(edition);
      if (preview) assert(html.includes(`Preview on ${preview.market} · ${preview.format}`) && html.includes("Read sample"), `${book.id}: missing instructions for the verified preview`);
      for (const { market, format, url } of purchaseLinks(edition)) {
        assert(html.includes(`href="${url}"`) && html.includes(`${market} · ${format}`), `${book.id}: purchase link must show its market and format`);
      }
    }
  }
  assert(pages.get("contact/index.html").includes(`href="mailto:${site.contactEmail}"`), "Contact page needs an actionable email link");
  assert(pages.get("404.html").includes('content="noindex,follow"'), "404 must not be indexed");
  console.log(`Checked ${pages.size} pages, sitemap, local links, sample content and labelled purchase links.`);
}

check().catch(error => { console.error(error); process.exit(1); });
