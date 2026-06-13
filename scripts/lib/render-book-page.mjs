import { featuredEdition, orderedEditions } from "./books.mjs";
import { attr, escapeHtml, jsonLdScript } from "./html.mjs";
import { bookPageSchema, pageMetaTags } from "./schema.mjs";

const coverDimensions = {
  "/assets/cover-beginner-second.jpg": { width: 313, height: 500 },
  "/assets/cover-conversations-second.jpg": { width: 313, height: 500 },
  "/assets/cover-kids-current.jpg": { width: 387, height: 500 },
  "/assets/cover-kids-animals-current.jpg": { width: 387, height: 500 }
};

function displayImage(edition) {
  return edition.localImage || edition.image;
}

function imageSizeAttrs(edition) {
  const dimensions = coverDimensions[displayImage(edition)];
  return dimensions ? ` width="${dimensions.width}" height="${dimensions.height}"` : "";
}

function navHref(href) {
  return href.startsWith("#") ? `/${href}` : href;
}

function renderNav(site) {
  return `
    <header class="site-header">
      <nav class="nav" aria-label="Primary navigation">
        <a class="brand" href="/" aria-label="${attr(site.name)} home">
          <span class="brand-mark" aria-hidden="true">H</span>
          <span>${escapeHtml(site.name)}</span>
        </a>
        <div class="nav-links">
          ${site.navigation.map((item) => `<a href="${attr(navHref(item.href))}">${escapeHtml(item.label)}</a>`).join("")}
        </div>
      </nav>
    </header>
  `;
}

function renderFooter(site) {
  return `
    <footer class="site-footer">
      <div class="footer-inner">
        <p>Copyright ${new Date().getFullYear()} ${escapeHtml(site.author)}. ${escapeHtml(site.name)}.</p>
        <nav class="footer-links" aria-label="Footer links">
          <a href="/">Home</a>
          <a href="/affiliate-disclosure/">Affiliate disclosure</a>
          <a href="/contact/">Contact</a>
          <a href="/privacy/">Privacy</a>
        </nav>
        <p class="footer-note">${escapeHtml(site.affiliateDisclosure)}</p>
      </div>
    </footer>
  `;
}

function renderAffiliateButton(book, edition, market, url, variant = "") {
  const label = market === "Amazon AU" ? "Amazon AU" : "Amazon US";
  const variantClass = variant ? ` ${variant}` : "";
  return `<a class="edition-button${variantClass}" href="${attr(url)}" rel="sponsored" aria-label="${attr(`${label} listing for ${book.title}: ${book.subtitle}, ${edition.label}`)}">${escapeHtml(label)}</a>`;
}

function bookTrack(book) {
  return book.series === "Hiligaynon 101 Kids" ? "Kids Track" : "Adult Track";
}

function renderEarlierEditions(book, currentEdition) {
  const earlierEditions = orderedEditions(book).filter((edition) => edition.id !== currentEdition.id);
  if (earlierEditions.length === 0) return "";

  return `
    <details class="earlier-editions book-page-earlier">
      <summary>Earlier edition links</summary>
      <div class="earlier-edition-list">
        ${earlierEditions
          .map(
            (edition) => `
              <div class="edition-row earlier-edition-row">
                <span class="edition-label">
                  ${escapeHtml(edition.label)}
                  <span class="edition-note">Earlier edition</span>
                </span>
                <div class="edition-actions">
                  ${renderAffiliateButton(book, edition, "Amazon US", edition.amazonUrl)}
                  ${renderAffiliateButton(book, edition, "Amazon AU", edition.amazonAuUrl, "secondary")}
                </div>
              </div>
            `
          )
          .join("")}
      </div>
    </details>
  `;
}

export function renderBookPage({ site, book }) {
  const edition = featuredEdition(book);
  const title = `${book.title}: ${book.subtitle} | ${site.name}`;
  const description = book.seoDescription || book.summary;

  return `<!doctype html>
<html lang="en-AU">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    ${pageMetaTags(site, { title, description, path: book.path, image: displayImage(edition), type: "book" })}
    ${jsonLdScript(bookPageSchema(site, book))}
    <link rel="stylesheet" href="/styles.css?v=20260613-conversion-pages">
  </head>
  <body>
    <a class="skip-link" href="#main-content">Skip to main content</a>
    ${renderNav(site)}
    <main id="main-content">
      <section class="book-detail-hero">
        <div class="wrap book-detail-grid">
          <div class="book-detail-cover">
            <img src="${attr(displayImage(edition))}" alt="${attr(`${book.title}: ${book.subtitle} ${edition.label} cover`)}"${imageSizeAttrs(edition)}>
          </div>
          <div class="book-detail-copy">
            <p class="eyebrow">${escapeHtml(bookTrack(book))}</p>
            <h1>${escapeHtml(book.title)}</h1>
            <p class="book-detail-subtitle">${escapeHtml(book.subtitle)}</p>
            <p class="book-detail-audience">${escapeHtml(book.audience)}</p>
            <p>${escapeHtml(book.summary)}</p>
            <div class="book-detail-actions">
              <div class="current-edition-callout">
                <span>Buy current edition</span>
                <strong>${escapeHtml(edition.label)}</strong>
                <small>Recommended for most buyers</small>
              </div>
              <div class="edition-actions">
                ${renderAffiliateButton(book, edition, "Amazon US", edition.amazonUrl)}
                ${renderAffiliateButton(book, edition, "Amazon AU", edition.amazonAuUrl, "secondary")}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="section">
        <div class="wrap book-page-content">
          <div>
            <p class="eyebrow">What this book helps with</p>
            <h2>${escapeHtml(book.shortTitle)}</h2>
            <ul class="feature-list book-page-features">
              ${book.features.map((feature) => `<li>${escapeHtml(feature)}</li>`).join("")}
            </ul>
          </div>
          <aside class="book-page-aside" aria-label="Edition links">
            <p class="edition-heading">Current edition links</p>
            <div class="edition-row recommended-edition">
              <span class="edition-label">
                ${escapeHtml(edition.label)}
                <span class="edition-note">Recommended for most buyers</span>
              </span>
              <div class="edition-actions">
                ${renderAffiliateButton(book, edition, "Amazon US", edition.amazonUrl)}
                ${renderAffiliateButton(book, edition, "Amazon AU", edition.amazonAuUrl, "secondary")}
              </div>
            </div>
            ${renderEarlierEditions(book, edition)}
          </aside>
        </div>
      </section>

      <section class="section surface">
        <div class="wrap cta-band">
          <div>
            <p class="eyebrow">Back to the series</p>
            <h2>Compare the full Hiligaynon 101 pathway.</h2>
            <p>Use the homepage guide to choose between the adult track and the separate kids colouring branch.</p>
          </div>
          <a class="button secondary" href="/#series-pathway">View pathway</a>
        </div>
      </section>
    </main>
    ${renderFooter(site)}
  </body>
</html>`;
}
