import { NextRequest, NextResponse } from "next/server";
import { routing } from "@/i18n/routing";
import { addConfirmedContact } from "@/lib/club/providers";
import { verifyConfirmToken } from "@/lib/club/token";

function isSupportedLocale(value: string | null): value is (typeof routing.locales)[number] {
  return !!value && (routing.locales as readonly string[]).includes(value);
}

/**
 * Second temps du double opt-in : lien cliqué depuis l'e-mail de
 * confirmation. Le jeton (signé, 48h) prouve à lui seul le consentement —
 * c'est SEULEMENT ici que le contact est ajouté à la liste du
 * fournisseur (voir src/lib/club/providers.ts), jamais à l'inscription
 * initiale.
 */
export async function GET(request: NextRequest) {
  const localeParam = request.nextUrl.searchParams.get("locale");
  const locale = isSupportedLocale(localeParam) ? localeParam : routing.defaultLocale;

  const token = request.nextUrl.searchParams.get("token") ?? "";
  const payload = verifyConfirmToken(token);

  if (!payload) {
    return NextResponse.redirect(new URL(`/${locale}/club?confirm=invalid`, request.url));
  }

  try {
    await addConfirmedContact(payload.email);
  } catch (error) {
    console.error("[api/club/confirm] échec d'ajout du contact confirmé", error);
    return NextResponse.redirect(new URL(`/${locale}/club?confirm=error`, request.url));
  }

  return NextResponse.redirect(new URL(`/${locale}/club?confirm=success`, request.url));
}
