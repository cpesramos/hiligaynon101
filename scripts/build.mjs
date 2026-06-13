import { existsSync } from "node:fs";
import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { renderBookPage } from "./lib/render-book-page.mjs";
import { renderHomePage } from "./lib/render-home.mjs";
import { infoPageRoutes } from "./lib/render-info-page.mjs";
import { siteOrigin } from "./lib/urls.mjs";
import { validateContent } from "./lib/validation.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const src = path.join(root, "src");
const dist = path.join(root, "dist");
const assets = path.join(src, "assets");

const readJson = async (...parts) => JSON.parse(await readFile(path.join(src, ...parts), "utf8"));

function pagePath(routePath) {
  if (routePath === "/") return path.join(dist, "index.html");
  return path.join(dist, routePath.replace(/^\/+/, ""), "index.html");
}

function sitemapXml(site, routes) {
  const urls = routes
    .map((route) => {
      const lastmod = site.lastModified ? `<lastmod>${site.lastModified}</lastmod>` : "";
      return `  <url><loc>${siteOrigin(site)}${route.path}</loc>${lastmod}</url>`;
    })
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

async function writePage(route) {
  const outputPath = pagePath(route.path);
  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, route.html);
}

async function build() {
  const [site, books, words, phrases, faq] = await Promise.all([
    readJson("data", "site.json"),
    readJson("content", "books.json"),
    readJson("content", "words.json"),
    readJson("content", "phrases.json"),
    readJson("content", "faq.json")
  ]);

  validateContent({ site, books, words, phrases, faq, src });

  const routes = [
    {
      path: "/",
      html: renderHomePage({ site, books, words, phrases, faq })
    },
    ...books.map((book) => ({
      path: book.path,
      html: renderBookPage({ site, book })
    })),
    ...infoPageRoutes(site)
  ];

  await rm(dist, { recursive: true, force: true });
  await mkdir(dist, { recursive: true });
  await cp(path.join(src, "styles.css"), path.join(dist, "styles.css"));
  if (existsSync(assets)) {
    await cp(assets, path.join(dist, "assets"), { recursive: true });
  }

  await Promise.all(routes.map(writePage));
  await writeFile(path.join(dist, "sitemap.xml"), sitemapXml(site, routes));
  await writeFile(path.join(dist, "robots.txt"), `User-agent: *\nAllow: /\nSitemap: ${siteOrigin(site)}/sitemap.xml\n`);
}

build().catch((error) => {
  console.error(error);
  process.exit(1);
});
