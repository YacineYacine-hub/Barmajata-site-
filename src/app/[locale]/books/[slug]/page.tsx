import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link, getPathname } from "@/i18n/navigation";
import { getAdjacentBooks, getAuthorBySlug, getVisibleBookBySlug, getVisibleBooks } from "@/lib/content";
import { getEpaisseurMm, getMinPrice, resolveEdition, type ContentLocale } from "@/lib/content/schema";
import { buildBookJsonLd, buildBreadcrumbListJsonLd } from "@/lib/content/jsonld";
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
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const alternates = buildAlternates({ pathname: "/books/[slug]", params: { slug } });

  const book = getVisibleBookBySlug(slug);
  const edition = book ? resolveEdition(book, locale as ContentLocale) : undefined;
  if (!edition) return { alternates };

  return { title: edition.titre, description: edition.resumeCourt, alternates };
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
  const tNav = await getTranslations("nav");
  const tSite = await getTranslations("site");

  const pathname = getPathname({
    locale,
    href: { pathname: "/books/[slug]", params: { slug } },
  });
  const authorPathname = getPathname({
    locale,
    href: { pathname: "/authors/[slug]", params: { slug: author.slug } },
  });
  const booksPathname = getPathname({ locale, href: "/books" });
  const homePathname = getPathname({ locale, href: "/" });

  const jsonLd = buildBookJsonLd(book, edition, {
    siteUrl: SITE_URL,
    pathname,
    publisherName: tSite("name"),
    author,
    authorPathname,
  });
  const breadcrumbJsonLd = buildBreadcrumbListJsonLd([
    { url: `${SITE_URL}${homePathname}`, name: tNav("home") },
    { url: `${SITE_URL}${booksPathname}`, name: tNav("books") },
    { url: `${SITE_URL}${pathname}`, name: edition.titre },
  ]);

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

  const { previous, next } = getAdjacentBooks(book);
  const previousEdition = previous ? resolveEdition(previous, contentLocale) : undefined;
  const nextEdition = next ? resolveEdition(next, contentLocale) : undefined;

  return (
    <main className="mx-auto max-w-3xl ps-6 pe-6 py-16 pb-28 md:pb-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <nav aria-label={tNav("breadcrumb")} className="text-sm text-roche-700">
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link href="/" className="hover:text-or-500">
              {tNav("home")}
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link href="/books" className="hover:text-or-500">
              {tNav("books")}
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-nuit-900">
            {edition.titre}
          </li>
        </ol>
      </nav>

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
        <span className="inline-block rounded-full bg-or-500/10 px-3 py-1 text-xs font-medium text-roche-700">
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

      <p className="mt-6 text-roche-700 text-start">{edition.resumeLong}</p>

      {edition.extrait && (
        <blockquote className="mt-6 border-s-2 border-or-500 ps-4 text-roche-700 italic text-start">
          {edition.extrait}
        </blockquote>
      )}

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

      <Link
        href={{ pathname: "/authors/[slug]", params: { slug: author.slug } }}
        className="mt-12 flex items-center gap-4 rounded-lg border border-sable-300 p-4 hover:border-or-500"
      >
        {author.portrait ? (
          <Image
            src={author.portrait}
            alt=""
            width={56}
            height={56}
            className="h-14 w-14 shrink-0 rounded-full object-cover"
          />
        ) : (
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-sable-300 font-serif text-lg text-nuit-900">
            {author.nom.charAt(0)}
          </span>
        )}
        <span>
          <span className="block text-sm text-roche-700">{t("fields.author")}</span>
          <span className="block font-serif text-lg text-nuit-900">{author.nom}</span>
          <span className="mt-1 block text-sm text-roche-700">
            {author.bioCourte[contentLocale]}
          </span>
          <span className="mt-1 block text-sm text-roche-700 underline">
            {t("cta.viewAuthorProfile")}
          </span>
        </span>
      </Link>

      {(previousEdition || nextEdition) && (
        <div className="mt-12 grid gap-4 border-t border-sable-300 pt-8 sm:grid-cols-2">
          {previous && previousEdition ? (
            <Link
              href={{ pathname: "/books/[slug]", params: { slug: previous.slug } }}
              className="rounded-lg border border-sable-300 p-4 text-start hover:border-or-500"
            >
              <span className="block text-xs text-roche-700">{t("nav.previousBook")}</span>
              <span className="mt-1 block font-serif text-lg text-nuit-900">
                {previousEdition.titre}
              </span>
            </Link>
          ) : (
            <span />
          )}
          {next && nextEdition ? (
            <Link
              href={{ pathname: "/books/[slug]", params: { slug: next.slug } }}
              className="rounded-lg border border-sable-300 p-4 text-end hover:border-or-500 sm:text-end"
            >
              <span className="block text-xs text-roche-700">{t("nav.nextBook")}</span>
              <span className="mt-1 block font-serif text-lg text-nuit-900">
                {nextEdition.titre}
              </span>
            </Link>
          ) : (
            <span />
          )}
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
