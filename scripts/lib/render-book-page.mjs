import { featuredEdition, orderedEditions, previewLink } from "./books.mjs";
import { attr, escapeHtml, jsonLdScript } from "./html.mjs";
import { bookPageSchema, pageMetaTags } from "./schema.mjs";
import { displayImage, imageSizeAttrs, renderFooter, renderMarketLinks, renderNav, renderPreviewLink, stylesheet } from "./components.mjs";

function renderEarlierEditions(book, currentEdition) {
  const earlier = orderedEditions(book).filter(edition => edition.id !== currentEdition.id);
  if (!earlier.length) return "";
  return `<details class="earlier-editions book-page-earlier"><summary>Earlier edition links</summary>
    <p>These links open the first edition. The main links above open the current edition.</p>
    ${earlier.map(edition => `<div class="edition-row earlier-edition-row"><span class="edition-label">${escapeHtml(edition.label)}</span>${renderMarketLinks(book, edition)}</div>`).join("")}
  </details>`;
}

export function renderBookPage({ site, book }) {
  const edition = featuredEdition(book);
  const details = book.details;
  const preview = previewLink(edition);
  const published = new Intl.DateTimeFormat("en-AU", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(details.published));
  return `<!doctype html><html lang="en-AU"><head>
    <meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
    ${pageMetaTags(site, { title: `${book.title}: ${book.subtitle} | ${site.name}`, description: book.seoDescription || book.summary, path: book.path, image: displayImage(edition), type: "book" })}
    ${jsonLdScript(bookPageSchema(site, book))}${stylesheet(site)}
  </head><body>
    <a class="skip-link" href="#main-content">Skip to main content</a>${renderNav(site)}
    <main id="main-content">
      <section class="book-detail-hero"><div class="wrap book-detail-grid">
        <div class="book-detail-cover"><img src="${attr(displayImage(edition))}" alt="${attr(`${book.subtitle}, ${edition.label} cover`)}"${imageSizeAttrs(edition)}></div>
        <div class="book-detail-copy">
          <p class="eyebrow">${escapeHtml(book.series)} · Book ${book.bookNumber}</p>
          <h1>${escapeHtml(book.subtitle)}</h1>
          <p class="book-detail-audience">${escapeHtml(book.audience)}</p><p>${escapeHtml(book.summary)}</p>
          <div class="book-detail-actions"><div class="current-edition-callout"><span>Buy current edition</span><strong>${escapeHtml(edition.label)}</strong></div>
            ${renderMarketLinks(book, edition)}
            ${renderPreviewLink(book, edition)}
            <p class="buying-note">Choose the store for your country. These links open the formats shown; Amazon may offer other formats. Delivery and Kindle eligibility depend on your region and account.</p>
          </div>
        </div>
      </div></section>
      <section class="section"><div class="wrap book-page-content">
        <div class="book-topic-guide">
          <p class="eyebrow">What’s covered</p><h2>Inside the book</h2>
          <p>A topic guide based on the current edition’s published description.</p>
          <ul class="feature-list book-page-features">${details.topics.map(topic => `<li>${escapeHtml(topic)}</li>`).join("")}</ul>
          <h3>Practice and activities</h3><p>${escapeHtml(details.practice)}</p>
          <h3>How to use it</h3><p>${escapeHtml(details.howToUse)}</p>
          <h3>Check the interior before buying</h3>
          ${preview ? `<p>Amazon’s current ${escapeHtml(preview.format)} listing has a “Read sample” control. Open the preview link, then choose “Read sample” to inspect sample pages. Availability can vary by device and marketplace.</p>${renderPreviewLink(book, edition)}` : `<p>Amazon does not always show interior previews for these colouring books. If “Read sample” is available on your listing, use it to check the pictures and activities before buying.</p><div class="text-links"><a class="book-detail-link" href="${attr(edition.amazonUrl)}" rel="sponsored">Check Amazon US</a><a class="book-detail-link" href="${attr(edition.amazonAuUrl)}" rel="sponsored">Check Amazon AU</a></div>`}
        </div>
        <aside class="book-page-aside" aria-label="Paperback specifications">
          <h2>Paperback details</h2>
          <dl class="book-specs">
            <div><dt>Edition</dt><dd>${escapeHtml(edition.label)}</dd></div>
            <div><dt>Pages</dt><dd>${details.paperbackPages}</dd></div>
            <div><dt>Published</dt><dd>${escapeHtml(published)}</dd></div>
            <div><dt>Size</dt><dd>${escapeHtml(details.dimensions)}</dd></div>
            <div><dt>ISBN-13</dt><dd>${escapeHtml(details.isbn)}</dd></div>
          </dl>
          <p class="spec-source">Paperback specifications from the Amazon AU listing, checked 11 October 2026. Kindle pagination may differ.</p>
          ${renderEarlierEditions(book, edition)}
        </aside>
      </div></section>
      <section class="section surface"><div class="wrap cta-band"><div><h2>Keep exploring.</h2><p>Compare the books or try a few website practice examples.</p></div><div class="section-actions"><a class="button secondary" href="/#books">Compare books</a><a class="button secondary" href="/samples/">Try sample practice</a></div></div></section>
    </main>${renderFooter(site)}
  </body></html>`;
}
