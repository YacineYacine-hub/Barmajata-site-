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

// Corps de la réponse 410. Le middleware ne peut pas rendre un composant
// React ni changer le statut d'un `rewrite` (Next.js ne l'autorise que
// pour les en-têtes) : la page est donc écrite ici, en HTML autonome,
// styles en ligne et valeurs de palette en dur. Les libellés sont
// volontairement dupliqués ici plutôt que lus dans `messages/*.json` —
// importer les trois fichiers de traduction alourdirait le bundle du
// middleware, exécuté à chaque requête.
const GONE_TEXT = {
  fr: {
    lang: "fr",
    dir: "ltr",
    code: "Erreur 410",
    title: "Page retirée",
    lede: "Cette page a été retirée définitivement. Son contenu a été repris dans la fiche du livre concerné.",
    home: "Retour à l\u2019accueil",
  },
  en: {
    lang: "en",
    dir: "ltr",
    code: "Error 410",
    title: "Page removed",
    lede: "This page has been permanently removed. Its content now lives on the relevant book page.",
    home: "Back to the home page",
  },
  ar: {
    lang: "ar",
    dir: "rtl",
    code: "\u062e\u0637\u0623 410",
    title: "\u0635\u0641\u062d\u0629 \u0645\u062d\u0630\u0648\u0641\u0629",
    lede: "\u0623\u064f\u0632\u064a\u0644\u062a \u0647\u0630\u0647 \u0627\u0644\u0635\u0641\u062d\u0629 \u0646\u0647\u0627\u0626\u064a\u064b\u0627. \u0627\u0646\u062a\u0642\u0644 \u0645\u062d\u062a\u0648\u0627\u0647\u0627 \u0625\u0644\u0649 \u0635\u0641\u062d\u0629 \u0627\u0644\u0643\u062a\u0627\u0628 \u0627\u0644\u0645\u0639\u0646\u064a.",
    home: "\u0627\u0644\u0639\u0648\u062f\u0629 \u0625\u0644\u0649 \u0627\u0644\u0635\u0641\u062d\u0629 \u0627\u0644\u0631\u0626\u064a\u0633\u064a\u0629",
  },
} as const;

function goneResponse(pathname: string) {
  const prefix = pathname.split("/")[1];
  const t =
    prefix === "en" || prefix === "ar" ? GONE_TEXT[prefix] : GONE_TEXT.fr;

  const body = `<!doctype html>
<html lang="${t.lang}" dir="${t.dir}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>${t.title} — BARMAJATA</title>
<link rel="icon" href="/brand/favicon.svg">
</head>
<body style="margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;background-color:#fbf8f2;color:#2a2521;font-family:ui-sans-serif,system-ui,sans-serif;padding:1.5rem;text-align:center">
<main style="max-width:36rem">
<p style="margin:0;font-size:.875rem;font-weight:500;text-transform:uppercase;letter-spacing:.05em;color:#5a5048">${t.code}</p>
<h1 style="margin:.5rem 0 0;font-family:ui-serif,Georgia,serif;font-size:1.875rem;font-weight:400">${t.title}</h1>
<p style="margin:1.5rem 0 0;color:#5a5048">${t.lede}</p>
<p style="margin:2rem 0 0"><a href="/${t.lang}" style="display:inline-block;border-radius:.375rem;background-color:#2a2521;color:#fbf8f2;padding:.75rem 1.5rem;font-size:.875rem;font-weight:500;text-decoration:none">${t.home}</a></p>
</main>
</body>
</html>`;

  return new NextResponse(body, {
    status: 410,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

// Traité ici (avant next-intl) pour éviter que le middleware i18n ne
// traite ces chemins comme des segments inconnus et ne rende un 404
// générique à leur place. `nextUrl.pathname` n'est jamais décodé par
// Next.js (les segments non-ASCII restent en %XX) : on le décode nous-
// mêmes avant de comparer aux tables ci-dessus.
export default function proxy(request: NextRequest) {
  const pathname = decodeURIComponent(request.nextUrl.pathname);

  if (GONE_PATHS.has(pathname)) {
    return goneResponse(pathname);
  }

  const renamedTarget = RENAMED_PATHS[pathname];
  if (renamedTarget) {
    return NextResponse.redirect(new URL(renamedTarget, request.url), 301);
  }

  return intlMiddleware(request);
}

export const config = {
  // Runs on every path except: api routes, Next internals, the QR-code
  // redirect (/b/...) and its unlocked-content target (/bonus/...), the
  // generated sitemap/robots files, and files with an extension (static
  // assets). Those are intentionally kept outside the locale-prefixed
  // routing scheme.
  matcher: ["/((?!api|_next|_vercel|b/|bonus/|sitemap\\.xml|robots\\.txt|.*\\..*).*)"],
};
