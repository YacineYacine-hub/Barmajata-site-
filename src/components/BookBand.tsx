"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export type BandItem = {
  slug: string;
  title: string;
  coverSrc?: string;
  /**
   * Quand il est présent, l'élément ne mène pas à une fiche livre mais au
   * catalogue filtré sur cette catégorie. C'est ce qui permet à la même
   * bande de servir de présentoir sur `/livres` et de MENU DE CATÉGORIES
   * sur l'accueil, sans dupliquer sa mécanique de défilement.
   *
   * Chaîne vide = « toutes catégories », donc le catalogue sans filtre.
   */
  categorieSlug?: string;
};

/** Cible du lien d'un élément : une fiche, ou le catalogue filtré. */
function lienDe(item: BandItem) {
  return item.categorieSlug === undefined
    ? ({ pathname: "/books/[slug]", params: { slug: item.slug } } as const)
    : ({
        pathname: "/books",
        query: item.categorieSlug ? { categorie: item.categorieSlug } : {},
      } as const);
}

// Constantes explicitement données par la spec.
const SCALE_CENTER = 1.34;
const SCALE_EDGE = 0.84;
const ROTATE_MAX_DEG = 38;
const OPACITY_CUTOFF_DISTANCE = 3.7;

// Choix d'implémentation (non spécifiés), documentés ici plutôt que
// laissés magiques dans le code.
const RECOIL_PX = 220; // recul en Z au bord de la plage de visibilité
const ITEM_WIDTH_PX = 160; // largeur d'une couverture au repos (scale 1)
/*
 * Distance entre les centres de deux éléments.
 *
 * Elle valait 190px et l'élément CENTRAL était chevauché de 12px par
 * chacun de ses voisins : agrandi à SCALE_CENTER (1,34), il occupe 107px
 * de demi-largeur, tandis que son voisin immédiat en occupe encore 95
 * après réduction d'échelle et rotation — soit 202px à loger dans 190.
 *
 * Seule cette première paire posait problème : au-delà, la réduction
 * d'échelle creuse l'écart toute seule (175px requis entre le 1er et le
 * 2e, 144 entre le 2e et le 3e).
 *
 * 224px laisse 22px de jeu autour de l'élément central. Valeur
 * d'implémentation, pas de spec — contrairement à SCALE_CENTER,
 * SCALE_EDGE, ROTATE_MAX_DEG et OPACITY_CUTOFF_DISTANCE, qui eux sont
 * donnés et ne se touchent pas.
 */
const ITEM_SPACING_PX = 224;
const SETTLE_DURATION_MS = 420;
const DRAG_CLICK_THRESHOLD_PX = 6; // au-delà, un pointerup n'est plus un clic
const WHEEL_IDLE_MS = 120; // silence molette avant de caler

/**
 * Forme de la courbe d'extinction. OPACITY_CUTOFF_DISTANCE (3,7) vient de
 * la spec et n'est PAS touchée : une couverture disparaît toujours à la
 * même distance. Seule la courbe change, de linéaire à concave.
 *
 * Motif : en linéaire, la couverture voisine tombait à 0,73 d'opacité et
 * la suivante à 0,46. Sur le fond sombre d'origine, ça lisait comme un
 * éloignement ; sur le fond clair du registre moderne (Lot H8), ça lit
 * comme une couleur morte — un rouge profond y vire au mauve pâle.
 *
 * Avec cet exposant, la voisine tient 0,94 et la suivante 0,74 : les
 * couvertures gardent leur couleur, et c'est l'échelle, la rotation et le
 * recul en Z qui portent la profondeur.
 */
const OPACITY_COURBE = 2.2;

// Inertie au lâcher (« on pousse, ça continue »). Vitesses en unités de
// position par milliseconde — 1 unité = une couverture.
//
// La distance parcourue par une décroissance exponentielle vaut
// vitesse / friction : au plafond, 0,028 / 0,0035 ≈ 8 couvertures. Assez
// pour que le geste porte, trop peu pour traverser le catalogue d'un coup
// et perdre le lecteur.
const INERTIE_FRICTION_PAR_MS = 0.0035;
const INERTIE_VITESSE_MAX = 0.028; // plafond d'un geste vif
const INERTIE_VITESSE_LANCEMENT = 0.002; // en dessous, on cale sans lancer
const INERTIE_VITESSE_ARRET = 0.0012; // en dessous, l'inertie s'arrête
const INERTIE_LISSAGE = 0.72; // part de l'ancienne vitesse conservée

function subscribeReducedMotion(callback: () => void) {
  const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
  mql.addEventListener("change", callback);
  return () => mql.removeEventListener("change", callback);
}
function getReducedMotionSnapshot() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
function getReducedMotionServerSnapshot() {
  return false;
}

function subscribeNarrow(callback: () => void) {
  const mql = window.matchMedia("(max-width: 639px)");
  mql.addEventListener("change", callback);
  return () => mql.removeEventListener("change", callback);
}
function getNarrowSnapshot() {
  return window.matchMedia("(max-width: 639px)").matches;
}
function getNarrowServerSnapshot() {
  return false;
}

/** Distance signée la plus courte de i au centre, en tenant compte du
 * bouclage (après le dernier élément vient le premier). */
function wrappedDelta(i: number, position: number, count: number): number {
  const raw = i - position;
  return raw - Math.round(raw / count) * count;
}

function normalizeIndex(i: number, count: number): number {
  return ((i % count) + count) % count;
}

/**
 * Bande continue et bouclée de couvertures (glissement, molette
 * horizontale, clavier). ≥640px : perspective/rotation/échelle 3D pilotées
 * par la distance au centre. <640px : simple défilement horizontal natif,
 * aucune transform 3D. Toutes les couvertures sont des <Link> réels vers
 * /books/[slug], TOUJOURS présents dans le DOM et rendus côté serveur
 * (indexation) — un filtre externe (ex. BookBandSection) ne doit jamais
 * conditionner cette liste elle-même, seulement `mutedSlugs` (les éléments
 * restent dans le DOM, juste masqués visuellement/à l'interaction).
 */
export function BookBand({
  items,
  mutedSlugs,
}: {
  items: BandItem[];
  mutedSlugs?: ReadonlySet<string>;
}) {
  const t = useTranslations("band");
  const count = items.length;

  const prefersReducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot,
  );
  const isNarrow = useSyncExternalStore(subscribeNarrow, getNarrowSnapshot, getNarrowServerSnapshot);

  const itemRefs = useRef<Array<HTMLLIElement | null>>([]);
  const positionRef = useRef(0);
  const [centerIndex, setCenterIndex] = useState(0);

  const dragRef = useRef<{
    startX: number;
    startPosition: number;
    moved: number;
    dernierX: number;
    dernierT: number;
    vitesse: number;
  } | null>(null);
  const clickSuppressRef = useRef(false);
  const settleAnimRef = useRef<number | null>(null);
  const wheelIdleTimerRef = useRef<number | null>(null);

  const applyTransforms = useCallback(() => {
    if (isNarrow || count === 0) return;
    const position = positionRef.current;
    let newCenter = 0;
    let minAbs = Infinity;

    for (let i = 0; i < count; i++) {
      const delta = wrappedDelta(i, position, count);
      const absDelta = Math.abs(delta);
      if (absDelta < minAbs) {
        minAbs = absDelta;
        newCenter = i;
      }

      const el = itemRefs.current[i];
      if (!el) continue;

      const t2 = Math.min(absDelta / OPACITY_CUTOFF_DISTANCE, 1);
      const scale = SCALE_CENTER + (SCALE_EDGE - SCALE_CENTER) * t2;
      const rotate = -Math.sign(delta) * ROTATE_MAX_DEG * t2;
      const z = -RECOIL_PX * t2;
      const isMuted = mutedSlugs?.has(items[i].slug) ?? false;
      const opacity = isMuted ? 0 : Math.max(0, 1 - Math.pow(t2, OPACITY_COURBE));
      const x = delta * ITEM_SPACING_PX;

      el.style.transform = `translateX(${x}px) translateZ(${z}px) rotateY(${rotate}deg) scale(${scale})`;
      el.style.opacity = String(opacity);
      const visible = !isMuted && absDelta < OPACITY_CUTOFF_DISTANCE;
      el.style.pointerEvents = visible ? "auto" : "none";
      el.setAttribute("aria-hidden", isMuted ? "true" : "false");
    }

    setCenterIndex((prev) => (prev === newCenter ? prev : newCenter));
  }, [count, isNarrow, items, mutedSlugs]);

  // Peinture initiale après montage (les refs n'existent qu'après le
  // premier rendu) : différée via rAF plutôt qu'appelée en synchrone dans
  // le corps de l'effet, pour ne pas déclencher de rendu en cascade.
  useEffect(() => {
    const frame = requestAnimationFrame(() => applyTransforms());
    return () => cancelAnimationFrame(frame);
  }, [applyTransforms, items.length]);

  const settleTo = useCallback(
    (target: number, immediate: boolean) => {
      if (settleAnimRef.current !== null) {
        cancelAnimationFrame(settleAnimRef.current);
        settleAnimRef.current = null;
      }
      if (immediate || prefersReducedMotion) {
        positionRef.current = target;
        applyTransforms();
        return;
      }
      const start = positionRef.current;
      const diff = target - start;
      const startTime = performance.now();

      function step(now: number) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / SETTLE_DURATION_MS, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        positionRef.current = start + diff * eased;
        applyTransforms();
        if (progress < 1) {
          settleAnimRef.current = requestAnimationFrame(step);
        } else {
          settleAnimRef.current = null;
        }
      }
      settleAnimRef.current = requestAnimationFrame(step);
    },
    [applyTransforms, prefersReducedMotion],
  );

  // L'identifiant d'animation est volontairement rangé dans settleAnimRef :
  // tous les points qui annulent déjà un calage en cours (pointerdown,
  // molette, clavier, clic pour centrer) annulent ainsi l'inertie sans
  // qu'aucun d'eux n'ait à être modifié.
  const lancerInertie = useCallback(
    (vitesseInitiale: number) => {
      let vitesse = Math.max(
        -INERTIE_VITESSE_MAX,
        Math.min(INERTIE_VITESSE_MAX, vitesseInitiale),
      );
      let precedent = performance.now();

      function pas(maintenant: number) {
        const dt = maintenant - precedent;
        precedent = maintenant;

        positionRef.current += vitesse * dt;
        vitesse *= Math.exp(-INERTIE_FRICTION_PAR_MS * dt);
        applyTransforms();

        if (Math.abs(vitesse) > INERTIE_VITESSE_ARRET) {
          settleAnimRef.current = requestAnimationFrame(pas);
        } else {
          settleAnimRef.current = null;
          settleTo(Math.round(positionRef.current), false);
        }
      }

      settleAnimRef.current = requestAnimationFrame(pas);
    },
    [applyTransforms, settleTo],
  );

  function focusItem(index: number) {
    const el = itemRefs.current[normalizeIndex(index, count)];
    el?.querySelector("a")?.focus();
  }

  function handlePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (isNarrow || count === 0) return;
    (event.target as Element).setPointerCapture?.(event.pointerId);
    if (settleAnimRef.current !== null) {
      cancelAnimationFrame(settleAnimRef.current);
      settleAnimRef.current = null;
    }
    clickSuppressRef.current = false;
    dragRef.current = {
      startX: event.clientX,
      startPosition: positionRef.current,
      moved: 0,
      dernierX: event.clientX,
      dernierT: performance.now(),
      vitesse: 0,
    };
  }

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    if (!drag) return;
    const dx = event.clientX - drag.startX;
    drag.moved = Math.max(drag.moved, Math.abs(dx));
    if (drag.moved > DRAG_CLICK_THRESHOLD_PX) clickSuppressRef.current = true;
    positionRef.current = drag.startPosition - dx / ITEM_SPACING_PX;

    // Vitesse instantanée, lissée : un seul échantillon suffirait à faire
    // partir la bande de travers sur un micro-soubresaut en fin de geste.
    // Le signe est inversé comme ci-dessus — pointeur vers la droite fait
    // décroître la position.
    const maintenant = performance.now();
    const dt = maintenant - drag.dernierT;
    if (dt > 0) {
      const instantanee = -(event.clientX - drag.dernierX) / ITEM_SPACING_PX / dt;
      drag.vitesse = drag.vitesse * INERTIE_LISSAGE + instantanee * (1 - INERTIE_LISSAGE);
      drag.dernierX = event.clientX;
      drag.dernierT = maintenant;
    }

    applyTransforms();
  }

  function handlePointerUp() {
    const drag = dragRef.current;
    if (!drag) return;
    dragRef.current = null;

    // Un geste vif prolonge le défilement ; un geste lent, ou un doigt
    // resté immobile avant de lâcher, cale directement. Coupé net pour
    // qui demande moins de mouvement.
    const vitesse = drag.vitesse;
    if (!prefersReducedMotion && Math.abs(vitesse) > INERTIE_VITESSE_LANCEMENT) {
      lancerInertie(vitesse);
      return;
    }
    settleTo(Math.round(positionRef.current), false);
  }

  function handleWheel(event: React.WheelEvent<HTMLDivElement>) {
    if (isNarrow || count === 0) return;
    // Molette horizontale UNIQUEMENT : si la composante verticale domine,
    // ne jamais intercepter — laisser le défilement de la page se faire.
    if (Math.abs(event.deltaX) <= Math.abs(event.deltaY)) return;
    event.preventDefault();

    if (settleAnimRef.current !== null) {
      cancelAnimationFrame(settleAnimRef.current);
      settleAnimRef.current = null;
    }
    positionRef.current += event.deltaX / ITEM_SPACING_PX;
    applyTransforms();

    if (wheelIdleTimerRef.current !== null) window.clearTimeout(wheelIdleTimerRef.current);
    wheelIdleTimerRef.current = window.setTimeout(() => {
      settleTo(Math.round(positionRef.current), false);
    }, WHEEL_IDLE_MS);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (count === 0) return;
    const rtl = typeof document !== "undefined" && document.documentElement.dir === "rtl";

    if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
      event.preventDefault();
      const forward = event.key === "ArrowRight" ? !rtl : rtl;
      const target = Math.round(positionRef.current) + (forward ? 1 : -1);
      settleTo(target, false);
      focusItem(target);
    }
  }

  function handleClickCapture(event: React.MouseEvent<HTMLDivElement>) {
    if (clickSuppressRef.current) {
      event.preventDefault();
      clickSuppressRef.current = false;
    }
  }

  // Clic sur la couverture centrale : navigation normale (comportement
  // par défaut du <Link>). Clic sur une couverture latérale : la
  // recentre sans naviguer — plus court chemin bouclé via wrappedDelta().
  function handleItemClick(event: React.MouseEvent<HTMLAnchorElement>, index: number) {
    if (event.defaultPrevented) return;
    if (index === centerIndex) return;
    event.preventDefault();
    const target = positionRef.current + wrappedDelta(index, positionRef.current, count);
    settleTo(target, false);
    focusItem(index);
  }

  if (count === 0) return null;

  if (isNarrow) {
    return (
      <ul
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto ps-6 pe-6 pb-2"
        aria-label={t("label")}
      >
        {items.map((item) => (
          <li key={item.slug} className="w-32 shrink-0 snap-center">
            <Link href={lienDe(item)} className="block">
              <BandCover item={item} />
            </Link>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div
      role="listbox"
      aria-label={t("label")}
      aria-orientation="horizontal"
      tabIndex={0}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onWheel={handleWheel}
      onKeyDown={handleKeyDown}
      onClickCapture={handleClickCapture}
      className="relative h-[420px] w-full touch-pan-y select-none overflow-hidden [perspective:1200px]"
    >
      <ul className="contents">
        {items.map((item, index) => (
          <li
            key={item.slug}
            ref={(el) => {
              itemRefs.current[index] = el;
            }}
            role="option"
            aria-selected={index === centerIndex}
            className="absolute left-1/2 top-1/2 [transform-style:preserve-3d] will-change-transform"
            style={{
              width: ITEM_WIDTH_PX,
              marginLeft: -ITEM_WIDTH_PX / 2,
              marginTop: -((ITEM_WIDTH_PX * 3) / 2) / 2,
            }}
          >
            <Link
              href={lienDe(item)}
              tabIndex={index === centerIndex ? 0 : -1}
              onClick={(event) => handleItemClick(event, index)}
              className="block"
            >
              <BandCover item={item} />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function BandCover({ item }: { item: BandItem }) {
  // Le titre est TOUJOURS rendu, au moins pour les lecteurs d'écran : le
  // visuel porte `alt=""`, donc sans ce texte le lien n'aurait aucun nom
  // accessible — défaut préexistant, corrigé ici.
  //
  // Pour une catégorie il est en plus rendu VISIBLE par-dessus le fond :
  // les visuels de catégorie ne contiennent volontairement pas de texte,
  // sans quoi le libellé serait figé en français dans le fichier SVG.
  const estCategorie = item.categorieSlug !== undefined;

  if (item.coverSrc) {
    return (
      <div className="relative aspect-[2/3] w-full overflow-hidden rounded-sm shadow-flottant">
        {estCategorie ? (
          <span className="absolute inset-0 z-10 flex items-start p-4 font-serif text-lg leading-tight text-lin-50">
            {item.title}
          </span>
        ) : (
          <span className="sr-only">{item.title}</span>
        )}
        {/* Largeur logique max 160px (ITEM_WIDTH_PX) sur tous les
            contextes d'usage (bande 3D et défilement natif <640px) —
            sizes fixe en conséquence, pas de variation par breakpoint. */}
        <Image src={item.coverSrc} alt="" fill sizes="160px" className="object-cover" />
      </div>
    );
  }
  return (
    <span className="flex aspect-[2/3] w-full items-center justify-center rounded-sm bg-sable-300 p-3 text-center text-xs font-medium text-nuit-900 shadow-flottant">
      {item.title}
    </span>
  );
}
