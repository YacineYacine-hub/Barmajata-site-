import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link, getPathname } from "@/i18n/navigation";
import { getVisibleBooks } from "@/lib/content";
import { getMinPrice, resolveEdition, type Book, type ContentLocale, type Edition } from "@/lib/content/schema";
import { buildBookListJsonLd } from "@/lib/content/jsonld";
import { SITE_URL } from "@/lib/site";

export default async function BooksPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("pages.books");
  const tBooks = await getTranslations("books");
  const contentLocale = locale as ContentLocale;

  const entries = getVisibleBooks()
    .map((book) => ({ book, edition: resolveEdition(book, contentLocale) }))
    .filter((entry): entry is { book: Book; edition: Edition } => entry.edition !== undefined);

  const jsonLd = buildBookListJsonLd(
    entries.map(({ book, edition }) => ({
      url: `${SITE_URL}${getPathname({ locale, href: { pathname: "/books/[slug]", params: { slug: book.slug } } })}`,
      name: edition.titre,
    })),
  );

  return (
    <main className="mx-auto max-w-5xl ps-6 pe-6 py-16">
      {entries.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}

      <h1 className="font-serif text-4xl text-ink-900 text-start">{t("title")}</h1>

      {entries.length === 0 ? (
        <p className="mt-6 text-ink-700 text-start">{tBooks("empty")}</p>
      ) : (
        <ul className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {entries.map(({ book, edition }) => {
            const minPrice = getMinPrice(edition);
            const isOtherLanguage = edition.langue !== contentLocale;

            return (
              <li
                key={book.slug}
                className="rounded-lg border border-sand-200 bg-sand-50 p-6"
              >
                <Link
                  href={{ pathname: "/books/[slug]", params: { slug: book.slug } }}
                  className="block"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-block rounded-full bg-gold-500/10 px-3 py-1 text-xs font-medium text-gold-600">
                      {tBooks(`status.${edition.statut}`)}
                    </span>
                    {isOtherLanguage && (
                      <span className="inline-block rounded-full bg-sand-200 px-3 py-1 text-xs font-medium text-ink-700">
                        {tBooks(`languages.${edition.langue}`)}
                      </span>
                    )}
                  </div>
                  <h2 className="mt-4 font-serif text-xl text-ink-900 text-start">
                    {edition.titre}
                  </h2>
                  <p className="mt-2 text-sm text-ink-700 text-start">{edition.resumeCourt}</p>
                  {edition.statut === "publie" && minPrice !== undefined && (
                    <p className="mt-3 text-sm font-medium text-ink-900 text-start">
                      {tBooks("priceFrom", {
                        price: new Intl.NumberFormat(locale, {
                          style: "currency",
                          currency: "EUR",
                        }).format(minPrice),
                      })}
                    </p>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
