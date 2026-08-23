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
     * L'accueil est un livre ouvert (Lot H5). Le sombre ne subsiste que
     * dans deux bandes fines — l'en-tête et le pied de page — et tout ce
     * qui se trouve entre elles est du papier : deux pages séparées par
     * une marge centrale. Remplace la devanture sombre du Lot H2.
     *
     * La gouttière est posée AVANT le contenu et celui-ci est enveloppé
     * dans un bloc `relative z-10` : un élément positionné passe sinon
     * au-dessus du contenu en flux, et la marge masquerait le texte.
     */
    <main className="page-livre grain-papier grain-papier-large">
      <div aria-hidden="true" className="page-livre-gouttiere" />

      <div className="relative z-10">
        <Hero
          slides={[
            { eyebrow: t("heroEyebrow"), title: t("heroTitle"), subtitle: t("heroSubtitle") },
          ]}
        />

        {/* La bande est une vitrine (pas la boutique) : aucun filtre ici,
            voir BookBandSection sur /livres pour les puces de catégorie. */}
        {bandItems.length > 0 && (
          <section className="py-20">
            <BookBand items={bandItems} />
          </section>
        )}

        {/*
         * « Explorer » : quatre rectangles posés sur les pages, comme des
         * vignettes collées dans un cahier. Bord net et fond très
         * légèrement plus clair que le papier — ils doivent se détacher
         * par l'arête, pas par une ombre : une ombre portée sur du papier
         * plat trahirait le procédé.
         */}
        <section className="mx-auto max-w-5xl ps-6 pe-6 pt-16 pb-24">
          <h2 className="font-serif text-sous-titre text-nuit-900 text-start">
            {t("pillarsTitle")}
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {PILLARS.map((pillar, index) => (
              <Reveal key={pillar} index={index}>
                <Link
                  href={`/${pillar}`}
                  className="block h-full border border-roche-700/35 bg-lin-50/70 ps-5 pe-5 py-5 text-start transition-colors hover:border-nuit-900 hover:bg-lin-50"
                >
                  <h3 className="font-serif text-xl text-nuit-900">
                    {t(`pillars.${pillar}.title`)}
                  </h3>
                  <p className="mt-1 text-sm text-roche-700">
                    {t(`pillars.${pillar}.description`)}
                  </p>
                </Link>
              </Reveal>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
