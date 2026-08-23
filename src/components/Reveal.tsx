import type { CSSProperties } from "react";

/**
 * Apparition sobre au défilement : fondu + translation de 14px, jamais de
 * rebond ni de rotation.
 *
 * Depuis le Lot H1, toute la mécanique vit dans `globals.css` (classe
 * `.reveal`, `animation-timeline: view()`). Ce composant n'est plus qu'un
 * conteneur : **plus de "use client", plus d'IntersectionObserver, plus de
 * `useSyncExternalStore`, zéro JavaScript envoyé au navigateur.** C'est
 * redevenu un composant serveur.
 *
 * `index` remplace l'ancien `delayMs` : sur une timeline de défilement, un
 * délai en millisecondes n'a plus de sens (l'animation avance avec le
 * scroll, pas avec le temps). La cascade d'une grille se décale donc dans
 * la timeline, pas dans le temps — `index={i}` suffit à l'appel.
 *
 * Le décalage est plafonné : au-delà de la 8e carte, l'échelonnement
 * cesse de croître, sinon les dernières cartes d'une longue grille
 * n'auraient toujours pas commencé leur fondu une fois à l'écran.
 */
const DECALAGE_PAR_RANG_POURCENT = 2;
const RANG_MAX = 8;

export function Reveal({
  children,
  index = 0,
  className = "",
}: {
  children: React.ReactNode;
  index?: number;
  className?: string;
}) {
  const rang = Math.min(Math.max(index, 0), RANG_MAX);
  const style = rang
    ? ({ "--reveal-decalage": `${rang * DECALAGE_PAR_RANG_POURCENT}%` } as CSSProperties)
    : undefined;

  return (
    <div className={`reveal ${className}`} style={style}>
      {children}
    </div>
  );
}
