import { readdir, readFile, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");

const requiredFiles = [
  "index.html",
  "styles.css",
  "sitemap.xml",
  "robots.txt"
];

const expectedHtmlFiles = [
  "index.html",
  "books/beginner-journey/index.html",
  "books/practical-conversations/index.html",
  "kids/my-first-words-colouring-book/index.html",
  "kids/animals-food-nature-colouring-book/index.html",
  "affiliate-disclosure/index.html",
  "contact/index.html",
  "privacy/index.html"
];

const expectedSitemapRoutes = [
  "/",
  "/books/beginner-journey/",
  "/books/practical-conversations/",
  "/kids/my-first-words-colouring-book/",
  "/kids/animals-food-nature-colouring-book/",
  "/affiliate-disclosure/",
  "/contact/",
  "/privacy/"
];

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const next = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walk(next)));
    } else {
      files.push(next);
    }
  }
  return files;
}

function findAll(pattern, text) {
  return [...text.matchAll(pattern)].map((match) => match[1]);
}

async function check() {
  const wranglerConfigPath = path.join(root, "wrangler.jsonc");
  if (!existsSync(wranglerConfigPath)) {
    throw new Error("Missing wrangler.jsonc for Cloudflare Workers assets deployment.");
  }

  const wranglerConfig = await readFile(wranglerConfigPath, "utf8");
  if (!/"directory"\s*:\s*"(?:\.\/)?dist"/.test(wranglerConfig)) {
    throw new Error("wrangler.jsonc must point Cloudflare Workers assets at dist.");
  }

  if (!existsSync(dist)) {
    throw new Error("dist/ does not exist. Run npm run build first.");
  }

  for (const file of requiredFiles) {
    const filePath = path.join(dist, file);
    if (!existsSync(filePath)) {
      throw new Error(`Missing generated file: ${file}`);
    }
    const info = await stat(filePath);
    if (info.size === 0) {
      throw new Error(`Generated file is empty: ${file}`);
    }
  }

  const html = await readFile(path.join(dist, "index.html"), "utf8");
  const css = await readFile(path.join(dist, "styles.css"), "utf8");
  const sitemap = await readFile(path.join(dist, "sitemap.xml"), "utf8");
  const files = await walk(dist);
  const htmlFiles = files.filter((file) => file.endsWith(".html"));
  const htmlByFile = new Map();

  for (const file of expectedHtmlFiles) {
    const filePath = path.join(dist, file);
    if (!existsSync(filePath)) {
      throw new Error(`Missing generated HTML page: ${file}`);
    }
    const pageHtml = await readFile(filePath, "utf8");
    if (pageHtml.length === 0) {
      throw new Error(`Generated HTML page is empty: ${file}`);
    }
    htmlByFile.set(file, pageHtml);
  }

  const allHtml = [...htmlByFile.values()].join("\n");
  const allText = `${allHtml}\n${css}`;

  for (const needle of [
    "<title>",
    "name=\"description\"",
    "name=\"author\"",
    "name=\"keywords\"",
    "name=\"theme-color\"",
    "rel=\"canonical\"",
    "hreflang=\"en-au\"",
    "dateModified",
    "property=\"og:image\"",
    "property=\"og:image:width\"",
    "application/ld+json",
    "CollectionPage",
    "DefinedTermSet",
    "Offer",
    "/assets/social-preview.png",
    "Hiligaynon 101 Kids",
    "Chanelle Ramos",
    "FAQPage",
    "B0GT5SBYFT",
    "B0CVNQ9192",
    "B0F3CPBSK5",
    "B0GT5TTQWS",
    "B0H266YQC6",
    "B0H4FVZPKC",
    "Amazon US",
    "Amazon AU",
    "Recommended for most buyers",
    "Start with Book 1",
    "Buy current edition",
    "Earlier edition links",
    "Hiligaynon 101 learning paths",
    "Find the Hiligaynon book that matches your learner",
    "How the series works",
    "Adult Track",
    "Kids Track",
    "not the next adult level",
    "Maayong aga",
    "Salamat gid",
    "Diin ang merkado",
    "Sample Hiligaynon phrases for adult beginners",
    "#book-series",
    "#author",
    "rel=\"sponsored\"",
    "From the author",
    "Created by Chanelle Ramos, Bacolod-born and Australia-based",
    "Beginner-first Hiligaynon for families, heritage learners and everyday use",
    "Why Hiligaynon 101 is different",
    "Bacolod City",
    "ADLAW",
    "BALAY",
    "TUBIG",
    "LIBRO",
    "BOLA",
    "TASA",
    "KABAYO",
    "MANGGA",
    "BULAN",
    "https://amzn.to/4ujalZO",
    "https://amzn.to/4dTLAO2",
    "https://amzn.to/4aBIkES",
    "https://amzn.to/4v1ZXpO",
    "Animals, Food and Nature Colouring Book",
    "Where can I buy Hiligaynon 101 books in Australia?",
    "Affiliate disclosure",
    "Contact",
    "Privacy",
    "Skip to main content",
    "As an Amazon Associate"
  ]) {
    if (!html.includes(needle)) {
      throw new Error(`index.html is missing required content: ${needle}`);
    }
  }

  for (const needle of [
    ".hero-backdrop",
    ".hero-routes",
    ".hero-route",
    ".skip-link",
    ".trust-strip",
    ".pathway-grid",
    ".phrase-grid",
    ".difference-grid",
    ".book-detail-hero",
    ".info-page",
    "prefers-reduced-motion"
  ]) {
    if (!css.includes(needle)) {
      throw new Error(`styles.css is missing required design marker: ${needle}`);
    }
  }

  if (!sitemap.includes("<lastmod>2026-06-13</lastmod>")) {
    throw new Error("sitemap.xml is missing the configured lastmod date.");
  }

  for (const route of expectedSitemapRoutes) {
    if (!sitemap.includes(`<loc>https://hiligaynon101.com${route}</loc>`)) {
      throw new Error(`sitemap.xml is missing route: ${route}`);
    }
  }

  for (const forbidden of [
    "TODO",
    "Lorem ipsum",
    "placeholder",
    "FIXME",
    "reusable product record",
    "future books can be added without redesigning the site",
    "Check the edition before you buy",
    "id=\"editions\"",
    "HAMPANGANAN",
    "hampanganan",
    "LAMESA",
    "lamesa"
  ]) {
    if (allText.includes(forbidden)) {
      throw new Error(`Draft marker found: ${forbidden}`);
    }
  }

  const wordCardCount = (html.match(/class="word-card"/g) || []).length;
  if (wordCardCount !== 9) {
    throw new Error(`Expected exactly 9 sample word cards for a 3x3 grid, found ${wordCardCount}.`);
  }

  const phraseCardCount = (html.match(/class="phrase-card"/g) || []).length;
  if (phraseCardCount !== 8) {
    throw new Error(`Expected exactly 8 adult phrase sample cards, found ${phraseCardCount}.`);
  }

  for (const [file, needles] of [
    ["books/beginner-journey/index.html", ["A Beginner&#39;s Journey to Ilonggo", "Complete beginners", "https://amzn.to/4dnSknb", "https://amzn.to/4nEFGDX"]],
    ["books/practical-conversations/index.html", ["Practical Conversations for Everyday Life", "Learners ready to practise", "https://amzn.to/4ukPxRF", "https://amzn.to/4dCO6qC"]],
    ["kids/my-first-words-colouring-book/index.html", ["My First Words Colouring Book", "Children ages 3-6", "https://amzn.to/4dnSj2B", "https://amzn.to/4dTLAO2"]],
    ["kids/animals-food-nature-colouring-book/index.html", ["Animals, Food and Nature Colouring Book", "Children ages 3-6", "https://amzn.to/4aBIkES", "https://amzn.to/4v1ZXpO"]]
  ]) {
    const pageHtml = htmlByFile.get(file);
    for (const needle of ["Buy current edition", "Recommended for most buyers", "What this book helps with", ...needles]) {
      if (!pageHtml.includes(needle)) {
        throw new Error(`${file} is missing required content: ${needle}`);
      }
    }
  }

  const localRefs = [
    ...findAll(/\s(?:href|src)="(\/[^"#?]+)(?:#[^"]*)?"/g, allHtml),
    ...findAll(/url\("?(\/[^")?#]+)"?\)/g, css)
  ];

  for (const ref of localRefs) {
    if (ref === "/") continue;
    const refPath = path.join(dist, ref.replace(/^\/+/, ""));
    if (!existsSync(refPath)) {
      throw new Error(`Local asset/link target does not exist: ${ref}`);
    }
  }

  const expectedHtmlPaths = expectedHtmlFiles.map((file) => path.join(dist, file)).sort();
  const actualHtmlPaths = htmlFiles.sort();
  if (actualHtmlPaths.length !== expectedHtmlPaths.length) {
    throw new Error(`Expected ${expectedHtmlPaths.length} HTML pages, found ${actualHtmlPaths.length}.`);
  }

  for (const expectedPath of expectedHtmlPaths) {
    if (!actualHtmlPaths.includes(expectedPath)) {
      throw new Error(`Unexpected generated HTML page set; missing ${path.relative(dist, expectedPath)}.`);
    }
  }

  console.log(`Checked ${files.length} generated files.`);
}

check().catch((error) => {
  console.error(error);
  process.exit(1);
});
