"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Apparition sobre au scroll : fondu + translation de 12px (translate-y-3),
 * 400ms. Jamais de rebond ni de rotation. `delayMs` sert à échelonner une
 * grille (ex. cascade de 80ms : delayMs={index * 80}).
 *
 * Respecte prefers-reduced-motion à deux niveaux : globals.css coupe les
 * transitions pour tout le monde, et ce composant évite en plus tout état
 * "masqué" initial pour ces utilisateurs (rien à révéler, l'élément est
 * visible dès le rendu, pas de flash).
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
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisible(true);
      return;
    }

    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

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
