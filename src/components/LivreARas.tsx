/**
 * Pied de la devanture (Lot H4) : un livre ouvert vu à ras, pleine largeur,
 * l'œil posé au niveau de la table.
 *
 * Entièrement décoratif — d'où `aria-hidden` et l'absence de tout texte :
 * il ne porte aucune information, il pose une atmosphère. Un lecteur
 * d'écran n'a rien à y entendre.
 *
 * Toute la matière vit dans `globals.css` (`.livre-a-ras` et ses parties),
 * comme pour les champs : ce composant n'est qu'un assemblage. Les trois
 * surfaces qu'il empile sont exactement les emplacements que remplacera
 * l'image de fond quand elle existera — la structure ne bougera pas.
 */
export function LivreARas() {
  return (
    <div aria-hidden="true" className="livre-a-ras bg-nuit-950">
      <div className="livre-page livre-page-gauche" />
      <div className="livre-page livre-page-droite" />
      <div className="livre-gouttiere" />
      <div className="livre-fondu" />
    </div>
  );
}
