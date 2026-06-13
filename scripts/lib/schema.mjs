import { attr, escapeHtml, jsonLdScript } from "./html.mjs";
import { absoluteAssetUrl, absoluteUrl, siteOrigin } from "./urls.mjs";

export function metaTags(site) {
  const title = site.seoTitle || `${site.name} | ${site.tagline}`;
  const url = absoluteUrl(site, "/");
  const image = absoluteAssetUrl(site, site.socialImage);
  const keywords = Array.isArray(site.keywords) ? site.keywords.join(", ") : "";
  const authorId = `${siteOrigin(site)}/#author`;
  const organizationId = `${siteOrigin(site)}/#organization`;
  const websiteId = `${siteOrigin(site)}/#website`;
  const homepageId = `${siteOrigin(site)}/#homepage`;
  const seriesId = `${siteOrigin(site)}/#book-series`;
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": authorId,
        name: site.author,
        url,
        knowsAbout: ["Hiligaynon", "Ilonggo", "language learning", "heritage language learning"]
      },
      {
        "@type": "Organization",
        "@id": organizationId,
        name: site.name,
        url,
        founder: { "@id": authorId }
      },
      {
        "@type": "WebSite",
        "@id": websiteId,
        name: site.name,
        alternateName: ["Ilonggo 101", "Hiligaynon 101 Books"],
        url,
        description: site.description,
        inLanguage: site.language,
        keywords,
        creator: { "@id": authorId },
        publisher: { "@id": organizationId }
      },
      {
        "@type": ["WebPage", "CollectionPage"],
        "@id": homepageId,
        url,
        name: title,
        description: site.description,
        dateModified: site.lastModified,
        isPartOf: { "@id": websiteId },
        publisher: { "@id": organizationId },
        creator: { "@id": authorId },
        primaryImageOfPage: {
          "@type": "ImageObject",
          url: image,
          width: 1200,
          height: 630
        },
        mainEntity: { "@id": seriesId },
        hasPart: [
          {
            "@type": "WebPageElement",
            name: "Hiligaynon 101 book chooser",
            url: `${url}#books`
          },
          {
            "@type": "WebPageElement",
            name: "Hiligaynon 101 Kids sample words",
            url: `${url}#words`
          },
          {
            "@type": "WebPageElement",
            name: "Hiligaynon 101 frequently asked questions",
            url: `${url}#faq`
          }
        ],
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
    <meta name="author" content="${attr(site.author)}">
    ${keywords ? `<meta name="keywords" content="${attr(keywords)}">` : ""}
    <meta name="robots" content="index,follow,max-image-preview:large">
    <meta name="theme-color" content="#16313d">
    <link rel="canonical" href="${attr(url)}">
    <link rel="alternate" href="${attr(url)}" hreflang="en-au">
    <link rel="sitemap" type="application/xml" href="/sitemap.xml">
    <meta property="og:locale" content="en_AU">
    <meta property="og:site_name" content="${attr(site.name)}">
    <meta property="og:title" content="${attr(title)}">
    <meta property="og:description" content="${attr(site.description)}">
    <meta property="og:type" content="website">
    <meta property="og:url" content="${attr(url)}">
    <meta property="og:image" content="${attr(image)}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:image:alt" content="${attr(`${site.name} book series by ${site.author}`)}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${attr(title)}">
    <meta name="twitter:description" content="${attr(site.description)}">
    <meta name="twitter:image" content="${attr(image)}">
    <meta name="twitter:image:alt" content="${attr(`${site.name} book series by ${site.author}`)}">
    ${jsonLdScript(structuredData)}
  `;
}

export function pageMetaTags(site, { title, description, path = "/", image = site.socialImage, type = "website" }) {
  const url = absoluteUrl(site, path);
  const imageUrl = absoluteAssetUrl(site, image);
  const keywords = Array.isArray(site.keywords) ? site.keywords.join(", ") : "";

  return `
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${attr(description)}">
    <meta name="author" content="${attr(site.author)}">
    ${keywords ? `<meta name="keywords" content="${attr(keywords)}">` : ""}
    <meta name="robots" content="index,follow,max-image-preview:large">
    <meta name="theme-color" content="#16313d">
    <link rel="canonical" href="${attr(url)}">
    <link rel="alternate" href="${attr(url)}" hreflang="en-au">
    <link rel="sitemap" type="application/xml" href="/sitemap.xml">
    <meta property="og:locale" content="en_AU">
    <meta property="og:site_name" content="${attr(site.name)}">
    <meta property="og:title" content="${attr(title)}">
    <meta property="og:description" content="${attr(description)}">
    <meta property="og:type" content="${attr(type)}">
    <meta property="og:url" content="${attr(url)}">
    <meta property="og:image" content="${attr(imageUrl)}">
    <meta property="og:image:alt" content="${attr(title)}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${attr(title)}">
    <meta name="twitter:description" content="${attr(description)}">
    <meta name="twitter:image" content="${attr(imageUrl)}">
    <meta name="twitter:image:alt" content="${attr(title)}">
  `;
}

export function bookSchema(site, books) {
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

  const editionImage = (edition) => (edition.localImage ? absoluteAssetUrl(site, edition.localImage) : edition.image);

  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "@id": `${siteOrigin(site)}/#book-series`,
    name: "Hiligaynon 101 book series",
    description: site.description,
    itemListOrder: "https://schema.org/ItemListOrderAscending",
    numberOfItems: books.length,
    itemListElement: books.map((book, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Book",
        "@id": `${siteOrigin(site)}/#book-${book.id}`,
        url: `${siteOrigin(site)}/#${book.id}`,
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
        image: book.editions.map(editionImage),
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
          image: editionImage(edition),
          url: edition.amazonUrl,
          sameAs: [edition.amazonUrl, edition.amazonAuUrl],
          offers: [offerFor(edition, edition.amazonUrl, "Amazon"), offerFor(edition, edition.amazonAuUrl, "Amazon AU")]
        }))
      }
    }))
  };
}

export function bookPageSchema(site, book) {
  const editionImage = (edition) => (edition.localImage ? absoluteAssetUrl(site, edition.localImage) : edition.image);
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
    "@graph": [
      {
        "@type": "Book",
        "@id": `${siteOrigin(site)}/#book-${book.id}`,
        url: absoluteUrl(site, book.path),
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
        image: book.editions.map(editionImage),
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
          image: editionImage(edition),
          url: edition.amazonUrl,
          sameAs: [edition.amazonUrl, edition.amazonAuUrl],
          offers: [offerFor(edition, edition.amazonUrl, "Amazon"), offerFor(edition, edition.amazonAuUrl, "Amazon AU")]
        }))
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: site.name,
            item: siteOrigin(site)
          },
          {
            "@type": "ListItem",
            position: 2,
            name: book.shortTitle,
            item: absoluteUrl(site, book.path)
          }
        ]
      }
    ]
  };
}

export function phraseSchema(site, phrases) {
  const cleanSentence = (value) => String(value).trim().replace(/[.?!]+$/, "");

  return {
    "@context": "https://schema.org",
    "@type": "DefinedTermSet",
    name: "Sample Hiligaynon phrases for adult beginners",
    description: "Beginner-friendly Hiligaynon phrases featured on the Hiligaynon 101 website.",
    inLanguage: site.language,
    hasDefinedTerm: phrases.map((phrase) => ({
      "@type": "DefinedTerm",
      name: phrase.phrase,
      termCode: phrase.audioKey,
      description: `Hiligaynon phrase: ${phrase.phrase} Translation: ${cleanSentence(phrase.translation)}. ${phrase.usage}`
    }))
  };
}

export function wordSchema(site, words) {
  return {
    "@context": "https://schema.org",
    "@type": "DefinedTermSet",
    name: "Sample Hiligaynon words for kids",
    description: "Child-friendly Hiligaynon words featured on the Hiligaynon 101 website.",
    inLanguage: site.language,
    hasDefinedTerm: words.map((word) => ({
      "@type": "DefinedTerm",
      name: word.word,
      termCode: word.word,
      description: `${word.word} means ${word.translation}. ${word.prompt}`
    }))
  };
}

export function faqSchema(faq) {
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
