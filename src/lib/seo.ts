import { getPathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { SITE_URL } from "@/lib/site";

/**
 * Locales indexables publiquement (hreflang, alternates).
 *
 * Les trois locales du site y figurent depuis le passage à `es` (Lot H46).
 * L'arabe en était exclu parce qu'il n'était pas jugé prêt ; l'espagnol,
 * lui, est un marché visé et n'aurait aucun intérêt hors de l'index.
 * **Sa traduction reste à faire relire par un humain** — voir CLAUDE.md.
 */
export const PUBLIC_LOCALES = ["fr", "en", "es"] as const;
export type PublicLocale = (typeof PUBLIC_LOCALES)[number];

type Href = Parameters<typeof getPathname>[0]["href"];

/**
 * `alternates.languages` pour `generateMetadata` : une entrée par locale
 * publique (y compris la locale courante), plus x-default vers le
 * français. Ne référence jamais une locale absente de PUBLIC_LOCALES,
 * quelle que soit la locale de la page qui l'appelle.
 */
export function buildAlternates(href: Href) {
  const languages: Record<string, string> = {};

  for (const locale of PUBLIC_LOCALES) {
    languages[locale] = `${SITE_URL}${getPathname({ locale, href })}`;
  }
  languages["x-default"] = `${SITE_URL}${getPathname({ locale: routing.defaultLocale, href })}`;

  return { languages };
}
