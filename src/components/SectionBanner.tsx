/**
 * Bandeau de titre plein `bg-nuit-900` en tête d'une page éditoriale, le
 * corps de la page restant sur `lin-50` (fond par défaut). `children` sert
 * de créneau pour un lien retour / fil d'Ariane affiché dans le bandeau
 * lui-même (couleurs adaptées au fond sombre).
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
    <div className="bg-nuit-900">
      <div className={`mx-auto ${maxWidthClassName} ps-6 pe-6 py-16`}>
        {children}
        {eyebrow && (
          <p className="text-sm font-medium uppercase tracking-wide text-or-500">{eyebrow}</p>
        )}
        <h1 className="mt-2 font-serif text-4xl text-lin-50 text-start">{title}</h1>
        {lede && <p className="mt-4 max-w-2xl text-lin-100 text-start">{lede}</p>}
      </div>
    </div>
  );
}
