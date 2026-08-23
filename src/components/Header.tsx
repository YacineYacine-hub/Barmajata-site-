"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { LocaleSwitcher } from "./LocaleSwitcher";

type NavHref = "/books" | "/authors" | "/house" | "/journal" | "/contact";

const SCROLL_SHRINK_THRESHOLD = 80;

export function Header() {
  const t = useTranslations("nav");
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Bandeau plein nuit-900, toujours séparé du héro (jamais en overlay
  // transparent dessus) : sticky pour rester visible, réduit sa hauteur
  // au-delà de 80px de défilement.
  useEffect(() => {
    function handleScroll() {
      setIsScrolled(window.scrollY > SCROLL_SHRINK_THRESHOLD);
    }
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // "/commitment" (engagement) est volontairement absent : page hors menu
  // tant que le partenariat n'est pas fixé, voir commitment/page.tsx.
  const links: Array<{ href: NavHref; label: string }> = [
    { href: "/books", label: t("books") },
    { href: "/authors", label: t("authors") },
    { href: "/house", label: t("house") },
    { href: "/journal", label: t("journal") },
    { href: "/contact", label: t("contact") },
  ];

  return (
    <header className="sticky top-0 z-50 bg-nuit-900">
      <div
        className={`mx-auto flex max-w-5xl items-center justify-between gap-4 ps-6 pe-6 transition-[padding] duration-200 ${
          isScrolled ? "py-2" : "py-4"
        }`}
      >
        {/* dir="ltr" fixe : le logo ne doit jamais se miroiter ni se
            réordonner en RTL (voir CLAUDE.md, Lot 3). alt volontairement
            en dur, identique dans toutes les langues — jamais dans les
            fichiers de traduction. */}
        <Link href="/" dir="ltr" className="inline-flex shrink-0" onClick={() => setIsOpen(false)}>
          <img
            src="/brand/logo-horizontal-light.svg"
            alt="BARMAJATA Éditions"
            width={220}
            height={40}
            className={`w-auto transition-[height] duration-200 ${isScrolled ? "h-6 md:h-8" : "h-8 md:h-10"}`}
          />
        </Link>

        <nav aria-label={t("home")} className="hidden md:block">
          <ul className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-sable-300">
            {links.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="hover:text-lin-50">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="hidden md:block">
          <LocaleSwitcher />
        </div>

        <button
          type="button"
          onClick={() => setIsOpen((open) => !open)}
          aria-expanded={isOpen}
          aria-controls="mobile-nav"
          aria-label={t("home")}
          className="flex h-9 w-9 items-center justify-center rounded-md border border-sable-300 text-lin-50 md:hidden"
        >
          <span className="sr-only">Menu</span>
          {isOpen ? (
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          )}
        </button>
      </div>

      {isOpen && (
        <div id="mobile-nav" className="border-t border-sable-300/30 md:hidden">
          <nav aria-label={t("home")} className="ps-6 pe-6 py-4">
            <ul className="flex flex-col gap-3 text-sm text-sable-300">
              {links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="block text-start hover:text-lin-50"
                    onClick={() => setIsOpen(false)}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-4">
              <LocaleSwitcher />
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
