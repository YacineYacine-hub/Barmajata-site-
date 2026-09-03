import type { QrCode } from "./schema";

/**
 * Où mène un QR code, décidé à part de la route qui redirige.
 *
 * Séparé pour être **testable** : la règle qui compte ici est une
 * promesse faite à un objet imprimé, et elle ne doit pas dépendre d'un
 * serveur pour être vérifiée.
 *
 * LA RÈGLE : un QR imprimé ne mène JAMAIS à une 404. Le support physique
 * survit à toutes les décisions — un livre retiré du catalogue, une fiche
 * repassée en brouillon, un slug changé. Le lecteur qui scanne a le livre
 * entre les mains ; lui répondre « page introuvable » est la seule réponse
 * qu'on ne peut pas se permettre.
 *
 * Elle était tenue pour un code inconnu, pas pour une destination inconnue :
 * la route construisait l'URL de la fiche sans vérifier que le livre
 * existait, et la fiche répondait 404. Mesuré le 2026-09-03 sur un code
 * pointant vers un slug inexistant — corrigé ici.
 */
export type CibleQr =
  | { type: "accueil" }
  | { type: "bonus"; destination: string }
  | { type: "livre"; slug: string; ancre?: string }
  /**
   * Le livre existe mais **aucune de ses éditions n'est visible** — donc
   * `brouillon`, et `brouillon` seulement.
   *
   * Nuance à ne pas perdre : `a_paraitre` EST un statut visible. Un
   * ouvrage annoncé mène donc à sa fiche, où l'attend déjà le bouton
   * « Être informé·e de la sortie ». Ce cas-ci ne concerne que
   * l'ouvrage encore en brouillon — situation réelle, puisque le code est
   * attribué dès la création de la fiche, donc avant même l'annonce.
   *
   * Le club y répond alors de façon générique : il n'affiche pas le titre.
   * C'est délibéré et vérifié au navigateur — sa liste ne contient que les
   * éditions visibles, et un brouillon ne doit fuiter nulle part, pas même
   * par son titre. Le lecteur peut s'inscrire, ce qui est la seule chose
   * utile qu'on puisse lui offrir à ce stade.
   */
  | { type: "club"; slug: string };

/**
 * @param entry      l'entrée trouvée pour ce code, ou `undefined`
 * @param etatLivre  pour un code de type « livre » : l'état du slug visé.
 *                   `"visible"` mène à la fiche, `"masque"` au club,
 *                   `"absent"` à l'accueil. Fourni par l'appelant, qui
 *                   seul sait lire le catalogue.
 */
export function resoudreCibleQr(
  entry: QrCode | undefined,
  etatLivre?: "visible" | "masque" | "absent",
): CibleQr {
  // Code inconnu, ou désactivé après impression : accueil.
  if (!entry?.actif) return { type: "accueil" };

  if (entry.type !== "livre" && entry.type !== "avis") {
    return { type: "bonus", destination: entry.destination };
  }

  // Un code « avis » mène à la même fiche, ancrée sur son bloc d'avis.
  // C'est le QR de fin d'ouvrage : il évite au lecteur de chercher.
  const ancre = entry.type === "avis" ? "avis" : undefined;

  switch (etatLivre) {
    case "visible":
      return { type: "livre", slug: entry.destination, ancre };
    case "masque":
      return { type: "club", slug: entry.destination };
    default:
      // Slug inexistant : faute de frappe dans la table, ou ouvrage
      // supprimé. L'accueil plutôt qu'une page d'erreur.
      return { type: "accueil" };
  }
}
