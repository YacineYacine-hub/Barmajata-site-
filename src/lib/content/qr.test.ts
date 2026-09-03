import { describe, expect, it } from "vitest";
import { resoudreCibleQr } from "./qr";
import type { QrCode } from "./schema";

/*
 * Ces tests gardent une promesse faite à un objet imprimé : un QR code ne
 * mène JAMAIS à une 404. Le lecteur qui scanne a le livre entre les mains ;
 * « page introuvable » est la seule réponse qu'on ne peut pas se permettre.
 *
 * Le cas qui a motivé cette correction — un code pointant vers un slug
 * inexistant — produisait exactement cela, mesuré le 2026-09-03.
 */

function code(surcharge: Partial<QrCode> = {}): QrCode {
  return {
    code: "abc123",
    destination: "un-bonus",
    libelle: "Un bonus",
    actif: true,
    ...surcharge,
  };
}

describe("la règle qui prime : jamais une 404", () => {
  it("un code inconnu mène à l'accueil", () => {
    expect(resoudreCibleQr(undefined)).toEqual({ type: "accueil" });
  });

  it("un code désactivé après impression mène à l'accueil", () => {
    // Le support physique survit à la désactivation : on ne peut pas
    // rappeler les exemplaires déjà vendus.
    expect(resoudreCibleQr(code({ actif: false }))).toEqual({ type: "accueil" });
  });

  it("un code livre dont le slug n'existe pas mène à l'accueil", () => {
    // Faute de frappe dans la table, ou ouvrage supprimé. C'est le cas qui
    // produisait une 404 avant correction.
    const entree = code({ type: "livre", destination: "slug-fantome" });
    expect(resoudreCibleQr(entree, "absent")).toEqual({ type: "accueil" });
  });

  it("aucun cas ne renvoie de cible nulle", () => {
    const cas: Array<[QrCode | undefined, "visible" | "masque" | "absent" | undefined]> = [
      [undefined, undefined],
      [code({ actif: false }), undefined],
      [code(), undefined],
      [code({ type: "livre" }), "visible"],
      [code({ type: "livre" }), "masque"],
      [code({ type: "livre" }), "absent"],
    ];
    for (const [entree, etat] of cas) {
      expect(resoudreCibleQr(entree, etat).type).toBeTruthy();
    }
  });
});

describe("contenu bonus", () => {
  it("mène à la page déverrouillée", () => {
    expect(resoudreCibleQr(code({ destination: "grilles" }))).toEqual({
      type: "bonus",
      destination: "grilles",
    });
  });

  it("un type absent vaut « bonus » — les entrées d'origine restent valides", () => {
    const entree = code({ destination: "grilles" });
    delete (entree as Partial<QrCode>).type;
    expect(resoudreCibleQr(entree).type).toBe("bonus");
  });
});

describe("QR imprimé dans un ouvrage", () => {
  it("mène à la fiche quand le livre est visible", () => {
    const entree = code({ type: "livre", destination: "un-livre" });
    expect(resoudreCibleQr(entree, "visible")).toEqual({ type: "livre", slug: "un-livre" });
  });

  it("mène au club quand le livre existe mais n'est pas encore publié", () => {
    // Le seul cas où un QR a mieux à offrir qu'une page d'attente :
    // proposer d'être prévenu de la sortie. Situation réelle — le code est
    // attribué dès la création de la fiche, donc avant sa publication.
    const entree = code({ type: "livre", destination: "un-livre" });
    expect(resoudreCibleQr(entree, "masque")).toEqual({ type: "club", slug: "un-livre" });
  });

  it("ne mène jamais à la fiche d'un livre masqué", () => {
    // Un brouillon reste invisible partout, y compris par ce chemin.
    const entree = code({ type: "livre", destination: "un-livre" });
    expect(resoudreCibleQr(entree, "masque").type).not.toBe("livre");
  });
});
