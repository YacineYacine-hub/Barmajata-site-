import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { buildAlternates } from "@/lib/seo";
import { Hero } from "@/components/Hero";
import { Reveal } from "@/components/Reveal";
import { BookBand, type BandItem } from "@/components/BookBand";
import { LivreARas } from "@/components/LivreARas";
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
    /* Devanture « Encre » (Lot H2) : l'accueil est la seule page au fond
       sombre de bout en bout — Header et Footer l'étaient déjà. Les pages
       de lecture restent claires (registre « Papier », Lot H3). */
    <main className="bg-nuit-950">
      <Hero
        slides={[
          { eyebrow: t("heroEyebrow"), title: t("heroTitle"), subtitle: t("heroSubtitle") },
        ]}
      />

      {/* La bande est une vitrine (pas la boutique) : aucun filtre ici,
          voir BookBandSection sur /livres pour les puces de catégorie. */}
      {bandItems.length > 0 && (
        <section className="py-20">
          <BookBand items={bandItems} registre="encre" />
        </section>
      )}

      {/* Réglure d'imprimeur : le liant entre les deux registres. En
          currentColor, donc réglée ici par la couleur du texte du bloc. */}
      {/* Les onglets sont tassés vers le bas : beaucoup d'air au-dessus,
          très peu en dessous, pour qu'ils viennent se poser sur le livre
          qui suit au lieu de flotter au milieu de la page. */}
      <section className="reglure grain-encre border-t border-lin-50/10 text-lin-50">
        <div className="mx-auto max-w-5xl ps-6 pe-6 pt-32 pb-10">
          <h2 className="font-serif text-sous-titre text-lin-50 text-start">
            {t("pillarsTitle")}
          </h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {PILLARS.map((pillar, index) => (
              <Reveal key={pillar} index={index}>
                <Link
                  href={`/${pillar}`}
                  className="block h-full rounded-lg border border-lin-50/12 bg-nuit-900/70 ps-6 pe-6 py-7 text-start shadow-nappe transition-colors hover:border-or-500 hover:bg-nuit-900"
                >
                  <h3 className="font-serif text-xl text-lin-50">
                    {t(`pillars.${pillar}.title`)}
                  </h3>
                  <p className="mt-2 text-sm text-sable-300">
                    {t(`pillars.${pillar}.description`)}
                  </p>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Pied de la devanture : le livre vu à ras, pleine largeur. Il
          ferme la page sur le sujet même du site, et sert d'assise aux
          onglets tassés juste au-dessus. */}
      <LivreARas />
    </main>
  );
}
