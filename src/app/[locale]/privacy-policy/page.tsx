import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { EditorialPage } from "@/components/EditorialPage";
import { SectionPage } from "@/components/SectionPage";
import { buildAlternates } from "@/lib/seo";
import {
  identiteLegaleComplete,
  lignesIdentite,
  FOURNISSEUR_EMAIL,
} from "@/lib/legal";

type Section = { heading: string; body: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "legal.privacyPolicy" });

  return { title: t("title"), alternates: buildAlternates("/privacy-policy") };
}

/**
 * Politique de confidentialité. Son contenu décrit ce que le code fait réellement — une seule adresse e-mail, un seul cookie de préférence, aucun traceur.
 *
 * Le contenu réel n'est rendu QUE si l'identité de l'éditeur est
 * renseignée dans `src/lib/legal.ts`. Sinon la page garde son texte
 * d'attente : une mention légale à trous serait pire qu'une page vide,
 * et un document qui annonce un éditeur inexistant est faux.
 */
export default async function PrivacyPolicyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("legal.privacyPolicy");

  if (!identiteLegaleComplete()) {
    return <SectionPage title={t("title")} body={t("body")} />;
  }

  const tMentions = await getTranslations("legal.legalNotice");

  /*
   * Le nom du fournisseur d'envoi est injecté ici et non écrit dans les
   * traductions : il doit correspondre au fournisseur RÉELLEMENT
   * configuré (voir src/lib/club/providers.ts). Nommer le mauvais rendrait
   * l'information trompeuse. Tant qu'il n'est pas renseigné, la phrase
   * reste générique plutôt que fausse.
   */
  const fournisseur = FOURNISSEUR_EMAIL.nom
    ? `${FOURNISSEUR_EMAIL.nom}${FOURNISSEUR_EMAIL.pays ? ` (${FOURNISSEUR_EMAIL.pays})` : ""}`
    : t("fournisseurNonPrecise");

  const sections: Section[] = [
    {
      heading: t("responsable"),
      body: lignesIdentite({
        directeur: tMentions("labelDirecteur"),
        capital: tMentions("labelCapital"),
        tva: tMentions("labelTva"),
      }).join("\n"),
    },
    ...(t.raw("sections") as Section[]).map((section) => ({
      ...section,
      body: section.body.replace("{fournisseur}", fournisseur),
    })),
  ];

  return (
    <EditorialPage
      eyebrow={t("eyebrow")}
      title={t("title")}
      lede={t("lede")}
      sections={sections}
    />
  );
}
