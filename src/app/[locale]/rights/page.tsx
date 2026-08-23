import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { EditorialPage } from "@/components/EditorialPage";
import { buildAlternates } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pages.rights" });

  return {
    title: t("title"),
    description: t("lede"),
    alternates: buildAlternates("/rights"),
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("pages.rights");
  const sections = t.raw("sections") as Array<{ heading: string; body: string }>;

  return (
    <EditorialPage
      eyebrow={t("eyebrow")}
      title={t("title")}
      lede={t("lede")}
      sections={sections}
    />
  );
}
