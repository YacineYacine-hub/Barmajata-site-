import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link, getPathname } from "@/i18n/navigation";
import { getAuthorBySlug, getVisibleBookBySlug, getVisibleBooks } from "@/lib/content";
import { getEpaisseurMm, getMinPrice, resolveEdition, type ContentLocale } from "@/lib/content/schema";
import { buildBookJsonLd } from "@/lib/content/jsonld";
import { AmazonBuyButton } from "@/components/AmazonBuyButton";
import { StickyBuyBar } from "@/components/StickyBuyBar";
import { NotifyMe } from "@/components/NotifyMe";
import { BookSolid } from "@/components/BookSolid";
import { SITE_URL } from "@/lib/site";
import { buildAlternates } from "@/lib/seo";

export function generateStaticParams() {
  return getVisibleBooks().map((book) => ({ slug: book.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  return { alternates: buildAlternates({ pathname: "/books/[slug]", params: { slug } }) };
}

export default async function BookPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const book = getVisibleBookBySlug(slug);
  if (!book) {
    notFound();
  }

  const contentLocale = locale as ContentLocale;
  const edition = resolveEdition(book, contentLocale);
  if (!edition) {
    notFound();
  }

  const author = getAuthorBySlug(book.auteurSlug);
  if (!author) {
    notFound();
  }

  const t = await getTranslations("books");
  const tSite = await getTranslations("site");

  const pathname = getPathname({
    locale,
    href: { pathname: "/books/[slug]", params: { slug } },
  });
  const authorPathname = getPathname({
    locale,
    href: { pathname: "/authors/[slug]", params: { slug: author.slug } },
  });
  const jsonLd = buildBookJsonLd(book, edition, {
    siteUrl: SITE_URL,
    pathname,
    publisherName: tSite("name"),
    author,
    authorPathname,
  });

  const minPrice = getMinPrice(edition);
  const priceLabel =
    edition.statut === "publie" && minPrice !== undefined
      ? t("priceFrom", {
          price: new Intl.NumberFormat(locale, { style: "currency", currency: "EUR" }).format(
            minPrice,
          ),
        })
      : undefined;
  const isOtherLanguage = edition.langue !== contentLocale;
  const sellableFormats = edition.formats?.filter(
    (format) => format.asin || format.urlOverride,
  );
  const primarySellableFormat = sellableFormats?.[0];

  return (
    <main className="mx-auto max-w-3xl ps-6 pe-6 py-16 pb-28 md:pb-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Link href="/books" className="text-sm text-or-500 hover:underline">
        {t("cta.backToCatalogue")}
      </Link>

      <div className="mt-6 max-w-xs">
        <BookSolid
          title={edition.titre}
          couvertureImage={edition.couvertureImage}
          quatriemeImage={edition.quatriemeImage}
          dosImage={edition.dosImage}
          epaisseurMm={getEpaisseurMm(edition)}
        />
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <span className="inline-block rounded-full bg-or-500/10 px-3 py-1 text-xs font-medium text-or-500">
          {t(`status.${edition.statut}`)}
        </span>
        {isOtherLanguage && (
          <span className="inline-block rounded-full bg-sable-300 px-3 py-1 text-xs font-medium text-roche-700">
            {t(`languages.${edition.langue}`)}
          </span>
        )}
      </div>

      <h1 className="mt-4 font-serif text-4xl text-nuit-900 text-start">{edition.titre}</h1>
      {edition.sousTitre && (
        <p className="mt-2 text-lg text-roche-700 text-start">{edition.sousTitre}</p>
      )}

      <Link
        href={{ pathname: "/authors/[slug]", params: { slug: author.slug } }}
        className="mt-3 inline-block text-sm text-roche-700 hover:text-or-500"
      >
        {t("fields.author")} : {author.nom}
      </Link>

      <p className="mt-6 text-roche-700 text-start">{edition.resumeLong}</p>

      {edition.formats?.length ? (
        <ul className="mt-10 flex flex-wrap gap-3">
          {edition.formats.map((format, index) => (
            <li
              key={index}
              className="rounded-md border border-sable-300 px-4 py-2 text-sm text-roche-700"
            >
              <span className="font-medium text-nuit-900">{t(`formats.${format.type}`)}</span>
              {format.pages ? ` · ${format.pages} ${t("fields.pages")}` : ""}
              {format.isbn ? ` · ${t("fields.isbn")} ${format.isbn}` : ""}
            </li>
          ))}
        </ul>
      ) : null}

      {edition.dateParution && (
        <p className="mt-6 text-sm text-roche-700 text-start">
          {edition.statut === "publie" ? t("fields.publicationDate") : t("fields.announcedDate")}
          {" : "}
          {edition.dateParution}
        </p>
      )}

      {priceLabel && (
        <p className="mt-6 text-lg font-medium text-nuit-900 text-start">{priceLabel}</p>
      )}

      {edition.statut === "publie" && sellableFormats?.length ? (
        <div className="mt-6 flex flex-col gap-4">
          {sellableFormats.map((format, index) => (
            <div key={index} className="flex items-center gap-3">
              <span className="text-sm font-medium text-nuit-900">
                {t(`formats.${format.type}`)}
              </span>
              <AmazonBuyButton
                asin={format.asin}
                urlOverride={format.urlOverride}
                locale={contentLocale}
              />
            </div>
          ))}
        </div>
      ) : null}

      {edition.statut === "a_paraitre" && (
        <div className="mt-6">
          <NotifyMe slug={book.slug} langue={edition.langue} />
        </div>
      )}

      {edition.statut === "publie" && primarySellableFormat && (
        <StickyBuyBar
          title={edition.titre}
          price={priceLabel}
          asin={primarySellableFormat.asin}
          urlOverride={primarySellableFormat.urlOverride}
          locale={contentLocale}
        />
      )}
    </main>
  );
}
