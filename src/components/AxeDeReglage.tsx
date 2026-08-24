/**
 * OUTIL DE RÉGLAGE — TEMPORAIRE, À RETIRER.
 *
 * Trace un filet rouge d'un pixel sur l'axe vertical exact de la fenêtre,
 * pour vérifier à l'œil qu'un élément est bien centré.
 *
 * Deux gardes le rendent inoffensif :
 * - il ne rend RIEN hors du drapeau `NEXT_PUBLIC_DEMO_CONTENT`, donc il ne
 *   peut pas atteindre la production ;
 * - `pointer-events: none` : il couvre toute la hauteur de la page et
 *   intercepterait sinon tous les clics de la colonne centrale.
 *
 * `position: fixed` et non `absolute` : l'axe visé est celui de la
 * FENÊTRE, pas celui d'un conteneur — c'est justement ce que l'on cherche
 * à vérifier.
 */
const VISIBLE = process.env.NEXT_PUBLIC_DEMO_CONTENT === "true";

export function AxeDeReglage() {
  if (!VISIBLE) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-y-0 left-1/2 z-[70] w-px -translate-x-1/2 bg-red-600"
    />
  );
}
