import assert from "node:assert/strict";
import test from "node:test";
import worker from "../src/worker.mjs";

test("production aliases redirect to HTTPS apex while preserving paths and queries", async () => {
  for (const origin of ["http://hiligaynon101.com", "http://www.hiligaynon101.com", "https://www.hiligaynon101.com"]) {
    const response = await worker.fetch(new Request(`${origin}/books/beginner-journey/?ref=home&next=https%3A%2F%2Fexample.com`), {
      ASSETS: { fetch() { assert.fail("Redirect requests must not fetch assets"); } }
    });
    assert.equal(response.status, 308);
    assert.equal(response.headers.get("location"), "https://hiligaynon101.com/books/beginner-journey/?ref=home&next=https%3A%2F%2Fexample.com");
  }
});

test("canonical, preview and localhost requests preserve asset responses and 404 status", async () => {
  for (const origin of ["https://hiligaynon101.com", "http://localhost:8787", "https://hiligaynon101.example.workers.dev", "https://hiligaynon101.com.example.com"]) {
    const request = new Request(`${origin}/missing`, { method: "HEAD" });
    const assetResponse = new Response(null, { status: 404, headers: { "content-type": "text/html", "x-test": "preserved" } });
    const response = await worker.fetch(request, { ASSETS: { fetch(incoming) { assert.equal(incoming, request); return assetResponse; } } });
    assert.equal(response, assetResponse);
    assert.equal(response.status, 404);
  }
});
