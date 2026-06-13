import { featuredEdition, orderedEditions } from "./books.mjs";
import { attr, escapeHtml, jsonLdScript } from "./html.mjs";
import { bookSchema, faqSchema, metaTags, phraseSchema, wordSchema } from "./schema.mjs";

const coverDimensions = {
  "/assets/cover-beginner-second.jpg": { width: 313, height: 500 },
  "/assets/cover-conversations-second.jpg": { width: 313, height: 500 },
  "/assets/cover-kids-current.jpg": { width: 387, height: 500 },
  "/assets/cover-kids-animals-current.jpg": { width: 387, height: 500 }
};

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

function displayImage(edition) {
  return edition.localImage || edition.image;
}

function imageSizeAttrs(edition) {
  const dimensions = coverDimensions[displayImage(edition)];
  return dimensions ? ` width="${dimensions.width}" height="${dimensions.height}"` : "";
}

function bookPath(book) {
  return book.path || `#${book.id}`;
}

function bookStatusText(book) {
  return `${book.series} Book ${book.bookNumber}`;
}

function bookFitText(book) {
  const fitById = {
    "beginner-journey": "Start here if you are learning Hiligaynon from zero or returning to family language after a long break.",
    "practical-conversations": "Move here when useful everyday dialogue matters more than another beginner overview.",
    "kids-first-words": "Use this first for ages 3-6 when an adult can read, repeat and colour with the child.",
    "kids-animals-food-nature": "Use this next for young learners who are ready for themed words about animals, food and nature."
  };

  return fitById[book.id] || book.audience;
}

function renderBookCard(book) {
  const edition = featuredEdition(book);
  const earlierEditions = orderedEditions(book).filter((item) => item.id !== edition.id);
  const statusText = bookStatusText(book);
  return `
    <article class="book-card" id="${attr(book.id)}">
      <div class="book-visual">
        <img class="book-cover" src="${attr(displayImage(edition))}" alt="${attr(`${book.title}: ${book.subtitle} ${edition.label} cover`)}" loading="lazy"${imageSizeAttrs(edition)}>
      </div>
      <div class="book-body">
        <span class="status">${escapeHtml(statusText)}</span>
        <div>
          <h3>${escapeHtml(book.title)}</h3>
          <p class="book-subtitle">${escapeHtml(book.subtitle)}</p>
        </div>
        <p class="book-fit">${escapeHtml(bookFitText(book))}</p>
        <p class="book-summary">${escapeHtml(book.summary)}</p>
        <ul class="feature-list">
          ${book.features.map((feature) => `<li>${escapeHtml(feature)}</li>`).join("")}
        </ul>
      </div>
      <div class="edition-panel">
        <div class="edition-list" id="${attr(book.id)}-editions" aria-label="${attr(`${book.title}: ${book.subtitle} Amazon editions`)}">
          <p class="edition-heading">Buy current edition</p>
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
          ${
            earlierEditions.length
              ? `<details class="earlier-editions">
                  <summary>Earlier edition links</summary>
                  <div class="earlier-edition-list">
                    ${earlierEditions
                      .map(
                        (item) => `
                          <div class="edition-row earlier-edition-row">
                            <span class="edition-label">
                              ${escapeHtml(item.label)}
                              <span class="edition-note">Earlier edition</span>
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
                </details>`
              : ""
          }
          <a class="book-detail-link" href="${attr(bookPath(book))}">View book details</a>
        </div>
      </div>
    </article>
  `;
}

function renderKidsFeatureCard(book) {
  const edition = featuredEdition(book);
  return `
    <article class="kids-option">
      <div class="kids-option-visual">
        <img src="${attr(displayImage(edition))}" alt="${attr(`${book.title}: ${book.subtitle} ${edition.label} cover`)}" loading="lazy"${imageSizeAttrs(edition)}>
      </div>
      <div class="kids-option-body">
        <span class="status">${escapeHtml(bookStatusText(book))}</span>
        <h3>${escapeHtml(book.subtitle)}</h3>
        <p>${escapeHtml(book.summary)}</p>
        <div class="kids-actions">
          ${renderAffiliateButton(book, edition, "Amazon US", edition.amazonUrl)}
          ${renderAffiliateButton(book, edition, "Amazon AU", edition.amazonAuUrl, "secondary")}
        </div>
        <a class="book-detail-link" href="${attr(bookPath(book))}">View book details</a>
      </div>
    </article>
  `;
}

function renderBookChooser(books) {
  const choices = [
    {
      label: "Adult Track",
      title: "Adult beginner",
      text: "Start here for first Hiligaynon lessons, greetings and basic sentence practice.",
      cta: "Start with Book 1",
      book: books.find((book) => book.id === "beginner-journey")
    },
    {
      label: "Adult Track",
      title: "Everyday conversations",
      text: "Move here when you want practical Ilonggo dialogue for family, travel and daily life.",
      cta: "Go to Book 2",
      book: books.find((book) => book.id === "practical-conversations")
    },
    {
      label: "Kids Track",
      title: "Kids first words",
      text: "Choose this for ages 3-6 when an adult can read, repeat and colour with the child.",
      cta: "Go to kids Book 1",
      book: books.find((book) => book.id === "kids-first-words")
    },
    {
      label: "Kids Track",
      title: "Kids themed words",
      text: "Add animals, food and nature vocabulary after the first kids colouring book.",
      cta: "Go to kids Book 2",
      book: books.find((book) => book.id === "kids-animals-food-nature")
    }
  ];

  return `
    <div class="book-chooser" aria-label="Quick book chooser">
      ${choices
        .filter((choice) => choice.book)
        .map((choice, index) => ({ ...choice, index: index + 1 }))
        .map(
          (choice) => `
            <a class="chooser-item" href="#${attr(choice.book.id)}">
              <span class="chooser-number">${String(choice.index).padStart(2, "0")}</span>
              <span class="chooser-kicker">${escapeHtml(choice.label)}</span>
              <strong>${escapeHtml(choice.title)}</strong>
              <small>${escapeHtml(choice.text)}</small>
              <em>${escapeHtml(choice.cta)}</em>
            </a>
          `
        )
        .join("")}
    </div>
  `;
}

function renderHeroBackdrop(books) {
  const heroBooks = [
    books.find((book) => book.id === "beginner-journey"),
    books.find((book) => book.id === "practical-conversations"),
    books.find((book) => book.id === "kids-first-words"),
    books.find((book) => book.id === "kids-animals-food-nature")
  ].filter(Boolean);

  return `
    <div class="hero-backdrop" aria-hidden="true">
      <div class="cover-field">
        ${heroBooks
          .map((book, index) => {
            const edition = featuredEdition(book);
            return `
              <figure class="hero-cover hero-cover-${index + 1}">
                <img src="${attr(displayImage(edition))}" alt=""${imageSizeAttrs(edition)}>
              </figure>
            `;
          })
          .join("")}
      </div>
    </div>
  `;
}

function renderHeroRoutes(books) {
  const routes = [
    {
      number: "01",
      label: "Beginner",
      text: "Book 1",
      book: books.find((book) => book.id === "beginner-journey")
    },
    {
      number: "02",
      label: "Conversation",
      text: "Book 2",
      book: books.find((book) => book.id === "practical-conversations")
    },
    {
      number: "03",
      label: "Kids start",
      text: "First words",
      book: books.find((book) => book.id === "kids-first-words")
    },
    {
      number: "04",
      label: "Kids next",
      text: "Animals, food, nature",
      book: books.find((book) => book.id === "kids-animals-food-nature")
    }
  ];

  return `
    <div class="hero-routes" aria-label="Hiligaynon 101 learning paths">
      ${routes
        .filter((route) => route.book)
        .map(
          (route) => `
            <a class="hero-route" href="${attr(bookPath(route.book))}">
              <span>${escapeHtml(route.number)}</span>
              <strong>${escapeHtml(route.label)}</strong>
              <small>${escapeHtml(route.text)}</small>
            </a>
          `
        )
        .join("")}
    </div>
  `;
}

function renderTrustStrip() {
  return `
    <section class="trust-strip" aria-label="Hiligaynon 101 trust markers">
      <div class="trust-strip-inner">
        <p><strong>Created by Chanelle Ramos, Bacolod-born and Australia-based.</strong></p>
        <p>Beginner-first Hiligaynon for families, heritage learners and everyday use.</p>
      </div>
    </section>
  `;
}

function renderSeriesPathway(books) {
  const adultBooks = ["beginner-journey", "practical-conversations"].map((id) => books.find((book) => book.id === id)).filter(Boolean);
  const kidsBooks = ["kids-first-words", "kids-animals-food-nature"].map((id) => books.find((book) => book.id === id)).filter(Boolean);

  const renderPathwayItem = (book) => `
    <a class="pathway-item" href="${attr(bookPath(book))}">
      <span>${escapeHtml(bookStatusText(book))}</span>
      <strong>${escapeHtml(book.shortTitle)}</strong>
      <small>${escapeHtml(book.audience)}</small>
    </a>
  `;

  return `
    <section class="section" id="series-pathway">
      <div class="wrap">
        <div class="section-header">
          <div>
            <p class="eyebrow">How the series works</p>
            <h2>Two adult books, plus a separate kids activity branch.</h2>
          </div>
          <p>The adult track builds from foundations into practical conversations. The kids books are not the next adult level; they are parent-led colouring activities for young children.</p>
        </div>
        <div class="pathway-grid">
          <article class="pathway-track">
            <div class="track-heading">
              <span>Adult Track</span>
              <h3>Foundations, then everyday conversation.</h3>
            </div>
            <div class="pathway-list">
              ${adultBooks.map(renderPathwayItem).join("")}
            </div>
          </article>
          <article class="pathway-track kids-branch">
            <div class="track-heading">
              <span>Kids Track</span>
              <h3>Parent-led first words and themed vocabulary.</h3>
            </div>
            <div class="pathway-list">
              ${kidsBooks.map(renderPathwayItem).join("")}
            </div>
          </article>
        </div>
      </div>
    </section>
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

function renderPhraseCard(phrase) {
  return `
    <article class="phrase-card" data-audio-key="${attr(phrase.audioKey)}">
      <div class="phrase-context">${escapeHtml(phrase.context)}</div>
      <h3 lang="hil">${escapeHtml(phrase.phrase)}</h3>
      <p class="phrase-translation">${escapeHtml(phrase.translation)}</p>
      <p>${escapeHtml(phrase.usage)}</p>
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

export function renderHomePage({ site, books, words, phrases, faq }) {
  const kidsBooks = books.filter((book) => book.series === "Hiligaynon 101 Kids");

  return `<!doctype html>
<html lang="en-AU">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    ${metaTags(site)}
    ${jsonLdScript(bookSchema(site, books))}
    ${jsonLdScript(faqSchema(faq))}
    ${jsonLdScript(phraseSchema(site, phrases))}
    ${jsonLdScript(wordSchema(site, words))}
    <link rel="stylesheet" href="/styles.css?v=20260613-book-mobile-fix-5">
  </head>
  <body>
    <a class="skip-link" href="#main-content">Skip to main content</a>
    ${renderNav(site)}
    <main id="main-content">
      <section class="hero" aria-labelledby="hero-title">
        ${renderHeroBackdrop(books)}
        <div class="hero-inner">
          <div class="hero-copy">
            <p class="eyebrow">Official Hiligaynon 101 book series</p>
            <h1 id="hero-title">Learn Hiligaynon with the right book for your stage.</h1>
            <p class="lede">Start with Book 1 if you are an adult beginner or heritage learner, move to Book 2 for everyday conversation, or choose the kids branch for parent-led colouring practice.</p>
            <div class="hero-actions">
              <a class="button" href="/books/beginner-journey/">Start with Book 1</a>
              <a class="button secondary" href="#samples">Try sample phrases</a>
            </div>
            <div class="hero-proof" aria-label="Series highlights">
              <span class="proof-pill">Adult beginner path</span>
              <span class="proof-pill">Everyday conversation learner</span>
              <span class="proof-pill">Kids and family-led learning</span>
            </div>
            ${renderHeroRoutes(books)}
          </div>
        </div>
      </section>
      ${renderTrustStrip()}

      <section class="section surface" id="books">
        <div class="wrap">
          <div class="section-header">
            <div>
              <p class="eyebrow">Choose by learner</p>
              <h2>Find the Hiligaynon book that matches your learner.</h2>
            </div>
            <p>Use this as a simple buyer guide for learning Hiligaynon or Ilonggo: adult beginner, conversation practice, first words for kids, or the next themed colouring book.</p>
          </div>
          ${renderBookChooser(books)}
          <div class="book-grid">
            ${books.map(renderBookCard).join("")}
          </div>
        </div>
      </section>

      ${renderSeriesPathway(books)}

      <section class="section" id="author">
        <div class="wrap">
          <div class="section-header">
            <div>
              <p class="eyebrow">From the author</p>
              <h2>Created by Chanelle Ramos, Bacolod-born and Australia-based.</h2>
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
        <div class="wrap">
          <div class="section-header">
            <div>
              <p class="eyebrow">Hiligaynon 101 Kids</p>
              <h2>Hiligaynon colouring books for first words and themed vocabulary.</h2>
            </div>
            <p>Begin with everyday first words, then add animals, food and nature vocabulary through simple colouring pages designed for practice with an adult helper.</p>
          </div>
          <div class="kids-options">
            ${kidsBooks.map(renderKidsFeatureCard).join("")}
          </div>
        </div>
      </section>

      <section class="section" id="samples">
        <div class="wrap">
          <div class="section-header">
            <div>
              <p class="eyebrow">Sample practice</p>
              <h2>Try adult phrases and kids first words before you buy.</h2>
            </div>
            <p>The adult examples show beginner-friendly everyday phrases. The kids examples show the short, concrete vocabulary style used in the colouring books.</p>
          </div>
          <div class="sample-group adult-samples">
            <h3>Adult beginner phrase samples</h3>
            <div class="phrase-grid">
              ${phrases.map(renderPhraseCard).join("")}
            </div>
          </div>
          <div class="sample-group" id="words">
            <h3>Kids first-word samples</h3>
          <div class="words-grid">
            ${words.map(renderWordCard).join("")}
          </div>
          </div>
        </div>
      </section>

      <section class="section surface" id="approach">
        <div class="wrap">
          <div class="section-header">
            <div>
              <p class="eyebrow">Why Hiligaynon 101 is different</p>
              <h2>Beginner-first Hiligaynon for real families and everyday use.</h2>
            </div>
            <p>The series keeps the pressure low and the language usable, especially for families reconnecting with Hiligaynon across countries, generations and learner confidence levels.</p>
          </div>
          <div class="difference-grid">
            <article class="approach-item">
              <h3>Practical</h3>
              <p>Lessons and activities focus on language that helps with greetings, family, home, travel and everyday conversation.</p>
            </article>
            <article class="approach-item">
              <h3>Gentle</h3>
              <p>The pacing is designed for people who may feel unsure, rusty or completely new to Hiligaynon.</p>
            </article>
            <article class="approach-item">
              <h3>Family-connected</h3>
              <p>The books support heritage learners, mixed-language households and children learning with adults.</p>
            </article>
            <article class="approach-item">
              <h3>Culturally aware</h3>
              <p>Hiligaynon usage can vary by family, town, province and speaker, so the books keep a gentle and practical tone.</p>
            </article>
            <article class="approach-item">
              <h3>Beginner-first</h3>
              <p>The series starts with useful foundations before asking learners to handle longer conversations.</p>
            </article>
          </div>
        </div>
      </section>

      <section class="section" id="faq">
        <div class="wrap">
          <div class="section-header">
            <div>
              <p class="eyebrow">Questions</p>
              <h2>Common questions about Hiligaynon 101 books.</h2>
            </div>
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
              <p class="eyebrow">Book discovery</p>
              <h2>Start with the right Hiligaynon 101 book.</h2>
              <p>Compare the learning path, check the current editions and use the Amazon US or Amazon AU links for the right book.</p>
            </div>
            <a class="button secondary" href="#books">Review the paths</a>
          </div>
        </div>
      </section>
    </main>
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
  </body>
</html>`;
}
