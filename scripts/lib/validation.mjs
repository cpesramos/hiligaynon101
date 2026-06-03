import { existsSync } from "node:fs";
import path from "node:path";
import { isExternalUrl } from "./urls.mjs";

function assert(condition, message, errors) {
  if (!condition) errors.push(message);
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function requireString(value, field, errors) {
  assert(isNonEmptyString(value), `${field} must be a non-empty string.`, errors);
}

function requireArray(value, field, errors) {
  assert(Array.isArray(value), `${field} must be an array.`, errors);
}

function assertUnique(items, field, label, errors) {
  const seen = new Set();
  for (const item of items) {
    const value = item?.[field];
    if (!isNonEmptyString(value)) continue;
    assert(!seen.has(value), `${label} contains duplicate ${field}: ${value}.`, errors);
    seen.add(value);
  }
}

function validateSite(site, src, errors) {
  for (const field of ["name", "url", "author", "tagline", "seoTitle", "description", "language", "socialImage", "affiliateDisclosure"]) {
    requireString(site[field], `site.${field}`, errors);
  }

  requireArray(site.keywords, "site.keywords", errors);
  requireArray(site.navigation, "site.navigation", errors);

  if (Array.isArray(site.keywords)) {
    site.keywords.forEach((keyword, index) => requireString(keyword, `site.keywords[${index}]`, errors));
  }

  if (Array.isArray(site.navigation)) {
    site.navigation.forEach((item, index) => {
      requireString(item?.label, `site.navigation[${index}].label`, errors);
      requireString(item?.href, `site.navigation[${index}].href`, errors);
      assert(String(item?.href || "").startsWith("#") || String(item?.href || "").startsWith("/"), `site.navigation[${index}].href must be an anchor or local path.`, errors);
    });
  }

  if (isNonEmptyString(site.url)) {
    assert(/^https:\/\/[^/]+/.test(site.url), "site.url must be an https origin.", errors);
  }

  if (isNonEmptyString(site.socialImage) && !isExternalUrl(site.socialImage)) {
    const imagePath = path.join(src, site.socialImage.replace(/^\/+/, ""));
    assert(existsSync(imagePath), `site.socialImage points to a missing local asset: ${site.socialImage}.`, errors);
  }
}

function validateBooks(books, errors) {
  requireArray(books, "books", errors);
  if (!Array.isArray(books)) return;

  assert(books.length > 0, "books must contain at least one book.", errors);
  assertUnique(books, "id", "books", errors);

  books.forEach((book, bookIndex) => {
    const prefix = `books[${bookIndex}]`;
    for (const field of ["id", "series", "title", "subtitle", "shortTitle", "audience", "summary", "featuredEditionId"]) {
      requireString(book?.[field], `${prefix}.${field}`, errors);
    }
    requireArray(book?.features, `${prefix}.features`, errors);
    requireArray(book?.editions, `${prefix}.editions`, errors);

    if (Array.isArray(book?.features)) {
      assert(book.features.length > 0, `${prefix}.features must contain at least one feature.`, errors);
      book.features.forEach((feature, featureIndex) => requireString(feature, `${prefix}.features[${featureIndex}]`, errors));
    }

    if (!Array.isArray(book?.editions)) return;

    assert(book.editions.length > 0, `${prefix}.editions must contain at least one edition.`, errors);
    assertUnique(book.editions, "id", `${prefix}.editions`, errors);

    const editionIds = new Set(book.editions.map((edition) => edition.id));
    assert(editionIds.has(book.featuredEditionId), `${prefix}.featuredEditionId must match one of its edition IDs.`, errors);

    book.editions.forEach((edition, editionIndex) => {
      const editionPrefix = `${prefix}.editions[${editionIndex}]`;
      for (const field of ["id", "label", "asin", "amazonAsin", "amazonAuAsin", "format", "amazonUrl", "amazonAuUrl", "image"]) {
        requireString(edition?.[field], `${editionPrefix}.${field}`, errors);
      }
      for (const field of ["amazonUrl", "amazonAuUrl", "image"]) {
        if (isNonEmptyString(edition?.[field])) {
          assert(isExternalUrl(edition[field]), `${editionPrefix}.${field} must be an absolute http(s) URL.`, errors);
        }
      }
    });
  });
}

function validateWords(words, errors) {
  requireArray(words, "words", errors);
  if (!Array.isArray(words)) return;

  assert(words.length === 9, "words must contain exactly 9 sample words for the current 3x3 layout.", errors);
  assertUnique(words, "word", "words", errors);
  words.forEach((word, index) => {
    for (const field of ["word", "translation", "theme", "prompt"]) {
      requireString(word?.[field], `words[${index}].${field}`, errors);
    }
  });
}

function validateFaq(faq, errors) {
  requireArray(faq, "faq", errors);
  if (!Array.isArray(faq)) return;

  assert(faq.length > 0, "faq must contain at least one question.", errors);
  faq.forEach((item, index) => {
    requireString(item?.question, `faq[${index}].question`, errors);
    requireString(item?.answer, `faq[${index}].answer`, errors);
  });
}

export function validateContent({ site, books, words, faq, src }) {
  const errors = [];
  validateSite(site, src, errors);
  validateBooks(books, errors);
  validateWords(words, errors);
  validateFaq(faq, errors);

  if (errors.length > 0) {
    throw new Error(`Content validation failed:\n- ${errors.join("\n- ")}`);
  }
}
