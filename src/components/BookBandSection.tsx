"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { BookBand, type BandItem } from "./BookBand";
import { BOOK_CATEGORIES, type BookCategory, type ContentLocale } from "@/lib/content/schema";
import { categoryToSlug, slugToCategory } from "@/lib/content/categories";

export type BandEntry = BandItem & { categories: BookCategory[]; isNew: boolean };

// Valeur réservée pour le filtre calculé "Nouveautés" — distinct des slugs
// de genre (jamais stocké, voir isNewRelease() dans schema.ts).
const NEW_RELEASES_PARAM = "nouveautes";

/**
 * Lit ?categorie= et remonte sa valeur au parent. Isolé dans son propre
 * composant + Suspense (useSearchParams l'exige), pour que SEULE cette
 * lecture soit différée à l'hydratation — la bande elle-même (voir
 * BookBandSection) reste rendue intégralement côté serveur : masquer un
 * élément filtré se fait après coup, sans jamais retirer son lien du DOM.
 */
function ActiveFilterReader({ onChange }: { onChange: (param: string | null) => void }) {
  const searchParams = useSearchParams();
  const param = searchParams.get("categorie");
  useEffect(() => {
    onChange(param);
  }, [param, onChange]);
  return null;
}

/**
 * Puces de filtre (Tout, Nouveautés, quatre genres) + BookBand. La bande
 * rend TOUJOURS la totalité de `entries` (liens réels, indexable) ; le
 * filtre actif ne fait que masquer visuellement les éléments non
 * concernés (`mutedSlugs`), après hydratation. Le catalogue en grille
 * classique, lui, reste complet et non filtré (voir books/page.tsx) : la
 * bande est une vitrine, pas la boutique.
 */
export function BookBandSection({
  entries,
  locale,
}: {
  entries: BandEntry[];
  locale: ContentLocale;
}) {
  const tCategories = useTranslations("categories");
  const [activeParam, setActiveParam] = useState<string | null>(null);

  const activeCategory =
    activeParam && activeParam !== NEW_RELEASES_PARAM
      ? slugToCategory(activeParam, locale)
      : undefined;
  const isNewFilter = activeParam === NEW_RELEASES_PARAM;

  const mutedSlugs = new Set(
    entries
      .filter((entry) => {
        if (isNewFilter) return !entry.isNew;
        if (activeCategory) return !entry.categories.includes(activeCategory);
        return false; // "Tout" : rien de masqué
      })
      .map((entry) => entry.slug),
  );

  const chips: Array<{ key: string; label: string; param?: string }> = [
    { key: "all", label: tCategories("all") },
    { key: "new", label: tCategories("new"), param: NEW_RELEASES_PARAM },
    ...BOOK_CATEGORIES.map((category) => ({
      key: category,
      label: tCategories(category),
      param: categoryToSlug(category, locale),
    })),
  ];

  return (
    <section className="mb-16">
      <Suspense fallback={null}>
        <ActiveFilterReader onChange={setActiveParam} />
      </Suspense>

      <ul className="mb-6 flex flex-wrap gap-2 ps-6 pe-6">
        {chips.map((chip) => {
          const isActive = chip.param ? chip.param === activeParam : !activeParam;
          return (
            <li key={chip.key}>
              <Link
                href={{ pathname: "/books", query: chip.param ? { categorie: chip.param } : {} }}
                aria-current={isActive ? "true" : undefined}
                className={`inline-block rounded-full border px-4 py-1.5 text-sm transition ${
                  isActive
                    ? "border-nuit-900 bg-nuit-900 text-lin-50"
                    : "border-sable-300 text-roche-700 hover:border-or-500"
                }`}
              >
                {chip.label}
              </Link>
            </li>
          );
        })}
      </ul>

      <BookBand items={entries} mutedSlugs={mutedSlugs} />
    </section>
  );
}
