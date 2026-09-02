import { SectionBanner } from "@/components/SectionBanner";

type Section = { heading: string; body: string };

/**
 * Page éditoriale complète (bandeau du registre Papier + sections sur
 * lin-50 — voir SectionBanner, passé au clair au Lot H3),
 * distincte de SectionPage (une seule ligne, qui ne sert plus qu'aux pages
 * légales tant que l'identité de l'éditeur n'est pas renseignée). Utilisée
 * par les pages du Lot C — La maison, Journal, Contact — et, depuis le Lot
 * H47, par les quatre pages légales une fois leur contenu débloqué.
 *
 * `whitespace-pre-line` sur le corps : le bloc d'identification légale est
 * une suite de lignes (raison sociale, adresse, immatriculation…) et non
 * un paragraphe. Sans lui, tout se collerait sur une seule ligne.
 * Le bandeau (h1) est un enfant direct de <main>, pas un frère : un
 * titre de page hors de tout repère (landmark) est signalé par les
 * contrôles d'accessibilité de type axe.
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
    <main>
      <SectionBanner eyebrow={eyebrow} title={title} lede={lede} />
      <div className="mx-auto max-w-3xl ps-6 pe-6 py-16">
        {sections.map((section, index) => (
          <section key={section.heading} className={index > 0 ? "mt-10" : undefined}>
            <h2 className="font-serif text-2xl text-nuit-900 text-start">{section.heading}</h2>
            <p className="mt-3 whitespace-pre-line text-roche-700 text-start">{section.body}</p>
          </section>
        ))}
      </div>
    </main>
  );
}
