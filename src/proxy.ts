import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

// Anciennes routes retirées définitivement (contenu absorbé par la fiche
// livre concernée, voir CLAUDE.md) : 410 Gone plutôt qu'un 404, pour
// signaler explicitement qu'il ne s'agit pas d'une simple page manquante.
const GONE_PATHS = new Set([
  "/fr/methode",
  "/en/method",
  "/ar/المنهج",
  "/fr/spiritualite",
  "/en/spirituality",
  "/ar/الروحانية",
]);

// Ancienne fiche autrice unique → catalogue auteurs, même locale. 301
// explicite (next.config.ts `redirects()` ne peut produire que du 307/308).
const RENAMED_PATHS: Record<string, string> = {
  "/fr/autrice": "/fr/auteurs",
  "/en/author": "/en/authors",
  "/ar/الكاتبة": "/ar/المؤلفون",
};

// Traité ici (avant next-intl) pour éviter que le middleware i18n ne
// traite ces chemins comme des segments inconnus et ne rende un 404
// générique à leur place. `nextUrl.pathname` n'est jamais décodé par
// Next.js (les segments non-ASCII restent en %XX) : on le décode nous-
// mêmes avant de comparer aux tables ci-dessus.
export default function proxy(request: NextRequest) {
  const pathname = decodeURIComponent(request.nextUrl.pathname);

  if (GONE_PATHS.has(pathname)) {
    return new NextResponse(null, { status: 410 });
  }

  const renamedTarget = RENAMED_PATHS[pathname];
  if (renamedTarget) {
    return NextResponse.redirect(new URL(renamedTarget, request.url), 301);
  }

  return intlMiddleware(request);
}

export const config = {
  // Runs on every path except: api routes, Next internals, the QR-code
  // redirect (/b/...), the generated sitemap/robots files, and files with
  // an extension (static assets). Those are intentionally kept outside the
  // locale-prefixed routing scheme.
  matcher: ["/((?!api|_next|_vercel|b/|sitemap\\.xml|robots\\.txt|.*\\..*).*)"],
};
