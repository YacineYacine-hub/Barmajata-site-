import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { SectionBanner } from "@/components/SectionBanner";

/**
 * 404 localisée, rendue à l'intérieur de `[locale]/layout.tsx` (donc avec
 * Header/Footer et le provider next-intl). Elle couvre deux cas :
 *
 * - un `notFound()` levé par une page du segment (fiche livre ou auteur
 *   inconnue) ;
 * - une URL inconnue sous un préfixe de locale valide, via le catch-all
 *   `[...rest]/page.tsx` — sans lui, Next.js remonterait jusqu'à la 404
 *   racine (`src/app/not-found.tsx`), non traduite.
 *
 * `not-found.tsx` ne reçoit pas de `params` : impossible d'appeler
 * `setRequestLocale()` ici. On lit donc la locale de la requête via
 * `useTranslations` (isomorphe, fonctionne en composant serveur), et
 * cette page est rendue dynamiquement — acceptable pour une 404.
 */
export default function NotFound() {
  const t = useTranslations("errors.notFound");

  return (
    <main>
      <SectionBanner eyebrow={t("code")} title={t("title")} lede={t("lede")} />
      <div className="mx-auto max-w-3xl ps-6 pe-6 py-16">
        <div className="flex flex-wrap gap-4">
          <Link
            href="/"
            className="inline-block rounded-md bg-nuit-900 px-6 py-3 text-sm font-medium text-lin-50 hover:bg-roche-700"
          >
            {t("backHome")}
          </Link>
          <Link
            href="/books"
            className="inline-block rounded-md border border-sable-300 px-6 py-3 text-sm font-medium text-roche-700 hover:border-or-500 hover:text-or-500"
          >
            {t("browseBooks")}
          </Link>
        </div>
      </div>
    </main>
  );
}
