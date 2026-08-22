"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { LocaleSwitcher } from "./LocaleSwitcher";

type NavHref = "/books" | "/authors" | "/house" | "/journal" | "/contact";

export function Header() {
  const t = useTranslations("nav");
  const tSite = useTranslations("site");
  const [isOpen, setIsOpen] = useState(false);

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
    <header className="border-b border-sand-200 bg-sand-50">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 ps-6 pe-6 py-4">
        <Link
          href="/"
          className="font-serif text-xl text-ink-900"
          onClick={() => setIsOpen(false)}
        >
          {tSite("name")}
        </Link>

        <nav aria-label={t("home")} className="hidden md:block">
          <ul className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-ink-700">
            {links.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="hover:text-gold-600">
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
          className="flex h-9 w-9 items-center justify-center rounded-md border border-sand-200 text-ink-900 md:hidden"
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
        <div id="mobile-nav" className="border-t border-sand-200 md:hidden">
          <nav aria-label={t("home")} className="ps-6 pe-6 py-4">
            <ul className="flex flex-col gap-3 text-sm text-ink-700">
              {links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="block text-start hover:text-gold-600"
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
