import { featuredEdition, orderedEditions } from "./books.mjs";
import { attr, escapeHtml, jsonLdScript } from "./html.mjs";
import { bookSchema, faqSchema, metaTags, wordSchema } from "./schema.mjs";

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

function renderAffiliateButton(book, edition, market, url, variant = "") {
  const label = market === "Amazon AU" ? "Amazon AU" : "Amazon US";
  const variantClass = variant ? ` ${variant}` : "";
  return `<a class="edition-button${variantClass}" href="${attr(url)}" rel="sponsored" aria-label="${attr(`${label} listing for ${book.title}: ${book.subtitle}, ${edition.label}`)}">${escapeHtml(label)}</a>`;
}

function renderBookCard(book) {
  const edition = featuredEdition(book);
  const statusText = book.series === "Hiligaynon 101 Kids" ? "Hiligaynon 101 Kids" : `${book.series} Book ${book.bookNumber}`;
  return `
    <article class="book-card" id="${attr(book.id)}">
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
          ${orderedEditions(book)
            .map(
              (item) => `
                <div class="edition-row${item.id === edition.id ? " recommended-edition" : ""}">
                  <span class="edition-label">
                    ${escapeHtml(item.label)}
                    <span class="edition-note">${item.id === edition.id ? "Recommended for most buyers" : "Earlier edition"}</span>
                  </span>
                  <div class="edition-actions">
                    ${renderAffiliateButton(book, item, "Amazon US", item.amazonUrl)}
                    ${renderAffiliateButton(book, item, "Amazon AU", item.amazonAuUrl, "secondary")}
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

function renderBookChooser(books) {
  const choices = [
    {
      label: "Adult beginner",
      title: "Start with Book 1",
      text: "Best first step for greetings, basics and beginner-friendly practice.",
      book: books.find((book) => book.id === "beginner-journey")
    },
    {
      label: "Ready to practise",
      title: "Move to conversations",
      text: "Use this after the first book when everyday dialogue matters most.",
      book: books.find((book) => book.id === "practical-conversations")
    },
    {
      label: "Child ages 3-6",
      title: "Choose the kids book",
      text: "First words, colouring and repeat-after-me practice with an adult helper.",
      book: books.find((book) => book.id === "kids-first-words")
    }
  ];

  return `
    <div class="book-chooser" aria-label="Quick book chooser">
      ${choices
        .filter((choice) => choice.book)
        .map(
          (choice) => `
            <a class="chooser-item" href="#${attr(choice.book.id)}">
              <span>${escapeHtml(choice.label)}</span>
              <strong>${escapeHtml(choice.title)}</strong>
              <small>${escapeHtml(choice.text)}</small>
            </a>
          `
        )
        .join("")}
    </div>
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

export function renderHomePage({ site, books, words, faq }) {
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
            <p class="lede">Learn Hiligaynon, also known as Ilonggo, through beginner lessons, everyday conversations and first-word colouring books for kids.</p>
            <div class="hero-actions">
              <a class="button" href="#books">Choose your book</a>
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
            <h2>Choose a Hiligaynon 101 book.</h2>
            <p>Start with beginner Ilonggo lessons, practise everyday conversations, or introduce first Hiligaynon words through the kids colouring book.</p>
          </div>
          ${renderBookChooser(books)}
          <div class="book-grid">
            ${books.map(renderBookCard).join("")}
          </div>
        </div>
      </section>

      <section class="section" id="author">
        <div class="wrap">
          <div class="section-header">
            <div>
              <p class="eyebrow">From the author</p>
              <h2>Why Chanelle created Hiligaynon 101.</h2>
            </div>
            <div class="author-copy">
              <p>Chanelle Ramos is a native of Bacolod City in the Philippines and is now based in Australia. After moving to Australia at 13, she kept Hiligaynon close as an enduring connection to home, family and culture.</p>
              <p>The series began when her wife wanted to learn the language and clear beginner-friendly resources were difficult to find. Hiligaynon 101 was created to make the first steps practical, gentle and culturally connected.</p>
            </div>
          </div>
          <div class="approach-grid">
            <article class="approach-item">
              <h3>Heritage connection</h3>
              <p>The books are shaped by a lived connection to Hiligaynon and the experience of carrying language across countries and generations.</p>
            </article>
            <article class="approach-item">
              <h3>Beginner clarity</h3>
              <p>They focus on approachable lessons, everyday words and practical conversations for learners starting without a clear path.</p>
            </article>
            <article class="approach-item">
              <h3>Language as a bridge</h3>
              <p>Hiligaynon 101 treats language as a way to connect people, families and cultures, not just a list of words to memorise.</p>
            </article>
          </div>
        </div>
      </section>

      <section class="section surface" id="kids">
        <div class="wrap kids-band">
          <div class="kids-copy">
            <p class="eyebrow">Hiligaynon 101 Kids</p>
            <h2>First Hiligaynon words for ages 3-6.</h2>
            <p>Hiligaynon 101 Kids: My First Words Colouring Book helps children connect familiar pictures with simple Hiligaynon words and English meanings.</p>
            <p>It is built for parent, grandparent and carer-led practice: colour the picture, say the word aloud, then reuse it naturally around home.</p>
            <div class="section-actions">
              <a class="button" href="${attr(kidsEdition?.amazonUrl || "#books")}" rel="sponsored" aria-label="Amazon US listing for Hiligaynon 101 Kids: My First Words Colouring Book">Amazon US</a>
              <a class="button secondary" href="${attr(kidsEdition?.amazonAuUrl || "#books")}" rel="sponsored" aria-label="Amazon AU listing for Hiligaynon 101 Kids: My First Words Colouring Book">Amazon AU</a>
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
            <h2>Simple words children can colour and repeat.</h2>
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
            <h2>A gentle way to learn together.</h2>
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
            <h2>Common questions about Hiligaynon 101.</h2>
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
              <h2>Explore the Hiligaynon 101 series.</h2>
              <p>This website gives the books a clear home for search, book discovery and Amazon edition links.</p>
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
