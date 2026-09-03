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
import { buildAmazonReviewUrl, DEFAULT_MARKETPLACE_BY_LOCALE } from "@/lib/amazon/marketplaces";

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

  // Loi Lang (prix unique du livre) : c'est l'éditeur qui fixe le prix
  // public, et un détaillant — Amazon compris — ne peut accorder que 5 %
  // de rabais. Le prix affiché ici fait donc autorité ; il n'a pas à être
  // présenté comme indicatif. Chaque format a le sien, d'où l'affichage
  // par format plutôt qu'un « à partir de » global, réservé au catalogue.
  const formatPrix = (valeur: number) =>
    new Intl.NumberFormat(locale, { style: "currency", currency: "EUR" }).format(valeur);

  const minPrice = getMinPrice(edition);
  const priceLabel =
    edition.statut === "publie" && minPrice !== undefined
      ? t("priceFrom", { price: formatPrix(minPrice) })
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
    /*
     * Fiche livre en deux colonnes (Lot H11), inspirée du modèle Stripe
     * Press : l'objet d'un côté, toute l'écriture de l'autre, de haut en
     * bas. La colonne de gauche est COLLANTE — le livre reste visible et
     * manipulable pendant qu'on lit le texte, ce qui est l'intérêt d'un
     * objet qu'on peut tourner.
     *
     * Sous 1024px la grille retombe en une seule colonne et le collant
     * est désactivé : sur mobile, un objet collant mangerait la moitié de
     * l'écran pendant toute la lecture.
     *
     * L'ordre des colonnes suit la direction d'écriture (CSS Grid le fait
     * nativement), donc le livre passe à droite en arabe sans code dédié.
     */
    <main className="mx-auto max-w-6xl ps-6 pe-6 py-12 pb-28 md:pb-16">
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
            <Link href="/" className="underline hover:text-nuit-900">
              {tNav("home")}
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link href="/books" className="underline hover:text-nuit-900">
              {tNav("books")}
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-nuit-900">
            {edition.titre}
          </li>
        </ol>
      </nav>

      <div className="mt-10 grid gap-12 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)] lg:gap-20">
        {/* ── L'objet, et l'acte d'achat qui lui est attaché ── */}
        <div className="lg:sticky lg:top-28 lg:self-start">
          <BookSolid
            title={edition.titre}
            couvertureImage={edition.couvertureImage}
            quatriemeImage={edition.quatriemeImage}
            dosImage={edition.dosImage}
            epaisseurMm={getEpaisseurMm(edition)}
          />

          {edition.statut === "publie" && sellableFormats?.length ? (
            <div className="mt-8 flex flex-col gap-4">
              {sellableFormats.map((format, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between gap-4 border-t border-nuit-900/10 pt-4"
                >
                  <span className="text-start">
                    <span className="block text-sm font-medium text-nuit-900">
                      {t(`formats.${format.type}`)}
                    </span>
                    <span className="block text-sm text-roche-700">
                      {formatPrix(format.prixIndicatif)}
                    </span>
                  </span>
                  <AmazonBuyButton
                    asin={format.asin}
                    urlOverride={format.urlOverride}
                    locale={contentLocale}
                  />
                </div>
              ))}

              {/* Information précontractuelle : la vente se conclut chez un
                  tiers, il faut le dire avant le clic, pas après. */}
              <p className="text-xs leading-relaxed text-roche-700 text-start">
                {t("amazonNotice")}
              </p>
            </div>
          ) : null}

          {edition.statut === "a_paraitre" && (
            <div className="mt-8">
              <NotifyMe slug={book.slug} langue={edition.langue} />
            </div>
          )}
        </div>

        {/* ── Toute l'écriture, de haut en bas ── */}
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="border border-nuit-900/20 px-3 py-1 text-xs font-medium uppercase tracking-wider text-roche-700">
              {t(`status.${edition.statut}`)}
            </span>
            {isOtherLanguage && (
              <span className="border border-nuit-900/20 px-3 py-1 text-xs font-medium uppercase tracking-wider text-roche-700">
                {t(`languages.${edition.langue}`)}
              </span>
            )}
          </div>

          <h1 className="mt-5 font-serif text-titre text-nuit-900 text-start">{edition.titre}</h1>
          {edition.sousTitre && (
            <p className="mt-3 text-lg text-roche-700 text-start">{edition.sousTitre}</p>
          )}

          <Link
            href={{ pathname: "/authors/[slug]", params: { slug: author.slug } }}
            className="mt-4 inline-block font-serif text-xl text-nuit-900 underline decoration-nuit-900/25 underline-offset-4 hover:decoration-nuit-900"
          >
            {author.nom}
          </Link>

          <section className="mt-12">
            <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-roche-700 text-start">
              {t("aboutTitle")}
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-roche-700 text-start">
              {edition.resumeLong}
            </p>
          </section>

          {edition.extrait && (
            <section className="mt-12">
              <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-roche-700 text-start">
                {t("extractTitle")}
              </h2>
              <blockquote className="mt-4 border-s border-nuit-900/20 ps-6 font-serif text-xl leading-relaxed text-nuit-900 text-start">
                {edition.extrait}
              </blockquote>
            </section>
          )}

          {(edition.formats?.length || edition.dateParution) && (
            <section className="mt-12">
              <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-roche-700 text-start">
                {t("detailsTitle")}
              </h2>
              <dl className="mt-4 border-t border-nuit-900/10 text-sm">
                {edition.formats?.map((format, index) => (
                  <div
                    key={index}
                    className="flex flex-wrap justify-between gap-4 border-b border-nuit-900/10 py-3"
                  >
                    <dt className="font-medium text-nuit-900">{t(`formats.${format.type}`)}</dt>
                    <dd className="text-roche-700 text-end">
                      {[
                        format.pages ? `${format.pages} ${t("fields.pages")}` : null,
                        format.isbn ? `${t("fields.isbn")} ${format.isbn}` : null,
                        formatPrix(format.prixIndicatif),
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </dd>
                  </div>
                ))}
                {edition.dateParution && (
                  <div className="flex flex-wrap justify-between gap-4 border-b border-nuit-900/10 py-3">
                    <dt className="font-medium text-nuit-900">
                      {edition.statut === "publie"
                        ? t("fields.publicationDate")
                        : t("fields.announcedDate")}
                    </dt>
                    <dd className="text-roche-700 text-end">{edition.dateParution}</dd>
                  </div>
                )}
              </dl>
            </section>
          )}

          {/*
            * Avis de lecteurs : recueillis chez Amazon, jamais ici. Le
            * lecteur y a acheté le livre, Amazon vérifie donc l'achat et
            * porte les obligations de l'article L111-7-2 du Code de la
            * consommation. Voir CLAUDE.md, « Avis de lecteurs ».
            */}
          {edition.statut === "publie" && primarySellableFormat?.asin && (
            /* `id="avis"` : cible du QR code de type « avis », imprimé en
               fin d'ouvrage. `scroll-mt` pour que le bandeau collant ne
               recouvre pas le bloc à l'arrivée. */
            <section id="avis" className="mt-12 scroll-mt-24 border border-nuit-900/15 p-6">
              <h2 className="font-serif text-xl text-nuit-900 text-start">
                {t("review.title")}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-roche-700 text-start">
                {t("review.lede")}
              </p>
              <a
                href={buildAmazonReviewUrl(
                  primarySellableFormat.asin,
                  DEFAULT_MARKETPLACE_BY_LOCALE[contentLocale],
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-block text-sm font-medium text-nuit-900 underline underline-offset-4 hover:opacity-70"
              >
                {t("review.cta")}
              </a>
            </section>
          )}

          <section className="mt-12">
            <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-roche-700 text-start">
              {t("fields.author")}
            </h2>
            <Link
              href={{ pathname: "/authors/[slug]", params: { slug: author.slug } }}
              className="mt-4 flex items-start gap-5 border-t border-nuit-900/10 pt-5 transition-opacity hover:opacity-70"
            >
              {author.portrait ? (
                <Image
                  src={author.portrait}
                  alt=""
                  width={64}
                  height={64}
                  className="h-16 w-16 shrink-0 rounded-full object-cover"
                />
              ) : (
                <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-lin-100 font-serif text-xl text-nuit-900">
                  {author.nom.charAt(0)}
                </span>
              )}
              <span className="text-start">
                <span className="block font-serif text-xl text-nuit-900">{author.nom}</span>
                <span className="mt-2 block text-sm leading-relaxed text-roche-700">
                  {author.bioCourte[contentLocale]}
                </span>
              </span>
            </Link>
          </section>

          {(previousEdition || nextEdition) && (
            <nav className="mt-16 grid gap-6 border-t border-nuit-900/10 pt-8 sm:grid-cols-2">
              {previous && previousEdition ? (
                <Link
                  href={{ pathname: "/books/[slug]", params: { slug: previous.slug } }}
                  className="text-start transition-opacity hover:opacity-60"
                >
                  <span className="block text-xs uppercase tracking-wider text-roche-700">
                    {t("nav.previousBook")}
                  </span>
                  <span className="mt-2 block font-serif text-lg text-nuit-900">
                    {previousEdition.titre}
                  </span>
                </Link>
              ) : (
                <span />
              )}
              {next && nextEdition ? (
                <Link
                  href={{ pathname: "/books/[slug]", params: { slug: next.slug } }}
                  className="text-end transition-opacity hover:opacity-60"
                >
                  <span className="block text-xs uppercase tracking-wider text-roche-700">
                    {t("nav.nextBook")}
                  </span>
                  <span className="mt-2 block font-serif text-lg text-nuit-900">
                    {nextEdition.titre}
                  </span>
                </Link>
              ) : (
                <span />
              )}
            </nav>
          )}
        </div>
      </div>

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
