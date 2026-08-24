import { SOCIAL_LINKS, type SocialPlatform } from "@/lib/social";

/**
 * Rangée d'icônes des comptes de la maison, pour l'en-tête et le pied de
 * page. Ne rend **rien** tant que `SOCIAL_LINKS` est vide : une icône qui
 * ne mène nulle part est pire que pas d'icône.
 *
 * Les icônes sont dessinées ici, en SVG inline : aucune police d'icônes,
 * aucun paquet tiers, et elles héritent de `currentColor`, donc la même
 * rangée sert sur fond sombre comme sur fond clair.
 *
 * Chaque lien porte un nom accessible (`aria-label`) car il n'a pas de
 * texte visible, et `rel="noopener noreferrer"` puisqu'il ouvre un onglet.
 */
const CHEMINS: Record<SocialPlatform, string> = {
  facebook:
    "M14 8.5V7c0-.7.3-1 1-1h1.5V3.5h-2.3C12 3.5 11 4.9 11 7v1.5H9V11h2v9.5h3V11h2.1l.4-2.5H14z",
  instagram:
    "M8 3h8a5 5 0 0 1 5 5v8a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5V8a5 5 0 0 1 5-5zm0 2a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h8a3 3 0 0 0 3-3V8a3 3 0 0 0-3-3H8zm4 2.8a4.2 4.2 0 1 1 0 8.4 4.2 4.2 0 0 1 0-8.4zm0 2a2.2 2.2 0 1 0 0 4.4 2.2 2.2 0 0 0 0-4.4zM17 6.2a1.1 1.1 0 1 1 0 2.2 1.1 1.1 0 0 1 0-2.2z",
  tiktok:
    "M15.5 3h-2.6v12.1a2.3 2.3 0 1 1-2.3-2.3c.2 0 .4 0 .6.1v-2.6a5 5 0 1 0 4.3 4.9V9.1a6 6 0 0 0 3.5 1.1V7.6a3.6 3.6 0 0 1-3.5-3.6V3z",
  youtube:
    "M21.6 7.9a2.5 2.5 0 0 0-1.8-1.8C18.2 5.7 12 5.7 12 5.7s-6.2 0-7.8.4A2.5 2.5 0 0 0 2.4 7.9 26 26 0 0 0 2 12a26 26 0 0 0 .4 4.1 2.5 2.5 0 0 0 1.8 1.8c1.6.4 7.8.4 7.8.4s6.2 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8A26 26 0 0 0 22 12a26 26 0 0 0-.4-4.1zM10 15.1V8.9l5.2 3.1-5.2 3.1z",
};

export function SocialLinks({ className = "" }: { className?: string }) {
  if (SOCIAL_LINKS.length === 0) return null;

  return (
    <ul className={`flex items-center gap-3 ${className}`}>
      {SOCIAL_LINKS.map((link) => (
        <li key={link.platform}>
          <a
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={link.label}
            className="block opacity-75 transition-opacity hover:opacity-100"
          >
            <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="currentColor" aria-hidden="true">
              <path d={CHEMINS[link.platform]} />
            </svg>
          </a>
        </li>
      ))}
    </ul>
  );
}
