import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { EditorialPage } from "@/components/EditorialPage";
import { SectionPage } from "@/components/SectionPage";
import { buildAlternates } from "@/lib/seo";
import {
  identiteLegaleComplete,
  hebergeurComplet,
  lignesIdentite,
  lignesHebergeur,
} from "@/lib/legal";

type Section = { heading: string; body: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "legal.legalNotice" });

  return { title: t("title"), alternates: buildAlternates("/legal-notice") };
}

/**
 * Mentions légales.
 *
 * Le contenu réel n'est rendu QUE si l'identité de l'éditeur est
 * renseignée dans `src/lib/legal.ts`. Sinon la page garde son texte
 * d'attente : une mention légale à trous serait pire qu'une page vide,
 * et un document qui annonce un éditeur inexistant est faux.
 */
export default async function LegalNoticePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("legal.legalNotice");

  if (!identiteLegaleComplete()) {
    return <SectionPage title={t("title")} body={t("body")} />;
  }

  const sections: Section[] = [
    {
      heading: t("editeur"),
      body: lignesIdentite({
        directeur: t("labelDirecteur"),
        capital: t("labelCapital"),
        tva: t("labelTva"),
      }).join("\n"),
    },
    // L'hébergeur est une exigence propre aux mentions légales : la page
    // s'affiche sans lui si besoin, plutôt que de rester bloquée entière.
    ...(hebergeurComplet()
      ? [{ heading: t("hebergement"), body: lignesHebergeur().join("\n") }]
      : []),
    ...(t.raw("sections") as Section[]),
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
