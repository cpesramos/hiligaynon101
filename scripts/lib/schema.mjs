import { attr, escapeHtml, jsonLdScript } from "./html.mjs";
import { absoluteAssetUrl, absoluteUrl, siteOrigin } from "./urls.mjs";

export function metaTags(site) {
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
