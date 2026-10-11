import { attr, escapeHtml, jsonLdScript } from "./html.mjs";
import { pageMetaTags, phraseSchema, wordSchema } from "./schema.mjs";
import { renderFooter, renderNav, stylesheet } from "./components.mjs";

export function renderWordCard(word) {
  return `<article class="word-card"><div class="word-theme">${escapeHtml(word.theme)}</div><h3 lang="hil">${escapeHtml(word.word)}</h3><p class="word-translation">${escapeHtml(word.translation)}</p><p>${escapeHtml(word.prompt)}</p></article>`;
}

export function renderPhraseCard(phrase) {
  return `<article class="phrase-card" data-audio-key="${attr(phrase.audioKey)}"><div class="phrase-context">${escapeHtml(phrase.context)}</div><h3 lang="hil">${escapeHtml(phrase.phrase)}</h3><p class="phrase-translation">${escapeHtml(phrase.translation)}</p><p>${escapeHtml(phrase.usage)}</p></article>`;
}

export function renderSamplesPage({ site, words, phrases }) {
  return `<!doctype html><html lang="en-AU"><head>
    <meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
    ${pageMetaTags(site, { title: `Hiligaynon phrases and first words | ${site.name}`, description: "Try useful Hiligaynon phrases with English translations, plus first-word practice for children learning with family.", path: "/samples/" })}
    ${jsonLdScript(phraseSchema(site, phrases))}${jsonLdScript(wordSchema(site, words))}${stylesheet(site)}
  </head><body><a class="skip-link" href="#main-content">Skip to main content</a>${renderNav(site)}
    <main id="main-content"><section class="section"><div class="wrap">
      <p class="eyebrow">Sample practice</p><h1 class="samples-title">A little Hiligaynon, every day.</h1>
      <p class="samples-intro">Website practice examples with English meanings. These are not scans of book pages. Pronunciation recordings are not available yet. Ask a Hiligaynon-speaking family member or friend to practise with you; wording can vary by speaker and place.</p>
      <div class="sample-group"><h2>Adult beginner phrases</h2><div class="phrase-grid">${phrases.map(renderPhraseCard).join("")}</div></div>
      <div class="sample-group" id="words"><h2>Kids first words</h2><div class="words-grid">${words.map(renderWordCard).join("")}</div></div>
      <a class="button secondary" href="/#books">Find a book for more practice</a>
    </div></section></main>${renderFooter(site)}
  </body></html>`;
}
