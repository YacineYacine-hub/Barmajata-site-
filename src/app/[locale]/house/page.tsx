import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { EditorialPage } from "@/components/EditorialPage";
import { buildOrganizationJsonLd } from "@/lib/content/jsonld";
import { SITE_URL } from "@/lib/site";
import { buildAlternates } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pages.house" });

  return {
    title: t("title"),
    description: t("lede"),
    alternates: buildAlternates("/house"),
  };
}

export default async function HousePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("pages.house");
  const tSite = await getTranslations("site");

  const jsonLd = buildOrganizationJsonLd({
    siteUrl: SITE_URL,
    name: tSite("name"),
    description: tSite("tagline"),
  });

  const sections = t.raw("sections") as Array<{ heading: string; body: string }>;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <EditorialPage
        eyebrow={t("eyebrow")}
        title={t("title")}
        lede={t("lede")}
        sections={sections}
      />
    </>
  );
}
