"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { SectionBanner } from "@/components/SectionBanner";

/**
 * Frontière d'erreur du segment localisé : rendue à la place de la page
 * (à l'intérieur de `[locale]/layout.tsx`, donc avec Header/Footer et le
 * provider next-intl — d'où l'accès à `useTranslations` côté client).
 *
 * Le message de l'exception n'est jamais affiché : en production Next.js
 * le remplace déjà par un texte générique, et l'exposer côté serveur
 * reviendrait à publier un détail d'implémentation. Il part en console
 * pour le débogage local et la collecte côté hébergeur.
 */
export default function LocaleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("errors.serverError");

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main>
      <SectionBanner eyebrow={t("code")} title={t("title")} lede={t("lede")} />
      <div className="mx-auto max-w-3xl ps-6 pe-6 py-16">
        <div className="flex flex-wrap gap-4">
          <button
            type="button"
            onClick={reset}
            className="rounded-md bg-nuit-900 px-6 py-3 text-sm font-medium text-lin-50 hover:bg-roche-700"
          >
            {t("retry")}
          </button>
          <Link
            href="/"
            className="inline-block rounded-md border border-sable-300 px-6 py-3 text-sm font-medium text-roche-700 hover:border-or-500 hover:text-or-500"
          >
            {t("backHome")}
          </Link>
        </div>
      </div>
    </main>
  );
}
