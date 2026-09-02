"use client";

import { useParams } from "next/navigation";
import { routing } from "@/i18n/routing";
import { Link, usePathname } from "@/i18n/navigation";

/*
 * Typé sur les locales du routage, et NON en `Record<string, string>`.
 *
 * C'est ce qui manquait : au changement de locales du Lot H46, la table
 * était restée sur `ar` et le sélecteur n'affichait plus que FR et EN.
 * TypeScript n'avait rien signalé, puisqu'un `Record<string, string>`
 * accepte n'importe quelle clé et n'en exige aucune. Défaut silencieux,
 * trouvé au navigateur.
 *
 * Avec ce typage, ajouter une locale sans son libellé ne compile plus.
 */
const LOCALE_LABELS: Record<(typeof routing.locales)[number], string> = {
  fr: "FR",
  en: "EN",
  es: "ES",
};

// Couleurs figées pour fond sombre : utilisé dans Header.tsx et
// Footer.tsx, tous deux bg-nuit-900. À revoir si jamais réutilisé sur un
// fond clair ailleurs.
export function LocaleSwitcher() {
  const pathname = usePathname();
  const params = useParams();

  return (
    <ul className="flex items-center gap-3 text-sm">
      {routing.locales.map((locale) => {
        const isActive = params.locale === locale;
        return (
          <li key={locale}>
            <Link
              href={pathname as never}
              locale={locale}
              className={
                isActive
                  ? "font-semibold text-lin-50"
                  : "text-sable-300 hover:text-lin-50"
              }
              aria-current={isActive ? "true" : undefined}
            >
              {LOCALE_LABELS[locale]}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
