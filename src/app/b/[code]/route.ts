import { NextRequest, NextResponse } from "next/server";
import { routing } from "@/i18n/routing";
import { getQrCodeByCode } from "@/lib/content";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params;
  const entry = getQrCodeByCode(code);
  // Code inconnu ou explicitement inactif → accueil, jamais une 404 (le
  // support physique du QR code peut survivre à sa désactivation).
  const target = entry?.actif ? `/bonus/${entry.destination}` : `/${routing.defaultLocale}`;

  return NextResponse.redirect(new URL(target, request.url), 302);
}
