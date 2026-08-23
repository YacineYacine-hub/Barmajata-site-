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
    /*
     * Registre moderne (Lot H8). La simulation de papier — grain, lignes
     * de cahier, marges, auréoles, pli central — a été retirée : empilée,
     * elle ne pouvait produire que de l'ancien.
     *
     * Ce qui la remplace n'est pas une autre texture, c'est de l'absence :
     * un fond quasi uni, beaucoup d'air, une typographie nette, et les
     * couvertures présentées comme des objets posés dans le vide (voir
     * `--shadow-flottant`).
     */
    <main className="bg-lin-50">
      <Hero
        slides={[
          { eyebrow: t("heroEyebrow"), title: t("heroTitle"), subtitle: t("heroSubtitle") },
        ]}
      />

      {/* La bande est une vitrine (pas la boutique) : aucun filtre ici,
          voir BookBandSection sur /livres pour les puces de catégorie. */}
      {bandItems.length > 0 && (
        <section className="pb-28">
          <BookBand items={bandItems} />
        </section>
      )}

      {/*
       * « Explorer » : plus de rectangles bordés. Une liste, séparée par
       * des filets d'un pixel, où seul le mot compte. Le chevron apparaît
       * au survol — l'interface ne s'annonce pas avant qu'on la sollicite.
       */}
      <section className="mx-auto max-w-4xl ps-6 pe-6 pb-32">
        <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-roche-700 text-start">
          {t("pillarsTitle")}
        </h2>
        <ul className="mt-8 border-t border-nuit-900/10">
          {PILLARS.map((pillar, index) => (
            <li key={pillar} className="border-b border-nuit-900/10">
              <Reveal index={index}>
                <Link
                  href={`/${pillar}`}
                  className="group flex items-baseline justify-between gap-6 py-6 text-start transition-opacity hover:opacity-60"
                >
                  <span className="font-serif text-2xl text-nuit-900 sm:text-3xl">
                    {t(`pillars.${pillar}.title`)}
                  </span>
                  <span className="hidden text-sm text-roche-700 sm:block sm:flex-1">
                    {t(`pillars.${pillar}.description`)}
                  </span>
                  <span
                    aria-hidden="true"
                    className="shrink-0 text-lg text-roche-700 opacity-0 transition-opacity group-hover:opacity-100 rtl:-scale-x-100"
                  >
                    &rarr;
                  </span>
                </Link>
              </Reveal>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
