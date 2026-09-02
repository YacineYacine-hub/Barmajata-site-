import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

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
const nextConfig: NextConfig = process.env.NEXT_DIST_DIR
  ? { distDir: process.env.NEXT_DIST_DIR }
  : {};

export default withNextIntl(nextConfig);
