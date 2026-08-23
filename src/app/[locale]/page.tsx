import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { buildAlternates } from "@/lib/seo";
import { Hero } from "@/components/Hero";
import { Reveal } from "@/components/Reveal";
import { BookBand, type BandItem } from "@/components/BookBand";
import { getVisibleBooks } from "@/lib/content";
import { resolveEdition, type Book, type ContentLocale, type Edition } from "@/lib/content/schema";

const PILLARS = ["books", "authors", "house", "journal"] as const;

export function generateMetadata(): Metadata {
  return { alternates: buildAlternates("/") };
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const contentLocale = locale as ContentLocale;
  const bandItems: BandItem[] = getVisibleBooks()
    .map((book) => ({ book, edition: resolveEdition(book, contentLocale) }))
    .filter((entry): entry is { book: Book; edition: Edition } => entry.edition !== undefined)
    .map(({ book, edition }) => ({ slug: book.slug, title: edition.titre, coverSrc: book.couverture }));

  return <HomeContent bandItems={bandItems} />;
}

function HomeContent({ bandItems }: { bandItems: BandItem[] }) {
  const t = useTranslations("home");

  return (
    <main>
      <Hero
        slides={[
          { eyebrow: t("heroEyebrow"), title: t("heroTitle"), subtitle: t("heroSubtitle") },
        ]}
      />

      {/* La bande est une vitrine (pas la boutique) : aucun filtre ici,
          voir BookBandSection sur /livres pour les puces de catégorie. */}
      {bandItems.length > 0 && (
        <section className="py-16">
          <BookBand items={bandItems} />
        </section>
      )}

      <section className="mx-auto max-w-5xl ps-6 pe-6 py-20">
        <h2 className="font-serif text-2xl text-nuit-900 text-start">
          {t("pillarsTitle")}
        </h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          {PILLARS.map((pillar, index) => (
            <Reveal key={pillar} index={index}>
              <Link
                href={`/${pillar}`}
                className="block rounded-lg border border-sable-300 bg-lin-100 ps-6 pe-6 py-6 text-start transition hover:border-or-500"
              >
                <h3 className="font-serif text-xl text-nuit-900">
                  {t(`pillars.${pillar}.title`)}
                </h3>
                <p className="mt-2 text-sm text-roche-700">
                  {t(`pillars.${pillar}.description`)}
                </p>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>
    </main>
  );
}
