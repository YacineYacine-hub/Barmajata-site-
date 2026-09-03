import { AMAZON_MARKETPLACES, MARKETPLACE_CODES, type MarketplaceCode } from "./marketplaces";

/**
 * Validation de la sortie mesurée vers Amazon.
 *
 * Extraite de la route pour être testable : c'est le seul endroit du site
 * qui redirige d'après des paramètres d'URL, donc le seul qui pourrait
 * devenir une **redirection ouverte** — une adresse en `barmajata.com`
 * menant chez n'importe qui, avec la caution de notre domaine.
 *
 * Le principe tient en une phrase : **on ne redirige jamais vers une URL
 * reçue.** On reçoit un ASIN et un code de boutique, on les valide, et
 * l'URL est reconstruite ailleurs. Tout ce qui s'écarte de ce cadre est
 * refusé.
 */

/** Même forme que le schéma de contenu : 10 caractères, majuscules et chiffres. */
const ASIN = /^[A-Z0-9]{10}$/;

export type SortieValide = { asin: string; marketplace: MarketplaceCode };

/**
 * Renvoie la sortie si — et seulement si — les deux paramètres sont
 * valides et la boutique est active. Sinon `undefined`, et l'appelant
 * renvoie à l'accueil.
 */
export function validerSortieAmazon(
  asin: string | null,
  marketplace: string | null,
): SortieValide | undefined {
  if (!asin || !marketplace) return undefined;
  if (!ASIN.test(asin)) return undefined;

  // `in` sur un objet ne suffit pas : il accepterait "toString" ou
  // "constructor", hérités du prototype. On vérifie contre la liste.
  if (!(MARKETPLACE_CODES as readonly string[]).includes(marketplace)) return undefined;

  const code = marketplace as MarketplaceCode;
  // Une boutique désactivée n'est proposée nulle part : y mener par URL
  // forgée n'aurait aucune raison d'être.
  if (!AMAZON_MARKETPLACES[code].actif) return undefined;

  return { asin, marketplace: code };
}
