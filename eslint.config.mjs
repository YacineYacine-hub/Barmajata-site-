import nextConfig from "eslint-config-next";

/*
 * `eslint-config-next` ignore `.next/` d'office, mais pas les autres
 * dossiers de build. Or `.claude/push-si-vert.sh` construit dans
 * `.next-verif/` pour ne pas écraser le `.next` d'un serveur local en
 * cours (voir `distDir` dans next.config.ts).
 *
 * Sans cette ligne, `npm run lint` analyse le code GÉNÉRÉ qui s'y trouve
 * et sort en erreur — donc le garde-fou refuse de pousser, à partir du
 * deuxième commit seulement, puisque le dossier n'existe pas au premier.
 * Piège rencontré et corrigé le 2026-09-02, avant qu'il ne morde.
 */
const config = [{ ignores: [".next-verif/**"] }, ...nextConfig];

export default config;
