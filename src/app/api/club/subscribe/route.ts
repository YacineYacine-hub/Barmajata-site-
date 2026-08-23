import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { routing } from "@/i18n/routing";
import { getConfiguredProvider, sendTransactionalEmail } from "@/lib/club/providers";
import { createConfirmToken } from "@/lib/club/token";
import { buildConfirmationHtml, buildConfirmationSubject } from "@/lib/club/email";
import { SITE_URL } from "@/lib/site";

const bodySchema = z.object({
  email: z.string().email(),
  consent: z.literal(true),
  locale: z.enum(routing.locales),
  bookSlug: z.string().optional(),
  langue: z.enum(routing.locales).optional(),
});

/**
 * Premier temps du double opt-in : envoie un e-mail de confirmation
 * signé (voir src/lib/club/token.ts), n'ajoute PAS encore le contact à
 * la liste du fournisseur — cela n'a lieu qu'à la confirmation
 * (/api/club/confirm), pour un vrai double consentement.
 */
export async function POST(request: NextRequest) {
  if (!getConfiguredProvider()) {
    return NextResponse.json({ error: "service_unavailable" }, { status: 503 });
  }

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const { email, locale, bookSlug, langue } = parsed.data;

  const token = createConfirmToken({ email, bookSlug, langue });
  const confirmUrl = `${SITE_URL}/api/club/confirm?token=${encodeURIComponent(token)}&locale=${locale}`;

  try {
    await sendTransactionalEmail({
      to: email,
      subject: buildConfirmationSubject(locale),
      html: buildConfirmationHtml(confirmUrl, locale),
    });
  } catch (error) {
    console.error("[api/club/subscribe] échec d'envoi de l'e-mail de confirmation", error);
    return NextResponse.json({ error: "send_failed" }, { status: 502 });
  }

  return NextResponse.json({ ok: true }, { status: 202 });
}
