import { describe, expect, it } from "vitest";
import {
  type Book,
  type Edition,
  getEpaisseurMm,
  getMinPrice,
  hasVisibleEdition,
  isNewRelease,
  isVisibleStatus,
  resolveEdition,
} from "./schema";

/*
 * Ces quatre fonctions décident de ce qu'un visiteur voit : quelle
 * édition d'un livre s'affiche, à quel prix, si le livre compte comme une
 * nouveauté. Elles n'ont aucune trace visible quand elles se trompent —
 * un livre disparaît simplement du catalogue, ou s'affiche au prix d'un
 * autre format.
 */

function edition(surcharge: Partial<Edition> = {}): Edition {
  return {
    langue: "fr",
    titre: "Un titre",
    resumeCourt: "Un résumé court.",
    resumeLong: "Un résumé long.",
    statut: "publie",
    ...surcharge,
  } as Edition;
}

function livre(editions: Edition[]): Book {
  return { slug: "un-livre", auteurSlug: "un-auteur", editions } as Book;
}

describe("choix de l'édition affichée", () => {
  it("prend celle de la langue demandée quand elle existe", () => {
    const book = livre([
      edition({ langue: "fr", titre: "Français" }),
      edition({ langue: "es", titre: "Español" }),
    ]);
    expect(resolveEdition(book, "es")?.titre).toBe("Español");
  });

  it("se replie sur la première édition visible quand la langue manque", () => {
    // Comportement voulu, pas un défaut : mieux vaut montrer le livre dans
    // sa langue d'origine que de le faire disparaître du catalogue.
    const book = livre([edition({ langue: "fr", titre: "Français" })]);
    expect(resolveEdition(book, "en")?.titre).toBe("Français");
  });

  it("ignore un brouillon MÊME dans la langue demandée", () => {
    // Le cas piégeux : l'édition existe dans la bonne langue, mais elle
    // est en brouillon. Elle ne doit jamais l'emporter.
    const book = livre([
      edition({ langue: "es", statut: "brouillon", titre: "Brouillon espagnol" }),
      edition({ langue: "fr", titre: "Français publié" }),
    ]);
    expect(resolveEdition(book, "es")?.titre).toBe("Français publié");
  });

  it("ne renvoie rien si toutes les éditions sont en brouillon", () => {
    const book = livre([edition({ statut: "brouillon" })]);
    expect(resolveEdition(book, "fr")).toBeUndefined();
    expect(hasVisibleEdition(book)).toBe(false);
  });

  it("« à paraître » est visible, « brouillon » ne l'est pas", () => {
    expect(isVisibleStatus("a_paraitre")).toBe(true);
    expect(isVisibleStatus("publie")).toBe(true);
    expect(isVisibleStatus("brouillon")).toBe(false);
  });
});

describe("prix affiché", () => {
  it("retient le format le moins cher", () => {
    const e = edition({
      formats: [
        { type: "broche", prixIndicatif: 21 },
        { type: "epub", prixIndicatif: 9.99 },
      ],
    });
    expect(getMinPrice(e)).toBe(9.99);
  });

  it("ne renvoie rien sans format — jamais zéro", () => {
    // Un prix de 0 s'afficherait comme « À partir de 0 € ».
    expect(getMinPrice(edition())).toBeUndefined();
    expect(getMinPrice(edition({ formats: [] }))).toBeUndefined();
  });
});

describe("épaisseur du livre en volume", () => {
  it("préfère la valeur explicite quand elle existe", () => {
    expect(getEpaisseurMm(edition({ epaisseurMm: 42 }))).toBe(42);
  });

  it("la dérive des pages du broché à défaut", () => {
    const e = edition({ formats: [{ type: "broche", prixIndicatif: 21, pages: 200 }] });
    expect(getEpaisseurMm(e)).toBeCloseTo(14, 5);
  });

  it("ignore les pages d'un format numérique", () => {
    // Un ePub n'a pas d'épaisseur physique : en déduire une donnerait un
    // livre en volume aux dimensions fantaisistes.
    const e = edition({ formats: [{ type: "epub", prixIndicatif: 9.99, pages: 200 }] });
    expect(getEpaisseurMm(e)).toBeUndefined();
  });
});

describe("filtre « Nouveautés »", () => {
  const reference = new Date("2026-06-15T12:00:00Z");

  it("retient une parution récente et publiée", () => {
    const e = edition({ dateParution: "2026-03-01" });
    expect(isNewRelease(e, reference)).toBe(true);
  });

  it("écarte une parution de plus de douze mois", () => {
    expect(isNewRelease(edition({ dateParution: "2025-01-01" }), reference)).toBe(false);
  });

  it("écarte une parution FUTURE", () => {
    // Sans quoi un livre annoncé pour l'an prochain serait « nouveauté »
    // aujourd'hui.
    expect(isNewRelease(edition({ dateParution: "2026-12-01" }), reference)).toBe(false);
  });

  it("écarte ce qui n'est pas publié, même daté d'hier", () => {
    const e = edition({ statut: "a_paraitre", dateParution: "2026-06-14" });
    expect(isNewRelease(e, reference)).toBe(false);
  });

  it("écarte une édition sans date", () => {
    expect(isNewRelease(edition(), reference)).toBe(false);
  });

  it("écarte une date illisible plutôt que de planter", () => {
    expect(isNewRelease(edition({ dateParution: "pas-une-date" }), reference)).toBe(false);
  });
});
