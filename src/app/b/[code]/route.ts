import { NextRequest, NextResponse } from "next/server";
import { routing } from "@/i18n/routing";
import { getPathname } from "@/i18n/navigation";
import { getBookBySlug, getQrCodeByCode } from "@/lib/content";
import { hasVisibleEdition } from "@/lib/content/schema";
import { resoudreCibleQr } from "@/lib/content/qr";

/**
 * Redirecteur des QR codes imprimés.
 *
 * La décision elle-même vit dans `resoudreCibleQr()` — séparée pour être
 * testable, parce que la règle qu'elle applique est une promesse faite à
 * un objet imprimé : **un QR ne mène jamais à une 404**.
 *
 * Cette route ne fait donc que deux choses : lire l'état du livre visé
 * dans le catalogue, et traduire la cible en URL.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params;
  const entry = getQrCodeByCode(code);

  // L'état du livre n'est calculé que si le code en désigne un. Un livre
  // existant mais dont aucune édition n'est visible (brouillon) est
  // « masqué », pas « absent » : la nuance décide entre le club et
  // l'accueil.
  let etatLivre: "visible" | "masque" | "absent" | undefined;
  if (entry?.type === "livre" || entry?.type === "avis") {
    const book = getBookBySlug(entry.destination);
    etatLivre = !book ? "absent" : hasVisibleEdition(book) ? "visible" : "masque";
  }

  const cible = resoudreCibleQr(entry, etatLivre);
  const locale = routing.defaultLocale;

  let target: string;
  switch (cible.type) {
    case "livre":
      target = getPathname({
        locale,
        href: { pathname: "/books/[slug]", params: { slug: cible.slug } },
      });
      if (cible.ancre) target += `#${cible.ancre}`;
      break;
    case "club":
      // Le livre existe mais n'est pas encore publié : plutôt que de
      // renvoyer le lecteur les mains vides, on lui propose d'être
      // prévenu. `/club` lit `?book=` côté client, sans rendre la page
      // dynamique.
      target = `${getPathname({ locale, href: "/club" })}?book=${encodeURIComponent(cible.slug)}`;
      break;
    case "bonus":
      // Segment hors préfixe de locale — voir le matcher de src/proxy.ts.
      target = `/bonus/${cible.destination}`;
      break;
    default:
      target = `/${locale}`;
  }

  return NextResponse.redirect(new URL(target, request.url), 302);
}
