import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { getPathname } from "@/i18n/navigation";
import { getAllAuthors, getVisibleBooks } from "@/lib/content";
import { SITE_URL } from "@/lib/site";

// "/commitment" (engagement) est volontairement absent : hors sitemap tant
// que la page reste en noindex, voir commitment/page.tsx.
const CANONICAL_PATHS = [
  "/",
  "/authors",
  "/books",
  "/house",
  "/club",
  "/journal",
  "/contact",
  // Pages professionnelles (Lot H12). Cette liste est écrite à la main :
  // une route ajoutée à `routing.pathnames` n'y entre PAS toute seule et
  // resterait absente du sitemap sans que rien ne le signale.
  "/submissions",
  "/press",
  "/rights",
  "/booksellers",
  "/faq",
  "/legal-notice",
  "/terms-of-sale",
  "/privacy-policy",
  "/shipping-returns",
] as const;

function localizedEntry(href: Parameters<typeof getPathname>[0]["href"]) {
  const languages = Object.fromEntries(
    routing.locales.map((locale) => [locale, `${SITE_URL}${getPathname({ locale, href })}`]),
  );

  return {
    url: `${SITE_URL}${getPathname({ locale: routing.defaultLocale, href })}`,
    alternates: { languages },
  };
}

export default function sitemap(): MetadataRoute.Sitemap {
  const staticEntries = CANONICAL_PATHS.map((href) => localizedEntry(href));

  const bookEntries = getVisibleBooks().map((book) =>
    localizedEntry({ pathname: "/books/[slug]", params: { slug: book.slug } }),
  );

  const authorEntries = getAllAuthors().map((author) =>
    localizedEntry({ pathname: "/authors/[slug]", params: { slug: author.slug } }),
  );

  return [...staticEntries, ...bookEntries, ...authorEntries];
}
