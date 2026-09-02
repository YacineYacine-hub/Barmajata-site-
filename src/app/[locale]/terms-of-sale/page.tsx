import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { EditorialPage } from "@/components/EditorialPage";
import { SectionPage } from "@/components/SectionPage";
import { buildAlternates } from "@/lib/seo";
import {
  identiteLegaleComplete,
} from "@/lib/legal";

type Section = { heading: string; body: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "legal.termsOfSale" });

  return { title: t("title"), alternates: buildAlternates("/terms-of-sale") };
}

/**
 * Conditions générales de vente. Elles disent surtout ce que ce site NE fait pas : il ne vend rien, la vente est conclue par Amazon.
 *
 * Le contenu réel n'est rendu QUE si l'identité de l'éditeur est
 * renseignée dans `src/lib/legal.ts`. Sinon la page garde son texte
 * d'attente : une mention légale à trous serait pire qu'une page vide,
 * et un document qui annonce un éditeur inexistant est faux.
 */
export default async function TermsOfSalePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("legal.termsOfSale");

  if (!identiteLegaleComplete()) {
    return <SectionPage title={t("title")} body={t("body")} />;
  }

  return (
    <EditorialPage
      eyebrow={t("eyebrow")}
      title={t("title")}
      lede={t("lede")}
      sections={t.raw("sections") as Section[]}
    />
  );
}
