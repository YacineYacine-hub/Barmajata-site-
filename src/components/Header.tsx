"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { SocialLinks } from "./SocialLinks";

type NavHref = "/authors" | "/house" | "/journal" | "/contact";
type ProHref = "/submissions" | "/press" | "/rights" | "/booksellers";

const SCROLL_SHRINK_THRESHOLD = 80;
const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function Header() {
  const t = useTranslations("nav");
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

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

  // Panneau plein écran : Échap ferme, Tab/Shift+Tab piégés dedans, focus
  // posé sur le bouton de fermeture à l'ouverture puis restitué au
  // déclencheur à la fermeture, défilement de la page bloqué pendant.
  useEffect(() => {
    if (!isOpen) return;

    const trigger = triggerRef.current;
    closeButtonRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
        return;
      }
      if (event.key !== "Tab") return;

      const panel = panelRef.current;
      if (!panel) return;
      const focusable = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      trigger?.focus();
    };
  }, [isOpen]);

  // "/commitment" (engagement) est volontairement absent : page hors menu
  // tant que le partenariat n'est pas fixé, voir commitment/page.tsx.
  // "/books" n'est pas dans le panneau : lien direct dans le bandeau.
  const panelLinks: Array<{ href: NavHref; label: string }> = [
    { href: "/authors", label: t("authors") },
    { href: "/house", label: t("house") },
    { href: "/journal", label: t("journal") },
    { href: "/contact", label: t("contact") },
  ];

  // Pages professionnelles (Lot H12) : rangées dans le panneau et non
  // dans le bandeau, qui doit rester une bande fine, ni dans le pied de
  // page pour la même raison. Elles s'adressent aux auteurs, à la presse,
  // aux libraires et aux acheteurs de droits — pas au lecteur qui vient
  // acheter un livre, dont le parcours reste le bandeau.
  const proLinks: Array<{ href: ProHref; label: string }> = [
    { href: "/submissions", label: t("submissions") },
    { href: "/press", label: t("press") },
    { href: "/rights", label: t("rights") },
    { href: "/booksellers", label: t("booksellers") },
  ];

  // Bande fine du haut. La réglure d'imprimeur qu'elle portait depuis le
  // Lot H4 a été retirée au Lot H8 : une texture sur une barre
  // d'interface est exactement ce qui datait l'ensemble. `text-lin-50`
  // reste, il donne sa couleur au contenu de la bande.
  return (
    <header className="sticky top-0 z-50 bg-nuit-900 text-lin-50">
      <div
        className={`mx-auto flex max-w-5xl items-center justify-between gap-4 ps-6 pe-6 transition-[padding] duration-200 ${
          isScrolled ? "py-2" : "py-4"
        }`}
      >
        {/* dir="ltr" fixe : le logo (sceau + nom) ne doit jamais se
            miroiter ni se réordonner en RTL (voir CLAUDE.md, Lot 3). alt
            volontairement en dur, identique dans toutes les langues —
            jamais dans les fichiers de traduction. */}
        <Link href="/" dir="ltr" className="inline-flex shrink-0" onClick={() => setIsOpen(false)}>
          <Image
            src="/brand/logo-horizontal-light.svg"
            alt="BARMAJATA Éditions"
            width={220}
            height={40}
            priority
            className={`w-auto transition-[height] duration-200 ${isScrolled ? "h-6 md:h-8" : "h-8 md:h-10"}`}
          />
        </Link>

        <div className="flex items-center gap-5">
          {/* Masqué tant que SOCIAL_LINKS est vide — voir src/lib/social.ts.
              Caché sous 640px : la bande doit rester une bande fine. */}
          <SocialLinks className="hidden text-sable-300 sm:flex" />

          <LocaleSwitcher />

          <Link href="/books" className="text-sm text-sable-300 hover:text-lin-50">
            {t("books")}
          </Link>

          <button
            ref={triggerRef}
            type="button"
            onClick={() => setIsOpen(true)}
            aria-label={t("menu")}
            aria-expanded={isOpen}
            aria-controls="nav-panel"
            className="flex h-9 w-9 items-center justify-center rounded-md border border-sable-300 text-lin-50"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </button>
        </div>
      </div>

      {isOpen && (
        <div
          ref={panelRef}
          id="nav-panel"
          role="dialog"
          aria-modal="true"
          aria-label={t("menu")}
          className="fixed inset-0 z-[60] flex flex-col bg-nuit-900 ps-6 pe-6 py-6"
        >
          <div className="flex items-center justify-end">
            <button
              ref={closeButtonRef}
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label={t("closeMenu")}
              className="flex h-9 w-9 items-center justify-center rounded-md border border-sable-300 text-lin-50"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>

          <nav aria-label={t("menu")} className="mt-16 flex-1 overflow-y-auto">
            <ul className="flex flex-col gap-6">
              {panelLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className="font-serif text-3xl text-lin-50 hover:text-or-500"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            <p className="mt-12 text-xs font-medium uppercase tracking-[0.2em] text-sable-300">
              {t("pro")}
            </p>
            <ul className="mt-5 flex flex-col gap-4">
              {proLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className="text-lg text-sable-300 hover:text-lin-50"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      )}
    </header>
  );
}
