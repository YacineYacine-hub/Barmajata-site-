import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

/**
 * Bande de bas de page : invitation à s'abonner, puis les deux liens
 * d'aide. Posée **au-dessus** du pied de page, qui doit rester un filet
 * fin (Lot H5) — d'où une bande distincte plutôt qu'un footer épaissi.
 *
 * Le bouton mène à `/club`, où vit le vrai formulaire avec son double
 * consentement : pas de second formulaire ici, qui dupliquerait la
 * logique de consentement RGPD à deux endroits.
 *
 * Composant serveur : aucun JavaScript envoyé.
 */
export function BlocAbonnement() {
  const t = useTranslations("club.bloc");
  const tNav = useTranslations("nav");

  return (
    /*
     * `aria-labelledby` n'est pas décoratif : une <section> ne devient un
     * repère (landmark) qu'à condition d'avoir un nom accessible. Sans lui,
     * ce bloc était le seul contenu de la page hors de tout repère — relevé
     * par l'audit axe du 2026-09-02, sur toutes les pages.
     */
    <section aria-labelledby="abonnement-titre" className="border-t border-nuit-900/10 bg-lin-50">
      <div className="mx-auto flex max-w-4xl flex-col gap-8 ps-6 pe-6 py-16 sm:flex-row sm:items-end sm:justify-between">
        <div className="text-start">
          <h2 id="abonnement-titre" className="font-serif text-sous-titre text-nuit-900">
            {t("title")}
          </h2>
          <p className="mt-3 max-w-sm text-roche-700">{t("lede")}</p>
        </div>

        <div className="flex flex-col items-start gap-5 sm:items-end">
          <Link
            href="/club"
            className="inline-block rounded-md bg-nuit-900 px-6 py-3 text-sm font-medium text-lin-50 transition-opacity hover:opacity-80"
          >
            {t("cta")}
          </Link>

          <ul className="flex items-center gap-6 text-sm text-roche-700">
            <li>
              <Link href="/faq" className="underline underline-offset-4 hover:text-nuit-900">
                {tNav("faq")}
              </Link>
            </li>
            <li>
              <Link href="/contact" className="underline underline-offset-4 hover:text-nuit-900">
                {tNav("contact")}
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
