"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import {
  AMAZON_MARKETPLACES,
  DEFAULT_MARKETPLACE_BY_LOCALE,
  buildAmazonUrl,
  getActiveMarketplaces,
  type MarketplaceCode,
} from "@/lib/amazon/marketplaces";
import type { ContentLocale } from "@/lib/content/schema";

const COOKIE_NAME = "amazon_marketplace";

function readMarketplaceCookie(): MarketplaceCode | undefined {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie.match(new RegExp(`(?:^|; )${COOKIE_NAME}=([^;]+)`));
  const value = match?.[1];
  return value && value in AMAZON_MARKETPLACES ? (value as MarketplaceCode) : undefined;
}

function writeMarketplaceCookie(marketplace: MarketplaceCode) {
  document.cookie = `${COOKIE_NAME}=${marketplace}; path=/; max-age=31536000; SameSite=Lax`;
}

export function AmazonBuyButton({
  asin,
  urlOverride,
  locale,
}: {
  asin?: string;
  urlOverride?: string;
  locale: ContentLocale;
}) {
  const t = useTranslations("books");
  const active = getActiveMarketplaces();

  const [marketplace, setMarketplace] = useState<MarketplaceCode>(
    DEFAULT_MARKETPLACE_BY_LOCALE[locale],
  );

  // Lecture du cookie uniquement côté client, après hydratation : la page
  // reste statique (pas de lecture de cookie côté serveur, pas de
  // géo-IP), on applique la préférence mémorisée une fois montée.
  useEffect(() => {
    const cookieValue = readMarketplaceCookie();
    if (cookieValue && active.some((marketplaceConfig) => marketplaceConfig.code === cookieValue)) {
      setMarketplace(cookieValue);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (urlOverride) {
    return (
      <a
        href={urlOverride}
        target="_blank"
        rel="nofollow sponsored noopener"
        className="inline-block rounded-md bg-nuit-900 px-6 py-3 text-sm font-medium text-lin-50 hover:bg-roche-700"
      >
        {t("cta.buy")}
      </a>
    );
  }

  if (!asin) {
    return null;
  }

  function handleChange(next: MarketplaceCode) {
    setMarketplace(next);
    writeMarketplaceCookie(next);
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <a
        href={buildAmazonUrl(asin, marketplace)}
        target="_blank"
        rel="nofollow sponsored noopener"
        className="inline-block rounded-md bg-nuit-900 px-6 py-3 text-sm font-medium text-lin-50 hover:bg-roche-700"
      >
        {t("cta.buy")}
      </a>

      {active.length > 1 && (
        <select
          value={marketplace}
          onChange={(event) => handleChange(event.target.value as MarketplaceCode)}
          aria-label={t("cta.marketplace")}
          className="rounded-md border border-sable-300 bg-lin-50 px-3 py-2 text-sm text-nuit-900"
        >
          {active.map((marketplaceConfig) => (
            <option key={marketplaceConfig.code} value={marketplaceConfig.code}>
              {t(`marketplaces.${marketplaceConfig.code}`)}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}
