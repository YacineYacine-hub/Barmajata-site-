import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createConfirmToken, verifyConfirmToken } from "./token";

/*
 * Le jeton de confirmation du club est le seul mécanisme cryptographique
 * du projet, et il tient lieu de base de données : il porte lui-même
 * l'adresse et son expiration, signées. S'il se laisse falsifier,
 * n'importe qui inscrit n'importe quelle adresse.
 *
 * Ces tests vérifient donc surtout ce que le jeton doit REFUSER.
 */

const SECRET = "secret-de-test-suffisamment-long-pour-etre-realiste";

beforeEach(() => {
  process.env.CLUB_CONFIRM_SECRET = SECRET;
});

afterEach(() => {
  delete process.env.CLUB_CONFIRM_SECRET;
  vi.useRealTimers();
});

describe("aller-retour", () => {
  it("relit ce qu'il a écrit", () => {
    const token = createConfirmToken({ email: "lecteur@example.com" });
    expect(verifyConfirmToken(token)?.email).toBe("lecteur@example.com");
  });

  it("conserve le livre et la langue quand ils sont fournis", () => {
    const token = createConfirmToken({
      email: "lecteur@example.com",
      bookSlug: "un-livre",
      langue: "es",
    });
    const payload = verifyConfirmToken(token);
    expect(payload?.bookSlug).toBe("un-livre");
    expect(payload?.langue).toBe("es");
  });
});

describe("ce que le jeton refuse", () => {
  it("rejette une signature falsifiée", () => {
    const token = createConfirmToken({ email: "lecteur@example.com" });
    const [encoded] = token.split(".");
    expect(verifyConfirmToken(`${encoded}.signature-inventee`)).toBeUndefined();
  });

  it("rejette une charge utile modifiée, même signature conservée", () => {
    // Le scénario qui compte : quelqu'un remplace l'adresse par la sienne
    // en gardant la signature d'origine.
    const token = createConfirmToken({ email: "victime@example.com" });
    const [, signature] = token.split(".");
    const forge = Buffer.from(
      JSON.stringify({ email: "attaquant@example.com", exp: Date.now() + 10_000 }),
      "utf-8",
    ).toString("base64url");

    expect(verifyConfirmToken(`${forge}.${signature}`)).toBeUndefined();
  });

  it("rejette un jeton signé avec un autre secret", () => {
    const token = createConfirmToken({ email: "lecteur@example.com" });
    process.env.CLUB_CONFIRM_SECRET = "un-tout-autre-secret";
    expect(verifyConfirmToken(token)).toBeUndefined();
  });

  it.each([
    ["vide", ""],
    ["sans point", "abcdef"],
    ["charge utile seule", "abcdef."],
    ["signature seule", ".abcdef"],
    ["base64 invalide", "&&&.&&&"],
  ])("rejette un jeton malformé (%s)", (_cas, jeton) => {
    expect(verifyConfirmToken(jeton)).toBeUndefined();
  });
});

describe("expiration", () => {
  it("accepte juste avant 48 heures", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00Z"));
    const token = createConfirmToken({ email: "lecteur@example.com" });

    vi.setSystemTime(new Date("2026-01-02T23:59:00Z"));
    expect(verifyConfirmToken(token)).toBeDefined();
  });

  it("refuse juste après 48 heures", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00Z"));
    const token = createConfirmToken({ email: "lecteur@example.com" });

    vi.setSystemTime(new Date("2026-01-03T00:01:00Z"));
    expect(verifyConfirmToken(token)).toBeUndefined();
  });
});

describe("secret absent", () => {
  it("ne lance JAMAIS à la vérification, il renvoie undefined", () => {
    // Le comportement documenté, et il compte : un lien cliqué des mois
    // plus tard, ou sur un déploiement mal configuré, ne doit pas faire
    // planter la route — juste rediriger vers ?confirm=invalid.
    const token = createConfirmToken({ email: "lecteur@example.com" });
    delete process.env.CLUB_CONFIRM_SECRET;

    expect(() => verifyConfirmToken(token)).not.toThrow();
    expect(verifyConfirmToken(token)).toBeUndefined();
  });

  it("lance en revanche à la CRÉATION — une inscription silencieusement perdue serait pire", () => {
    delete process.env.CLUB_CONFIRM_SECRET;
    expect(() => createConfirmToken({ email: "lecteur@example.com" })).toThrow();
  });
});
