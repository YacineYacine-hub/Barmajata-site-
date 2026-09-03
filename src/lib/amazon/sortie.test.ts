import { describe, expect, it } from "vitest";
import { validerSortieAmazon } from "./sortie";

/*
 * `/sortie/amazon` est le SEUL endroit du site qui redirige d'après des
 * paramètres d'URL. C'est donc le seul qui pourrait devenir une
 * redirection ouverte : une adresse en barmajata.com menant chez
 * n'importe qui, avec la caution du domaine.
 *
 * Ces tests décrivent surtout ce qu'elle doit REFUSER.
 */

describe("ce que la sortie accepte", () => {
  it("laisse passer un ASIN bien formé vers une boutique active", () => {
    expect(validerSortieAmazon("B0TEST12345".slice(0, 10), "fr")).toEqual({
      asin: "B0TEST1234",
      marketplace: "fr",
    });
  });

  it("accepte l'Allemagne, marché visé sans que le site parle allemand", () => {
    expect(validerSortieAmazon("B0TEST1234", "de")?.marketplace).toBe("de");
  });
});

describe("résistance à la redirection ouverte", () => {
  it.each([
    ["URL complète en guise d'ASIN", "https://site-malveillant.example", "fr"],
    ["URL complète en guise de boutique", "B0TEST1234", "https://site-malveillant.example"],
    ["remontée de chemin", "../../evil", "fr"],
    ["double barre oblique", "//evil.example", "fr"],
    ["ASIN trop court", "B0TEST", "fr"],
    ["ASIN trop long", "B0TEST123456", "fr"],
    ["minuscules", "b0test1234", "fr"],
    ["ASIN vide", "", "fr"],
    ["boutique vide", "B0TEST1234", ""],
    ["boutique inconnue", "B0TEST1234", "zz"],
  ])("refuse : %s", (_cas, asin, marketplace) => {
    expect(validerSortieAmazon(asin, marketplace)).toBeUndefined();
  });

  it("refuse les paramètres absents", () => {
    expect(validerSortieAmazon(null, null)).toBeUndefined();
    expect(validerSortieAmazon("B0TEST1234", null)).toBeUndefined();
    expect(validerSortieAmazon(null, "fr")).toBeUndefined();
  });

  it("refuse les propriétés héritées du prototype", () => {
    // Le piège classique : `"toString" in objet` vaut true. Vérifier
    // l'appartenance avec `in` plutôt que contre la liste des codes
    // laisserait passer ces valeurs — et `AMAZON_MARKETPLACES.toString`
    // n'ayant pas de `domaine`, l'URL construite serait absurde.
    for (const piege of ["toString", "constructor", "__proto__", "valueOf", "hasOwnProperty"]) {
      expect(validerSortieAmazon("B0TEST1234", piege)).toBeUndefined();
    }
  });
});

describe("boutiques désactivées", () => {
  it.each([["ae"], ["sa"]])("refuse la boutique %s, désactivée dans la table", (code) => {
    // Elle n'est proposée nulle part dans l'interface : y mener par une
    // URL forgée n'aurait aucune raison d'être.
    expect(validerSortieAmazon("B0TEST1234", code)).toBeUndefined();
  });
});
