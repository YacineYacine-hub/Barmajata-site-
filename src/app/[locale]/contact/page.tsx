import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { EditorialPage } from "@/components/EditorialPage";
import { buildAlternates } from "@/lib/seo";

export function generateMetadata(): Metadata {
  return { alternates: buildAlternates("/contact") };
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("pages.contact");
  const sections = t.raw("sections") as Array<{ heading: string; body: string }>;

  return (
    <EditorialPage eyebrow={t("eyebrow")} title={t("title")} lede={t("lede")} sections={sections} />
  );
}
