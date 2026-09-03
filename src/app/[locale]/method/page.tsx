import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { SectionBanner } from "@/components/SectionBanner";
import { Reveal } from "@/components/Reveal";
import { buildAlternates } from "@/lib/seo";

type Affirmation = { phrase: string; source: string; limite: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pages.method" });

  return {
    title: t("title"),
    description: t("lede"),
    alternates: buildAlternates("/method"),
  };
}

/**
 * « La méthode » — le fondement documenté des ouvrages.
 *
 * Nommée ainsi et NON « Le Lab » : on lit la recherche, on n'en mène pas,
 * et laisser croire l'inverse serait une version discrète du faux expert
 * (voir CLAUDE.md).
 *
 * La forme suit le fond. Chaque affirmation est **courte et frappante**,
 * puis immédiatement suivie de sa source, puis — quand il y en a une — de
 * sa limite. C'est cette troisième ligne qui fait la valeur de la page :
 * n'importe qui peut aligner des affirmations, presque personne ne publie
 * ce qui les affaiblit.
 *
 * Les tailles d'effet sont écrites en toutes lettres, y compris quand
 * elles sont petites. Voir docs/le-fondement-scientifique.md pour le
 * détail des sources et ce qu'il ne faut PAS citer.
 */
export default async function MethodPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("pages.method");
  const recit = t.raw("recit") as string[];
  const affirmations = t.raw("affirmations") as Affirmation[];

  return (
    <main>
      <SectionBanner eyebrow={t("eyebrow")} title={t("title")} lede={t("lede")} />

      {/* Le récit d'ouverture : un pas typographique au-dessus du corps
          courant, pour qu'on le lise avant de plonger dans les sources. */}
      <section className="mx-auto max-w-2xl ps-6 pe-6 pt-16">
        {recit.map((paragraphe, index) => (
          <p
            key={index}
            className={`text-lg leading-relaxed text-nuit-900 text-start ${index > 0 ? "mt-6" : ""}`}
          >
            {paragraphe}
          </p>
        ))}
      </section>

      <section className="mx-auto max-w-3xl ps-6 pe-6 py-20">
        <ul className="flex flex-col gap-16">
          {affirmations.map((affirmation, index) => (
            <li key={affirmation.phrase}>
              <Reveal index={index}>
                <p className="font-serif text-sous-titre text-nuit-900 text-start">
                  {affirmation.phrase}
                </p>

                <p className="mt-4 text-sm leading-relaxed text-roche-700 text-start">
                  <span className="font-medium uppercase tracking-[0.14em] text-nuit-900">
                    {t("sourceLabel")}
                  </span>
                  {" — "}
                  {affirmation.source}
                </p>

                {/* La limite n'est pas un aveu de faiblesse, c'est
                    l'argument. D'où un filet qui la distingue au lieu de
                    la faire passer pour une note de bas de page. */}
                {affirmation.limite ? (
                  <p className="mt-4 border-s-2 border-or-500 ps-4 text-sm leading-relaxed text-roche-700 text-start">
                    <span className="font-medium uppercase tracking-[0.14em] text-nuit-900">
                      {t("limiteLabel")}
                    </span>
                    {" — "}
                    {affirmation.limite}
                  </p>
                ) : null}
              </Reveal>
            </li>
          ))}
        </ul>
      </section>

      <section className="border-t border-nuit-900/10 bg-lin-100">
        <div className="mx-auto max-w-2xl ps-6 pe-6 py-20 text-start">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-roche-700">
            {t("regleTitre")}
          </p>
          <p className="mt-5 font-serif text-titre text-nuit-900">{t("regle")}</p>
          <p className="mt-6 text-roche-700">{t("regleSuite")}</p>
        </div>
      </section>
    </main>
  );
}
