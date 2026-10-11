export function featuredEdition(book) {
  return book.editions.find((edition) => edition.id === book.featuredEditionId) || book.editions[0];
}

export function purchaseLinks(edition) {
  return [
    { market: "Amazon US", format: edition.amazonFormat, url: edition.amazonUrl },
    { market: "Amazon AU", format: edition.amazonAuFormat, url: edition.amazonAuUrl },
    ...(edition.additionalLinks || [])
  ].sort((a, b) => a.market.localeCompare(b.market) || a.format.localeCompare(b.format));
}

export function previewLink(edition) {
  return purchaseLinks(edition).find(link => link.market === edition.previewMarket && link.format === edition.previewFormat);
}

export function orderedEditions(book) {
  const featured = featuredEdition(book);
  return [featured, ...book.editions.filter((edition) => edition.id !== featured.id)];
}
