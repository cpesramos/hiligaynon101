import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const src = path.join(root, "src");
const dist = path.join(root, "dist");

const readJson = async (...parts) => JSON.parse(await readFile(path.join(src, ...parts), "utf8"));

const escapeHtml = (value = "") =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const attr = escapeHtml;
const compactText = (value = "") => String(value).replace(/\s+/g, " ").trim();
const siteOrigin = (site) => compactText(site.url).replace(/\/+$/, "");
const absoluteUrl = (site, route = "") => `${siteOrigin(site)}${route.startsWith("/") ? route : `/${route}`}`.replace(/\/$/, "/");
const isExternalUrl = (value = "") => /^https?:\/\//.test(value);
const absoluteAssetUrl = (site, assetPath) =>
  isExternalUrl(assetPath) ? assetPath : `${siteOrigin(site)}${assetPath.startsWith("/") ? assetPath : `/${assetPath}`}`;

function jsonLdScript(value) {
  return `<script type="application/ld+json">${JSON.stringify(value).replaceAll("</", "<\\/")}</script>`;
}

function metaTags(site) {
  const title = site.seoTitle || `${site.name} | ${site.tagline}`;
  const url = absoluteUrl(site, "/");
  const image = absoluteAssetUrl(site, site.socialImage);
  const keywords = Array.isArray(site.keywords) ? site.keywords.join(", ") : "";
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${siteOrigin(site)}/#organization`,
        name: site.name,
        url,
        founder: {
          "@type": "Person",
          name: site.author
        }
      },
      {
        "@type": "WebSite",
        "@id": `${siteOrigin(site)}/#website`,
        name: site.name,
        alternateName: ["Ilonggo 101", "Hiligaynon 101 Books"],
        url,
        description: site.description,
        inLanguage: site.language,
        keywords,
        publisher: { "@id": `${siteOrigin(site)}/#organization` }
      },
      {
        "@type": "WebPage",
        "@id": `${siteOrigin(site)}/#homepage`,
        url,
        name: site.name,
        description: site.description,
        isPartOf: { "@id": `${siteOrigin(site)}/#website` },
        about: [
          "Hiligaynon language learning",
          "Ilonggo language learning",
          "Hiligaynon books for beginners",
          "Hiligaynon books for kids"
        ],
        keywords,
        inLanguage: site.language
      }
    ]
  };

  return `
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${attr(site.description)}">
    ${keywords ? `<meta name="keywords" content="${attr(keywords)}">` : ""}
    <meta name="robots" content="index,follow,max-image-preview:large">
    <link rel="canonical" href="${attr(url)}">
    <link rel="sitemap" type="application/xml" href="/sitemap.xml">
    <meta property="og:locale" content="en_AU">
    <meta property="og:site_name" content="${attr(site.name)}">
    <meta property="og:title" content="${attr(title)}">
    <meta property="og:description" content="${attr(site.description)}">
    <meta property="og:type" content="website">
    <meta property="og:url" content="${attr(url)}">
    <meta property="og:image" content="${attr(image)}">
    <meta property="og:image:alt" content="${attr(`${site.name} book series by ${site.author}`)}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${attr(title)}">
    <meta name="twitter:description" content="${attr(site.description)}">
    <meta name="twitter:image" content="${attr(image)}">
    <meta name="twitter:image:alt" content="${attr(`${site.name} book series by ${site.author}`)}">
    ${jsonLdScript(structuredData)}
  `;
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
          ${site.navigation.map((item) => `<a href="${attr(item.href)}">${escapeHtml(item.label)}</a>`).join("")}
        </div>
      </nav>
    </header>
  `;
}

function featuredEdition(book) {
  return book.editions.find((edition) => edition.id === book.featuredEditionId) || book.editions[0];
}

function renderBookCard(book) {
  const edition = featuredEdition(book);
  const statusText = book.series === "Hiligaynon 101 Kids" ? "Hiligaynon 101 Kids" : `${book.series} Book ${book.bookNumber}`;
  return `
    <article class="book-card">
      <div class="book-visual">
        <img class="book-cover" src="${attr(edition.image)}" alt="${attr(`${book.title}: ${book.subtitle} ${edition.label} cover from Amazon`)}" loading="lazy">
      </div>
      <div class="book-body">
        <span class="status">${escapeHtml(statusText)}</span>
        <div>
          <h3>${escapeHtml(book.title)}</h3>
          <p class="book-subtitle">${escapeHtml(book.subtitle)}</p>
        </div>
        <p class="book-meta">${escapeHtml(book.audience)}</p>
        <p class="book-summary">${escapeHtml(book.summary)}</p>
        <ul class="feature-list">
          ${book.features.map((feature) => `<li>${escapeHtml(feature)}</li>`).join("")}
        </ul>
        <div class="edition-list" id="${attr(book.id)}-editions" aria-label="${attr(`${book.title}: ${book.subtitle} Amazon editions`)}">
          ${book.editions
            .map(
              (item) => `
                <div class="edition-row">
                  <span class="edition-label">${escapeHtml(item.label)}</span>
                  <div class="edition-actions">
                    <a class="edition-button" href="${attr(item.amazonUrl)}">Amazon</a>
                    <a class="edition-button secondary" href="${attr(item.amazonAuUrl)}">Amazon AU</a>
                  </div>
                </div>
              `
            )
            .join("")}
        </div>
      </div>
    </article>
  `;
}

function renderWordCard(word) {
  return `
    <article class="word-card">
      <div class="word-theme">${escapeHtml(word.theme)}</div>
      <h3>${escapeHtml(word.word)}</h3>
      <p class="word-translation">${escapeHtml(word.translation)}</p>
      <p>${escapeHtml(word.prompt)}</p>
    </article>
  `;
}

function renderFaqItem(item) {
  return `
    <article class="faq-item">
      <h3>${escapeHtml(item.question)}</h3>
      <p>${escapeHtml(item.answer)}</p>
    </article>
  `;
}

function bookSchema(site, books) {
  const offerFor = (edition, url, market) => ({
    "@type": "Offer",
    url,
    availability: "https://schema.org/InStock",
    itemCondition: "https://schema.org/NewCondition",
    seller: {
      "@type": "Organization",
      name: market
    }
  });

  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Hiligaynon 101 book series",
    description: site.description,
    itemListElement: books.map((book, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Book",
        name: `${book.title}: ${book.subtitle}`,
        alternateName: [`${book.shortTitle} by ${site.author}`, `${book.series} ${book.bookNumber}`],
        author: {
          "@type": "Person",
          name: site.author
        },
        publisher: {
          "@id": `${siteOrigin(site)}/#organization`
        },
        inLanguage: site.language,
        genre: ["Language learning", "Hiligaynon", "Ilonggo"],
        keywords: [book.series, book.shortTitle, "Hiligaynon", "Ilonggo", "Chanelle Ramos"].join(", "),
        audience: book.audience,
        image: book.editions.map((edition) => edition.image),
        description: book.seoDescription || book.summary,
        workExample: book.editions.map((edition) => ({
          "@type": "Book",
          name: `${book.title}: ${book.subtitle} - ${edition.label}`,
          identifier: [
            {
              "@type": "PropertyValue",
              propertyID: "Amazon ASIN",
              value: edition.amazonAsin
            },
            {
              "@type": "PropertyValue",
              propertyID: "Amazon AU ASIN",
              value: edition.amazonAuAsin
            }
          ],
          image: edition.image,
          url: edition.amazonUrl,
          sameAs: [edition.amazonUrl, edition.amazonAuUrl],
          offers: [offerFor(edition, edition.amazonUrl, "Amazon"), offerFor(edition, edition.amazonAuUrl, "Amazon AU")]
        }))
      }
    }))
  };
}

function wordSchema(site, words) {
  return {
    "@context": "https://schema.org",
    "@type": "DefinedTermSet",
    name: "Sample Hiligaynon first words for kids",
    description: "Child-friendly Hiligaynon first words featured on the Hiligaynon 101 website.",
    inLanguage: site.language,
    hasDefinedTerm: words.map((word) => ({
      "@type": "DefinedTerm",
      name: word.word,
      termCode: word.word,
      description: `${word.word} means ${word.translation}. ${word.prompt}`
    }))
  };
}

function faqSchema(faq) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer
      }
    }))
  };
}

function renderPage(site, books, words, faq) {
  const kidsBook = books.find((book) => book.series === "Hiligaynon 101 Kids");
  const kidsEdition = kidsBook ? featuredEdition(kidsBook) : null;

  return `<!doctype html>
<html lang="en-AU">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    ${metaTags(site)}
    ${jsonLdScript(bookSchema(site, books))}
    ${jsonLdScript(faqSchema(faq))}
    ${jsonLdScript(wordSchema(site, words))}
    <link rel="stylesheet" href="/styles.css?v=20260522-words-deploy">
  </head>
  <body>
    ${renderNav(site)}
    <main>
      <section class="hero" aria-labelledby="hero-title">
        <div class="hero-inner">
          <div class="hero-copy">
            <p class="eyebrow">Books for beginners, families and heritage learners</p>
            <h1 id="hero-title"><span class="title-line">Hiligaynon</span> <span class="title-line">101</span></h1>
            <p class="lede">${escapeHtml(site.description)} Start with beginner lessons, continue into practical conversations, or help children meet first words through colouring and play.</p>
            <div class="hero-actions">
              <a class="button" href="#books">Explore the books</a>
              <a class="button secondary" href="#words">Try sample words</a>
            </div>
            <div class="hero-proof" aria-label="Series highlights">
              <span class="proof-pill">Beginner lessons</span>
              <span class="proof-pill">Everyday conversations</span>
              <span class="proof-pill">Kids colouring books</span>
            </div>
          </div>
        </div>
      </section>

      <section class="section surface" id="books">
        <div class="wrap">
          <div class="section-header">
            <h2>Hiligaynon books for beginners, conversations and kids.</h2>
            <p>Start with beginner Ilonggo lessons, practise everyday conversations, or introduce first Hiligaynon words through the kids colouring book.</p>
          </div>
          <div class="book-grid">
            ${books.map(renderBookCard).join("")}
          </div>
        </div>
      </section>

      <section class="section" id="editions">
        <div class="wrap">
          <div class="section-header">
            <h2>Amazon editions are kept separate.</h2>
            <p>The adult books currently have first and second edition listings for Amazon and Amazon AU. The kids colouring book has one current edition with both markets linked.</p>
          </div>
          <div class="approach-grid">
            ${books
              .map(
                (book) => `
                  <article class="approach-item">
                    <h3>${escapeHtml(book.shortTitle)}</h3>
                    <p>${book.editions
                      .map((edition) => `${edition.label}: Amazon ${edition.amazonAsin}, Amazon AU ${edition.amazonAuAsin}`)
                      .join(" | ")}</p>
                  </article>
                `
              )
              .join("")}
          </div>
        </div>
      </section>

      <section class="section surface" id="kids">
        <div class="wrap kids-band">
          <div class="kids-copy">
            <p class="eyebrow">Hiligaynon 101 Kids</p>
            <h2>A first words colouring book for ages 3-6.</h2>
            <p>Hiligaynon 101 Kids: My First Words Colouring Book helps children connect familiar pictures with simple Hiligaynon words and English meanings.</p>
            <p>It is built for parent, grandparent and carer-led practice: colour the picture, say the word aloud, then reuse it naturally around home.</p>
            <div class="section-actions">
              <a class="button" href="${attr(kidsEdition?.amazonUrl || "#books")}">Amazon</a>
              <a class="button secondary" href="${attr(kidsEdition?.amazonAuUrl || "#books")}">Amazon AU</a>
              <a class="button secondary" href="#approach">Read the approach</a>
            </div>
          </div>
          <div class="cover-spread">
            <img src="${attr(kidsEdition?.image || site.socialImage)}" alt="Hiligaynon 101 Kids colouring book Amazon cover" loading="lazy">
          </div>
        </div>
      </section>

      <section class="section" id="words">
        <div class="wrap">
          <div class="section-header">
            <h2>Sample first words from the kids colouring book.</h2>
            <p>These child-friendly Hiligaynon words match the early vocabulary style shown on the kids book listing, with familiar objects children can colour, see and repeat.</p>
          </div>
          <div class="words-grid">
            ${words.map(renderWordCard).join("")}
          </div>
        </div>
      </section>

      <section class="section surface" id="approach">
        <div class="wrap">
          <div class="section-header">
            <h2>A practical, respectful way to begin.</h2>
            <p>The series keeps the pressure low and the language usable, especially for families reconnecting with Hiligaynon in everyday life.</p>
          </div>
          <div class="approach-grid">
            <article class="approach-item">
              <h3>Start small</h3>
              <p>Lessons and activities focus on short, repeatable language that beginners can use without needing a full grammar course first.</p>
            </article>
            <article class="approach-item">
              <h3>Practise together</h3>
              <p>The children's books are built for shared moments: say the word, colour the picture, then say it again later.</p>
            </article>
            <article class="approach-item">
              <h3>Respect variation</h3>
              <p>Hiligaynon usage can vary by family, town, province and speaker, so the books keep a gentle and practical tone.</p>
            </article>
          </div>
        </div>
      </section>

      <section class="section">
        <div class="wrap">
          <div class="section-header">
            <h2>Common questions.</h2>
            <p>Search-friendly answers for people comparing Hiligaynon, Ilonggo and beginner learning options.</p>
          </div>
          <div class="faq-list">
            ${faq.map(renderFaqItem).join("")}
          </div>
        </div>
      </section>

      <section class="section surface">
        <div class="wrap">
          <div class="cta-band">
            <div>
              <h2>Built for hiligaynon101.com.</h2>
              <p>This first website version gives the series a clean home for search, book discovery, Amazon edition links and future Hiligaynon 101 releases.</p>
            </div>
            <a class="button secondary" href="#books">Review the series</a>
          </div>
        </div>
      </section>
    </main>
    <footer class="site-footer">
      <div class="footer-inner">
        <p>Copyright ${new Date().getFullYear()} ${escapeHtml(site.author)}. ${escapeHtml(site.name)}.</p>
        <a href="/">hiligaynon101.com</a>
        <p class="footer-note">${escapeHtml(site.affiliateDisclosure)}</p>
      </div>
    </footer>
  </body>
</html>`;
}

async function build() {
  const [site, books, words, faq] = await Promise.all([
    readJson("data", "site.json"),
    readJson("content", "books.json"),
    readJson("content", "words.json"),
    readJson("content", "faq.json")
  ]);

  await rm(dist, { recursive: true, force: true });
  await mkdir(dist, { recursive: true });
  await cp(path.join(src, "styles.css"), path.join(dist, "styles.css"));
  await writeFile(path.join(dist, "index.html"), renderPage(site, books, words, faq));
  await writeFile(
    path.join(dist, "sitemap.xml"),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>${siteOrigin(site)}/</loc></url>\n</urlset>\n`
  );
  await writeFile(
    path.join(dist, "robots.txt"),
    `User-agent: *\nAllow: /\nSitemap: ${siteOrigin(site)}/sitemap.xml\n`
  );
}

build().catch((error) => {
  console.error(error);
  process.exit(1);
});
