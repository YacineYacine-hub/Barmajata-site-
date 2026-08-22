# Barma Jata

Site vitrine de Barma Jata, maison d'édition, mettant en avant son autrice
Daya Layla. **Ce n'est pas un site de bar/restaurant** malgré le nom.

## Phase 1 — périmètre

- Aucune base de données, aucun paiement.
- Contenu éditorial réel non encore fourni : toutes les pages utilisent des
  placeholders neutres ("Contenu à venir." / "Content coming soon." /
  "المحتوى قادم قريبًا."). Ne jamais inventer de texte biographique sur
  l'autrice.
- Quatre piliers de contenu, mis en avant sur l'accueil et déclinés en
  pages dédiées : Méthode, Spiritualité, Engagement, Journal.

## Stack

- Next.js 16 (App Router, Turbopack), TypeScript.
- next-intl v4 pour l'i18n : routing avec `pathnames` traduits, préfixe de
  locale toujours présent (`localePrefix: "always"`).
- Tailwind CSS v4, configuration CSS-first via `@theme` dans
  `src/app/globals.css` (pas de `tailwind.config.js`).
- Rendu **statique** partout sauf `/b/[code]` : chaque page appelle
  `setRequestLocale(locale)` en première ligne de son composant.

## i18n / RTL

- Locales : `fr` (défaut), `en`, `ar`.
- Slugs traduits par locale (voir `src/i18n/routing.ts`), ex.
  `/autrice` (fr) / `/author` (en) / `/الكاتبة` (ar).
- `ar` est RTL (`dir="rtl"` posé dans `src/app/[locale]/layout.tsx`).
  Contrainte stricte : n'utiliser que des classes Tailwind logiques
  (`ms-*`, `me-*`, `ps-*`, `pe-*`, `text-start`, `text-end`) — jamais
  `ml-*`, `mr-*`, `pl-*`, `pr-*`, `text-left`, `text-right`.
- Polices : Cormorant Garamond (`--font-serif`, titres), Inter
  (`--font-sans`, texte latin), Noto Naskh Arabic (`--font-arabic`, texte
  arabe) — chargées via `next/font/google` dans le layout locale.

## Palette (voir `src/app/globals.css`)

Tons éditoriaux : `ink` (encre, texte), `sand` (fonds), `gold` (accent),
`deep` (vert profond). Valeurs exactes dans le `@theme`.

## Routes techniques hors préfixe locale

- `/b/[code]` — redirection 302 QR code (`src/app/b/[code]/route.ts`),
  table de correspondance en dur pour l'instant (pas de DB en Phase 1).
- `/sitemap.xml`, `/robots.txt` — générés (`src/app/sitemap.ts`,
  `src/app/robots.ts`), excluent `/b/`.

## Convention Next.js 16

Le fichier de middleware suit la convention `src/proxy.ts` (et non
`middleware.ts`, dépréciée depuis Next 16).

## Déploiement

Pas de Docker : le `Dockerfile`, `.dockerignore` et `output: "standalone"`
(next.config.ts) ont été retirés. Déploiement prévu directement sur un
VPS (`npm run build` puis `npm run start`), stratégie exacte à définir
quand le VPS sera provisionné. `.github/workflows/ci.yml` vérifie
uniquement le build (`tsc --noEmit` + `next build`) sur chaque push —
aucun déploiement automatique n'est configuré.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
