import { BOOK_CATEGORIES, type BookCategory, type ContentLocale } from "./schema";

/**
 * Slug de `?categorie=` par locale — même principe que les pathnames
 * traduits de `src/i18n/routing.ts`, appliqué à une valeur de query plutôt
 * qu'à un segment d'URL. Les clés des fichiers de contenu (BOOK_CATEGORIES)
 * restent en français quelle que soit la locale.
 *
 * TODO(traduction humaine) : slugs arabes non fournis — l'anglais est
 * utilisé en attendant (voir aussi messages/ar.json, namespace "categories").
 */
export const CATEGORY_SLUGS: Record<ContentLocale, Record<BookCategory, string>> = {
  fr: {
    famille: "famille",
    psychologie: "psychologie",
    thriller: "thriller",
    "histoire-vraie": "histoire-vraie",
  },
  en: {
    famille: "family",
    psychologie: "psychology",
    thriller: "thriller",
    "histoire-vraie": "true-story",
  },
  ar: {
    famille: "family",
    psychologie: "psychology",
    thriller: "thriller",
    "histoire-vraie": "true-story",
  },
};

export function categoryToSlug(category: BookCategory, locale: ContentLocale): string {
  return CATEGORY_SLUGS[locale][category];
}

export function slugToCategory(slug: string, locale: ContentLocale): BookCategory | undefined {
  return BOOK_CATEGORIES.find((category) => CATEGORY_SLUGS[locale][category] === slug);
}
