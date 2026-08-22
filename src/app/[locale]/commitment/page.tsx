import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { SectionPage } from "@/components/SectionPage";

// Page construite à l'avance mais volontairement tenue hors du menu et en
// noindex : le partenariat d'engagement associé n'est pas encore fixé.
// Retirer ce noindex et rajouter le lien dans Header.tsx et
// src/app/sitemap.ts une fois le partenariat confirmé.
export function generateMetadata(): Metadata {
  return { robots: { index: false, follow: false } };
}

export default async function CommitmentPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("pages.commitment");

  return <SectionPage title={t("title")} body={t("body")} />;
}
