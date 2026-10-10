import { createServer } from "node:http";
import { createReadStream, existsSync } from "node:fs";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");
const port = Number(process.env.PORT || 4321);

const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml; charset=utf-8"
};

function send(res, statusCode, body, contentType = "text/plain; charset=utf-8") {
  res.writeHead(statusCode, { "content-type": contentType });
  res.end(body);
}

const server = createServer(async (req, res) => {
  try {
    if (!["GET", "HEAD"].includes(req.method)) {
      res.writeHead(405, { allow: "GET, HEAD" });
      res.end();
      return;
    }
    const url = new URL(req.url || "/", `http://localhost:${port}`);
    let pathname;
    try {
      pathname = decodeURIComponent(url.pathname);
    } catch {
      send(res, 400, "Invalid address");
      return;
    }
    if (pathname.endsWith("/")) pathname = `${pathname}index.html`;
    const filePath = path.normalize(path.join(dist, pathname));

    if (!filePath.startsWith(`${dist}${path.sep}`) || !existsSync(filePath)) {
      const html = await readFile(path.join(dist, "404.html"), "utf8");
      send(res, 404, req.method === "HEAD" ? "" : html, contentTypes[".html"]);
      return;
    }

    const info = await stat(filePath);
    if (!info.isFile()) {
      const html = await readFile(path.join(dist, "404.html"), "utf8");
      send(res, 404, req.method === "HEAD" ? "" : html, contentTypes[".html"]);
      return;
    }

    res.writeHead(200, {
      "cache-control": "no-store",
      "content-type": contentTypes[path.extname(filePath)] || "application/octet-stream"
    });
    if (req.method === "HEAD") res.end();
    else createReadStream(filePath).pipe(res);
  } catch (error) {
    console.error(error);
    send(res, 500, "Unable to load this page");
  }
});

server.listen(port, () => {
  console.log(`Serving ${dist} at http://localhost:${port}`);
});
