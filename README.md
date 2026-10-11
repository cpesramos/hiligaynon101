# Hiligaynon 101

Static website for the Hiligaynon 101 book series by Chanelle Ramos.

## Local Development

Build the site:

```bash
npm run build
```

Serve the built site locally:

```bash
npm run dev
```

The local server defaults to `http://localhost:4321`.

## Content

- Site settings: `src/data/site.json`
- Book and series content: `src/content/books.json`
- Adult beginner phrase samples: `src/content/phrases.json`
- Sample vocabulary: `src/content/words.json`
- FAQ/SEO content: `src/content/faq.json`

Generated output is written to `dist/` and should not be edited by hand.

Book records include their static page path, topic guide and verified paperback specifications. Amazon US and Amazon AU links each have an explicit format label at the edition level in `src/content/books.json`. Optional `additionalLinks` add independently verified country/format choices. `previewMarket` and `previewFormat` identify a verified current listing with a “Read sample” control, and `contentLanguages` distinguishes bilingual book/sample content from the English website interface. Recheck the linked product before changing its format label or specifications.

The build generates the homepage, full sample collection, one page per book, footer pages and a custom `404.html`. The 404 page is excluded from the sitemap. Contact email and content modification date live in `src/data/site.json`.

## Deployment

The existing deployment uses **Cloudflare Workers with Static Assets**, configured in `wrangler.jsonc`:

- Install dependencies with `npm ci`.
- Build and validate with `npm run validate`.
- Deploy with `npm run deploy` (requires Cloudflare authentication). Its `predeploy` hook rebuilds and validates the site automatically, and stops publication if checks fail.
- Preview the actual asset routing locally with `npm run preview`.

`src/worker.mjs` redirects requests for `http://hiligaynon101.com` and `www.hiligaynon101.com` to `https://hiligaynon101.com`, preserving paths and queries. Both production hosts must remain attached to this Worker in Cloudflare. Localhost and preview hosts are left alone. The assets binding serves the generated site and returns the custom 404 page with HTTP status 404.

No book-interior scans, edition-change claims, independent reviews or audio recordings are invented. Add these only with genuine source material and publication rights. Website sample practice is labelled separately from Amazon book previews.

## Review Flow

Changes should go through pull requests into `main`. The validation workflow runs the static build and local checks on every PR.
