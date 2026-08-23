import { SectionBanner } from "@/components/SectionBanner";

type Section = { heading: string; body: string };

/**
 * Page éditoriale complète (bandeau nuit-900 + sections sur lin-50),
 * distincte de SectionPage (une seule ligne, réutilisée par les pages
 * légales). Réservée aux pages du Lot C — La maison, Journal, Contact.
 */
export function EditorialPage({
  eyebrow,
  title,
  lede,
  sections,
}: {
  eyebrow?: string;
  title: string;
  lede?: string;
  sections: Section[];
}) {
  return (
    <>
      <SectionBanner eyebrow={eyebrow} title={title} lede={lede} />
      <main className="mx-auto max-w-3xl ps-6 pe-6 py-16">
        {sections.map((section, index) => (
          <section key={section.heading} className={index > 0 ? "mt-10" : undefined}>
            <h2 className="font-serif text-2xl text-nuit-900 text-start">{section.heading}</h2>
            <p className="mt-3 text-roche-700 text-start">{section.body}</p>
          </section>
        ))}
      </main>
    </>
  );
}
