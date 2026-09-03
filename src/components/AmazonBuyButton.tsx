"use client";

import { useState, useSyncExternalStore } from "react";
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

function parseMarketplaceCookie(cookieString: string): MarketplaceCode | undefined {
  const match = cookieString.match(new RegExp(`(?:^|; )${COOKIE_NAME}=([^;]+)`));
  const value = match?.[1];
  return value && value in AMAZON_MARKETPLACES ? (value as MarketplaceCode) : undefined;
}

function writeMarketplaceCookie(marketplace: MarketplaceCode) {
  document.cookie = `${COOKIE_NAME}=${marketplace}; path=/; max-age=31536000; SameSite=Lax`;
}

// document.cookie n'a pas d'événement de changement fiable à écouter :
// subscribe reste un no-op (pattern documenté par React pour une source
// externe qu'on lit une fois, sans mises à jour poussées).
function subscribeToCookie() {
  return () => {};
}
function getCookieSnapshot() {
  return document.cookie;
}
function getCookieServerSnapshot() {
  return "";
}

export function AmazonBuyButton({
  asin,
  urlOverride,
  locale,
  livreSlug,
}: {
  asin?: string;
  urlOverride?: string;
  locale: ContentLocale;
  /** Purement indicatif, pour la ligne de journal de `/sortie/amazon`.
   *  N'entre jamais dans l'URL construite vers Amazon. */
  livreSlug?: string;
}) {
  const t = useTranslations("books");
  const active = getActiveMarketplaces();

  // Lecture du cookie via useSyncExternalStore plutôt qu'un effet +
  // setState : hydratation sûre (snapshot serveur "" vs. snapshot client
  // réel) sans rendu en cascade — la page reste statique (pas de lecture
  // de cookie côté serveur, pas de géo-IP).
  const cookieString = useSyncExternalStore(
    subscribeToCookie,
    getCookieSnapshot,
    getCookieServerSnapshot,
  );
  const cookieMarketplace = parseMarketplaceCookie(cookieString);
  const cookieIsValid =
    cookieMarketplace && active.some((marketplaceConfig) => marketplaceConfig.code === cookieMarketplace);

  // Choix explicite de l'utilisateur pendant cette session, prioritaire
  // sur le cookie (qui vient de se faire écrire au moment du choix, donc
  // les deux convergent, mais évite d'attendre un re-render du snapshot).
  const [override, setOverride] = useState<MarketplaceCode | null>(null);
  const marketplace =
    override ?? (cookieIsValid ? (cookieMarketplace as MarketplaceCode) : DEFAULT_MARKETPLACE_BY_LOCALE[locale]);

  /*
   * `urlOverride` reste un lien DIRECT, donc non mesuré. C'est une URL
   * libre : la faire passer par la sortie mesurée obligerait à rediriger
   * vers une adresse reçue, c'est-à-dire à ouvrir exactement la brèche
   * que cette route existe pour éviter. Échappatoire rare, mesure perdue,
   * sécurité gardée.
   */
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
    setOverride(next);
    writeMarketplaceCookie(next);
  }

  return (
    <div className="flex flex-col items-start gap-2">
      {/*
        * Le lien passe par `/sortie/amazon` et non directement chez
        * Amazon : le clic devient une ligne dans le journal du serveur,
        * ce qui donne le rapport visites / clics d'achat **sans traceur,
        * sans cookie et sans script**.
        *
        * La route ne redirige jamais vers une URL reçue : elle valide
        * l'ASIN et la boutique, puis reconstruit l'adresse elle-même —
        * sans quoi ce serait une redirection ouverte. Voir
        * src/app/sortie/amazon/route.ts.
        */}
      <a
        href={`/sortie/amazon?asin=${encodeURIComponent(asin)}&m=${encodeURIComponent(marketplace)}${
          livreSlug ? `&livre=${encodeURIComponent(livreSlug)}` : ""
        }`}
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
