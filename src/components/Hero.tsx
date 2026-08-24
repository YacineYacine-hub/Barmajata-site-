"use client";

import { useRef, useState, type KeyboardEvent, type TouchEvent } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Reveal } from "./Reveal";

export type HeroSlide = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  /** Sans image (Lot H5) : rien derrière l'écriture — le papier de
   *  `.page-livre` transparaît, le texte est en encre. Avec image : la
   *  photo est couverte d'un voile dégradé et le texte passe au clair. */
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
      className="relative aspect-[4/5] w-full overflow-hidden sm:aspect-[26/9]"
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
            ) : null}

            <div className="relative z-10 mx-auto flex h-full max-w-5xl flex-col items-center justify-center ps-6 pe-6 text-center">
              <Reveal>
                {/*
                 * Bloc de signature. `inline-block` : sa largeur est celle
                 * de son plus large enfant, c'est-à-dire le mot BARMAJATA.
                 * Le symbole peut donc être centré DANS L'AXE du mot, tout
                 * en laissant le surtitre aligné au fer, et l'axe se
                 * recalcule tout seul quand la typographie change de pas.
                 */}
                <span className="inline-block">
                  {/* roche-700 et non or-500 : sur papier clair l'or mesure
                      ~2,5:1, sous le seuil AA même en grand texte (règle du
                      Lot F). roche-700 tient 7,4:1 sur lin-50. */}
                  {slide.eyebrow && (
                    <p className="text-xs font-medium uppercase tracking-[0.2em] text-roche-700">
                      {slide.eyebrow}
                    </p>
                  )}

                  {/* text-enseigne : le pas réservé à la devanture, un seul
                      par page (voir globals.css). font-light parce qu'à
                      cette taille, un Cormorant en 400 devient lourd. */}
                  {/*
                   * On ne vise plus la jointure M|A : on l'AMÈNE au centre.
                   *
                   * Le mot est réparti en deux `span` **inline** — jamais
                   * `inline-block`, qui créerait un point de coupure et
                   * césurerait le mot (défaut du Lot H24). Une approche
                   * (`letter-spacing`) est appliquée au premier fragment
                   * pour égaliser les deux moitiés : `letter-spacing`
                   * ajoute une avance après CHAQUE caractère, dernier
                   * compris, donc 4 caractères × 0,045em ≈ 0,18em, soit
                   * exactement l'écart entre « BARM » (2,86em) et
                   * « AJATA » (3,04em).
                   *
                   * La jointure tombe alors au milieu du mot, le bloc est
                   * centré sur la page, et le symbole peut être posé à 50 %
                   * — plus aucune estimation de position.
                   *
                   * L'approche 0,045em vient de chasses estimées : c'est le
                   * seul nombre à ajuster si le calage n'est pas parfait.
                   *
                   * Géométrie verticale (logo-mark.svg, viewBox 128) : le
                   * point est à 56,1 % de la hauteur du symbole, le haut de
                   * la courbe à 40,8 %. `bottom-0` s'appuie sur le bas de
                   * la ligne, ~0,13em sous la ligne de base : le point
                   * tombe vers 0,57em au-dessus d'elle, la courbe culmine
                   * vers 0,81em, au-dessus des capitales (~0,66em).
                   */}
                  <span className="relative mt-3 block text-enseigne">
                    {slideIndex === 0 && (
                      <Image
                        src="/brand/logo-mark.svg"
                        alt=""
                        aria-hidden="true"
                        width={128}
                        height={128}
                        priority
                        className="pointer-events-none absolute bottom-0 left-1/2 h-[1.6em] w-[1.6em] -translate-x-1/2 opacity-30"
                      />
                    )}
                    {(() => {
                      const coupure = slide.title.indexOf("MA");
                      const equilibrable = slideIndex === 0 && coupure !== -1;
                      const classe =
                        "relative font-serif text-enseigne font-light text-nuit-900";

                      if (!equilibrable) {
                        return slideIndex === 0 ? (
                          <h1 className={classe}>{slide.title}</h1>
                        ) : (
                          <p className={classe}>{slide.title}</p>
                        );
                      }

                      return (
                        <h1 className={classe}>
                          <span className="tracking-[0.045em]">
                            {slide.title.slice(0, coupure + 1)}
                          </span>
                          {slide.title.slice(coupure + 1)}
                        </h1>
                      );
                    })()}
                  </span>

                  {slide.subtitle && (
                    <p className="mt-5 max-w-md text-base text-roche-700">{slide.subtitle}</p>
                  )}
                </span>
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
            className="absolute inset-y-0 start-0 z-20 flex w-12 items-center justify-center text-roche-700 transition-colors hover:text-nuit-900 disabled:opacity-25"
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
            className="absolute inset-y-0 end-0 z-20 flex w-12 items-center justify-center text-roche-700 transition-colors hover:text-nuit-900 disabled:opacity-25"
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
                  slideIndex === index ? "bg-nuit-900" : "bg-nuit-900/25"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
