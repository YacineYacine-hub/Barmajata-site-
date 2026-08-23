import crypto from "node:crypto";

// Double opt-in sans base de données (Phase 1) : le jeton envoyé par
// e-mail porte lui-même l'adresse et son expiration, signées par HMAC —
// aucun état de confirmation en attente n'est stocké côté serveur entre
// l'inscription et le clic de confirmation.
const TOKEN_TTL_MS = 1000 * 60 * 60 * 48; // 48h pour confirmer

type TokenPayload = {
  email: string;
  bookSlug?: string;
  langue?: string;
  exp: number;
};

function getSecret(): string {
  const secret = process.env.CLUB_CONFIRM_SECRET;
  if (!secret) {
    throw new Error(
      "CLUB_CONFIRM_SECRET manquant : impossible de signer/vérifier un jeton d'inscription club.",
    );
  }
  return secret;
}

function sign(payload: string, secret: string): string {
  return crypto.createHmac("sha256", secret).update(payload).digest("base64url");
}

export function createConfirmToken(input: {
  email: string;
  bookSlug?: string;
  langue?: string;
}): string {
  const secret = getSecret();
  const payload: TokenPayload = { ...input, exp: Date.now() + TOKEN_TTL_MS };
  const encoded = Buffer.from(JSON.stringify(payload), "utf-8").toString("base64url");
  return `${encoded}.${sign(encoded, secret)}`;
}

/** Vérifie la signature ET l'expiration. Retourne le payload si valide,
 * sinon `undefined` (jeton falsifié, expiré, malformé, ou secret non
 * configuré — un jeton ne peut jamais faire planter cette route, il est
 * cliqué depuis un e-mail potentiellement ancien ou déjà traité). */
export function verifyConfirmToken(token: string): TokenPayload | undefined {
  let secret: string;
  try {
    secret = getSecret();
  } catch {
    return undefined;
  }
  const [encoded, signature] = token.split(".");
  if (!encoded || !signature) return undefined;

  const expected = Buffer.from(sign(encoded, secret));
  const actual = Buffer.from(signature);
  if (expected.length !== actual.length || !crypto.timingSafeEqual(expected, actual)) {
    return undefined;
  }

  let payload: TokenPayload;
  try {
    payload = JSON.parse(Buffer.from(encoded, "base64url").toString("utf-8"));
  } catch {
    return undefined;
  }

  if (typeof payload.email !== "string" || typeof payload.exp !== "number") return undefined;
  if (payload.exp < Date.now()) return undefined;

  return payload;
}
