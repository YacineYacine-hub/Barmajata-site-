import { notFound } from "next/navigation";

/**
 * Attrape toute URL inconnue sous un préfixe de locale valide
 * (`/fr/nimporte-quoi`) pour la renvoyer vers `[locale]/not-found.tsx`,
 * la 404 traduite et habillée du Header/Footer. Sans cette route, Next.js
 * remonte au `not-found.tsx` racine, hors contexte next-intl.
 *
 * Les routes réelles (statiques comme `/livres`, dynamiques comme
 * `/livres/[slug]`) restent prioritaires : un catch-all n'est retenu que
 * si aucune autre route ne correspond.
 */
export default function CatchAllPage() {
  notFound();
}
