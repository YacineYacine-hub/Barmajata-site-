import Link from "next/link";

/**
 * 404 du segment `/bonus` (QR code inconnu, désactivé, ou adresse tapée à
 * la main). Rendue dans `bonus/layout.tsx`, qui fournit `<html>`/`<body>`
 * et le `noindex` du segment. Hors du routage next-intl : texte en
 * français (locale par défaut) et `next/link` brut plutôt que le `Link`
 * localisé de `@/i18n/navigation`, comme le reste du segment.
 */
export default function BonusNotFound() {
  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col justify-center ps-6 pe-6 py-16 text-center">
      <p className="text-sm font-medium uppercase tracking-wide text-roche-700">Erreur 404</p>
      <h1 className="mt-2 font-serif text-3xl text-nuit-900">Contenu introuvable</h1>
      <p className="mt-6 text-roche-700">
        Ce code ne correspond à aucun contenu débloqué. Il est peut-être
        expiré, ou l&apos;adresse a été mal recopiée.
      </p>
      <p className="mt-8">
        <Link
          href="/fr"
          className="inline-block rounded-md bg-nuit-900 px-6 py-3 text-sm font-medium text-lin-50 hover:bg-roche-700"
        >
          Retour à l&apos;accueil
        </Link>
      </p>
    </main>
  );
}
