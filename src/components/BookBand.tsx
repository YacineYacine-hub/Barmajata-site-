"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export type BandItem = { slug: string; title: string; coverSrc?: string };

// Constantes explicitement données par la spec.
const SCALE_CENTER = 1.34;
const SCALE_EDGE = 0.84;
const ROTATE_MAX_DEG = 38;
const OPACITY_CUTOFF_DISTANCE = 3.7;

// Choix d'implémentation (non spécifiés), documentés ici plutôt que
// laissés magiques dans le code.
const RECOIL_PX = 220; // recul en Z au bord de la plage de visibilité
const ITEM_WIDTH_PX = 160; // largeur d'une couverture au repos (scale 1)
const ITEM_SPACING_PX = 190; // distance entre centres de deux couvertures
const SETTLE_DURATION_MS = 420;
const DRAG_CLICK_THRESHOLD_PX = 6; // au-delà, un pointerup n'est plus un clic
const WHEEL_IDLE_MS = 120; // silence molette avant de caler

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

  const dragRef = useRef<{ startX: number; startPosition: number; moved: number } | null>(null);
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
      const opacity = isMuted ? 0 : Math.max(0, 1 - t2);
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
    dragRef.current = { startX: event.clientX, startPosition: positionRef.current, moved: 0 };
  }

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    if (!drag) return;
    const dx = event.clientX - drag.startX;
    drag.moved = Math.max(drag.moved, Math.abs(dx));
    if (drag.moved > DRAG_CLICK_THRESHOLD_PX) clickSuppressRef.current = true;
    positionRef.current = drag.startPosition - dx / ITEM_SPACING_PX;
    applyTransforms();
  }

  function handlePointerUp() {
    if (!dragRef.current) return;
    dragRef.current = null;
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
            <Link href={{ pathname: "/books/[slug]", params: { slug: item.slug } }} className="block">
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
              href={{ pathname: "/books/[slug]", params: { slug: item.slug } }}
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
  if (item.coverSrc) {
    return (
      <div className="relative aspect-[2/3] w-full overflow-hidden rounded-md shadow-lg">
        {/* Largeur logique max 160px (ITEM_WIDTH_PX) sur tous les
            contextes d'usage (bande 3D et défilement natif <640px) —
            sizes fixe en conséquence, pas de variation par breakpoint. */}
        <Image src={item.coverSrc} alt="" fill sizes="160px" className="object-cover" />
      </div>
    );
  }
  return (
    <span className="flex aspect-[2/3] w-full items-center justify-center rounded-md bg-sable-300 p-3 text-center text-xs font-medium text-nuit-900 shadow-lg">
      {item.title}
    </span>
  );
}
