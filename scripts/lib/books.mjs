export function featuredEdition(book) {
  return book.editions.find((edition) => edition.id === book.featuredEditionId) || book.editions[0];
}

export function orderedEditions(book) {
  const featured = featuredEdition(book);
  return [featured, ...book.editions.filter((edition) => edition.id !== featured.id)];
}
