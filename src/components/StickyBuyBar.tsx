"use client";

import { useEffect, useState } from "react";
import { AmazonBuyButton } from "./AmazonBuyButton";
import type { ContentLocale } from "@/lib/content/schema";

const SCROLL_SHOW_THRESHOLD = 200;

/**
 * Barre collante mobile (titre, prix, bouton Amazon) sur la fiche livre.
 * Apparaît après 200px de scroll, masquée dès 768px de large (md:hidden —
 * coïncide avec le breakpoint md de Tailwind, pas de valeur arbitraire à
 * maintenir en double).
 */
export function StickyBuyBar({
  title,
  price,
  asin,
  urlOverride,
  locale,
}: {
  title: string;
  price?: string;
  asin?: string;
  urlOverride?: string;
  locale: ContentLocale;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setVisible(window.scrollY > SCROLL_SHOW_THRESHOLD);
    }
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-40 border-t border-sable-300 bg-lin-50 px-4 py-3 shadow-[0_-2px_8px_rgba(0,0,0,0.08)] transition-transform duration-200 md:hidden ${
        visible ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-nuit-900">{title}</p>
          {price && <p className="text-sm text-roche-700">{price}</p>}
        </div>
        <AmazonBuyButton asin={asin} urlOverride={urlOverride} locale={locale} />
      </div>
    </div>
  );
}
