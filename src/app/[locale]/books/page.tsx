import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link, getPathname } from "@/i18n/navigation";
import { getVisibleBooks } from "@/lib/content";
import {
  getMinPrice,
  isNewRelease,
  resolveEdition,
  type Book,
  type ContentLocale,
  type Edition,
} from "@/lib/content/schema";
import { buildBookListJsonLd } from "@/lib/content/jsonld";
import { SITE_URL } from "@/lib/site";
import { buildAlternates } from "@/lib/seo";
import { Reveal } from "@/components/Reveal";
import { BookBandSection, type BandEntry } from "@/components/BookBandSection";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pages.books" });

  return {
    title: t("title"),
    description: t("description"),
    alternates: buildAlternates("/books"),
  };
}

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

  const visibleBooks = getVisibleBooks();
  const entries = visibleBooks
    .map((book) => ({ book, edition: resolveEdition(book, contentLocale) }))
    .filter((entry): entry is { book: Book; edition: Edition } => entry.edition !== undefined);

  // Garde-fou : getVisibleBooks() a déjà écarté les livres sans édition
  // visible, donc resolveEdition() ne devrait jamais échouer ici. Si ça
  // arrive quand même, le catalogue se viderait silencieusement — on
  // préfère un avertissement bruyant au build à un panier vide muet.
  if (visibleBooks.length > 0 && entries.length === 0) {
    console.warn(
      `[books/page.tsx] ${visibleBooks.length} livre(s) visible(s) pour "${contentLocale}" mais aucun n'a résolu d'édition — catalogue rendu vide alors qu'il ne devrait pas l'être.`,
    );
  }

  const bandEntries: BandEntry[] = entries.map(({ book, edition }) => ({
    slug: book.slug,
    title: edition.titre,
    coverSrc: book.couverture,
    categories: book.categories ?? [],
    isNew: isNewRelease(edition),
  }));

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

      <h1 className="font-serif text-4xl text-nuit-900 text-start">{t("title")}</h1>

      {bandEntries.length > 0 && (
        <div className="mt-10 -mx-6">
          <BookBandSection entries={bandEntries} locale={contentLocale} />
        </div>
      )}

      {entries.length === 0 ? (
        <p className="mt-6 text-roche-700 text-start">{tBooks("empty")}</p>
      ) : (
        <ul className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {entries.map(({ book, edition }, index) => {
            const minPrice = getMinPrice(edition);
            const isOtherLanguage = edition.langue !== contentLocale;

            return (
              <li
                key={book.slug}
                className="overflow-hidden rounded-lg border border-sable-300 bg-lin-50"
              >
                <Reveal delayMs={index * 80}>
                  <Link
                    href={{ pathname: "/books/[slug]", params: { slug: book.slug } }}
                    className="block"
                  >
                    {book.couverture && (
                      <div className="relative aspect-[2/3] w-full">
                        <Image
                          src={book.couverture}
                          alt=""
                          fill
                          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className="p-6">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-block rounded-full bg-or-500/10 px-3 py-1 text-xs font-medium text-roche-700">
                          {tBooks(`status.${edition.statut}`)}
                        </span>
                        {isOtherLanguage && (
                          <span className="inline-block rounded-full bg-sable-300 px-3 py-1 text-xs font-medium text-roche-700">
                            {tBooks(`languages.${edition.langue}`)}
                          </span>
                        )}
                      </div>
                      <h2 className="mt-4 font-serif text-xl text-nuit-900 text-start">
                        {edition.titre}
                      </h2>
                      <p className="mt-2 text-sm text-roche-700 text-start">{edition.resumeCourt}</p>
                      {edition.statut === "publie" && minPrice !== undefined && (
                        <p className="mt-3 text-sm font-medium text-nuit-900 text-start">
                          {tBooks("priceFrom", {
                            price: new Intl.NumberFormat(locale, {
                              style: "currency",
                              currency: "EUR",
                            }).format(minPrice),
                          })}
                        </p>
                      )}
                    </div>
                  </Link>
                </Reveal>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
