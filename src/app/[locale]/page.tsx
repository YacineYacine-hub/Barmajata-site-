import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";

const PILLARS = ["method", "spirituality", "commitment", "journal"] as const;

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <HomeContent />;
}

function HomeContent() {
  const t = useTranslations("home");

  return (
    <main>
      <section className="mx-auto max-w-3xl ps-6 pe-6 py-20 text-start">
        <p className="text-sm uppercase tracking-wide text-gold-600">
          {t("heroEyebrow")}
        </p>
        <h1 className="mt-3 font-serif text-5xl text-ink-900">
          {t("heroTitle")}
        </h1>
        <p className="mt-6 max-w-xl text-ink-700">{t("heroSubtitle")}</p>
      </section>

      <section className="mx-auto max-w-5xl ps-6 pe-6 pb-20">
        <h2 className="font-serif text-2xl text-ink-900 text-start">
          {t("pillarsTitle")}
        </h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          {PILLARS.map((pillar) => (
            <Link
              key={pillar}
              href={`/${pillar}`}
              className="block rounded-lg border border-sand-200 bg-sand-100 ps-6 pe-6 py-6 text-start transition hover:border-gold-500"
            >
              <h3 className="font-serif text-xl text-ink-900">
                {t(`pillars.${pillar}.title`)}
              </h3>
              <p className="mt-2 text-sm text-ink-700">
                {t(`pillars.${pillar}.description`)}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
