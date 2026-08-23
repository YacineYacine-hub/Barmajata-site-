"use client";

import { useRef, useState, type KeyboardEvent, type TouchEvent } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Reveal } from "./Reveal";

export type HeroSlide = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  /** Sans image : le champ maillé sombre `.champ-encre` + grain. Avec
   *  image : la photo est couverte d'un voile dégradé, le texte de la
   *  devanture étant clair. */
  image?: { src: string; alt: string };
};

type HeroProps = {
  slides: HeroSlide[];
};

const SWIPE_THRESHOLD_PX = 40;

// Carrousel manuel uniquement — jamais de défilement automatique. Toutes
// les diapositives restent dans le HTML (indexation) ; seule une
// transform CSS masque celles qui ne sont pas actives. Les flèches
// clavier suivent le sens visuel (inversé en RTL), coupé net par
// prefers-reduced-motion (transition-duration à 0 via globals.css).
export function Hero({ slides }: HeroProps) {
  const t = useTranslations("home.carousel");
  const [index, setIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);

  const hasMultiple = slides.length > 1;

  function goTo(next: number) {
    setIndex(Math.max(0, Math.min(slides.length - 1, next)));
  }

  function isRTL() {
    return typeof document !== "undefined" && document.documentElement.dir === "rtl";
  }

  function handleKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (!hasMultiple) return;
    const rtl = isRTL();
    if (event.key === "ArrowRight") goTo(index + (rtl ? -1 : 1));
    if (event.key === "ArrowLeft") goTo(index + (rtl ? 1 : -1));
  }

  function handleTouchStart(event: TouchEvent<HTMLElement>) {
    touchStartX.current = event.touches[0]?.clientX ?? null;
  }

  function handleTouchEnd(event: TouchEvent<HTMLElement>) {
    if (touchStartX.current === null || !hasMultiple) return;
    const endX = event.changedTouches[0]?.clientX ?? touchStartX.current;
    const delta = endX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(delta) < SWIPE_THRESHOLD_PX) return;

    const rtl = isRTL();
    const forward = delta < 0;
    goTo(index + (forward !== rtl ? 1 : -1));
  }

  return (
    <section
      role="region"
      aria-roledescription="carousel"
      aria-label={t("region")}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="relative aspect-[4/5] w-full overflow-hidden bg-nuit-900 sm:aspect-[16/9]"
    >
      <div
        className="flex h-full transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {slides.map((slide, slideIndex) => (
          <div
            key={slideIndex}
            aria-hidden={slideIndex !== index}
            className="relative h-full w-full shrink-0"
          >
            {slide.image ? (
              <>
                <Image
                  src={slide.image.src}
                  alt={slide.image.alt}
                  fill
                  priority={slideIndex === 0}
                  sizes="100vw"
                  className="object-cover"
                />
                {/* Voile : le texte de la devanture est clair, il ne peut
                    pas dépendre de la luminosité d'une photo qu'on ne
                    contrôle pas. Dégradé plutôt qu'aplat, pour ne pas
                    éteindre l'image. */}
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-gradient-to-t from-nuit-950/85 via-nuit-950/45 to-nuit-950/20"
                />
              </>
            ) : (
              /* Sans image : le champ maillé, jamais un aplat. */
              <div className="champ-encre grain-encre absolute inset-0" />
            )}

            <div className="relative z-10 mx-auto flex h-full max-w-3xl flex-col items-start justify-center ps-6 pe-6 text-start">
              <Reveal>
                {/* sable-300 et non or-500 : la règle « or-500 valide sur
                    nuit-900 » (5,8:1) ne vaut PAS sur le champ maillé, plus
                    clair là où passe la lueur dorée — l'or y retombe à
                    3,2:1, sous le seuil AA pour ce text-sm. sable-300 tient
                    5,1:1 au pire point du champ. Mesuré, voir CLAUDE.md. */}
                {slide.eyebrow && (
                  <p className="text-sm uppercase tracking-[0.18em] text-sable-300">
                    {slide.eyebrow}
                  </p>
                )}
                {/* text-enseigne : le pas réservé à la devanture, un seul
                    par page (voir globals.css). font-light parce qu'à
                    cette taille, un Cormorant en 400 devient lourd. */}
                {slideIndex === 0 ? (
                  <h1 className="mt-4 font-serif text-enseigne font-light text-lin-50">
                    {slide.title}
                  </h1>
                ) : (
                  <p className="mt-4 font-serif text-enseigne font-light text-lin-50">
                    {slide.title}
                  </p>
                )}
                {slide.subtitle && (
                  <p className="mt-6 max-w-xl text-lin-100">{slide.subtitle}</p>
                )}
              </Reveal>
            </div>
          </div>
        ))}
      </div>

      {hasMultiple && (
        <>
          <button
            type="button"
            onClick={() => goTo(index - 1)}
            disabled={index === 0}
            aria-label={t("previous")}
            className="absolute inset-y-0 start-0 z-20 flex w-12 items-center justify-center text-sable-300 transition-colors hover:text-or-500 disabled:opacity-25"
          >
            <svg viewBox="0 0 24 24" className="h-6 w-6 rtl:-scale-x-100" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 6l-6 6 6 6" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => goTo(index + 1)}
            disabled={index === slides.length - 1}
            aria-label={t("next")}
            className="absolute inset-y-0 end-0 z-20 flex w-12 items-center justify-center text-sable-300 transition-colors hover:text-or-500 disabled:opacity-25"
          >
            <svg viewBox="0 0 24 24" className="h-6 w-6 rtl:-scale-x-100" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 6l6 6-6 6" />
            </svg>
          </button>

          <div className="absolute inset-x-6 bottom-6 z-20 flex gap-2">
            {slides.map((_, slideIndex) => (
              <button
                key={slideIndex}
                type="button"
                onClick={() => goTo(slideIndex)}
                aria-label={t("goTo", { n: slideIndex + 1 })}
                aria-current={slideIndex === index}
                className={`h-1 flex-1 rounded-full transition-colors duration-200 ${
                  slideIndex === index ? "bg-or-500" : "bg-lin-50/25"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
