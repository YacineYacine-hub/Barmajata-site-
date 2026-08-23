import type { Author, Book, Edition } from "./schema";

const BOOK_FORMAT_SCHEMA_ORG: Record<string, string> = {
  broche: "https://schema.org/Paperback",
  epub: "https://schema.org/EBook",
  pdf: "https://schema.org/EBook",
};

function absoluteUrl(siteUrl: string, value: string): string {
  return value.startsWith("/") ? `${siteUrl}${value}` : value;
}

type BookJsonLdOptions = {
  siteUrl: string;
  pathname: string;
  publisherName: string;
  author: Author;
  authorPathname: string;
};

/** Représentation schema.org/Book d'une fiche livre, pour l'édition résolue. */
export function buildBookJsonLd(
  book: Book,
  edition: Edition,
  { siteUrl, pathname, publisherName, author, authorPathname }: BookJsonLdOptions,
) {
  const url = `${siteUrl}${pathname}`;

  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Book",
    "@id": url,
    url,
    name: edition.titre,
    description: edition.resumeCourt,
    inLanguage: edition.langue,
    author: {
      "@type": "Person",
      name: author.nom,
      url: `${siteUrl}${authorPathname}`,
    },
    publisher: {
      "@type": "Organization",
      name: publisherName,
    },
  };

  if (book.couverture) jsonLd.image = absoluteUrl(siteUrl, book.couverture);
  if (edition.dateParution) jsonLd.datePublished = edition.dateParution;

  const isbn = edition.formats?.find((format) => format.isbn)?.isbn;
  if (isbn) jsonLd.isbn = isbn;

  const formats = edition.formats
    ?.map((format) => BOOK_FORMAT_SCHEMA_ORG[format.type])
    .filter((value, index, all) => value && all.indexOf(value) === index);
  if (formats?.length) jsonLd.bookFormat = formats;

  // Le prix Amazon réel est dynamique et hors de notre contrôle : on ne
  // référence ici que le prix indicatif de nos propres fiches formats,
  // via une AggregateOffer plutôt qu'une Offer (qui impliquerait un prix
  // ferme et vérifié).
  if (edition.statut === "publie" && edition.formats?.length) {
    const prices = edition.formats.map((format) => format.prixIndicatif);
    jsonLd.offers = {
      "@type": "AggregateOffer",
      lowPrice: Math.min(...prices),
      highPrice: Math.max(...prices),
      priceCurrency: "EUR",
      availability: "https://schema.org/InStock",
    };
  }

  return jsonLd;
}

type AuthorJsonLdOptions = {
  siteUrl: string;
  pathname: string;
};

/** Représentation schema.org/Person d'une fiche auteur, pour une locale donnée. */
export function buildAuthorJsonLd(
  author: Author,
  locale: "fr" | "en" | "ar",
  { siteUrl, pathname }: AuthorJsonLdOptions,
) {
  const url = `${siteUrl}${pathname}`;

  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": url,
    url,
    name: author.nom,
    description: author.bioCourte[locale],
  };

  if (author.portrait) jsonLd.image = absoluteUrl(siteUrl, author.portrait);
  if (author.liens?.length) jsonLd.sameAs = author.liens.map((link) => link.url);

  return jsonLd;
}

/** Représentation schema.org/Organization de la maison d'édition. */
export function buildOrganizationJsonLd({
  siteUrl,
  name,
  description,
}: {
  siteUrl: string;
  name: string;
  description: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": siteUrl,
    url: siteUrl,
    name,
    description,
    logo: absoluteUrl(siteUrl, "/brand/logo-512.png"),
  };
}

/** Représentation schema.org/BreadcrumbList à partir d'une liste ordonnée
 * (accueil en premier). */
export function buildBreadcrumbListJsonLd(items: Array<{ url: string; name: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/** Représentation schema.org/ItemList du catalogue de livres visibles. */
export function buildBookListJsonLd(books: Array<{ url: string; name: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: books.map((book, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: book.url,
      name: book.name,
    })),
  };
}
