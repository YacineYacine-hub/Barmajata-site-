"use client";

import { useParams } from "next/navigation";
import { routing } from "@/i18n/routing";
import { Link, usePathname } from "@/i18n/navigation";

const LOCALE_LABELS: Record<string, string> = {
  fr: "FR",
  en: "EN",
  ar: "AR",
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
