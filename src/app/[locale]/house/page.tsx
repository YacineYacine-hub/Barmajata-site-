import { getTranslations, setRequestLocale } from "next-intl/server";
import { buildOrganizationJsonLd } from "@/lib/content/jsonld";
import { SITE_URL } from "@/lib/site";

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

  return (
    <main className="mx-auto max-w-3xl ps-6 pe-6 py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <h1 className="font-serif text-4xl text-ink-900 text-start">{t("title")}</h1>
      <p className="mt-6 text-ink-700 text-start">{t("body")}</p>
    </main>
  );
}
