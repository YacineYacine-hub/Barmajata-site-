"use client";

import { usePathname } from "@/i18n/navigation";

/**
 * Fondu de 250ms au changement de page. `key={pathname}` force le
 * remontage du conteneur à chaque navigation, ce qui rejoue l'animation
 * CSS `page-fade` (globals.css) — coupée comme toute animation pour les
 * utilisateurs `prefers-reduced-motion` par la règle globale du même
 * fichier, sans logique dédiée ici.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div key={pathname} className="animate-[page-fade_250ms_ease-out]">
      {children}
    </div>
  );
}
