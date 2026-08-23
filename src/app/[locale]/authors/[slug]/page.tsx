import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link, getPathname } from "@/i18n/navigation";
import { getAllAuthors, getAuthorBySlug, getBooksByAuthor } from "@/lib/content";
import { resolveEdition, type Book, type ContentLocale, type Edition } from "@/lib/content/schema";
import { buildAuthorJsonLd } from "@/lib/content/jsonld";
import { SITE_URL } from "@/lib/site";
import { buildAlternates } from "@/lib/seo";
import { SectionBanner } from "@/components/SectionBanner";

export function generateStaticParams() {
  return getAllAuthors().map((author) => ({ slug: author.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  return { alternates: buildAlternates({ pathname: "/authors/[slug]", params: { slug } }) };
}

export default async function AuthorPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const author = getAuthorBySlug(slug);
  if (!author) {
    notFound();
  }

  const t = await getTranslations("authors");
  const tBooks = await getTranslations("books");
  const contentLocale = locale as ContentLocale;

  const pathname = getPathname({
    locale,
    href: { pathname: "/authors/[slug]", params: { slug } },
  });
  const jsonLd = buildAuthorJsonLd(author, contentLocale, { siteUrl: SITE_URL, pathname });

  const entries = getBooksByAuthor(author.slug)
    .map((book) => ({ book, edition: resolveEdition(book, contentLocale) }))
    .filter((entry): entry is { book: Book; edition: Edition } => entry.edition !== undefined);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <SectionBanner title={author.nom}>
        <Link href="/authors" className="text-sm text-sable-300 hover:text-or-500">
          {t("cta.backToCatalogue")}
        </Link>
      </SectionBanner>

      <main className="mx-auto max-w-3xl ps-6 pe-6 py-16">
        <p className="text-roche-700 text-start">{author.bioLongue[contentLocale]}</p>

        {author.liens?.length ? (
          <ul className="mt-6 flex flex-wrap gap-4 text-sm">
            {author.liens.map((link) => (
              <li key={link.url}>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-or-500 hover:underline"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        ) : null}

        {entries.length > 0 && (
          <section className="mt-12">
            <h2 className="font-serif text-2xl text-nuit-900 text-start">{t("booksTitle")}</h2>
            <ul className="mt-6 grid gap-6 sm:grid-cols-2">
              {entries.map(({ book, edition }) => (
                <li
                  key={book.slug}
                  className="rounded-lg border border-sable-300 bg-lin-50 p-6"
                >
                  <Link href={{ pathname: "/books/[slug]", params: { slug: book.slug } }}>
                    <h3 className="font-serif text-lg text-nuit-900 text-start">{edition.titre}</h3>
                    <p className="mt-2 text-sm text-roche-700 text-start">{edition.resumeCourt}</p>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
        {entries.length === 0 && (
          <p className="mt-12 text-sm text-roche-700 text-start">{tBooks("empty")}</p>
        )}
      </main>
    </>
  );
}
