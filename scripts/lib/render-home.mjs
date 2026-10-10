import { featuredEdition } from "./books.mjs";
import { attr, escapeHtml, jsonLdScript } from "./html.mjs";
import { bookSchema, faqSchema, metaTags, phraseSchema, wordSchema } from "./schema.mjs";
import { displayImage, imageSizeAttrs, renderFooter, renderMarketLinks, renderNav, stylesheet } from "./components.mjs";
import { renderPhraseCard, renderWordCard } from "./render-samples.mjs";

const bookPath = (book) => book.path;

function renderBookCard(book) {
  const edition = featuredEdition(book);
  return `<article class="book-card compact-book" id="${attr(book.id)}">
    <a class="book-visual" href="${attr(book.path)}" aria-label="${attr(`View ${book.subtitle} details`)}"><img class="book-cover" src="${attr(displayImage(edition))}" alt="${attr(`${book.subtitle} cover`)}" loading="lazy"${imageSizeAttrs(edition)}></a>
    <div class="book-body">
      <span class="status">${escapeHtml(book.series)} · Book ${book.bookNumber}</span>
      <h3><a href="${attr(book.path)}">${escapeHtml(book.subtitle)}</a></h3>
      <p class="book-summary">${escapeHtml(book.summary)}</p>
      <p class="book-facts-line">${book.details.paperbackPages} paperback pages · ${escapeHtml(edition.label)}</p>
      ${renderMarketLinks(book, edition)}
      <a class="book-detail-link" href="${attr(book.path)}">Topics, practice &amp; book details</a>
    </div>
  </article>`;
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

export function renderHomePage({ site, books, words, phrases, faq }) {
  const samplePhrases = phrases.slice(0, 3);
  const sampleWords = words.slice(0, 3);
  return `<!doctype html>
<html lang="en-AU">
<head>
  <meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
  ${metaTags(site)}
  ${jsonLdScript(bookSchema(site, books))}
  ${jsonLdScript(faqSchema(faq))}
  ${jsonLdScript(phraseSchema(site, samplePhrases))}
  ${jsonLdScript(wordSchema(site, sampleWords))}
  ${stylesheet(site)}
</head>
<body>
  <a class="skip-link" href="#main-content">Skip to main content</a>
  ${renderNav(site)}
  <main id="main-content">
    <section class="hero" aria-labelledby="hero-title">
      ${renderHeroBackdrop(books)}
      <div class="hero-inner"><div class="hero-copy">
        <p class="eyebrow">Books by Chanelle Ramos</p>
        <h1 id="hero-title">Learn Hiligaynon.<br>Connect with home.</h1>
        <p class="lede">Practical books for adult beginners and heritage learners, plus colouring activities for children ages 3–6 learning with family.</p>
        <div class="hero-actions"><a class="button" href="/books/beginner-journey/">Start with Book 1</a><a class="button secondary" href="#samples">Try sample phrases</a></div>
        ${renderHeroRoutes(books)}
      </div></div>
    </section>
    <section class="section surface" id="books"><div class="wrap">
      <div class="section-header"><div><p class="eyebrow">Choose your book</p><h2>Four books. Two learning paths.</h2></div><p>Start with foundations, practise everyday conversation, or learn first words together with a child.</p></div>
      <p class="buying-note">Links show the format they open. Australian readers: use Amazon AU. Availability and Kindle eligibility vary by country and account.</p>
      <div class="book-grid">${books.map(renderBookCard).join("")}</div>
    </div></section>
    <section class="section" id="series-pathway"><div class="wrap">
      <div class="section-header"><div><p class="eyebrow">How the series works</p><h2>Choose the path that fits.</h2></div></div>
      <div class="pathway-grid concise-pathways">
        <article class="pathway-track"><h3>Adult learners</h3><p><a href="${attr(books[0].path)}">Book 1: foundations</a> → <a href="${attr(books[1].path)}">Book 2: conversation</a>.</p><p>Begin with Book 1 if you are starting from zero. Use Book 2 after it or alongside it for everyday dialogue.</p></article>
        <article class="pathway-track kids-branch" id="kids"><h3>Children ages 3–6</h3><p><a href="${attr(books[2].path)}">First words</a> → <a href="${attr(books[3].path)}">Animals, food and nature</a>.</p><p>Colour, say and repeat with an adult helper. This is a separate activity series for young children.</p></article>
      </div>
    </div></section>
    <section class="section surface" id="samples"><div class="wrap">
      <div class="section-header"><div><p class="eyebrow">Try a little Hiligaynon</p><h2>Useful phrases and first words.</h2></div><p>These are website practice examples. To check a book’s interior, look for “Read sample” on its Amazon listing where available.</p></div>
      <div class="sample-group"><h3>Adult beginner phrases</h3><div class="phrase-grid">${samplePhrases.map(renderPhraseCard).join("")}</div></div>
      <div class="sample-group" id="words"><h3>Kids first words</h3><div class="words-grid">${sampleWords.map(renderWordCard).join("")}</div></div>
      <a class="button secondary" href="/samples/">See all phrases and words</a>
    </div></section>
    <section class="section" id="author"><div class="wrap">
      <div class="section-header"><div><p class="eyebrow">From the author</p><h2>Chanelle Ramos</h2></div><div class="author-copy">
        <p>Chanelle was born in Bacolod City in the Philippines and moved to Australia at 13. Hiligaynon remained a connection to home, family and culture.</p>
        <p>The series began when her wife wanted to learn the language and clear beginner resources were difficult to find.</p>
        <a class="book-detail-link" href="/contact/">Contact Chanelle about the books</a>
      </div></div>
    </div></section>
    <section class="section surface" id="faq"><div class="wrap">
      <div class="section-header"><div><p class="eyebrow">Questions</p><h2>Before you choose.</h2></div></div>
      <div class="faq-list">${faq.map(item => `<details class="faq-item"><summary>${escapeHtml(item.question)}</summary><p>${escapeHtml(item.answer)}</p></details>`).join("")}</div>
    </div></section>
  </main>
  ${renderFooter(site)}
</body>
</html>`;
}
