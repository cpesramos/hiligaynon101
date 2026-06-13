import { attr, escapeHtml } from "./html.mjs";
import { pageMetaTags } from "./schema.mjs";

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

const pages = [
  {
    path: "/affiliate-disclosure/",
    title: "Affiliate Disclosure",
    description: "Affiliate disclosure for Hiligaynon 101 book links.",
    eyebrow: "Affiliate disclosure",
    heading: "Affiliate disclosure",
    body: [
      "Hiligaynon 101 links to Amazon listings for the book series by Chanelle Ramos.",
      "As an Amazon Associate, Hiligaynon 101 may earn from qualifying purchases. This does not change the price you pay through Amazon.",
      "The site keeps current edition links prominent and preserves earlier edition links where they are still useful for comparison."
    ]
  },
  {
    path: "/contact/",
    title: "Contact",
    description: "Contact information for Hiligaynon 101 book and website enquiries.",
    eyebrow: "Contact",
    heading: "Contact Hiligaynon 101",
    body: [
      "For book availability, delivery or order questions, use the relevant Amazon listing because fulfilment is handled by Amazon.",
      "For website, rights or book-series enquiries, use the public author and book channels associated with Hiligaynon 101 by Chanelle Ramos.",
      "This static site does not collect messages through an on-site form."
    ]
  },
  {
    path: "/privacy/",
    title: "Privacy",
    description: "Privacy information for the Hiligaynon 101 static website.",
    eyebrow: "Privacy",
    heading: "Privacy",
    body: [
      "Hiligaynon 101 is a static website. It does not provide user accounts, comments, checkout or an on-site contact form.",
      "External services such as Amazon may process information when you click an Amazon link or make a purchase. Their own privacy terms apply.",
      "Basic technical logs may be processed by the website host for security, reliability and performance."
    ]
  }
];

function renderInfoPage(site, page) {
  const title = `${page.title} | ${site.name}`;
  return `<!doctype html>
<html lang="en-AU">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    ${pageMetaTags(site, { title, description: page.description, path: page.path })}
    <link rel="stylesheet" href="/styles.css?v=20260613-conversion-pages">
  </head>
  <body>
    <a class="skip-link" href="#main-content">Skip to main content</a>
    ${renderNav(site)}
    <main id="main-content">
      <section class="info-page">
        <div class="wrap info-page-inner">
          <p class="eyebrow">${escapeHtml(page.eyebrow)}</p>
          <h1>${escapeHtml(page.heading)}</h1>
          ${page.body.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("")}
        </div>
      </section>
    </main>
    ${renderFooter(site)}
  </body>
</html>`;
}

export function infoPageRoutes(site) {
  return pages.map((page) => ({
    path: page.path,
    html: renderInfoPage(site, page)
  }));
}
