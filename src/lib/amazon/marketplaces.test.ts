import { describe, expect, it } from "vitest";
import {
  AMAZON_MARKETPLACES,
  DEFAULT_MARKETPLACE_BY_LOCALE,
  buildAmazonReviewUrl,
  buildAmazonUrl,
  getActiveMarketplaces,
} from "./marketplaces";
import { CONTENT_LOCALES } from "@/lib/content/schema";

/*
 * Ces URL sont le seul endroit où le site envoie un visiteur acheter.
 * Une erreur ici n'est pas visible sur une capture d'écran : le bouton
 * s'affiche, il mène simplement au mauvais endroit.
 */

describe("construction des liens d'achat", () => {
  it("mène à la fiche produit de la bonne boutique", () => {
    expect(buildAmazonUrl("B0TEST12345", "fr")).toBe(
      "https://www.amazon.fr/dp/B0TEST12345",
    );
  });

  it("respecte les domaines composés", () => {
    expect(buildAmazonUrl("B0TEST12345", "co_uk")).toContain("amazon.co.uk/dp/");
    expect(buildAmazonUrl("B0TEST12345", "com_au")).toContain("amazon.com.au/dp/");
    expect(buildAmazonUrl("B0TEST12345", "be")).toContain("amazon.com.be/dp/");
  });

  it("n'ajoute aucun paramètre d'affiliation tant qu'aucun n'est fourni", () => {
    // Phase 1 : aucun programme d'affiliation. Un « tag » qui apparaîtrait
    // sans avoir été demandé serait une balise de suivi non annoncée.
    expect(buildAmazonUrl("B0TEST12345", "fr")).not.toContain("tag=");
  });

  it("ajoute le paramètre d'affiliation quand il est fourni", () => {
    expect(buildAmazonUrl("B0TEST12345", "fr", "barmajata-21")).toContain(
      "tag=barmajata-21",
    );
  });
});

describe("lien de dépôt d'avis", () => {
  it("mène au formulaire d'avis d'Amazon, jamais à une page maison", () => {
    // Le choix de fond du Lot H14 : les avis se déposent chez Amazon, qui
    // vérifie l'achat et porte les obligations de l'article L111-7-2.
    expect(buildAmazonReviewUrl("B0TEST12345", "fr")).toBe(
      "https://www.amazon.fr/review/create-review?asin=B0TEST12345",
    );
  });
});

describe("boutique par défaut selon la langue du site", () => {
  it("couvre TOUTES les locales, sans exception", () => {
    // C'est le contrôle qui aurait signalé l'espagnol manquant lors du
    // changement de locales, si la table des libellés de langue avait été
    // typée aussi strictement que celle-ci.
    for (const locale of CONTENT_LOCALES) {
      expect(DEFAULT_MARKETPLACE_BY_LOCALE[locale]).toBeDefined();
    }
  });

  it("envoie chaque langue vers une boutique cohérente", () => {
    expect(DEFAULT_MARKETPLACE_BY_LOCALE.fr).toBe("fr");
    expect(DEFAULT_MARKETPLACE_BY_LOCALE.es).toBe("es");
    expect(DEFAULT_MARKETPLACE_BY_LOCALE.en).toBe("com");
  });

  it("ne désigne jamais une boutique désactivée", () => {
    for (const locale of CONTENT_LOCALES) {
      expect(AMAZON_MARKETPLACES[DEFAULT_MARKETPLACE_BY_LOCALE[locale]].actif).toBe(true);
    }
  });
});

describe("boutiques proposées au visiteur", () => {
  it("n'expose que les boutiques actives", () => {
    expect(getActiveMarketplaces().every((m) => m.actif)).toBe(true);
  });

  it("laisse de côté celles qui sont explicitement désactivées", () => {
    const codes = getActiveMarketplaces().map((m) => m.code);
    expect(codes).not.toContain("ae");
    expect(codes).not.toContain("sa");
  });

  it("propose l'Allemagne — le marché est visé sans que le site parle allemand", () => {
    expect(getActiveMarketplaces().map((m) => m.code)).toContain("de");
  });

  it("chaque entrée de la table a un code cohérent avec sa clé", () => {
    for (const [cle, config] of Object.entries(AMAZON_MARKETPLACES)) {
      expect(config.code).toBe(cle);
    }
  });
});
