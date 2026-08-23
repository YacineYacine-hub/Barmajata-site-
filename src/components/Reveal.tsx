"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeToReducedMotion(callback: () => void) {
  const mql = window.matchMedia(REDUCED_MOTION_QUERY);
  mql.addEventListener("change", callback);
  return () => mql.removeEventListener("change", callback);
}
function getReducedMotionSnapshot() {
  return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}
function getReducedMotionServerSnapshot() {
  return false;
}

/**
 * Apparition sobre au scroll : fondu + translation de 12px (translate-y-3),
 * 400ms. Jamais de rebond ni de rotation. `delayMs` sert à échelonner une
 * grille (ex. cascade de 80ms : delayMs={index * 80}).
 *
 * Respecte prefers-reduced-motion à deux niveaux : globals.css coupe les
 * transitions pour tout le monde, et ce composant évite en plus tout état
 * "masqué" initial pour ces utilisateurs (rien à révéler, l'élément est
 * visible dès le rendu, pas de flash) — lu via useSyncExternalStore
 * (matchMedia a un vrai événement "change" à écouter), pas un effet qui
 * appellerait setState en synchrone.
 */
export function Reveal({
  children,
  delayMs = 0,
  className = "",
}: {
  children: React.ReactNode;
  delayMs?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [intersected, setIntersected] = useState(false);
  const prefersReducedMotion = useSyncExternalStore(
    subscribeToReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot,
  );

  useEffect(() => {
    if (prefersReducedMotion) return;

    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIntersected(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [prefersReducedMotion]);

  const visible = prefersReducedMotion || intersected;

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delayMs}ms` }}
      className={`transition-[opacity,transform] duration-[400ms] ease-out ${
        visible ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
      } ${className}`}
    >
      {children}
    </div>
  );
}
