import type { MetadataRoute } from "next";

const SITE_URL = "https://www.barmajata.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/b/", "/bonus/"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
