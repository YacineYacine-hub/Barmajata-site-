import { Suspense } from "react";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getVisibleBooks } from "@/lib/content";
import { isVisibleStatus, type ContentLocale } from "@/lib/content/schema";
import { ClubForm } from "@/components/ClubForm";
import { buildAlternates } from "@/lib/seo";

export function generateMetadata(): Metadata {
  return { alternates: buildAlternates("/club") };
}

export default async function ClubPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("club");
  const contentLocale = locale as ContentLocale;

  // Liste plate (slug + langue + titre) de toutes les éditions visibles,
  // calculée côté serveur pour que ClubForm résolve ?book=/&langue= côté
  // client sans lecture dynamique de searchParams côté serveur — la page
  // reste statique (voir CLAUDE.md, "rendu statique partout").
  const books = getVisibleBooks().flatMap((book) =>
    book.editions
      .filter((edition) => isVisibleStatus(edition.statut))
      .map((edition) => ({ slug: book.slug, langue: edition.langue, titre: edition.titre })),
  );

  return (
    <main className="mx-auto max-w-xl ps-6 pe-6 py-16">
      <h1 className="font-serif text-4xl text-nuit-900 text-start">{t("title")}</h1>
      <p className="mt-4 text-roche-700 text-start">{t("intro")}</p>

      <Suspense fallback={null}>
        <ClubForm books={books} />
      </Suspense>
    </main>
  );
}
