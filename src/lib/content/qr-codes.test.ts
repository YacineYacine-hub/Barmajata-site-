import { describe, expect, it } from "vitest";
import { LONGUEUR_CODE, codeValide, creerCode, creerCodeUnique, urlDuCode } from "./qr-codes";

/*
 * Un code de QR mal formé ne se découvre pas au premier scan : il se
 * découvre sur un tirage entier, quand il est trop tard. D'où des tests
 * sur des propriétés qu'on ne peut pas vérifier à l'œil.
 */

/** Générateur déterministe, pour des tests reproductibles. */
function suite(octets: number[]): (n: number) => Uint8Array {
  let i = 0;
  return (n: number) => {
    const out = new Uint8Array(n);
    for (let k = 0; k < n; k++) out[k] = octets[i++ % octets.length];
    return out;
  };
}

describe("forme du code", () => {
  it("fait toujours la longueur attendue", () => {
    for (let i = 0; i < 200; i++) {
      expect(creerCode()).toHaveLength(LONGUEUR_CODE);
    }
  });

  it("ne contient jamais de caractère ambigu", () => {
    // 0/O, 1/I/l, 5/S sont ceux qu'on confond en recopiant un code à la
    // main — ce qui arrive dès qu'un téléphone ne scanne pas.
    const ambigus = ["0", "O", "o", "1", "I", "l", "5", "S", "s"];
    for (let i = 0; i < 500; i++) {
      const code = creerCode();
      for (const c of ambigus) expect(code).not.toContain(c);
    }
  });

  it("ne contient aucune voyelle — un code ne doit jamais former de mot", () => {
    // Contrainte réelle : ces codes sont imprimés dans des livres pour
    // enfants. Aucun ne doit composer un mot par accident.
    for (let i = 0; i < 500; i++) {
      expect(creerCode()).not.toMatch(/[aeiouy]/i);
    }
  });

  it("valide ce qu'il produit, et refuse le reste", () => {
    expect(codeValide(creerCode())).toBe(true);
    expect(codeValide("trop-court")).toBe(false);
    expect(codeValide("aaaaaaaaaa")).toBe(false); // voyelles
    expect(codeValide("0000000000")).toBe(false); // caractère exclu
    expect(codeValide("")).toBe(false);
  });
});

describe("imprévisibilité", () => {
  it("ne produit pas deux fois le même code", () => {
    // Un code séquentiel se devine, donc se scanne avant publication —
    // et révélerait le catalogue à venir.
    const vus = new Set<string>();
    for (let i = 0; i < 2000; i++) vus.add(creerCode());
    expect(vus.size).toBe(2000);
  });

  it("rejette les octets qui biaiseraient le tirage, sans jamais bloquer", () => {
    // La taille de l'alphabet ne divise pas 256 : un modulo direct rendrait
    // les premiers signes plus fréquents. Les octets au-delà du plus grand
    // multiple sont donc rejetés — et le tirage recommence jusqu'à obtenir
    // la longueur voulue. On mélange des octets hauts, majoritairement
    // rejetables, à des octets bas : le code doit tout de même sortir,
    // complet et valide.
    const code = creerCode(suite([255, 254, 253, 252, 251, 250, 3, 7, 11, 19]));
    expect(code).toHaveLength(LONGUEUR_CODE);
    expect(codeValide(code)).toBe(true);
  });
});

describe("unicité face aux codes existants", () => {
  it("évite un code déjà pris", () => {
    const dejaPris = creerCode();
    const suivant = creerCodeUnique([dejaPris]);
    expect(suivant).not.toBe(dejaPris);
  });

  it("échoue bruyamment plutôt que de rendre un doublon", () => {
    // Générateur constant : impossible de produire autre chose. Mieux vaut
    // une erreur qu'un code réattribué — des exemplaires imprimés le
    // portent à vie.
    const constant = suite([7]);
    const code = creerCode(suite([7]));
    expect(() => creerCodeUnique([code], constant)).toThrow();
  });
});

describe("URL encodée dans le QR", () => {
  it("passe TOUJOURS par le redirecteur maison", () => {
    // Jamais l'adresse finale : c'est ce qui permet de rediriger un QR
    // déjà imprimé.
    expect(urlDuCode("https://www.barmajata.com", "abc")).toBe(
      "https://www.barmajata.com/b/abc",
    );
  });

  it("ne double pas la barre oblique si le site en porte une", () => {
    expect(urlDuCode("https://www.barmajata.com/", "abc")).toBe(
      "https://www.barmajata.com/b/abc",
    );
  });
});
