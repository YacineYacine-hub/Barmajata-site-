import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { EditorialPage } from "@/components/EditorialPage";
import { buildAlternates } from "@/lib/seo";

export function generateMetadata(): Metadata {
  return { alternates: buildAlternates("/journal") };
}

export default async function JournalPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("pages.journal");
  const sections = t.raw("sections") as Array<{ heading: string; body: string }>;

  return (
    <EditorialPage eyebrow={t("eyebrow")} title={t("title")} lede={t("lede")} sections={sections} />
  );
}
