import { NextRequest, NextResponse } from "next/server";
import { routing } from "@/i18n/routing";
import { getPathname } from "@/i18n/navigation";
import { getQrCodeByCode } from "@/lib/content";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params;
  const entry = getQrCodeByCode(code);

  // Code inconnu ou explicitement inactif → accueil, jamais une 404 (le
  // support physique du QR code peut survivre à sa désactivation).
  //
  // Deux destinations possibles (Lot H14) : une page de contenu
  // déverrouillé, ou la fiche d'un livre — ce dernier cas sert au QR
  // imprimé dans l'ouvrage, qui ramène le lecteur à la fiche et donc à
  // son bloc d'avis. La fiche vit sous le préfixe de locale, contrairement
  // à /bonus qui en est exempté (voir le matcher de src/proxy.ts).
  let target = `/${routing.defaultLocale}`;
  if (entry?.actif) {
    target =
      entry.type === "livre"
        ? getPathname({
            locale: routing.defaultLocale,
            href: { pathname: "/books/[slug]", params: { slug: entry.destination } },
          })
        : `/bonus/${entry.destination}`;
  }

  return NextResponse.redirect(new URL(target, request.url), 302);
}
