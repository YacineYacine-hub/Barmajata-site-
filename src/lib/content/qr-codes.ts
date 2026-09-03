/**
 * Fabrication des identifiants de QR code.
 *
 * Séparé de l'outil qui les écrit, pour être testable : un code mal formé
 * ne se découvre pas au premier scan, il se découvre sur un tirage entier.
 */

/*
 * ALPHABET — ni voyelles, ni caractères ambigus.
 *
 * Les voyelles sont retirées pour qu'aucun code ne forme un mot, en
 * français comme ailleurs : un code imprimé dans un livre pour enfants
 * n'a pas le droit de composer une grossièreté par accident. **`y` en
 * fait partie** — c'est une voyelle en français, et sa présence initiale
 * dans cet alphabet a été rattrapée par le test, pas par la relecture.
 *
 * Sont retirés en plus `0/O`, `1/I/l` et `5/S` : un code finit toujours
 * par être recopié à la main par quelqu'un dont le téléphone ne scanne
 * pas, et ces paires-là sont celles qu'on confond.
 */
const ALPHABET = "2346789bcdfghjkmnpqrtvwxz";

/**
 * Longueur d'un code. 10 caractères sur cet alphabet de 25 signes donnent
 * environ 9,5 × 10^13 combinaisons : deviner un code non publié est hors
 * de portée, ce qui compte puisqu'un QR est attribué **avant** la
 * publication de l'ouvrage.
 */
export const LONGUEUR_CODE = 10;

/** Un code est-il de la forme attendue ? */
export function codeValide(code: string): boolean {
  if (code.length !== LONGUEUR_CODE) return false;
  return [...code].every((c) => ALPHABET.includes(c));
}

/**
 * Fabrique un code opaque.
 *
 * **Jamais séquentiel** : un code prévisible se scanne avant d'être
 * publié, et révélerait le catalogue à venir. D'où un tirage aléatoire
 * cryptographique plutôt qu'un compteur.
 *
 * @param aleatoire  générateur d'octets — injecté pour que les tests
 *                   soient déterministes. Par défaut, celui du système.
 */
export function creerCode(aleatoire?: (n: number) => Uint8Array): string {
  const source =
    aleatoire ??
    ((n: number) => {
      const octets = new Uint8Array(n);
      crypto.getRandomValues(octets);
      return octets;
    });

  /*
   * Rejet des octets hors du plus grand multiple entier de la taille de
   * l'alphabet, plutôt qu'un simple modulo : celui-ci favoriserait les
   * premiers caractères de l'alphabet, ce qui rendrait les codes
   * légèrement plus devinables.
   */
  const plafond = Math.floor(256 / ALPHABET.length) * ALPHABET.length;
  let code = "";
  while (code.length < LONGUEUR_CODE) {
    for (const octet of source(LONGUEUR_CODE)) {
      if (octet >= plafond) continue;
      code += ALPHABET[octet % ALPHABET.length];
      if (code.length === LONGUEUR_CODE) break;
    }
  }
  return code;
}

/**
 * Fabrique un code qui ne collisionne avec aucun code existant.
 *
 * **Un code n'est jamais réutilisé**, même après retrait d'un ouvrage :
 * des exemplaires en circulation le portent à vie. La liste passée ici
 * doit donc contenir tous les codes ayant existé, pas seulement les
 * codes actifs.
 */
export function creerCodeUnique(
  codesExistants: Iterable<string>,
  aleatoire?: (n: number) => Uint8Array,
): string {
  const pris = new Set(codesExistants);
  for (let essai = 0; essai < 1000; essai++) {
    const code = creerCode(aleatoire);
    if (!pris.has(code)) return code;
  }
  // Injoignable en pratique — sauf si le générateur aléatoire injecté est
  // constant. Mieux vaut échouer bruyamment que rendre un doublon.
  throw new Error(
    "Impossible de produire un code unique après 1000 essais : le générateur aléatoire est-il constant ?",
  );
}

/** L'URL à encoder dans le QR imprimé. */
export function urlDuCode(siteUrl: string, code: string): string {
  return `${siteUrl.replace(/\/$/, "")}/b/${code}`;
}
