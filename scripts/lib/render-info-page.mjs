import { attr, escapeHtml } from "./html.mjs";
import { pageMetaTags } from "./schema.mjs";
import { renderFooter, renderNav, stylesheet } from "./components.mjs";

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
      "For website, rights or book-series enquiries, email Chanelle Ramos using the address below.",
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
    ${stylesheet(site)}
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
          ${page.path === "/contact/" ? `<p><a class="contact-email" href="mailto:${attr(site.contactEmail)}">${escapeHtml(site.contactEmail)}</a></p>` : ""}
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

export function renderNotFoundPage(site) {
  const html = renderInfoPage(site, {
    path: "/404.html", title: "Page not found", description: "Find your way back to the Hiligaynon 101 books.",
    eyebrow: "404 · Page not found", heading: "Let’s get you back on track.",
    body: ["This page may have moved, or the address may be incomplete."]
  });
  return html.replace('content="index,follow,max-image-preview:large"', 'content="noindex,follow"')
    .replace('</main>', '<div class="wrap recovery-links"><a class="button" href="/">Go to the homepage</a><a class="button secondary" href="/#books">Browse the books</a><a href="/contact/">Report a broken link</a></div></main>');
}
