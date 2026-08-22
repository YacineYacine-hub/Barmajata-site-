import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["fr", "en", "ar"],
  defaultLocale: "fr",
  localePrefix: "always",
  pathnames: {
    "/": "/",
    "/authors": {
      fr: "/auteurs",
      en: "/authors",
      ar: "/المؤلفون",
    },
    "/authors/[slug]": {
      fr: "/auteurs/[slug]",
      en: "/authors/[slug]",
      ar: "/المؤلفون/[slug]",
    },
    "/books": {
      fr: "/livres",
      en: "/books",
      ar: "/الكتب",
    },
    "/books/[slug]": {
      fr: "/livres/[slug]",
      en: "/books/[slug]",
      ar: "/الكتب/[slug]",
    },
    "/house": {
      fr: "/la-maison",
      en: "/about",
      ar: "/من-نحن",
    },
    "/club": {
      fr: "/club",
      en: "/club",
      ar: "/النادي",
    },
    // Page construite mais hors menu et en noindex — voir le commentaire
    // dans src/app/[locale]/commitment/page.tsx.
    "/commitment": {
      fr: "/engagement",
      en: "/commitment",
      ar: "/الالتزام",
    },
    "/journal": {
      fr: "/journal",
      en: "/journal",
      ar: "/المدونة",
    },
    "/contact": {
      fr: "/contact",
      en: "/contact",
      ar: "/اتصل",
    },
    "/legal-notice": "/mentions-legales",
    "/terms-of-sale": "/cgv",
    "/privacy-policy": "/confidentialite",
    "/shipping-returns": "/livraison-retours",
  },
});

export type AppPathnames = keyof typeof routing.pathnames;
