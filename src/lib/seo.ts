import { getPathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { SITE_URL } from "@/lib/site";

/**
 * Locales indexables publiquement (hreflang, alternates). "ar" reste
 * pleinement accessible sur le site mais volontairement absent d'ici tant
 * qu'il n'est pas jugé prêt pour l'indexation — voir CLAUDE.md.
 */
export const PUBLIC_LOCALES = ["fr", "en"] as const;
export type PublicLocale = (typeof PUBLIC_LOCALES)[number];

type Href = Parameters<typeof getPathname>[0]["href"];

/**
 * `alternates.languages` pour `generateMetadata` : une entrée par locale
 * publique (y compris la locale courante si elle est publique), plus
 * x-default vers le français. Ne référence jamais "ar" tant qu'il est hors
 * PUBLIC_LOCALES, quelle que soit la locale de la page qui l'appelle.
 */
export function buildAlternates(href: Href) {
  const languages: Record<string, string> = {};

  for (const locale of PUBLIC_LOCALES) {
    languages[locale] = `${SITE_URL}${getPathname({ locale, href })}`;
  }
  languages["x-default"] = `${SITE_URL}${getPathname({ locale: routing.defaultLocale, href })}`;

  return { languages };
}
