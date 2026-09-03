import { describe, expect, it } from "vitest";
import { CATEGORY_SLUGS, NEW_RELEASES_PARAM, categoryToSlug, slugToCategory } from "./categories";
import { BOOK_CATEGORIES, CONTENT_LOCALES } from "./schema";

/*
 * Les catégories sont devenues la navigation principale de l'accueil au
 * Lot H38 : chaque carte du menu mène au catalogue filtré. Un slug
 * manquant ou ambigu, et une entrée du menu mène à une page vide.
 */

describe("aller-retour entre catégorie et slug", () => {
  it("chaque catégorie retrouve la sienne, dans chaque langue", () => {
    for (const locale of CONTENT_LOCALES) {
      for (const categorie of BOOK_CATEGORIES) {
        const slug = categoryToSlug(categorie, locale);
        expect(slugToCategory(slug, locale)).toBe(categorie);
      }
    }
  });

  it("aucune langue n'oublie une catégorie", () => {
    for (const locale of CONTENT_LOCALES) {
      for (const categorie of BOOK_CATEGORIES) {
        expect(CATEGORY_SLUGS[locale][categorie]).toBeTruthy();
      }
    }
  });

  it("les slugs sont uniques à l'intérieur d'une même langue", () => {
    // Deux catégories partageant un slug rendraient l'une des deux
    // inatteignable, sans qu'aucune erreur ne se produise.
    for (const locale of CONTENT_LOCALES) {
      const slugs = BOOK_CATEGORIES.map((c) => categoryToSlug(c, locale));
      expect(new Set(slugs).size).toBe(slugs.length);
    }
  });

  it("un slug inconnu ne renvoie rien plutôt qu'une catégorie au hasard", () => {
    expect(slugToCategory("categorie-inexistante", "fr")).toBeUndefined();
  });

  it("un slug d'une autre langue n'est pas reconnu", () => {
    // « psicologia » ne doit pas fonctionner sur l'URL française : les
    // slugs traduits sont ce qui rend l'URL indexable dans sa langue.
    expect(slugToCategory("psicologia", "fr")).toBeUndefined();
    expect(slugToCategory("psychologie", "es")).toBeUndefined();
  });
});

describe("« Nouveautés » n'est pas une catégorie", () => {
  it("son paramètre ne correspond à aucune catégorie stockée", () => {
    // C'est un filtre calculé (isNewRelease), pas une valeur de contenu.
    // La constante vit hors du module client pour que sa valeur soit la
    // même côté serveur — piège rencontré au Lot H38.
    for (const locale of CONTENT_LOCALES) {
      expect(slugToCategory(NEW_RELEASES_PARAM, locale)).toBeUndefined();
    }
  });

  it("garde une valeur stable, non traduite", () => {
    expect(NEW_RELEASES_PARAM).toBe("nouveautes");
  });
});
