import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { SectionPage } from "@/components/SectionPage";
import { buildAlternates } from "@/lib/seo";

export function generateMetadata(): Metadata {
  return { alternates: buildAlternates("/terms-of-sale") };
}

export default async function TermsOfSalePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("legal.termsOfSale");

  return <SectionPage title={t("title")} body={t("body")} />;
}
