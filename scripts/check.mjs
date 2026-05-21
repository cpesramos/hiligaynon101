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
  if (!wranglerConfig.includes("\"directory\": \"./dist\"")) {
    throw new Error("wrangler.jsonc must point Cloudflare Workers assets at ./dist.");
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
  const allText = `${html}\n${css}`;

  for (const needle of [
    "<title>",
    "name=\"description\"",
    "name=\"keywords\"",
    "rel=\"canonical\"",
    "property=\"og:image\"",
    "application/ld+json",
    "DefinedTermSet",
    "Offer",
    "Hiligaynon 101 Kids",
    "Chanelle Ramos",
    "FAQPage",
    "B0GT5SBYFT",
    "B0CVNQ9192",
    "B0F3CPBSK5",
    "B0GT5TTQWS",
    "B0H266YQC6",
    "Amazon AU",
    "ADLAW",
    "BALAY",
    "TUBIG",
    "LIBRO",
    "BOLA",
    "HAMPANGANAN",
    "PAMILYA",
    "NANAY",
    "TATAY",
    "LAMESA",
    "TASA",
    "https://amzn.to/4ujalZO",
    "https://amzn.to/4dTLAO2",
    "As an Amazon Associate"
  ]) {
    if (!html.includes(needle)) {
      throw new Error(`index.html is missing required content: ${needle}`);
    }
  }

  for (const forbidden of ["TODO", "Lorem ipsum", "placeholder", "FIXME"]) {
    if (allText.includes(forbidden)) {
      throw new Error(`Draft marker found: ${forbidden}`);
    }
  }

  const localRefs = [
    ...findAll(/\s(?:href|src)="(\/[^"#?]+)(?:#[^"]*)?"/g, html),
    ...findAll(/url\("?(\/[^")?#]+)"?\)/g, css)
  ];

  for (const ref of localRefs) {
    if (ref === "/") continue;
    const refPath = path.join(dist, ref.replace(/^\/+/, ""));
    if (!existsSync(refPath)) {
      throw new Error(`Local asset/link target does not exist: ${ref}`);
    }
  }

  const files = await walk(dist);
  const htmlFiles = files.filter((file) => file.endsWith(".html"));
  if (htmlFiles.length !== 1) {
    throw new Error(`Expected exactly one HTML page for launch, found ${htmlFiles.length}`);
  }

  console.log(`Checked ${files.length} generated files.`);
}

check().catch((error) => {
  console.error(error);
  process.exit(1);
});
