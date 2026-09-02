import { BOOK_CATEGORIES, type BookCategory, type ContentLocale } from "./schema";

/**
 * Slug de `?categorie=` par locale — même principe que les pathnames
 * traduits de `src/i18n/routing.ts`, appliqué à une valeur de query plutôt
 * qu'à un segment d'URL. Les clés des fichiers de contenu (BOOK_CATEGORIES)
 * restent en français quelle que soit la locale.
 *
 * Les trois locales ont désormais leurs propres slugs. L'espagnol a
 * remplacé l'arabe au Lot H46 ; ses slugs, comme le reste de sa
 * traduction, restent à faire relire par un humain.
 */
export const CATEGORY_SLUGS: Record<ContentLocale, Record<BookCategory, string>> = {
  fr: {
    famille: "famille",
    psychologie: "psychologie",
    thriller: "thriller",
    "histoire-vraie": "histoire-vraie",
    "enfance": "enfance",
    "developpement-personnel": "developpement-personnel",
    "poesie-pensees": "poesie-pensees",
  },
  en: {
    famille: "family",
    psychologie: "psychology",
    thriller: "thriller",
    "histoire-vraie": "true-story",
    "enfance": "childhood",
    "developpement-personnel": "personal-growth",
    "poesie-pensees": "poetry-thoughts",
  },
  es: {
    famille: "familia",
    psychologie: "psicologia",
    thriller: "thriller",
    "histoire-vraie": "historia-real",
    "enfance": "infancia",
    "developpement-personnel": "desarrollo-personal",
    "poesie-pensees": "poesia-pensamientos",
  },
};

/**
 * Valeur de `?categorie=` pour le filtre « Nouveautés ».
 *
 * Elle vit ICI et non dans BookBandSection, qui est un module `"use
 * client"` : Next.js y substitue une référence client, et une constante
 * qu'on en importe depuis un composant serveur ne vaut pas ce qu'on croit.
 * Symptôme observé : le filtre passait sans rien filtrer.
 *
 * « Nouveautés » n'est pas une catégorie stockée mais un filtre calculé
 * (voir isNewRelease dans le schéma), d'où une constante à part.
 */
export const NEW_RELEASES_PARAM = "nouveautes";

export function categoryToSlug(category: BookCategory, locale: ContentLocale): string {
  return CATEGORY_SLUGS[locale][category];
}

export function slugToCategory(slug: string, locale: ContentLocale): BookCategory | undefined {
  return BOOK_CATEGORIES.find((category) => CATEGORY_SLUGS[locale][category] === slug);
}
