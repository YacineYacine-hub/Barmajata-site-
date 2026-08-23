/**
 * Tête de page du registre « Papier » (Lot H3) : champ maillé clair, grain
 * de fibre et réglure d'imprimeur, le corps de la page restant sur `lin-50`
 * (fond par défaut). `children` sert de créneau pour un lien retour / fil
 * d'Ariane affiché dans le bandeau lui-même.
 *
 * Avant H3 ce bandeau était un aplat `bg-nuit-900` à texte clair. Il est
 * passé au clair pour que les pages de lecture forment un registre
 * distinct de la devanture (`/`, seule page au fond sombre intégral) : si
 * chaque page intérieure s'ouvrait elle aussi sur une plaque sombre, la
 * devanture cesserait d'être distincte et le système à deux registres
 * n'aurait plus d'objet.
 *
 * Conséquence sur les couleurs — voir la règle de contraste dans
 * `globals.css` : `or-500` est proscrit en texte sur fond clair (~2,5:1),
 * le surtitre est donc en `roche-700`, et tout contenu passé en `children`
 * doit l'être aussi (un `text-sable-300`, correct sur l'ancien fond
 * sombre, y devient illisible).
 */
export function SectionBanner({
  eyebrow,
  title,
  lede,
  maxWidthClassName = "max-w-3xl",
  children,
}: {
  eyebrow?: string;
  title: string;
  lede?: string;
  maxWidthClassName?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="champ-papier grain-papier border-b border-sable-300 text-nuit-900">
      <div className={`mx-auto ${maxWidthClassName} ps-6 pe-6 py-20`}>
        {children}
        {eyebrow && (
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-roche-700">
            {eyebrow}
          </p>
        )}
        <h1 className="mt-3 font-serif text-titre text-nuit-900 text-start">{title}</h1>
        {lede && <p className="mt-5 max-w-2xl text-roche-700 text-start">{lede}</p>}
      </div>
    </div>
  );
}
