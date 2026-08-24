# BARMAJATA

Site vitrine de BARMAJATA, maison d'édition qui publiera plusieurs livres
de plusieurs auteurs. **Ce n'est pas un site de bar/restaurant** malgré le
nom. Le nom de la maison s'écrit en un seul mot : **BARMAJATA** (forme
déposée) — jamais "Barma Jata" en deux mots.

## Règles de travail

Ces règles s'appliquent à toute session sur ce projet, avant toute
considération technique.

- **Devoir de conseil.** Dire NON fermement à une mauvaise idée, expliquer
  pourquoi, et proposer mieux. Ne jamais exécuter une demande
  techniquement mauvaise sans avertir d'abord. Si l'utilisateur maintient
  sa décision après l'avertissement, elle est appliquée — mais l'avis doit
  avoir été donné.
- **Risques juridiques : les signaler systématiquement**, sans attendre
  qu'on les demande. En particulier :
  - faux avis / témoignages fabriqués ;
  - allégations caritatives sans chiffre vérifiable (« une partie des
    ventes est reversée à… ») ;
  - affichage d'un prix sur le site alors que la vente passe par Amazon
    (le prix Amazon varie ; un prix figé ici devient une information
    trompeuse) ;
  - promesses de soin, de guérison ou de résultat thérapeutique.
- **Ne jamais inventer de contenu éditorial réel** — aucun texte de bio,
  de résumé, de journal ou de page institutionnelle sorti de nulle part.
  Placeholders neutres ou texte explicitement marqué comme fictif
  uniquement (voir « Phase 1 — périmètre »).
- **Jamais de token GitHub.** Ne pas en demander, ne pas en stocker, ne
  pas en attendre. Le push est fait par l'utilisateur avec `git push`.
- **Aucune préversion en dépendance** : ni alpha, ni beta, ni RC, ni
  `canary`. Uniquement des versions stables publiées.
- **Vérifier avant d'affirmer** : lire le code, pas la mémoire. Toute
  affirmation sur le comportement du projet doit venir d'un fichier lu
  dans la session en cours.
- **Rappeler la phase en cours** si la conversation dérive vers du hors
  périmètre (paiement direct, base de données, e-commerce complet…) — voir
  « Phase 1 — périmètre ».

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
- Pages éditoriales du Lot C (`/la-maison`, `/journal`, `/contact`) :
  `EditorialPage.tsx` (bandeau `SectionBanner.tsx` en `bg-nuit-900` +
  sections numérotées sur `lin-50`, via `t.raw("sections")`). Texte de
  remplissage **explicitement fictif** (lorem, "Texte de démonstration,
  aucun contenu éditorial réel" — voir `messages/*.json` →
  `pages.house/journal/contact`), à remplacer par du contenu réel quand
  il sera fourni. Distinct de `SectionPage.tsx` (une ligne, réservé aux
  pages légales, non touché par le Lot C). `/auteurs` et `/auteurs/[slug]`
  reprennent le même bandeau `SectionBanner` pour la cohérence visuelle
  mais **sans texte fictif** : ils n'affichent que des données réelles
  (`author.nom`, `bioCourte`/`bioLongue`) ou les états "vide" existants.
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
  (footer, selon fond clair/sombre — le footer est en `bg-nuit-900`, donc
  c'est `logo-lockup-dark.svg` qui est câblé ; vérifié dans `Footer.tsx`), `favicon.svg`,
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

## Header, Hero/carrousel, footer, animations

- `Header.tsx` : bandeau plein `bg-nuit-900`, `sticky top-0`, toujours
  visuellement séparé du Hero (jamais en overlay transparent dessus).
  Au-delà de 80px de scroll (`SCROLL_SHRINK_THRESHOLD`), hauteur/logo
  réduits, `transition-[...] duration-200`. Disposition : sceau+nom
  (`logo-horizontal-light.svg`) à gauche ; sélecteur de langue, lien
  "Livres" en clair puis bouton menu (3 traits) à droite — identique à
  toutes les tailles d'écran, plus de nav desktop séparée. Le bouton ouvre
  un panneau plein écran (`role="dialog" aria-modal`, `Auteurs`/`La
  maison`/`Journal`/`Contact` — pas "Livres", déjà direct dans le
  bandeau) : Échap ferme, Tab/Shift+Tab piégés dedans (`FOCUSABLE_SELECTOR`),
  focus posé sur le bouton de fermeture à l'ouverture puis restitué au
  déclencheur à la fermeture, scroll de la page bloqué pendant.
  `LocaleSwitcher.tsx` a des couleurs figées pour fond sombre (utilisé
  dans Header **et** Footer, tous deux `bg-nuit-900`).
- `Hero.tsx` : carrousel manuel uniquement — **jamais** de défilement
  automatique. `slides: HeroSlide[]` (`eyebrow?`, `title`, `subtitle?`,
  `image?: { src, alt }`) ; toutes les diapositives restent dans le HTML
  (indexation), seule une `transform: translateX` masque celles qui ne
  sont pas actives. Navigation : flèches clavier (sens inversé en RTL,
  détecté via `document.documentElement.dir`), balayage tactile
  (`SWIPE_THRESHOLD_PX`), traits de progression cliquables — masqués s'il
  n'y a qu'une diapositive. Sans image : dégradé
  `from-lin-100 via-sable-300 to-gres-600`. Avec image : `next/image`
  `fill priority sizes="100vw"`. Ratio `aspect-[4/5]` mobile,
  `sm:aspect-[16/9]` desktop. Titre toujours `text-nuit-900` (pas de scrim
  — à ajouter si une vraie photo pose un problème de contraste). Un seul
  slide réel utilisé sur `/` pour l'instant (aucun contenu réel
  supplémentaire à inventer).
- `StickyBuyBar.tsx` : barre collante mobile (titre, prix, premier format
  vendable) sur la fiche livre publiée. Apparaît après 200px de scroll,
  `md:hidden` (donc masquée ≥768px — coïncide avec le breakpoint `md` de
  Tailwind). `<main>` a un `pb-28 md:pb-16` pour ne pas être recouvert.
- `Footer.tsx` : bandeau `bg-nuit-900` (desktop et mobile) →
  `logo-lockup-dark.svg`, copyright, liens sociaux (`src/lib/social.ts`,
  `SOCIAL_LINKS` vide par conception — section masquée tant qu'aucun lien
  réel n'est fourni), sélecteur de langue.
- `PageTransition.tsx` : fondu de 250ms au changement de page
  (`@keyframes page-fade` dans `globals.css`), posé dans
  `[locale]/layout.tsx` entre `Header` et `Footer`. `key={pathname}`
  force le remontage à chaque navigation pour rejouer l'animation ;
  coupée pour `prefers-reduced-motion` par la règle globale existante
  (aucune logique dédiée à ce composant).
- `Reveal.tsx` : fondu + translation de 14px, jamais de rebond ni de
  rotation. **Réécrit au Lot H1** — toute la mécanique est passée dans
  `globals.css` (`.reveal`, `animation-timeline: view()`) : plus de
  `"use client"`, plus d'`IntersectionObserver`, plus de
  `useSyncExternalStore`, c'est redevenu un composant serveur qui n'envoie
  aucun JavaScript. La prop `delayMs` est devenue `index` (`index={i}`) :
  sur une timeline de défilement un délai en millisecondes n'a plus de
  sens, la cascade se décale dans la timeline via `--reveal-decalage`,
  plafonnée au 8e rang. Appelé par les grilles catalogue
  (`books/page.tsx`, `authors/page.tsx`) et la grille de piliers sur `/`.
  `prefers-reduced-motion` : voir les deux pièges documentés dans
  `globals.css` (la règle globale ne suffit pas pour une animation liée au
  scroll).

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
- Couvertures 2D (`book.couverture`) affichées sur la carte catalogue via
  `<img>` — champ optionnel, pas de rendu si absent. La fiche livre, elle,
  affiche `BookSolid` (voir plus bas) à la place.
- Genres (`book.categories`, quatre valeurs figées : `famille` |
  `psychologie` | `thriller` | `histoire-vraie`) : un livre peut en porter
  plusieurs, champ optionnel. Distinct de `formats[].type` (broché/epub/
  pdf) — jamais confondu. Slugs de filtre traduits par locale dans
  `src/lib/content/categories.ts` (`CATEGORY_SLUGS`) ; arabe non fourni,
  anglais utilisé en attendant (TODO traduction humaine, voir aussi
  `messages/ar.json` → `categories.famille/psychologie/thriller/
  histoire-vraie`, volontairement en anglais alors que `categories.all`/
  `categories.new` sont bien traduits).
- "Nouveautés" est un **filtre calculé**, jamais stocké : `isNewRelease()`
  dans `schema.ts` (édition `publie`, parution dans les 12 derniers mois,
  jamais dans le futur).
- Textures du livre en volume (`couvertureImage`, `quatriemeImage`,
  `dosImage`, toutes par édition) et `epaisseurMm` (dérivée des pages du
  format broché × 0,07 via `getEpaisseurMm()` si absente) — distinctes de
  `book.couverture`, consommées par `BookSolid` (voir plus bas).
- `extrait` (par édition, optionnel) : court passage du texte, affiché en
  citation sur la fiche livre. Distinct de `resumeCourt`/`resumeLong`
  (résumés éditoriaux, pas un extrait du texte lui-même).
- `getAdjacentBooks(book)` (`src/lib/content/index.ts`) : livre précédent/
  suivant sur la fiche, dans l'ordre du catalogue (`compareBooks`), parmi
  les livres visibles partageant **au moins une** catégorie avec `book`
  (un livre peut en avoir plusieurs). Sans catégorie sur `book`, ou sans
  aucun livre visible partageant une catégorie, aucun voisin n'est
  affiché — pas de repli sur l'ordre global du catalogue.
- Fiche livre (`/livres/[slug]`) : fil d'Ariane (Accueil / Livres / titre,
  doublé d'un JSON-LD `BreadcrumbList` via `buildBreadcrumbListJsonLd()`
  dans `src/lib/content/jsonld.ts`), extrait en citation, bloc auteur
  (portrait rond via `next/image` — initiale de repli sans `portrait` —,
  nom, `bioCourte[locale]`, lien vers la fiche auteur), navigation livre
  précédent/suivant. **Aucun avis, aucune étoile** : volontairement hors
  périmètre tant qu'aucune décision n'a été prise sur le sujet.

## BookBand et BookSolid

- `BookBand.tsx` : bande continue et bouclée de couvertures (`/`, sans
  filtre — "une vitrine, pas la boutique" — et `/livres`, avec filtre).
  Position continue (`positionRef`, pas un index entier), distance au
  centre calculée modulo (`wrappedDelta()`) pour boucler sans à-coup.
  ≥640px : échelle 1,34→0,84, rotation Y max ±38°, recul Z, opacité nulle
  au-delà d'une distance de 3,7 (`OPACITY_CUTOFF_DISTANCE`) — constantes
  données par la spec ; espacement/recul en px sont des choix
  d'implémentation documentés en commentaire dans le fichier. <640px :
  défilement horizontal natif, aucune transform. Glissement pointeur,
  molette **horizontale uniquement** (`deltaX` vs `deltaY`, jamais de
  `preventDefault` si la verticale domine — ne bloque jamais le scroll de
  la page), flèches clavier (sens inversé en RTL), calage amorti en fin de
  geste (`settleTo`, coupé net par `prefers-reduced-motion`).
  `role="listbox"` / `role="option"` / `aria-selected`. Clic sur la
  couverture centrale : navigation normale (comportement par défaut du
  `<Link>`). Clic sur une couverture latérale : `event.preventDefault()`
  + recentrage vers cette couverture (`settleTo`, plus court chemin
  bouclé via `wrappedDelta()`), aucune navigation. **Rend toujours la
  totalité des éléments reçus, liens réels vers `/books/[slug]` inclus,
  sans dépendre de `useSearchParams`** — un filtre externe ne doit
  masquer visuellement des éléments (`mutedSlugs`, opacité 0 +
  `pointer-events: none` + `aria-hidden`) qu'*après* ce rendu de base,
  jamais en le conditionnant, sous peine de sortir la bande du HTML
  statique (piège rencontré et corrigé pendant le développement — voir
  `BookBandSection.tsx` : seule la lecture de `?categorie=` vit dans une
  feuille `Suspense` séparée, isolée du rendu de la bande elle-même).
- `BookBandSection.tsx` (`/livres` uniquement) : puces Tout / Nouveautés
  (`NEW_RELEASES_PARAM = "nouveautes"`, réservé, non traduit par locale) /
  quatre genres, mettent à jour `?categorie=` (slug traduit via
  `categoryToSlug()`) — ce sont de vrais `<Link>` vers
  `/livres?categorie=slug` (indexables, fonctionnels sans JS). Le
  catalogue en grille classique sous la bande reste, lui, complet et non
  filtré.
- `BookSolid.tsx` : livre en volume par **projection SVG**, pas de CSS 3D.
  8 sommets (`localVertices`), rotation Y puis X (`rotateYX`), projection
  perspective focale 780 (`FOCAL`, `CAMERA_DISTANCE` = choix
  d'implémentation). 6 faces (`FACES`), élimination arrière sur la normale
  rotatée (`nz <= 0` culled, gardé si `nz > 0`), tri peintre par
  profondeur moyenne avant tracé. Éclairage lambertien fixe par rapport à
  la caméra (`LIGHT_DIR`, pas tourné avec l'objet) : ambiant 0,62 + diffus
  0,38. Chaque polygone a `fill` **et** `stroke` de la même couleur
  (`STROKE_WIDTH = 1.1`) pour supprimer les interstices d'anticrénelage
  entre faces adjacentes. Les 3 faces texturables (couverture, quatrième,
  dos) placent leur `<image>` via une **matrice affine dérivée de 3 des 4
  coins projetés** (approximation affine assumée par la spec, pas une
  correction perspective par pixel) ; sans image, aplat coloré teinté par
  l'éclairage. Rotation libre 2 axes à la souris/au toucher, inertie
  (décroissance 0,93/frame, coupée par `prefers-reduced-motion` — ajout
  défensif au-delà de la spec, cohérent avec le reste du site), flèches
  clavier, bouton "Redresser" (retour à `yaw=0, pitch=0`).
- Aucune vérification visuelle possible côté agent (pas d'outil
  navigateur dans cette session) : la géométrie/physique a été vérifiée
  par relecture et par inspection du HTML/SVG généré (coordonnées,
  couleurs éclairées, matrices affines), pas par capture d'écran. À
  confirmer visuellement par un humain.

## Contenu de démonstration (`NEXT_PUBLIC_DEMO_CONTENT`)

- `src/content/_demo/books/*.json` et `src/content/_demo/authors/*.json` :
  4 livres factices (`publie` à 3 formats avec `categories`+
  `couvertureImage`, `a_paraitre`, `brouillon`, `publie` 1 format non
  récent — pour tester `isNewRelease()` en négatif) + 2 auteurs factices,
  textes explicitement lorem ipsum, ASIN/ISBN fictifs
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
- `/club` (`src/app/[locale]/club/page.tsx`) : inscription (e-mail +
  case de consentement, jamais pré-cochée) avec **double opt-in réel**
  (Lot E), voir "Club (double opt-in)" ci-dessous. Reste statique malgré
  `?book=`/`?langue=` : la liste (slug, langue, titre) des éditions
  visibles est calculée côté serveur et la résolution du paramètre se
  fait côté client via `useSearchParams()`, pour ne pas forcer la page en
  rendu dynamique.

## Club (double opt-in, Lot E)

- Aucune base de données (contrainte Phase 1 inchangée) : le
  consentement en attente n'est stocké nulle part côté serveur, il est
  entièrement porté par un **jeton signé HMAC** (`src/lib/club/token.ts`,
  `CLUB_CONFIRM_SECRET`, 48h d'expiration) — `{ email, bookSlug?,
  langue?, exp }` encodé + signature, vérifié en temps constant
  (`crypto.timingSafeEqual`). `verifyConfirmToken()` ne lance jamais
  (secret absent, jeton malformé, expiré ou falsifié → `undefined`,
  jamais une exception) : un lien de confirmation cliqué des mois plus
  tard, ou sur un déploiement mal configuré, ne doit jamais faire planter
  la route — juste rediriger vers `?confirm=invalid`.
- `src/lib/club/providers.ts` : abstraction Brevo/Resend, un seul actif
  à la fois (`BREVO_API_KEY` prioritaire si les deux sont définies).
  `sendTransactionalEmail()` (e-mail de confirmation) et
  `addConfirmedContact()` (ajout réel à la liste — Brevo `/v3/contacts`
  + `BREVO_LIST_ID` optionnel, Resend `/audiences/{id}/contacts` +
  `RESEND_AUDIENCE_ID` requis) sont **deux étapes séparées** : le contact
  n'est ajouté à la liste qu'à la confirmation, jamais à l'inscription
  initiale — c'est ce qui fait du double opt-in un vrai double
  consentement plutôt qu'un simple e-mail de bienvenue.
- Flux : `POST /api/club/subscribe` (email + `consent: true` obligatoire
  + locale, Zod) → si aucun fournisseur configuré, 503 immédiat ; sinon
  crée le jeton et envoie l'e-mail de confirmation
  (`src/lib/club/email.ts`, gabarit HTML par locale, RTL pour l'arabe).
  `GET /api/club/confirm?token=&locale=` (lien cliqué dans l'e-mail) →
  vérifie le jeton, appelle `addConfirmedContact()`, puis redirige vers
  `/club?confirm=success|invalid|error`.
- `ClubForm.tsx` reçoit `serviceEnabled` (calculé côté serveur via
  `getConfiguredProvider() !== undefined`, **au moment du rendu statique**
  — comme `NEXT_PUBLIC_DEMO_CONTENT`, une bascule de fournisseur exige un
  nouveau build/déploiement). Sans fournisseur configuré, le formulaire
  reste inerte (champs et bouton désactivés) avec un message clair
  (`club.serviceUnavailable`) — pas d'échec silencieux à la soumission.
  Case de consentement RGPD jamais pré-cochée (`useState(false)`), texte
  de consentement + note RGPD toujours affichés
  (`club.consentLabel`/`club.gdprNote`), lien vers `/privacy-policy`.
- Variables d'environnement : voir `.env.example` — `BREVO_API_KEY` +
  `BREVO_LIST_ID` **ou** `RESEND_API_KEY` + `RESEND_AUDIENCE_ID`,
  `CLUB_FROM_EMAIL` + `CLUB_FROM_NAME`, `CLUB_CONFIRM_SECRET`.
- **Non testé avec de vraies clés** : aucun accès réseau sortant ni
  navigateur dans cette session. Le format des requêtes Brevo/Resend a
  été vérifié par relecture de leur documentation d'API, pas par un envoi
  réel. Le flux jeton (création, vérification, expiration) et les codes
  HTTP (503 sans fournisseur, 502 sur échec d'envoi, 400 sur corps
  invalide, redirections `?confirm=`) ont, eux, été vérifiés en local
  avec de fausses clés (échec attendu à l'appel réseau réel, capturé
  proprement).

## Performance et accessibilité (Lot F)

- Toutes les images passent par `next/image` (dernier `<img>` restant
  converti : couvertures `books/page.tsx`/`BookBand.tsx` en `fill` +
  `sizes`, logos `Header.tsx`/`Footer.tsx` en largeur/hauteur fixes).
  **Les SVG locaux (`/brand/*.svg`, `/demo/covers/*.svg`) fonctionnent
  avec `next/image` sans activer `images.dangerouslyAllowSVG`** : Next.js
  les sert directement (pas de passage par `/_next/image`, pas de
  génération de srcset raster) — vérifié par inspection du HTML rendu
  (`src` pointe vers le fichier original, `data-nimg` présent). `priority`
  sur le logo du header (visible immédiatement sur chaque page) et sur le
  premier slide du `Hero` (déjà en place avant ce lot).
- Polices (`next/font/google`, `[locale]/layout.tsx` et
  `bonus/layout.tsx`) : `display: "swap"` sur les trois (Cormorant,
  Inter, Noto Naskh Arabic), latin/arabic selon la police.
- `title` : `[locale]/layout.tsx` définit un `template` (`"%s — " + nom
  du site`) ; chaque page fournit désormais son propre titre court via
  `generateMetadata()` (résolu dynamiquement pour les pages `[slug]` —
  titre de l'édition/l'auteur — via une locale recherche de contenu
  dédiée, pas de duplication avec le composant de page). `description`
  ajoutée sur les pages qui n'en avaient pas (résumé/bio réels pour les
  fiches livre/auteur, texte déjà existant réutilisé — `lede`/`intro` —
  pour les pages éditoriales, rien d'inventé).
- Repères (landmarks) : le titre (`<h1>`) de chaque page bandeau
  (`SectionBanner`) est un enfant direct de `<main>`, jamais un frère —
  un titre hors de tout repère est un défaut détecté par les contrôles
  de type axe (corrigé sur `/la-maison`, `/journal`, `/contact`,
  `/auteurs`, `/auteurs/[slug]` pendant ce lot). Un seul `<main>` par
  page, vérifié sur l'ensemble du site.
- `nav aria-label` : la fiche livre a désormais une clé dédiée
  `nav.breadcrumb` ("Fil d'Ariane") au lieu de réutiliser par erreur
  `nav.home` ("Accueil") — bug introduit puis corrigé pendant ce lot.
- **Contraste** : `text-or-500` sur `lin-50`/`lin-100` mesure ~2,5:1 (sous
  le seuil AA, y compris pour du grand texte) — voir la règle mise à jour
  dans `globals.css`. Corrigé partout où c'était l'état par défaut affiché
  (badges de statut, lien "Voir la fiche", liens externes auteur, lien
  RGPD du club, libellé de `/bonus/[slug]`) en basculant vers
  `roche-700` (7,4:1 sur `lin-50`), avec `underline` ajouté sur les liens
  imbriqués dans du texte courant pour ne pas dépendre de la seule
  couleur. Les usages `hover:text-or-500` sur un état par défaut déjà
  conforme (roche-700, sable-300, lin-50) sont conservés : un survol
  transitoire n'est pas l'état évalué par un contrôle de contraste
  automatisé, et `or-500` reste pleinement conforme sur fond `nuit-900`
  (~5,8:1, déjà l'usage établi du Header/Footer/`SectionBanner`).
- Focus visible : l'anneau de focus n'est jamais supprimé pour un
  utilisateur au clavier. **Nuance introduite au Lot H10** : une seule
  règle globale, `:focus:not(:focus-visible) { outline: none }`, masque
  l'anneau au clic de souris — les éléments portant `tabIndex={0}` pour
  être pilotables au clavier (carrousel, bande, livre en volume)
  affichaient sinon un cadre à chaque clic. Ne JAMAIS élargir cela en
  `outline: none` sur `:focus` seul : le site deviendrait inutilisable
  sans souris.
- **Vérifié par lecture du HTML statique/RSC via `curl` et calcul manuel
  des ratios de contraste (formule WCAG), pas par un outil axe ni un
  navigateur** (aucun outil de ce type disponible dans cette session) — à
  confirmer avec un audit outillé (axe DevTools, Lighthouse) par un
  humain.

## Pages d'erreur (Lot G)

Avant ce lot, `notFound()` était appelé à cinq endroits sans qu'aucun
`not-found.tsx` n'existe : toutes les 404 tombaient sur la page par défaut
de Next.js (anglaise, sans style, sans Header/Footer), et le 410 renvoyait
un corps vide (page blanche).

- `[locale]/not-found.tsx` : 404 traduite, rendue dans le layout localisé
  (Header/Footer, provider next-intl). `not-found.tsx` ne reçoit pas de
  `params` — impossible d'y appeler `setRequestLocale()` — donc la locale
  vient de `useTranslations` (isomorphe, valide en composant serveur) et
  la page est rendue dynamiquement. Pour la même raison elle ne peut pas
  exporter de `metadata` : son `<title>` reste celui du layout.
- `[locale]/[...rest]/page.tsx` : catch-all qui appelle `notFound()`, pour
  qu'une URL inconnue **sous une locale valide** (`/fr/nimporte-quoi`)
  atteigne la 404 traduite au lieu de remonter à la 404 racine. Les routes
  réelles restent prioritaires (un catch-all n'est retenu qu'en dernier).
- `src/app/not-found.tsx` : 404 de dernier recours hors segment localisé
  (préfixe de locale invalide). Comme `bonus/layout.tsx`, elle déclare
  elle-même `<html>`/`<body>` et ses polices — le projet n'a pas de
  `src/app/layout.tsx`.
- `src/app/bonus/not-found.tsx` : 404 du segment QR, dans `bonus/layout.tsx`.
- `[locale]/error.tsx` : frontière d'erreur du segment (client, traduite
  via le provider du layout). Le message de l'exception n'est jamais
  affiché — seulement journalisé en console.
- `src/app/global-error.tsx` : filet ultime (erreur dans un layout
  racine). Sans next-intl, sans `globals.css`, sans `next/font` — l'erreur
  peut venir de leur chargement : styles en ligne, palette en dur,
  français, et lien `<a>` volontaire (rechargement complet du document).
  Affiche `error.digest` comme référence de support.
- **410** (`src/proxy.ts`) : `goneResponse()` renvoie désormais une page
  HTML autonome au lieu d'un corps vide. Le middleware ne peut ni rendre
  un composant React ni changer le statut d'un `rewrite` (Next.js ne
  l'autorise que pour les en-têtes) : le HTML est donc écrit à la main,
  styles en ligne, et les trois libellés sont dupliqués dans `proxy.ts`
  plutôt que lus dans `messages/*.json` — importer les fichiers de
  traduction alourdirait un bundle exécuté à chaque requête. `lang`/`dir`
  suivent le préfixe de locale du chemin.

### Limite connue : les 404 ne sont pas rendues côté serveur

Le HTML servi pour une 404 est une coquille vide (`<html
id="__next_error__">`, `<body>` sans contenu) : le corps n'existe que dans
le payload RSC et n'apparaît qu'après hydratation. **Comportement
antérieur à ce lot** (vérifié en rebuildant `HEAD` seul : même coquille
vide), et il concerne aussi bien `[locale]/not-found.tsx` que
`bonus/not-found.tsx`. Cause : Next.js exige un `src/app/layout.tsx`
racine pour rendre la frontière `not-found` côté serveur, et ce projet
n'en a pas (chaque sous-arbre déclare son propre `<html>`/`<body>`).
Conséquence : un visiteur sans JavaScript voit une page blanche sur une
404, et l'attribut `lang` manque sur ces réponses. Le statut HTTP 404,
lui, est correct. Corriger demanderait de remonter `<html>`/`<body>` dans
un layout racine et de convertir `[locale]/layout.tsx` et
`bonus/layout.tsx` en simples enveloppes — refactor non fait ici, à
arbitrer séparément. Le 410 n'est pas concerné : il sort du middleware,
entièrement rendu côté serveur.

## Refonte visuelle (Lot H) — direction arrêtée

Déclencheur : le site donnait une impression datée. Causes identifiées en
lisant le code, pas en supposant :

1. **Aucune image nulle part.** `[locale]/page.tsx` appelle `Hero` avec un
   seul slide **sans `image`** : il tombe sur le repli
   `bg-gradient-to-br from-lin-100 via-sable-300 to-gres-600`, un aplat
   beige plein écran. C'est la première chose que voit un visiteur.
2. **Zéro profondeur** : dans tout le projet, 2 `shadow-lg` et 1 ombre sur
   la barre mobile. Aucun `blur`, aucun `backdrop-filter`, aucune
   superposition, aucune texture.
3. **Mouvement bridé par la règle « jamais de rebond ni de rotation »**
   (fondu + 12 px, 400 ms).
4. **Colonne centrée partout** (`max-w-3xl` / `max-w-5xl`), sections
   empilées, typo plafonnée à `text-5xl`.

### La direction retenue : système à deux registres

Deux directions ont été maquettées et arbitrées par l'utilisateur —
maquette : https://claude.ai/code/artifact/5f571895-4fad-4f8e-8a2c-d16468618977

- **« Encre » en devanture** — accueil, hero, Header, Footer. Fond
  `nuit-900` dominant (et non plus seulement l'en-tête), titre monumental
  (`clamp` jusqu'à ~11rem), or en accent, livres en volume avec ombres
  portées dures.
- **« Papier » à l'intérieur** — les pages où l'on *lit* : la maison,
  journal, fiche livre, fiche auteur. Fond clair conservé, mais travaillé :
  dégradés maillés chauds, jamais l'aplat actuel.
- **La réglure d'imprimeur et le papier usé sont le liant** — présents
  dans les deux registres. C'est ce qui empêche le site de se lire comme
  deux sites collés. Déjà appliqué aux couvertures de démonstration
  (Lot H0) : grain `feTurbulence`, dégradé d'usure, réglure, double filet.

### Techniques retenues — natif, aucune dépendance ajoutée

Animations pilotées par le scroll (`animation-timeline: view()`, avec repli
`@supports` et coupure `prefers-reduced-motion`) en remplacement de
`Reveal` ; dégradés en couches + grain SVG ; OKLCH et `color-mix()` ;
container queries ; `text-wrap: balance`.

**Écarté volontairement** : les View Transitions de Next 16 passent par un
drapeau `experimental` — exclu par la règle « aucune préversion ».

### Fondations posées par H1 (`src/app/globals.css`)

- **Échelle typographique fluide** : `text-enseigne`
  (`clamp(3.4rem, 13vw, 10rem)`, interligne 0.86 — réservé au titre de la
  devanture, **un seul par page**), `text-titre`, `text-sous-titre`. Elles
  **prolongent** l'échelle Tailwind par défaut vers le haut, elles ne la
  remplacent pas. Le site plafonnait à `text-5xl` (3rem).
- **Profondeur** : `shadow-tome` (livre en volume sur fond sombre, ombre
  décalée vers la gauche + liseré interne clair qui détoure la tranche),
  `shadow-carte` (carte sur fond clair), `shadow-nappe` (élévation
  ambiante très basse).
- **Grain** : `--texture-grain`, bruit fractal SVG en data-URI (aucune
  requête réseau, se répète sans couture). Deux classes selon le fond :
  `.grain-encre` (mode `screen`, opacité 0.055) et `.grain-papier` (mode
  `multiply`, opacité 0.5). `isolation: isolate` sur la surface empêche le
  `mix-blend-mode` de déborder sur ce qu'il y a derrière.
- **Réglure** : `.reglure`, pilotée par `--reglure-pas` (défaut 34px) et
  `--reglure-encre` (défaut 5%). Construite sur `currentColor`, donc la
  même classe sert sur fond clair et sur fond sombre.
- `text-wrap: balance` sur `h1`/`h2`/`h3` — un mot orphelin en dernière
  ligne se voit d'autant plus aux tailles « enseigne ».

**Tailwind v4 élague les tokens `@theme` non utilisés** : tant qu'aucun
composant n'écrit `text-enseigne` ou `shadow-tome`, ces utilitaires
n'existent pas dans la feuille produite. Ce n'est pas un bug. Ils ont été
éprouvés pendant le lot avec un fichier sonde temporaire (créé, build,
vérification dans le CSS produit, supprimé) — les 7 utilitaires sont
générés correctement, interlignage et approche compris.

### Ce que H2 a posé (devanture « Encre »)

Header et Footer étaient **déjà** en `bg-nuit-900` — le diagnostic initial
le supposait autrement pour le footer. H2 a donc porté sur le corps de
l'accueil.

- `.champ-encre` (`globals.css`) : trois lueurs radiales décentrées
  mélangées `in oklab` par-dessus `nuit-900`. Remplace le
  `bg-gradient-to-br from-lin-100 via-sable-300 to-gres-600` du `Hero`,
  l'aplat beige qui était la première chose vue sur le site. C'est le seul
  endroit où la palette OKLCH sert réellement : un mélange en sRGB
  traverserait une zone grise entre l'or et le brun.
- `[locale]/page.tsx` : `bg-nuit-950` de bout en bout, cartes de piliers en
  `bg-nuit-900/70` + `shadow-nappe`, section en `.reglure` + `.grain-encre`.
  L'accueil est la **seule** page au fond sombre intégral ; les pages de
  lecture restent claires (H3).
- `Hero` : titre en `text-enseigne` + `font-light` (un Cormorant en 400
  devient lourd à cette taille), flèches et puces adaptées au fond sombre.
  Une photo de slide reçoit désormais un **voile dégradé** `nuit-950/85 →
  /20` : le texte de la devanture est clair, il ne peut pas dépendre de la
  luminosité d'une image qu'on ne contrôle pas.
- `BookBand` prend une prop `registre` (`"encre"` | `"papier"`, défaut
  `"papier"`). Seule la devanture passe `"encre"` et obtient `shadow-tome` ;
  `/livres` garde `shadow-lg`, `shadow-tome` y serait beaucoup trop lourde.
  **Attention : `BandCover` est rendu à deux endroits** (bande 3D ≥640px et
  repli à défilement natif <640px) — toute prop ajoutée doit l'être aux deux.

#### Nouvelle règle de contraste : l'or ne survit pas au champ

La règle du Lot F dit « `or-500` en texte est correct sur `nuit-900`
(~5,8:1) ». **Elle ne se transmet pas au champ maillé.** Là où passe la
lueur dorée, le fond monte jusqu'à ~`#584b3b`, et `or-500` y retombe à
**3,2:1** — sous le seuil AA pour du texte normal. Mesuré pendant le lot,
sur le surtitre du `Hero` qui est en `text-sm`.

Sur `.champ-encre`, en texte : `sable-300` (5,1:1 au pire point, 9,2:1 sur
aplat) ou `lin-100`/`lin-50`. `or-500` y reste admis pour du **non
textuel** (les puces du carrousel : 3,2:1 dépasse le seuil de 3:1 des
composants d'interface).

### Ce que H3 a posé (intérieur « Papier »)

- `.champ-papier` : pendant clair du champ Encre. Lueurs poussées à droite
  et en bas, pour que la colonne de texte (alignée au début de ligne) reste
  au plus près de `lin-50` et garde son contraste maximal.
- **`SectionBanner` est passé du sombre au clair.** C'était un aplat
  `bg-nuit-900` à texte `lin-50` ; il porte désormais `.champ-papier` +
  `.grain-papier`, titre en `text-titre`. Décision de fond : si chaque page
  intérieure s'ouvrait elle aussi sur une plaque sombre, **la devanture
  cesserait d'être distincte** et le système à deux registres n'aurait plus
  d'objet. `/` reste la seule page au fond sombre intégral.
- `/livres` s'ouvrait sur un simple `h1` posé sur le fond par défaut, sans
  tête de page : il reprend le bandeau, comme `/auteurs`. Il **reste
  clair** — même raison — et garde `registre="papier"` sur sa bande.
- Conséquence à ne pas manquer : tout ce qui était passé en `children` du
  bandeau était coloré pour un fond sombre. Le lien retour de
  `/auteurs/[slug]` (`text-sable-300`) devenait illisible ; basculé en
  `roche-700` + `underline`.

#### Piège CSS : deux classes ne peuvent pas écrire le même `background-image`

`.reglure` et `.champ-*` posaient toutes deux `background-image`. Combinées
sur un même élément, la dernière déclarée dans la feuille gagne — la
réglure aurait silencieusement effacé le champ. Repéré avant livraison.

La réglure est donc devenue une **couche** (`--reglure-couche`, déclarée
dans `@theme`), que les champs empilent en première position de leur liste
de `background-image`. `.reglure` subsiste pour une surface sans champ (la
section des piliers sur l'accueil) et consomme la même couche. **Ne jamais
combiner `.reglure` avec un `.champ-*`.**

#### Contraste mesuré sur le champ Papier

Point le plus sombre du champ (lueur d'or à 34 % puis sable à 46 %) :
`#dfd0b8`. Sur ce fond — `nuit-900` 10,0:1, `roche-700` 5,2:1 (les deux
seules couleurs de texte employées) ; `or-500` y tombe à 1,7:1 et
`gres-600` à 2,7:1, tous deux proscrits, ce qui confirme la règle du Lot F.

### Découpage restant

| Lot | Contenu | État |
|---|---|---|
| H0 | 10 livres + 10 auteurs + 10 couvertures de démo | **fait** |
| H1 | Fondations : échelle typo, tokens OKLCH, grain et réglure réutilisables, profondeur, bascule `Reveal` → scroll CSS | **fait** |
| H2 | Devanture « Encre » : accueil, Header, Footer | **fait** |
| H3 | Intérieur « Papier » : la maison, journal, fiches livre et auteur | **fait** |

### Règle d'animation : vérifiée, aucun changement nécessaire

Une note écrite ici avant le Lot H1 annonçait que la règle « jamais de
rebond ni de rotation » devrait être réécrite, au motif qu'elle
interdirait les livres en volume. **C'était faux, et la vérification l'a
montré** : cette règle est scopée à `Reveal` (l'apparition au défilement)
— voir sa formulation d'origine plus haut et le commentaire de
`globals.css`. Elle n'a jamais concerné `BookBand`, qui tourne déjà de
±38° en Y par spec. La règle est donc **conservée telle quelle**, H2
compris. Exemple utile de la règle « vérifier avant d'affirmer » : la note
erronée venait d'une mémoire de conversation, pas d'une lecture du code.

En revanche la règle de contraste `or-500` (Lot F) **reste inchangée** :
l'or est valide en texte sur `nuit-900` (~5,8:1), donc utilisable en
devanture ; sur les pages « Papier » il reste décoratif et ne porte jamais
de texte courant.

## Piège : `next build` sort en 0 malgré des erreurs

**Mesuré sur ce projet, pas supposé.** Retirer `pages.books.description`
de `messages/fr.json` fait imprimer `Error: MISSING_MESSAGE` pendant la
génération statique — et `npm run build` sort quand même en **code 0**.

Conséquences, dans l'ordre d'importance :

1. **La CI ne voit pas les clés de traduction manquantes.** Le workflow
   (`.github/workflows/ci.yml`) enchaîne `tsc --noEmit`, `eslint` et
   `npm run build` : les trois sortent en 0 alors que des pages se rendent
   sans leur `description`. C'est ainsi que le Lot F a pu livrer des pages
   incomplètes sans que rien ne l'accuse. **La CI n'était donc pas rouge** —
   une affirmation contraire a été faite en séance puis corrigée ici.
2. **Tout garde-fou fondé sur le seul code de sortie est inutile** contre
   cette classe de panne. `.claude/push-si-vert.sh` inspecte pour cette
   raison la *sortie* de chaque contrôle (`MISSING_MESSAGE`, lignes
   `Error:`, marqueur `⨯`) en plus du code de retour.
3. Le build est incrémental : une page inchangée n'est pas régénérée, donc
   son erreur n'est pas réimprimée. Un contrôle exhaustif demande un cache
   vide (`rm -rf .next`).

Les deux garde-fous appliquent désormais cette inspection :

- `.github/workflows/ci.yml`, étape « Build (échoue aussi sur une erreur
  signalée en code 0) » : `tee` dans `build.log`, `grep` sur les motifs,
  `exit 1` si l'un ressort. Vérifié en simulant l'étape localement dans
  bash — code 0 sur un dépôt sain, code 1 avec la clé retirée.
- `.claude/push-si-vert.sh`, en local avant tout push.

Les motifs sont dupliqués dans les deux fichiers, chacun renvoyant à
l'autre en commentaire : les factoriser demanderait un script partagé que
la CI devrait cloner avant de l'exécuter, pour trois lignes de `grep`.

Le build de la CI part d'un `checkout` neuf, donc sans cache : il ne
souffre pas de la génération incrémentale décrite au point 3.

## Lot H4 — inertie, frise, et le livre vu à ras

Demandes issues d'un retour sur le rendu réel de l'accueil.

### Inertie de la bande (`BookBand.tsx`)

Au lâcher, la bande se calait immédiatement sur la couverture la plus
proche (`settleTo(Math.round(...))`). Elle prolonge désormais le geste :

- la vitesse est mesurée pendant le glissement et **lissée**
  (`INERTIE_LISSAGE`, 72 % d'ancienne vitesse conservée) — un échantillon
  unique suffirait à faire partir la bande de travers sur un
  micro-soubresaut en fin de geste ;
- au `pointerup`, décroissance exponentielle. La distance parcourue vaut
  `vitesse / friction` : au plafond, `0,028 / 0,0035 ≈ 8` couvertures.
  Assez pour que le geste porte, trop peu pour traverser le catalogue
  d'un coup ;
- sous `INERTIE_VITESSE_LANCEMENT`, ou si l'utilisateur demande moins de
  mouvement, calage direct comme avant.

**L'identifiant d'animation est rangé dans `settleAnimRef`**, celui du
calage : tous les points qui annulaient déjà un calage en cours
(pointerdown, molette, clavier, clic pour centrer) annulent ainsi
l'inertie, sans qu'aucun d'eux n'ait eu à être modifié.

### Frise supérieure (`Header.tsx`)

La barre `bg-nuit-900` porte la réglure d'imprimeur : elle lit comme un
bandeau texturé, plus comme un aplat, et se relie au livre du pied de
page. `text-lin-50` y est **fonctionnel, pas décoratif** — la réglure est
bâtie sur `currentColor`, c'est lui qui la rend visible.

### Le livre vu à ras (`LivreARas.tsx`, `.livre-*`)

Pied de la devanture, pleine largeur : l'œil est posé au niveau de la
table, on regarde la tranche du livre ouvert. Trois indices suffisent à le
faire lire, et il n'y en a pas d'autres :

1. deux blocs très larges et très bas au sommet légèrement bombé
   (`border-radius: 100% 100% 0 0 / 22% 22% 0 0` — rayon horizontal
   complet pour une poignée de % vertical, d'où la courbe longue et molle
   d'une page qui s'affaisse), inclinés de ±0,7° ;
2. une réglure au pas de 3px sur leur épaisseur — la tranche des feuilles
   empilées, ce que les filets évoquaient depuis le début ;
3. une gouttière centrale en assombrissement **radial** et non en trait :
   aucune arête nette ne doit trahir le procédé.

Décoratif intégralement, donc `aria-hidden` et aucun texte.

Les onglets de l'accueil sont tassés vers le bas (`pt-32 pb-10`) pour venir
se poser sur ce livre au lieu de flotter au milieu de la page.

### Ce qui reste à faire sur ce lot

**L'image de fond unifiante n'existe pas encore.** L'intention : une image
courant du livre du pied jusqu'à la frise supérieure, passant *derrière* la
bande de couvertures et derrière le lettrage BARMAJATA. Les surfaces
génératives actuelles (`.champ-encre`, `.livre-*`) sont exactement les
emplacements qu'elle remplacera — la structure ne bougera pas.

**Le lettrage BARMAJATA doit rester du texte**, jamais une image : c'est un
`h1` en `text-enseigne`, et il doit le rester pour se détacher sur la
photo à venir.

## Lot H5 — l'accueil devient un livre ouvert

Changement de cap demandé après avoir vu le rendu réel : **la devanture
sombre du Lot H2 et le livre en perspective du Lot H4 sont abandonnés.**

- Le sombre ne subsiste que dans **deux bandes fines** : l'en-tête et le
  pied de page, toutes deux portant la réglure d'imprimeur. Le pied a été
  resserré (`py-10` → `py-4`, logo `h-10` → `h-6`).
- Entre elles, l'accueil est **un livre ouvert vu de face** : `.page-livre`
  (papier vieilli par quatre auréoles décentrées, d'intensités et de
  tailles différentes — une page qui a vécu n'est jamais salie
  uniformément) et `.page-livre-gouttiere` (la marge centrale).
- **Rien derrière l'écriture.** Le `Hero` a perdu son fond : plus de
  `.champ-encre`, le papier transparaît et le texte repasse en encre
  (`nuit-900`, `roche-700`).
- La vue 3D en perspective a été explicitement écartée comme trop
  compliquée.

**Code mort supprimé, pas laissé en place** : `.champ-encre` (984 o),
les six règles `.livre-*` (3 168 o), le composant `LivreARas.tsx` et la
prop `registre` de `BookBand` — plus aucun appelant ne passait `"encre"`.
Le CSS écrit à la main n'est pas élagué par Tailwind (qui n'élague que ses
propres tokens) : il serait parti dans la feuille livrée.

### Deux pièges de mise en œuvre

**La gouttière masquait les clics.** Elle couvre toute la hauteur de la
page ; sans `pointer-events: none` elle interceptait tout ce qui se trouve
dans la colonne centrale, bande de couvertures comprise.

**Un élément positionné passe au-dessus du contenu en flux**, même sans
`z-index`. La gouttière est donc posée avant le contenu, et le contenu
enveloppé dans un bloc `relative z-10` — sinon la marge masquait le texte.

### Le papier a été recalibré par la mesure, pas à l'œil

La première recette (base `lin-100`, auréoles 26/42/20 %, marge 20 %)
faisait tomber `roche-700` à **4,31:1 sur le papier et 3,03:1 sous la
marge** — sous le seuil AA pour du texte normal. Réduire la seule marge ne
suffisait pas : même à 6 % le papier était déjà trop chargé pour laisser
de la réserve.

Recette retenue après recherche : **base `lin-50`, auréoles 14/18/10 %,
marge 10 %**. Papier au pire point `#e4daca`, sous la marge `#d1c8b9` —
`nuit-900` 11,0:1 / 9,2:1, `roche-700` 5,7:1 / 4,7:1. Toute modification
de ces valeurs doit être remesurée : la réserve est mince.

### Reste à faire

- **L'image de fond unifiante** n'existe toujours pas. Les surfaces
  génératives sont ses emplacements.
- **« Explorer »** (les quatre onglets) est **explicitement reporté** : il
  sera repris en écriture manuscrite sur la page. Son traitement actuel
  (filets `gres-600`, 3,00:1 — juste au seuil du non-textuel) n'est là que
  pour rester lisible, ce n'est pas une proposition de mise en forme.
- Le lettrage BARMAJATA reste un `h1` en `text-enseigne`, jamais une image.

## Lot H6 — le papier en net, et la marque corrigée

### Le flou était le problème

Le Lot H5 empilait des auréoles radiales. Sur une page haute, ça ne lit
pas comme du papier, ça lit comme du flou. `.page-livre` est réécrit en
**trois couches à arrêts durs**, aucune n'étant un dégradé mou :

1. les lignes d'écriture (1px net, pas de fondu) ;
2. deux marges verticales, une par page, comme une réglure de cahier ;
3. **le bombé** : une lumière transversale, rehaut blanc sur la crête de
   chaque page vers 30 % / 70 %, ombre qui plonge vers le pli à 49–51 %.
   C'est cette couche, et elle seule, qui donne le relief.

Les pourcentages de la couche 3 décrivent le profil d'un livre ouvert vu
de face. **Ils se lisent comme une courbe, pas comme des valeurs
indépendantes** — en modifier un isolément casse le relief.

Le pli (`.page-livre-gouttiere`) est resserré (`clamp(22px, 3.2vw, 54px)`)
et bordé de deux liserés clairs : c'est le liseré qui fait remonter la
page, donc qui fait le bombé.

### Marque : deux infractions corrigées

- **Doublon dans le hero** : le surtitre disait « Maison d'édition
  BARMAJATA » juste au-dessus d'un titre « BARMAJATA ». Le surtitre est
  réduit à « Maison d'édition » dans les trois langues.
- **L'arabe écrivait la marque en DEUX mots** (`برما جاتا`), contre la
  règle « BARMAJATA en un seul mot » de la Phase 1. Six occurrences
  corrigées en `برماجاتا`, dont `site.name` — donc le `<title>`, l'OG et
  le JSON-LD.

### Logo dans le hero

`logo-mark.svg` (cercle, courbe de livre ouvert, point d'or) et **jamais
le lockup** : le titre écrit déjà BARMAJATA juste en dessous, le lettrage
ferait un troisième doublon. Décoratif, `alt=""` — la marque est dans le `h1`.

### « Explorer » en rectangles

Quatre rectangles posés sur les pages, comme des vignettes collées dans un
cahier. Ils se détachent **par l'arête, pas par une ombre** : une ombre
portée sur du papier plat trahirait le procédé.

### Le pli ne doit pas briller (correction post-capture)

Première version : 22–54px de large, rehaut blanc à 60 %. À l'écran ça
lisait comme **une tige chromée**, pas comme un pli de papier — trop
étroit, trop spéculaire. Rehaut tombé à 22 %, largeur triplée
(`clamp(40px, 6.5vw, 130px)`) : la page remonte au lieu de briller.

### Couvertures : des fonds PROFONDS, jamais beiges

Première version : fonds crème et beiges. Sur le papier clair de
l'accueil, elles **disparaissaient** — c'était ça, le « pas réaliste ».
Une couverture d'édition contraste avec son support.

Dix fonds sombres et distincts (ardoise, oxblood, prune, olive, indigo,
ocre…), dégradés en diagonale, texte crème `#f2ece0`, accent or
`#e2cba6`. Mesuré : titre **6,2:1 au pire fond**, nom d'auteur **4,6:1**.

L'or a dû être éclairci de `#c9ab7e` à `#e2cba6` : sur la couverture ocre,
le premier tombait à 3,3:1 — de l'or sur de l'or.

### Couvertures : la fabrication

Vectoriel, donc net à toute taille — la richesse vient des couches :
fibre `feTurbulence` en multiply, lumière diagonale, titre **gaufré**
(copie claire décalée d'1px sous l'encre), tranche à gauche avec liseré,
marque de l'éditeur, vignettage. Le générateur est en scratchpad ; les
palettes par slug sont dans le fichier, et il refuse de tourner si une
couverture du disque lui est inconnue.

## Lot H8 — virage vers le moderne

Retour de l'utilisateur après capture : « il y a un côté vieux, il manque
de la modernité, au départ je voulais un côté Apple ».

**Le diagnostic n'est pas un détail, c'est le concept.** Le papier vieilli,
le grain, les lignes de cahier, les marges, l'or, les doubles filets, le
gaufrage, le sceau de l'éditeur : chacun dit « ancien ». Empilés, ils ne
pouvaient produire que de l'ancien. On ne peut pas tenir simultanément
« papier vieilli avec des écritures » et « Apple ».

**Réserve exprimée à l'utilisateur, qui a maintenu sa décision** : une
maison d'édition qui ressemble à Apple risque de ressembler à une startup
tech plutôt qu'à un éditeur.

### Ce qui a été retiré (et non désactivé)

`.page-livre`, `.page-livre-gouttiere`, `.grain-encre`, `.grain-papier`,
`.grain-papier-large`, `.reglure`, `--reglure-couche`, `--texture-grain`,
et la réglure du Header et du Footer. Environ 6 Ko de CSS. Vérifié absent
de la feuille livrée.

Le `.champ-papier` des pages intérieures est réduit à un dégradé quasi
imperceptible : il décolle la tête de page du corps sans imiter de matière.

### Ce qui remplace la texture

**Rien — et c'est le point.** Le registre moderne tire sa profondeur de
l'absence : fond quasi uni, beaucoup d'air, typographie nette, et les
couvertures présentées comme des objets posés dans le vide.

`--shadow-flottant` (Lot H8) : trois couches d'ombre de plus en plus
larges et douces, comme un objet photographié sur fond blanc. C'est la
seule profondeur du registre, et elle remplace à elle seule le papier, le
grain et la réglure.

### Accueil

- `Hero` : proportion resserrée (`3/4` → `22/9` au-delà de 640px) — le
  `16/9` laissait un demi-écran de vide sous le titre. Surtitre en `text-xs`
  très espacé, logo réduit.
- « Explorer » : les rectangles bordés du Lot H6 deviennent une **liste**
  séparée de filets d'un pixel, où seul le mot compte. Le chevron
  n'apparaît qu'au survol — l'interface ne s'annonce pas avant qu'on la
  sollicite.

### Le fondu d'opacité de la bande, corrigé par le fond clair

`OPACITY_CUTOFF_DISTANCE` (3,7) vient de la spec et **n'a pas été
touchée** : une couverture disparaît toujours à la même distance. C'est la
*forme* de la courbe qui a changé, de linéaire à concave
(`OPACITY_COURBE = 2.2`).

Motif : en linéaire, la voisine tombait à 0,73 d'opacité et la suivante à
0,46. Sur le fond sombre d'origine ça lisait comme un éloignement ; sur le
fond clair du registre moderne, ça lit comme **une couleur morte** — un
rouge profond y virait au mauve pâle. Avec l'exposant, la voisine tient
0,94 et la suivante 0,74 : les couvertures gardent leur couleur, et ce
sont l'échelle, la rotation et le recul en Z qui portent la profondeur.

Leçon générale : **une constante de mouvement calibrée sur un fond sombre
ne se transpose pas telle quelle sur un fond clair.**

### Couvertures

Doubles filets, sceau de l'éditeur et gaufrage retirés : c'est cet
appareil ornemental qui les datait. Il reste un aplat profond en dégradé,
un titre généreux **aligné au fer à gauche** (et non centré, le centrage
appartient au registre classique), un filet d'accent unique, le nom de
l'auteur. Les dix fonds sombres du Lot H7 sont conservés.

## Lot H11 — fiche livre en deux colonnes, et le prix rétabli

### Correction d'un conseil erroné : la loi Lang

Il avait été conseillé en séance de **ne pas afficher les prix**, au motif
que le prix Amazon varie et qu'un prix figé deviendrait trompeur. **C'est
faux en France, et l'inverse est vrai.**

La [loi du 10 août 1981 dite loi Lang](https://fr.wikipedia.org/wiki/Loi_relative_au_prix_du_livre),
toujours en vigueur : **c'est l'éditeur qui fixe un prix public unique**,
avec obligation de le marquer sur la couverture, et aucun détaillant —
Amazon compris — ne peut accorder plus de **5 % de rabais**.

Conséquences pour ce projet :

- Le prix affiché sur le site **fait autorité**, il n'est pas indicatif.
- Chaque format a **son** prix : la fiche livre les affiche par format, et
  le « à partir de » reste réservé au catalogue, où il résume.
- Le champ `prixIndicatif` du schéma est **mal nommé** — c'est un prix
  public éditeur. Renommage non fait pour ne pas casser les fichiers de
  contenu ; à traiter si le schéma bouge par ailleurs.

Le risque juridique réel n'est donc pas d'afficher le prix, mais de **ne
pas dire que la vente se conclut ailleurs** : `books.amazonNotice` le dit
désormais, sous les boutons, avant le clic.

### La fiche en deux colonnes (modèle Stripe Press)

Vérification faite, les pages livre de Stripe Press ne sont **pas** en deux
colonnes fixes : c'est une colonne unique qui défile. La demande était
autre — « toute l'écriture sur le côté, de haut en bas » — et c'est ce qui
a été construit :

- **Colonne collante** (`lg:sticky lg:top-28`) : le livre en volume et
  l'acte d'achat. Le livre reste manipulable pendant qu'on lit — c'est
  tout l'intérêt d'un objet qu'on peut tourner.
- **Colonne de texte** : statut, titre, auteur, « À propos », extrait,
  caractéristiques en liste de définitions, bloc auteur, précédent/suivant.
- Sous 1024px, grille en une seule colonne et **collant désactivé** : sur
  mobile, un objet collant mangerait la moitié de l'écran pendant toute la
  lecture.
- L'ordre des colonnes suit la direction d'écriture — CSS Grid le fait
  nativement, le livre passe donc à droite en arabe sans code dédié.

### Ce que les sites d'éditeurs ont et que ce site n'a pas

Relevé pour mémoire, **rien n'est fait** : page manuscrits et soumissions,
espace presse (communiqués, visuels HD, contact), page droits et cessions
(étranger, audio, adaptation), page libraires et revendeurs, catalogue PDF
téléchargeable, citations de presse sur la fiche livre.

Côté légal, les quatre pages existent mais sont vides : il manque aussi
les mentions d'éditeur (SIRET, directeur de publication, hébergeur) et une
politique cookies.

## Lot H12 — les quatre pages professionnelles

Créées d'après ce que fait tout éditeur : `/manuscrits`, `/presse`,
`/droits`, `/libraires` (routes traduites dans les trois langues).

**Ce qui a été livré, c'est la STRUCTURE, pas le contenu.** Les délais de
réponse aux manuscrits, les droits effectivement cédés, les conditions
faites aux libraires sont de la **politique d'entreprise** : les inventer
aurait été pire que de laisser vide. Les corps de section portent donc le
« Contenu à venir. » du projet, sauf là où un énoncé est factuellement
vérifiable (la vente au public passe par Amazon, les demandes passent par
la page contact).

### Ce que l'utilisateur doit décider, page par page

| Page | Décisions à prendre |
|---|---|
| Manuscrits | Genres acceptés ; format et canal d'envoi (courriel ? postal ?) ; délai de réponse annoncé ; ce qui est refusé d'office |
| Presse | Adresse de contact presse dédiée ou non ; où sont les visuels HD ; conditions d'obtention d'un service de presse |
| Droits | Territoires et langues déjà cédés ou libres ; qui traite les demandes ; existence d'un agent |
| Libraires | Diffuseur et distributeur ; remise consentie ; canal de commande |

### Emplacement dans la navigation

Dans le **panneau du menu**, sous un intertitre « Professionnels » — ni
dans le bandeau ni dans le pied de page, tous deux devant rester des
bandes fines depuis le Lot H5. Ces pages s'adressent aux auteurs, à la
presse, aux libraires et aux acheteurs de droits ; le lecteur qui vient
acheter un livre garde son parcours dans le bandeau.

### Piège : le sitemap n'est pas automatique

`CANONICAL_PATHS` (`src/app/sitemap.ts`) est une liste **écrite à la
main**. Une route ajoutée à `routing.pathnames` n'y entre pas toute seule
et resterait absente du sitemap sans que rien ne le signale — même classe
de défaut silencieux que les clés de traduction manquantes du Lot F.
Vérifié : les quatre nouvelles routes y sont.

### Restent à faire

Citations de presse sur la fiche livre, catalogue PDF téléchargeable. Et
surtout : les quatre pages légales existent mais sont **vides**, et il
manque les mentions d'éditeur (SIRET, directeur de la publication,
hébergeur) ainsi qu'une politique cookies — toutes choses qui exigent des
informations d'entreprise réelles.

## Piège : le garde-fou de push écrase le build de démonstration

`.claude/push-si-vert.sh` lance `npm run build` **de production** — c'est
sa raison d'être, il vérifie ce que vérifie la CI. Effet de bord : il
écrase `.next`, qui redevient un build **sans contenu de démonstration**.

Symptôme observé : après un commit, le catalogue affiche « Aucun livre »
alors que les pages auteur, déjà générées, listent encore leurs titres —
un `.next` incohérent, mi-démo mi-production.

**Pour reprendre la consultation locale après un commit**, toujours :

```bash
rm -rf .next
NEXT_PUBLIC_DEMO_CONTENT=true npm run build
NEXT_PUBLIC_DEMO_CONTENT=true PORT=3000 npm run start
```

Le `rm -rf .next` n'est pas superflu : sans lui, la génération
incrémentale conserve des pages du build précédent et le mélange persiste.
Et le drapeau est nécessaire **au build ET au démarrage**.

## Stack

- Next.js 16 (App Router, Turbopack), TypeScript **5.9** (pas TS 7 natif :
  `typescript-eslint` refuse explicitement de tourner sur TS ≥7, voir
  https://github.com/typescript-eslint/typescript-eslint/issues/10940 —
  rétrogradé pour pouvoir lint le projet ; `tsc --noEmit` et `npm run
  build` inchangés par ce choix).
- ESLint (flat config, `eslint.config.mjs` — `eslint-config-next` seul,
  aucune règle maison, aucun Prettier). `npm run lint` dans la CI, entre
  `tsc --noEmit` et `npm run build`. Versions **stables uniquement** dans
  ce projet — jamais d'alpha/bêta/RC, y compris pour contourner un
  blocage de compatibilité (voir ci-dessus).
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

Depuis le Lot H1 les couleurs sont **écrites en OKLCH** (conversion
aller-retour exacte, aucune couleur n'a bougé d'un pixel — vérifié).
Nuance à connaître : Lightning CSS **retranscrit ces valeurs en
hexadécimal** dans la feuille produite, selon les cibles navigateurs. Le
gain n'est donc pas dans le fichier livré mais dans la source — palette
modifiable perceptivement — et dans les mélanges, qui eux interpolent bien
en OKLab (`color-mix(in oklab, …)`, utilisé par `.reglure`).

`nuit-950` s'ajoute pour la devanture « Encre » : un cran sous `nuit-900`,
afin que `nuit-900` puisse servir de surface posée dessus.

## Routes techniques hors préfixe locale

- `/b/[code]` — redirection 302 QR code (`src/app/b/[code]/route.ts`),
  lit `src/content/qr/codes.json` (`getQrCodeByCode()`, `getAllQrCodes()`
  dans `src/lib/content/index.ts`, schéma `qrCodeSchema` dans
  `schema.ts`) : `{ code, destination, libelle, actif }`. Code inconnu ou
  `actif: false` → redirection vers l'accueil (jamais une 404, le support
  physique du QR code peut survivre à sa désactivation). Code actif →
  `/bonus/<destination>`. `codes.json` est un tableau vide par conception
  (pas de code réel imprimé pour l'instant) ; `_template.json` à côté
  documente le format d'une entrée (ignoré par le loader, qui ne lit que
  `codes.json`).
- `/bonus/[slug]` (`src/app/bonus/[slug]/page.tsx`) — contenu déverrouillé
  par un QR code actif dont `destination === slug` ; `notFound()` sinon
  (code inconnu, inactif, ou accès direct sans code). Sobre, **sans
  menu ni pied de page** : `src/app/bonus/layout.tsx` déclare son propre
  `<html>`/`<body>` (segment hors `[locale]`, pas de layout racine
  partagé — voir Stack ci-dessous) et n'inclut ni `Header` ni `Footer` ni
  `NextIntlClientProvider`. `noindex` (page non destinée à l'indexation),
  en plus d'être exclue de `robots.ts` (`disallow: ["/b/", "/bonus/"]`).
  **Important** : le matcher de `src/proxy.ts` doit exclure `bonus/` (comme
  `b/`) sous peine que le middleware next-intl le préfixe en `/fr/bonus/...`
  et le fasse 404 (piège rencontré et corrigé pendant le développement).
- `/sitemap.xml`, `/robots.txt` — générés (`src/app/sitemap.ts`,
  `src/app/robots.ts`), excluent `/b/` et `/bonus/`.

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
