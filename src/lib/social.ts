export const SOCIAL_PLATFORMS = ["facebook", "instagram", "tiktok", "youtube"] as const;
export type SocialPlatform = (typeof SOCIAL_PLATFORMS)[number];

export type SocialLink = { platform: SocialPlatform; label: string; url: string };

/**
 * Comptes de la maison. **À remplir par l'utilisateur** : les adresses ne
 * s'inventent pas, un lien social erroné envoie les lecteurs chez
 * quelqu'un d'autre.
 *
 * Tant qu'un tableau est vide, l'en-tête et le pied de page masquent
 * entièrement la rangée — aucune icône morte n'est affichée.
 *
 * Pour activer, ajouter les entrées voulues, par exemple :
 *   { platform: "instagram", label: "Instagram", url: "https://instagram.com/…" }
 * L'ordre du tableau est l'ordre d'affichage. Le `label` sert de nom
 * accessible (« Instagram »), jamais de texte visible : seule l'icône est
 * montrée.
 */
export const SOCIAL_LINKS: SocialLink[] = [];
