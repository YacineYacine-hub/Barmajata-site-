import type { ContentLocale } from "@/lib/content/schema";

export const MARKETPLACE_CODES = [
  "fr",
  "ca",
  "be",
  "com",
  "co_uk",
  "com_au",
  "es",
  "de",
  "com_mx",
  "ae",
  "sa",
] as const;
export type MarketplaceCode = (typeof MARKETPLACE_CODES)[number];

export type MarketplaceConfig = {
  code: MarketplaceCode;
  /** Domaine Amazon après "amazon." (ex. "co.uk", "com.au"). */
  domaine: string;
  /** false = table présente mais marketplace non proposée dans l'UI. */
  actif: boolean;
  /** Tag d'affiliation par défaut pour cette marketplace. Aucun programme
   * d'affiliation actif en Phase 1 : toutes les entrées sont `undefined`. */
  tag?: string;
};

export const AMAZON_MARKETPLACES: Record<MarketplaceCode, MarketplaceConfig> = {
  fr: { code: "fr", domaine: "fr", actif: true },
  ca: { code: "ca", domaine: "ca", actif: true },
  be: { code: "be", domaine: "com.be", actif: true },
  com: { code: "com", domaine: "com", actif: true },
  co_uk: { code: "co_uk", domaine: "co.uk", actif: true },
  com_au: { code: "com_au", domaine: "com.au", actif: true },
  es: { code: "es", domaine: "es", actif: true },
  de: { code: "de", domaine: "de", actif: true },
  com_mx: { code: "com_mx", domaine: "com.mx", actif: true },
  ae: { code: "ae", domaine: "ae", actif: false },
  sa: { code: "sa", domaine: "sa", actif: false },
};

/** Marketplace par défaut selon la locale du site — jamais de géo-IP. */
export const DEFAULT_MARKETPLACE_BY_LOCALE: Record<ContentLocale, MarketplaceCode> = {
  fr: "fr",
  en: "com",
  es: "es",
};

export function getActiveMarketplaces(): MarketplaceConfig[] {
  return MARKETPLACE_CODES.map((code) => AMAZON_MARKETPLACES[code]).filter(
    (marketplace) => marketplace.actif,
  );
}

/**
 * Page de rédaction d'avis Amazon pour un ouvrage.
 *
 * Choix délibéré (Lot H14) : les avis de lecteurs sont recueillis **chez
 * Amazon**, pas sur ce site. L'achat s'y conclut, Amazon vérifie donc que
 * l'auteur de l'avis a réellement acheté le livre, et porte les
 * obligations de l'article L111-7-2 du Code de la consommation
 * (information sur le contrôle des avis, date, motif de rejet).
 *
 * Recueillir et publier des avis ici ferait basculer ces obligations sur
 * BARMAJATA, avec une amende administrative pouvant atteindre 375 000 €
 * pour une personne morale. Voir CLAUDE.md, « Avis de lecteurs ».
 */
export function buildAmazonReviewUrl(asin: string, marketplace: MarketplaceCode): string {
  const config = AMAZON_MARKETPLACES[marketplace];
  return `https://www.amazon.${config.domaine}/review/create-review?asin=${asin}`;
}

/** https://www.amazon.{domaine}/dp/{asin}[?tag=...] */
export function buildAmazonUrl(asin: string, marketplace: MarketplaceCode, tag?: string): string {
  const config = AMAZON_MARKETPLACES[marketplace];
  const url = new URL(`https://www.amazon.${config.domaine}/dp/${asin}`);

  const effectiveTag = tag ?? config.tag;
  if (effectiveTag) {
    url.searchParams.set("tag", effectiveTag);
  }

  return url.toString();
}
