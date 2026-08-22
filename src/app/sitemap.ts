import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { getPathname } from "@/i18n/navigation";

const SITE_URL = "https://www.barmajata.com";

const CANONICAL_PATHS = [
  "/",
  "/author",
  "/books",
  "/method",
  "/spirituality",
  "/commitment",
  "/journal",
  "/contact",
  "/legal-notice",
  "/terms-of-sale",
  "/privacy-policy",
  "/shipping-returns",
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  return CANONICAL_PATHS.map((href) => {
    const languages = Object.fromEntries(
      routing.locales.map((locale) => [
        locale,
        `${SITE_URL}${getPathname({ locale, href })}`,
      ]),
    );

    return {
      url: `${SITE_URL}${getPathname({ locale: routing.defaultLocale, href })}`,
      alternates: { languages },
    };
  });
}
