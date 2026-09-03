import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["fr", "en", "es"],
  defaultLocale: "fr",
  localePrefix: "always",
  pathnames: {
    "/": "/",
    "/authors": {
      fr: "/auteurs",
      en: "/authors",
      es: "/autores",
    },
    "/authors/[slug]": {
      fr: "/auteurs/[slug]",
      en: "/authors/[slug]",
      es: "/autores/[slug]",
    },
    "/books": {
      fr: "/livres",
      en: "/books",
      es: "/libros",
    },
    "/books/[slug]": {
      fr: "/livres/[slug]",
      en: "/books/[slug]",
      es: "/libros/[slug]",
    },
    "/house": {
      fr: "/la-maison",
      en: "/about",
      es: "/la-editorial",
    },
    "/club": {
      fr: "/club",
      en: "/club",
      es: "/club",
    },
    // Page construite mais hors menu et en noindex — voir le commentaire
    // dans src/app/[locale]/commitment/page.tsx.
    "/commitment": {
      fr: "/engagement",
      en: "/commitment",
      es: "/compromiso",
    },
    // Page « La méthode » (Lot H50) : le fondement documenté des ouvrages.
    // Le slug dit « méthode » et non « laboratoire » — on LIT la recherche,
    // on n'en mène pas, et laisser croire l'inverse serait une version
    // discrète du faux expert (voir CLAUDE.md).
    "/method": {
      fr: "/la-methode",
      en: "/the-method",
      es: "/el-metodo",
    },
    "/journal": {
      fr: "/journal",
      en: "/journal",
      es: "/diario",
    },
    "/contact": {
      fr: "/contact",
      en: "/contact",
      es: "/contacto",
    },
    // Pages professionnelles (Lot H12). Un éditeur sans page manuscrits
    // reçoit les manuscrits n'importe où ; sans page droits, il ne reçoit
    // pas d'offres de cession. Elles ne sont pas dans le bandeau : elles
    // vivent dans le panneau du menu, sous « Professionnels ».
    "/submissions": {
      fr: "/manuscrits",
      en: "/submissions",
      es: "/manuscritos",
    },
    "/press": {
      fr: "/presse",
      en: "/press",
      es: "/prensa",
    },
    "/rights": {
      fr: "/droits",
      en: "/rights",
      es: "/derechos",
    },
    "/booksellers": {
      fr: "/libraires",
      en: "/booksellers",
      es: "/libreros",
    },
    "/faq": {
      fr: "/faq",
      en: "/faq",
      es: "/preguntas-frecuentes",
    },
    "/legal-notice": "/mentions-legales",
    "/terms-of-sale": "/cgv",
    "/privacy-policy": "/confidentialite",
    "/shipping-returns": "/livraison-retours",
  },
});

export type AppPathnames = keyof typeof routing.pathnames;
