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
- Sample vocabulary: `src/content/words.json`
- FAQ/SEO content: `src/content/faq.json`

Generated output is written to `dist/` and should not be edited by hand.

Cover imagery is loaded from Amazon image endpoints by ASIN. Amazon and Amazon AU purchase links live at the edition level in `src/content/books.json`.

## Deployment

Recommended Cloudflare Pages settings:

- Build command: `node scripts/build.mjs`
- Build output directory: `dist`
- Root directory: repository root

Use `https://hiligaynon101.com` as the production domain once DNS is attached.

## Review Flow

Changes should go through pull requests into `main`. The validation workflow runs the static build and local checks on every PR.
