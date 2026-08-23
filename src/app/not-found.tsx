import { Cormorant_Garamond, Inter } from "next/font/google";
import Link from "next/link";
import "./globals.css";

/**
 * 404 de dernier recours, hors de tout segment localisé : préfixe de
 * locale invalide (`/xx/...`, où `[locale]/layout.tsx` appelle
 * `notFound()` avant d'avoir pu rendre `<html>`), ou chemin sans locale
 * échappant au proxy. Les 404 « normales » du site passent par
 * `[locale]/not-found.tsx` (traduite, avec Header/Footer).
 *
 * Ce projet n'a pas de `src/app/layout.tsx` (voir `bonus/layout.tsx`) :
 * cette page doit donc déclarer elle-même `<html>`/`<body>` et charger
 * ses polices. Texte en français, la locale par défaut — la locale réelle
 * est par définition inconnue ou invalide dans ce cas.
 */
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-cormorant",
});

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export default function RootNotFound() {
  return (
    <html lang="fr" dir="ltr" className={`${cormorant.variable} ${inter.variable}`}>
      <body className="font-sans antialiased">
        <main className="mx-auto flex min-h-screen max-w-xl flex-col justify-center ps-6 pe-6 py-16 text-center">
          <p className="text-sm font-medium uppercase tracking-wide text-roche-700">Erreur 404</p>
          <h1 className="mt-2 font-serif text-3xl text-nuit-900">Page introuvable</h1>
          <p className="mt-6 text-roche-700">
            Cette adresse ne correspond à aucune page du site. Le lien est
            peut-être ancien, ou l&apos;adresse a été mal recopiée.
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
      </body>
    </html>
  );
}
