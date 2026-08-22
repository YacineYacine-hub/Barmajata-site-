import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["fr", "en", "ar"],
  defaultLocale: "fr",
  localePrefix: "always",
  pathnames: {
    "/": "/",
    "/author": {
      fr: "/autrice",
      en: "/author",
      ar: "/الكاتبة",
    },
    "/books": {
      fr: "/livres",
      en: "/books",
      ar: "/الكتب",
    },
    "/method": {
      fr: "/methode",
      en: "/method",
      ar: "/المنهج",
    },
    "/spirituality": {
      fr: "/spiritualite",
      en: "/spirituality",
      ar: "/الروحانية",
    },
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
