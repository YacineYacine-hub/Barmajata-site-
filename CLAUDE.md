# BARMAJATA

Site vitrine de BARMAJATA, maison d'édition qui publiera plusieurs livres
de plusieurs auteurs. **Ce n'est pas un site de bar/restaurant** malgré le
nom. Le nom de la maison s'écrit en un seul mot : **BARMAJATA** (forme
déposée) — jamais "Barma Jata" en deux mots.

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
- Anciennes routes (ex-site mono-autrice), gérées dans `src/proxy.ts`
  (avant next-intl, car `nextUrl.pathname` n'est jamais décodé — les
  segments non-ASCII y restent en `%XX`) :
  - `/autrice`, `/author`, `/الكاتبة` → 301 vers l'équivalent `/auteurs`
    dans la même locale (contenu déplacé).
  - `/methode`, `/spiritualite` et leurs traductions → 410 Gone (contenu
    retiré définitivement, absorbé par la fiche livre concernée).
- SEO : `src/lib/seo.ts` définit `PUBLIC_LOCALES` (`fr`, `en` — `ar` reste
  pleinement accessible sur le site mais volontairement absent des
  `hreflang`/`alternates.languages` tant qu'il n'est pas jugé prêt pour
  l'indexation) et `buildAlternates(href)`, utilisé dans le
  `generateMetadata` de **chaque page** (y compris `/engagement`, malgré
  son noindex, et les pages dynamiques `[slug]`).

## Identité visuelle (Lot 3)

- `public/brand/` : `logo-horizontal-light.svg` (header — fond
  `bg-nuit-900` depuis la refonte de palette, voir plus bas ; version
  claire dédiée, `logo-horizontal.svg` reste la version sombre pour un
  usage futur sur fond clair), `logo-lockup.svg` / `logo-lockup-dark.svg`
  (footer, selon fond clair/sombre — seul le clair est câblé, le footer
  étant toujours `bg-lin-50` aujourd'hui), `favicon.svg`,
  `apple-touch-icon.png` (180×180), `og-image.png` (1200×630),
  `logo-512.png` (512×512, JSON-LD Organization).
  **Ce sont des placeholders générés par Claude** (lettrage "BARMA JATA" +
  monogramme "B", palette du site) — à remplacer par les fichiers
  définitifs du designer, mêmes noms de fichiers.
- Le logo est toujours référencé via `<img src="/brand/...">` (jamais
  inliné en `<svg>`) : une image externe rend dans son propre contexte,
  totalement isolé du `dir` de la page qui l'affiche — c'est ce qui
  garantit structurellement qu'il ne se miroite ni ne se réordonne en
  RTL, indépendamment du `dir="ltr"` (défensif) posé sur son conteneur.
- `alt="BARMAJATA Éditions"` du logo header : toujours en dur dans
  `Header.tsx`, jamais dans `messages/*.json` (identique dans les 3
  langues, contrairement à `site.name` qui, lui, est traduit).
- `metadataBase` (vers `SITE_URL`) posé dans
  `src/app/[locale]/layout.tsx` pour que `openGraph.images` résolve en
  URL absolue (requis par le protocole Open Graph).

## Header, Hero, animations

- `Header.tsx` : bandeau plein `bg-nuit-900`, `sticky top-0`, toujours
  visuellement séparé du Hero (jamais en overlay transparent dessus).
  Au-delà de 80px de scroll (`SCROLL_SHRINK_THRESHOLD`), hauteur/logo
  réduits, `transition-[...] duration-200`. `LocaleSwitcher.tsx` a des
  couleurs figées pour fond sombre (couplé au Header — à revoir s'il est
  réutilisé ailleurs).
- `Hero.tsx` : composant réutilisable (`eyebrow?`, `title`, `subtitle?`,
  `image?: { src, alt }`). Sans image : dégradé
  `from-lin-100 via-sable-300 to-gres-600`. Avec image : `next/image`
  `fill priority sizes="100vw"`. Ratio `aspect-[4/5]` mobile,
  `sm:aspect-[16/9]` desktop. Titre toujours `text-nuit-900`, y compris
  avec image (pas de scrim — à ajouter si une vraie photo pose un
  problème de contraste). Utilisé sur `/` pour l'instant.
- `Reveal.tsx` : fondu + `translate-y-3` (12px), `duration-[400ms]`,
  jamais de rebond ni de rotation. `delayMs={index * 80}` pour la cascade
  des grilles catalogue (`books/page.tsx`, `authors/page.tsx`) et de la
  grille de piliers sur `/`. `prefers-reduced-motion` géré à deux
  niveaux : `globals.css` coupe `transition-duration`/`animation-duration`
  pour tout le monde, et `Reveal` évite en plus tout état masqué initial
  pour ces utilisateurs (rendu visible dès le premier passage, pas de
  flash) via `window.matchMedia`.

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
- Couvertures (`book.couverture`) affichées sur la carte catalogue et la
  fiche livre via `<img>` — champ optionnel, pas de rendu si absent.

## Contenu de démonstration (`NEXT_PUBLIC_DEMO_CONTENT`)

- `src/content/_demo/books/*.json` et `src/content/_demo/authors/*.json` :
  3 livres factices (`publie` à 3 formats, `a_paraitre`, `brouillon`) + 2
  auteurs factices, textes explicitement lorem ipsum, ASIN/ISBN fictifs
  mais au bon format. Couvertures SVG générées dans
  `public/demo/covers/` (aplat sable, titre en `font-family:
  'Cormorant Garamond'` — sans import de police externe, donc dépendant
  des polices déjà chargées par la page qui affiche l'image).
- Chargé uniquement quand `NEXT_PUBLIC_DEMO_CONTENT=true`
  (`src/lib/content/index.ts`) : dossiers `_demo/` en plus des dossiers
  réels. Absent/`false` (défaut) → comportement strictement identique à
  avant, catalogue vide. Voir `.env.example`.
- Fixé **au build** (préfixe `NEXT_PUBLIC_` = inliné par Next.js à la
  compilation, pas lu au runtime) : `NEXT_PUBLIC_DEMO_CONTENT=true npm run
  build` puis `npm run start` pour juger le rendu ; un `npm run build`
  sans la variable régénère le site en catalogue vide.
- **Jamais activé sur Vercel en production** — variable d'environnement à
  ne pas définir sur le projet de prod, uniquement en local/preview au
  besoin.
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

Tons éditoriaux : `lin` (fonds clairs), `sable`/`gres` (tons intermédiaires,
`gres-600` jamais en corps de texte — contraste AA insuffisant), `or`
(accent, jamais un bouton principal), `roche` (texte secondaire), `nuit`
(texte principal / fond du header et des boutons principaux). Règles
d'usage détaillées en commentaire dans le `@theme`. Valeurs exactes dans
`src/app/globals.css`.

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
