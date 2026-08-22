# Barma Jata

Site vitrine de Barma Jata, maison d'édition qui publiera plusieurs livres
de plusieurs auteurs. **Ce n'est pas un site de bar/restaurant** malgré le
nom.

## Phase 1 — périmètre

- Aucune base de données. Vente **exclusivement par redirection Amazon**
  (pas de paiement ni panier en direct sur le site) — voir
  `src/components/AmazonBuyButton.tsx`.
- Contenu éditorial réel non encore fourni : toutes les pages statiques
  utilisent des placeholders neutres ("Contenu à venir." / "Content coming
  soon." / "المحتوى قادم قريبًا."). Ne jamais inventer de texte
  biographique ou éditorial sur un auteur ou un livre. Les catalogues
  livres/auteurs (`src/content/`) sont vides par conception — voir
  "Modèle de contenu" ci-dessous.
- Pages : Livres (`/livres`), Auteurs (`/auteurs`), La maison
  (`/la-maison`), Journal, Contact, légales. `/engagement` existe mais est
  volontairement **hors menu et en noindex** tant que le partenariat
  associé n'est pas fixé — voir le commentaire dans
  `src/app/[locale]/commitment/page.tsx`.

## Modèle de contenu — livres et auteurs

- `src/content/books/*.json` et `src/content/authors/*.json` : un fichier
  par entrée, aucune base de données. Chaque dossier contient un
  `_template.json` commenté (tous champs vides) qui sert de gabarit à
  copier — il est ignoré par le loader (tout fichier préfixé `_` est
  exclu).
- Validation Zod dans `src/lib/content/schema.ts`, lecture/tri/filtres
  dans `src/lib/content/index.ts` (aucun accès disque ailleurs).
- Un livre (`slug`, `auteurSlug`, `couverture`, `seo`) porte un tableau
  `editions[]` : une entrée par langue, chacune avec son propre `statut`,
  son contenu (`titre`, `resumeCourt`, `resumeLong`...), sa `dateParution`
  et ses `formats[]` — un même livre peut être `publie` en français et
  `a_paraitre` en anglais. `resolveEdition(book, locale)` dans
  `schema.ts` choisit l'édition à afficher : celle de la locale active si
  elle existe et n'est pas `brouillon`, sinon la première édition visible
  du tableau ("édition d'origine"), à charge pour la page d'afficher la
  mention de sa langue.
- Statut d'une édition (`statut`) conditionne tout son affichage :
  - `brouillon` → invisible partout (catalogue, fiche, sitemap), même par
    URL directe.
  - `a_paraitre` → fiche visible, `dateParution` affichée, CTA
    `NotifyMe` (`src/components/NotifyMe.tsx`) vers `/club?book=&langue=`
    à la place du bouton d'achat — jamais d'URL externe dans les fichiers
    de contenu.
  - `publie` → bouton "Acheter sur Amazon" par format vendable (voir
    ci-dessous), prix toujours affiché avec la mention "À partir de"
    (jamais un prix sec — `getMinPrice()` dans `schema.ts`).
- `auteurSlug` d'un livre doit référencer un auteur existant : le build
  échoue sinon (vérifié dans `getAllBooks()`).
- Vente Amazon : chaque format porte un `asin` optionnel (+ `urlOverride`
  en échappatoire). `src/lib/amazon/marketplaces.ts` définit la table des
  marketplaces (dont `ae`/`sa` désactivées, `actif: false`) et
  `buildAmazonUrl(asin, marketplace, tag?)`. Marketplace par défaut selon
  la locale du site (`fr`→`fr`, `en`/`ar`→`com`) ; le choix de l'utilisateur
  est mémorisé en cookie côté client uniquement (`AmazonBuyButton.tsx`) —
  jamais de géo-IP, jamais de lecture de cookie côté serveur (la page
  resterait sinon dynamique au lieu de statique).
- JSON-LD schema.org : `Book` sur la fiche livre, `Person` sur la fiche
  auteur, `Organization` sur `/la-maison`, `ItemList` sur le catalogue
  livres — générés dans `src/lib/content/jsonld.ts`.
- `/club` (`src/app/[locale]/club/page.tsx`) : page d'inscription unique
  (e-mail seul), pas de backend en Phase 1 — `ClubForm.tsx` est un
  formulaire inerte (`TODO(club-backend)` dans le code) qui affiche un
  message d'attente après soumission. Reste statique malgré `?book=`/
  `?langue=` : la liste (slug, langue, titre) des éditions visibles est
  calculée côté serveur et la résolution du paramètre se fait côté client
  via `useSearchParams()`, pour ne pas forcer la page en rendu dynamique.

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
  `/auteurs` (fr) / `/authors` (en) / `/المؤلفون` (ar).
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
