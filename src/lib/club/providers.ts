// Abstraction Brevo/Resend pour l'inscription au club (double opt-in).
// Un seul fournisseur actif à la fois, choisi par la variable
// d'environnement présente (BREVO_API_KEY prioritaire si les deux sont
// définies — cas non censé se produire). Aucune clé définie → toutes les
// fonctions ci-dessous lancent, l'appelant (route API) est responsable de
// vérifier getConfiguredProvider() avant d'appeler quoi que ce soit.
//
// Non testé en conditions réelles : aucune clé API vécue dans cette
// session (pas d'accès réseau sortant ni de navigateur). Vérifié par
// relecture du format des requêtes attendu par chaque fournisseur.

export type ClubProvider = "brevo" | "resend";

export function getConfiguredProvider(): ClubProvider | undefined {
  if (process.env.BREVO_API_KEY) return "brevo";
  if (process.env.RESEND_API_KEY) return "resend";
  return undefined;
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} manquant : configuration du club incomplète.`);
  }
  return value;
}

async function assertOk(response: Response, context: string): Promise<void> {
  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`${context} a échoué (${response.status}) : ${body.slice(0, 500)}`);
  }
}

type SendEmailInput = { to: string; subject: string; html: string };

async function sendViaBrevo({ to, subject, html }: SendEmailInput): Promise<void> {
  const apiKey = requireEnv("BREVO_API_KEY");
  const fromEmail = requireEnv("CLUB_FROM_EMAIL");
  const fromName = process.env.CLUB_FROM_NAME || "BARMAJATA";

  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": apiKey,
      "content-type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify({
      sender: { email: fromEmail, name: fromName },
      to: [{ email: to }],
      subject,
      htmlContent: html,
    }),
  });
  await assertOk(response, "Brevo (envoi transactionnel)");
}

async function sendViaResend({ to, subject, html }: SendEmailInput): Promise<void> {
  const apiKey = requireEnv("RESEND_API_KEY");
  const fromEmail = requireEnv("CLUB_FROM_EMAIL");
  const fromName = process.env.CLUB_FROM_NAME || "BARMAJATA";

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      authorization: `Bearer ${apiKey}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      from: `${fromName} <${fromEmail}>`,
      to: [to],
      subject,
      html,
    }),
  });
  await assertOk(response, "Resend (envoi transactionnel)");
}

export async function sendTransactionalEmail(input: SendEmailInput): Promise<void> {
  const provider = getConfiguredProvider();
  if (!provider) {
    throw new Error("Aucun fournisseur configuré (BREVO_API_KEY / RESEND_API_KEY).");
  }
  if (provider === "brevo") return sendViaBrevo(input);
  return sendViaResend(input);
}

async function addContactBrevo(email: string): Promise<void> {
  const apiKey = requireEnv("BREVO_API_KEY");
  const listIds = process.env.BREVO_LIST_ID
    ? [Number(process.env.BREVO_LIST_ID)]
    : undefined;

  const response = await fetch("https://api.brevo.com/v3/contacts", {
    method: "POST",
    headers: {
      "api-key": apiKey,
      "content-type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify({ email, listIds, updateEnabled: true }),
  });
  await assertOk(response, "Brevo (ajout contact)");
}

async function addContactResend(email: string): Promise<void> {
  const apiKey = requireEnv("RESEND_API_KEY");
  const audienceId = process.env.RESEND_AUDIENCE_ID;
  if (!audienceId) {
    // Resend structure ses contacts par audience : sans identifiant
    // d'audience, il n'y a nulle part où ajouter le contact. Le double
    // opt-in reste valide (l'e-mail a été confirmé), mais l'ajout à une
    // liste doit être complété manuellement tant que RESEND_AUDIENCE_ID
    // n'est pas configuré.
    throw new Error("RESEND_AUDIENCE_ID manquant : impossible d'ajouter le contact à une audience.");
  }

  const response = await fetch(`https://api.resend.com/audiences/${audienceId}/contacts`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${apiKey}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({ email, unsubscribed: false }),
  });
  await assertOk(response, "Resend (ajout contact)");
}

/** Ajoute définitivement l'e-mail à la liste du fournisseur — appelé
 * uniquement après confirmation du jeton (second temps du double opt-in),
 * jamais à l'inscription initiale. */
export async function addConfirmedContact(email: string): Promise<void> {
  const provider = getConfiguredProvider();
  if (!provider) {
    throw new Error("Aucun fournisseur configuré (BREVO_API_KEY / RESEND_API_KEY).");
  }
  if (provider === "brevo") return addContactBrevo(email);
  return addContactResend(email);
}
