import { attr, escapeHtml } from "./html.mjs";

const coverDimensions = {
  "/assets/cover-beginner-second.jpg": [313, 500],
  "/assets/cover-conversations-second.jpg": [313, 500],
  "/assets/cover-kids-current.jpg": [387, 500],
  "/assets/cover-kids-animals-current.jpg": [387, 500]
};

export const displayImage = (edition) => edition.localImage || edition.image;

export function imageSizeAttrs(edition) {
  const size = coverDimensions[displayImage(edition)];
  return size ? ` width="${size[0]}" height="${size[1]}"` : "";
}

export function renderNav(site) {
  return `<header class="site-header">
    <nav class="nav" aria-label="Primary navigation">
      <a class="brand" href="/" aria-label="${attr(site.name)} home"><span class="brand-mark" aria-hidden="true">H</span><span>${escapeHtml(site.name)}</span></a>
      <div class="nav-links">${site.navigation.map((item) => `<a href="${attr(item.href.startsWith("#") ? `/${item.href}` : item.href)}">${escapeHtml(item.label)}</a>`).join("")}</div>
    </nav>
  </header>`;
}

export function renderFooter(site) {
  return `<footer class="site-footer"><div class="footer-inner">
    <p>Copyright ${new Date().getFullYear()} ${escapeHtml(site.author)}. ${escapeHtml(site.name)}.</p>
    <nav class="footer-links" aria-label="Footer links"><a href="/">Home</a><a href="/affiliate-disclosure/">Affiliate disclosure</a><a href="/contact/">Contact</a><a href="/privacy/">Privacy</a></nav>
    <p class="footer-note">${escapeHtml(site.affiliateDisclosure)}</p>
  </div></footer>`;
}

export function renderMarketLinks(book, edition) {
  const link = (market, format, url, secondary = "") => {
    const label = `${market} · ${format}`;
    return `<a class="edition-button${secondary}" href="${attr(url)}" rel="sponsored" aria-label="${attr(`${label} for ${book.subtitle}, ${edition.label}`)}">${escapeHtml(label)}</a>`;
  };
  return `<div class="edition-actions">${link("Amazon US", edition.amazonFormat, edition.amazonUrl)}${link("Amazon AU", edition.amazonAuFormat, edition.amazonAuUrl, " secondary")}</div>`;
}

export const stylesheet = (site) => `<link rel="stylesheet" href="/styles.css?v=${attr(site.lastModified)}">`;
