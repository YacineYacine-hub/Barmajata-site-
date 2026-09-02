import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

/*
 * En-têtes de sécurité (Lot H45).
 *
 * Le site n'en envoyait aucun. Ceux-ci s'appliquent à toutes les réponses,
 * y compris aux pages statiques : `headers()` est évalué par le serveur de
 * `next start`, pas au build. **Si un jour un reverse proxy ou un CDN se
 * place devant, vérifier qu'il les relaie** — c'est l'erreur classique.
 *
 * POURQUOI PAS DE CSP À NONCE — à lire avant d'en ajouter une.
 *
 * La documentation de Next est explicite : une CSP à nonce impose un
 * rendu DYNAMIQUE, puisqu'un nonce doit être unique à chaque requête. Or
 * ce projet est statique partout sauf `/b/[code]`, et chaque page appelle
 * `setRequestLocale()` pour le rester. Poser une CSP à nonce reviendrait
 * donc à rendre tout le site dynamique — un changement d'architecture
 * déguisé en réglage de sécurité. Ne pas le faire sans arbitrage explicite.
 *
 * Ce qui reste possible en statique, et qui est fait ici : une CSP sans
 * nonce. Elle doit tolérer `'unsafe-inline'` sur les scripts — Next
 * injecte son amorce RSC en ligne — ce qui la rend inopérante contre une
 * injection de script inline. **Son intérêt est ailleurs** : elle
 * interdit toute origine externe, donc l'exfiltration vers un domaine
 * tiers. Ne pas la juger sur ce qu'elle ne peut pas faire.
 *
 * Elle a d'abord été posée en `Report-Only`, puis vérifiée au navigateur
 * le 2026-09-02 sur huit types de pages dans les trois langues (accueil,
 * catalogue, fiche livre, fiche auteur, club, pages éditoriales, 404,
 * RTL) : aucune violation. Deux violations volontaires — un script et une
 * image externes — ont par ailleurs confirmé que la politique était bien
 * appliquée, et pas seulement ignorée. Elle est donc passée en mode
 * bloquant.
 *
 * CONSÉQUENCE À CONNAÎTRE : tout script, image, police ou appel réseau
 * vers un domaine tiers sera désormais BLOQUÉ. C'est voulu. Les pixels
 * publicitaires et les widgets de discussion envisagés en phase 7 ne
 * fonctionneront pas sans ajouter explicitement leur origine ici — et
 * c'est bien qu'une telle décision passe par une modification consciente
 * de ce fichier. En cas de doute au déploiement, repasser la clé en
 * `Content-Security-Policy-Report-Only` : la politique signale alors sans
 * rien casser.
 */
const CSP = [
  "default-src 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "script-src 'self' 'unsafe-inline'",
  "connect-src 'self'",
  "upgrade-insecure-requests",
].join("; ");

const EN_TETES = [
  {
    /*
     * HSTS : deux ans, sous-domaines compris. Volontairement SANS
     * `preload` — l'inscription sur la liste des navigateurs est longue à
     * défaire, et elle interdirait tout sous-domaine en HTTP simple. À
     * n'ajouter qu'une fois le déploiement stabilisé.
     */
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains",
  },
  // Empêche le navigateur de deviner un type MIME différent de celui
  // annoncé — la porte d'entrée classique d'un fichier téléversé exécuté
  // comme un script.
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Le référent complet ne quitte jamais le site : une URL de fiche livre
  // ou un paramètre de recherche ne part pas chez un tiers.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Aucune de ces API n'est utilisée par le site. Les refuser explicitement
  // vaut mieux que de compter sur leur non-usage.
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
  },
  // Doublon assumé de `frame-ancestors` : les deux disent la même chose,
  // le second est mieux respecté par les navigateurs anciens.
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Content-Security-Policy", value: CSP },
];

/*
 * `distDir` pilotable par l'environnement.
 *
 * Raison d'être : `.claude/push-si-vert.sh` lance un `next build` de
 * production après chaque commit. Il écrasait `.next`, donc le build de
 * démonstration servi par un `npm run start` en cours — et le serveur
 * continuait de tourner en réclamant des fragments JavaScript qui
 * n'existaient plus, ce qui finissait en page d'erreur 500. Mesuré le
 * 2026-09-02, pas supposé.
 *
 * Le garde-fou construit désormais dans `.next-verif`. Sans la variable,
 * le comportement est strictement celui d'avant.
 */
const nextConfig: NextConfig = {
  // `X-Powered-By: Next.js` annonce la pile à qui cherche une faille
  // connue. Aucun intérêt à le publier.
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:chemin*", headers: EN_TETES }];
  },
  ...(process.env.NEXT_DIST_DIR ? { distDir: process.env.NEXT_DIST_DIR } : {}),
};

export default withNextIntl(nextConfig);
