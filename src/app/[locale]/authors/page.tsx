import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getAllAuthors } from "@/lib/content";
import type { ContentLocale } from "@/lib/content/schema";
import { buildAlternates } from "@/lib/seo";
import { Reveal } from "@/components/Reveal";

export function generateMetadata(): Metadata {
  return { alternates: buildAlternates("/authors") };
}

export default async function AuthorsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("pages.authors");
  const tAuthors = await getTranslations("authors");
  const contentLocale = locale as ContentLocale;

  const authors = getAllAuthors();

  return (
    <main className="mx-auto max-w-5xl ps-6 pe-6 py-16">
      <h1 className="font-serif text-4xl text-nuit-900 text-start">{t("title")}</h1>

      {authors.length === 0 ? (
        <p className="mt-6 text-roche-700 text-start">{tAuthors("empty")}</p>
      ) : (
        <ul className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {authors.map((author, index) => (
            <li
              key={author.slug}
              className="rounded-lg border border-sable-300 bg-lin-50 p-6"
            >
              <Reveal delayMs={index * 80}>
                <Link
                  href={{ pathname: "/authors/[slug]", params: { slug: author.slug } }}
                  className="block"
                >
                  <h2 className="font-serif text-xl text-nuit-900 text-start">{author.nom}</h2>
                  <p className="mt-2 text-sm text-roche-700 text-start">
                    {author.bioCourte[contentLocale]}
                  </p>
                </Link>
              </Reveal>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
