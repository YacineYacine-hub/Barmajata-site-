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
  pas en attendre, ne jamais en faire coller un dans la conversation.
  Cette règle est intacte : le push fonctionne **sans qu'aucun secret ne
  passe par l'agent**. Le dépôt est en HTTPS et Git lit l'identifiant dans
  le trousseau macOS (`credential.helper = osxkeychain`) — la même
  mécanique que lorsque l'utilisateur pousse à la main.
- **Le push est automatique et conditionnel** (mis en place le
  2026-09-02, à sa demande : « de manière durable »). Après chaque appel
  Bash, le hook `PostToolUse` déclaré dans `.claude/settings.local.json`
  (personnel, non versionné) lance `.claude/push-si-vert.sh`, qui :
  sort immédiatement s'il n'y a rien à publier, sinon enchaîne
  `tsc --noEmit`, `eslint` et `npm run build` — **en inspectant leur
  sortie et pas seulement leur code de retour** (voir « Piège : `next
  build` sort en 0 malgré des erreurs ») — et ne pousse que si les trois
  sont verts. Il ne bloque jamais la session : il sort toujours en 0 et
  rend compte par `systemMessage`. Un commit rouge reste donc en local,
  et le dit.
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
- Pages publiques : Livres (`/livres`), Auteurs (`/auteurs`), La maison
  (`/la-maison`), Journal, Contact, FAQ (`/faq`), légales. S'y ajoutent
  quatre **pages professionnelles** (Lot H12), absentes du bandeau et
  regroupées sous « Professionnels » dans le panneau de menu :
  `/manuscrits`, `/presse`, `/droits`, `/libraires`. `/engagement` existe mais est
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
  - `/autrice`, `/author` → 301 vers l'équivalent `/auteurs` dans la même
    locale (contenu déplacé). L'entrée arabe a été retirée avec la locale
    au Lot H46 : `/ar/...` n'est plus un préfixe valide et tombe sur la
    404 de dernier recours, ce qui est la réponse juste — un 410 dirait
    « cette page a été retirée du site », alors que c'est le site arabe
    entier qui n'existe plus.
  - `/methode`, `/spiritualite` et leurs traductions → 410 Gone (contenu
    retiré définitivement, absorbé par la fiche livre concernée).
- SEO : `src/lib/seo.ts` définit `PUBLIC_LOCALES` (**`fr`, `en`, `es`** —
  les trois locales y figurent depuis le Lot H46 ; l'arabe en était exclu
  faute d'être jugé prêt, l'espagnol est un marché visé et n'aurait aucun
  intérêt hors de l'index, **sa traduction restant à faire relire par un
  humain**) et `buildAlternates(href)`, utilisé dans le
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

- `Header.tsx` : **deux lignes depuis le Lot H16**, pas une.
  1. Une bande fine `bg-nuit-900`, `sticky top-0`, toujours visuellement
     séparée du Hero (jamais en overlay transparent dessus) : sceau+nom
     (`logo-horizontal-light.svg`) à gauche ; réseaux sociaux (coquilles
     tant que `SOCIAL_LINKS` est vide) et sélecteur de langue à droite.
     Au-delà de 80px de scroll (`SCROLL_SHRINK_THRESHOLD`), hauteur/logo
     réduits, `transition-[...] duration-200`.
  2. Sous elle, une ligne **transparente** alignée à droite, rendue sur
     **toutes** les pages et non seulement l'accueil (sans elle, le
     catalogue et les pages professionnelles perdraient tout accès au
     menu) : lien "Livres", puis — **uniquement sur le catalogue** — un
     champ de recherche, puis le bouton menu (3 traits).
  Le champ de recherche est un `<form method="get">` **sans `action`** :
  il se soumet à l'URL courante, donc au catalogue dans sa langue, sans
  reconstruire de chemin traduit ; la recherche vit dans `?q=`, elle est
  donc partageable et fonctionne sans JavaScript. Sa présence est décidée
  par `usePathname() === "/books"` — le chemin **interne** de next-intl,
  jamais sa traduction, ce qui fait tenir la comparaison dans les trois
  langues.
  Le bouton ouvre un panneau plein écran (`role="dialog" aria-modal`) :
  `Auteurs`/`La maison`/`Journal`/`Contact` en grand — pas "Livres", déjà
  direct dans la ligne — puis, sous un intertitre « Professionnels »,
  `Manuscrits`/`Presse`/`Droits`/`Libraires`. Échap ferme, Tab/Shift+Tab
  piégés dedans (`FOCUSABLE_SELECTOR`), focus posé sur le bouton de
  fermeture à l'ouverture puis restitué au déclencheur à la fermeture,
  scroll de la page bloqué pendant.
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
  la locale du site (`fr`→`fr`, `en`→`com`, `es`→`es`) ; le choix de l'utilisateur
  est mémorisé en cookie côté client uniquement (`AmazonBuyButton.tsx`) —
  jamais de géo-IP, jamais de lecture de cookie côté serveur (la page
  resterait sinon dynamique au lieu de statique).
- JSON-LD schema.org : `Book` sur la fiche livre, `Person` sur la fiche
  auteur, `Organization` sur `/la-maison`, `ItemList` sur le catalogue
  livres — générés dans `src/lib/content/jsonld.ts`.
- Couvertures 2D (`book.couverture`) affichées sur la carte catalogue via
  `<img>` — champ optionnel, pas de rendu si absent. La fiche livre, elle,
  affiche `BookSolid` (voir plus bas) à la place.
- Genres (`book.categories`, **sept** valeurs figées, dans cet ordre :
  `famille` | `psychologie` | `thriller` | `histoire-vraie` | `enfance` |
  `developpement-personnel` | `poesie-pensees`) : un livre peut en porter
  plusieurs, champ optionnel. La liste fait autorité dans
  `BOOK_CATEGORIES` (`schema.ts`) et l'accueil la parcourt pour composer
  son menu — ajouter un genre y ajoute une carte, et exige un visuel
  `public/categories/<clé>.svg` et une clé de traduction. Distinct de `formats[].type` (broché/epub/
  pdf) — jamais confondu. Slugs de filtre traduits par locale dans
  `src/lib/content/categories.ts` (`CATEGORY_SLUGS`) ; **les trois locales
  ont désormais leurs propres slugs**, l'espagnol ayant remplacé l'arabe
  au Lot H46. Comme le reste de la traduction espagnole, ils restent à
  faire relire par un humain.
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
  **Sémantique : `role="group"` + `aria-label` sur le conteneur, liste
  native à l'intérieur, `aria-current="true"` sur le lien centré.** Le
  motif `listbox`/`option`/`aria-selected` a été retiré au premier audit
  outillé (axe, 2026-09-02) qui y relevait quatre violations dont deux
  critiques — voir le commentaire de `BookBand.tsx` : un listbox est un
  widget de sélection, la bande est une liste de liens, et l'ARIA interdit
  tout élément interactif dans une option. Ne pas rétablir ces rôles.
  **Deux défauts clavier corrigés le 2026-09-02**, tous deux invisibles à
  la lecture du code et trouvés au navigateur :
  1. *Les flèches rapides s'annulaient.* La cible était calculée depuis la
     position ANIMÉE, encore proche du départ : deux flèches enchaînées
     redemandaient le même palier, et n'avançaient que d'un cran.
     `cibleRef` mémorise la cible d'un calage en cours, et toute reprise en
     main (glissement, molette, inertie) la remet à `null`.
  2. *La bande sortait de son axe.* `focus()` sur une couverture éloignée
     faisait défiler le conteneur pour « l'amener à l'écran », alors que la
     bande venait de la centrer par transform — `scrollLeft` mesuré à
     308px, toutes les couvertures poussées hors de leur axe pendant que la
     position interne restait juste. D'où `focus({ preventScroll: true })`,
     qui n'est pas une précaution mais la condition du centrage.
  Clic sur la
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
- La géométrie/physique de `BookSolid` a été vérifiée par relecture et par
  inspection du HTML/SVG généré (coordonnées, couleurs éclairées, matrices
  affines), **jamais par capture d'écran** : les séances d'alors n'avaient
  pas d'outil navigateur. **Ce n'est plus le cas** — un navigateur est
  disponible depuis le 2026-09-02, et cette vérification visuelle reste à
  faire. Vaut aussi pour l'audit d'accessibilité outillé, annoncé plus bas
  comme impossible pour la même raison.

## Contenu de démonstration (`NEXT_PUBLIC_DEMO_CONTENT`)

- `src/content/_demo/books/*.json` et `src/content/_demo/authors/*.json` :
  10 livres factices et 10 auteurs factices (dont `publie` à 3 formats avec `categories`+
  `couvertureImage`, `a_paraitre`, `brouillon`, `publie` 1 format non
  récent — pour tester `isNewRelease()` en négatif),
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
  (`src/lib/club/email.ts`, gabarit HTML par locale ; le sens RTL y a été retiré avec l'arabe, Lot H46).
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
  Inter), sous-ensemble latin. Noto Naskh Arabic a été retirée au Lot H46.
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
- **Premier audit outillé le 2026-09-02** (axe-core 4.10.2, dans un vrai
  navigateur, sur `/`, `/livres`, une fiche livre, `/club` et `/ar`) :
  **zéro violation** après correction. Ce qu'il a trouvé et qui est
  corrigé — les rôles ARIA de `BookBand` (voir plus haut), la ligne de
  navigation du header devenue un `<nav aria-label>`, et le bloc
  d'abonnement devenu un repère par `aria-labelledby`. Ce qu'il a
  confirmé : aucun défaut de contraste nulle part (les calculs manuels du
  Lot F tiennent), `BookSolid` propre, le formulaire du club correctement
  étiqueté, et le logo non miroité en RTL.
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
  navigateur** — aucun outil de ce type n'était disponible dans les
  séances concernées. **Un navigateur l'est depuis le 2026-09-02** :
  l'audit outillé (axe, Lighthouse) devient faisable et reste à faire. Il
  cesse donc d'être « à confirmer par un humain » pour devenir une tâche
  du projet.

## En-têtes de sécurité (Lot H45)

Posés dans `next.config.ts` (`headers()`), donc appliqués par le serveur de
`next start` à **toutes** les réponses, pages statiques comprises. **Si un
reverse proxy ou un CDN se place devant, vérifier qu'il les relaie** —
c'est l'erreur classique.

- `Strict-Transport-Security` deux ans, sous-domaines compris,
  **volontairement sans `preload`** : l'inscription sur la liste des
  navigateurs est longue à défaire.
- `X-Content-Type-Options: nosniff`, `Referrer-Policy:
  strict-origin-when-cross-origin`, `Permissions-Policy` refusant caméra,
  micro, géolocalisation, paiement et USB, `X-Frame-Options: DENY`
  (doublon assumé de `frame-ancestors`, pour les navigateurs anciens).
- `poweredByHeader: false` — plus de `X-Powered-By: Next.js`.

### CSP : pourquoi elle n'a pas de nonce

**À lire avant d'en ajouter un.** La documentation de Next est explicite :
une CSP à nonce impose un rendu **dynamique**, le nonce devant être unique
à chaque requête. Or ce projet est statique partout sauf `/b/[code]`.
Poser une CSP à nonce rendrait donc tout le site dynamique — un changement
d'architecture déguisé en réglage de sécurité.

La CSP posée est donc **sans nonce**, avec `'unsafe-inline'` sur les
scripts (Next injecte son amorce RSC en ligne). Elle est par construction
inopérante contre une injection de script inline : **son intérêt est
d'interdire toute origine externe**, donc l'exfiltration vers un tiers.

Vérifiée au navigateur le 2026-09-02 : posée d'abord en `Report-Only`,
aucune violation sur huit types de pages dans les trois langues, deux
violations volontaires (script et image externes) confirmant qu'elle était
bien appliquée — puis passée en mode bloquant.

**Conséquence** : tout script, image, police ou appel réseau vers un
domaine tiers est désormais bloqué. C'est voulu. Les pixels publicitaires
et widgets de discussion envisagés plus tard ne fonctionneront pas sans
ajouter explicitement leur origine — et il est sain qu'une telle décision
passe par une modification consciente du fichier. En cas de doute au
déploiement, repasser la clé en `Content-Security-Policy-Report-Only`.

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

## Avis de lecteurs — recueillis chez Amazon, jamais ici

Demande : « créer une ligne pour que les clients recommandent le livre,
un QR code qui redirige au site, une base avec les avis ».

**Le risque juridique a fait écarter la base d'avis maison.** L'article
L111-7-2 du Code de la consommation s'applique à *toute* personne dont
l'activité consiste, même à titre accessoire, à **collecter, modérer ou
diffuser** des avis en ligne de consommateurs. Il impose :

- une information loyale et transparente sur les modalités de publication
  et de traitement des avis ;
- de préciser si les avis font l'objet d'un contrôle, et lequel ;
- d'afficher **la date** de chaque avis et de ses mises à jour ;
- d'indiquer à l'auteur d'un avis rejeté **le motif du rejet**.

Sanction : amende administrative jusqu'à **75 000 € pour une personne
physique et 375 000 € pour une personne morale**. La DGCCRF contrôle
activement le secteur (outil « Polygraphe », 55 % de sites non conformes
relevés).

S'y ajoutent le RGPD (un avis est une donnée personnelle), la modération
anti-spam, et l'interdiction de supprimer sélectivement les avis négatifs
— qui relève de la pratique commerciale trompeuse.

**Solution retenue : le lecteur dépose son avis sur Amazon.** C'est là
qu'il a acheté, Amazon vérifie donc l'achat et porte toutes ces
obligations. `buildAmazonReviewUrl()` construit
`https://www.amazon.{domaine}/review/create-review?asin={asin}` et la
fiche livre affiche un bloc « Vous avez lu ce livre ? ». Zéro base, zéro
exposition, et les avis atterrissent là où ils font vendre.

### Le QR code existait déjà

`/b/<code>` → table `src/content/qr/codes.json`, avec repli sur l'accueil
si le code est inconnu ou désactivé (**jamais une 404** : le support
physique survit à la désactivation).

Étendu au Lot H14 d'un champ `type` :
- `"bonus"` (défaut, rétrocompatible) → `/bonus/<destination>` ;
- `"livre"` → la fiche du livre, donc son bloc d'avis. C'est le cas du QR
  imprimé dans l'ouvrage.

La fiche vit sous le préfixe de locale, contrairement à `/bonus` qui en
est exempté — d'où le `getPathname()` dans la route.

**L'URL à encoder dans le QR imprimé** est `https://www.barmajata.com/b/<code>`,
jamais l'adresse finale : elle reste ainsi redirigeable après impression.
Aucun générateur d'image QR n'est installé sur la machine et aucune
dépendance n'a été ajoutée pour cela.

### Si une base d'avis maison devient nécessaire

Ce serait une **Phase 2** : base de données, interface de modération, page
d'information L111-7-2, traitement RGPD (accès, rectification,
effacement), anti-spam, et une politique écrite de rejet. Rien de tout
cela n'existe.

## Direction visuelle — état actuel

**Registre moderne.** Fond quasi uni, beaucoup d'air, typographie nette, et
les objets présentés comme des produits posés dans le vide
(`--shadow-flottant`, seule profondeur du registre).

**Toute simulation de matière a été supprimée du code** — grain, réglure,
papier vieilli, dégradés maillés, ornements de couverture. Ne pas la
réintroduire sans demande explicite : deux directions bâties dessus ont été
abandonnées (voir `docs/journal-des-lots.md`).

### L'accueil n'est pas un présentoir de livres

Sa bande horizontale est un **menu de catégories** : neuf entrées (Tout,
Nouveautés, et sept genres). Chaque carte est composée comme une
couverture — symbole en haut, libellé centré, « Consulter » en bas — et
mène au catalogue filtré, qui fait office de page de catégorie.

Les fonds de catégorie (`public/categories/*.svg`) ne contiennent **aucun
texte** : le libellé et « Consulter » sont rendus en HTML, sans quoi ils
seraient figés en français. Le symbole, lui, est du dessin et vit dans le
SVG.

### Le hero

Baseline « L'esprit du livre » — première phrase réelle du site, tout le
reste du contenu éditorial étant encore en attente.

Le symbole du logo est **superposé au mot BARMAJATA**, réglé par
`--decalage-mot` (`globals.css`). Trois écueils, consignés dans
`Hero.tsx`, qui s'excluent mutuellement et dans lesquels on retombe en
fuyant l'un des autres :

- un `span` inline vide ne forme pas de bloc conteneur — le symbole
  s'échappe du cadre et disparaît ;
- un `inline-block` crée un point de coupure de ligne — le mot se césure ;
- un conteneur plus large que le mot — le centre visé n'est pas le sien.

**Tout y est exprimé en `em`**, donc relatif au mot : hauteur du hero,
taille du symbole, écarts, surtitre, sous-titre. Une valeur en pixels fixes
dans cette composition se déforme d'un écran à l'autre — c'est le défaut
qui a été corrigé aux lots H35 et H36. Seule exception assumée : le surtitre
garde un **plancher en rem**, une taille purement proportionnelle le
faisant tomber à 4px sur un téléphone.

### Où trouver le reste

`docs/journal-des-lots.md` retrace lot par lot *pourquoi* chaque décision a
été prise. Il n'est pas chargé automatiquement, et **contient des
directions abandonnées** — ne jamais s'en servir comme référence de l'état
courant.

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

## i18n

- Locales : **`fr` (défaut), `en`, `es`**. L'arabe a été retiré au Lot H46
  et remplacé par l'espagnol, sur décision de l'utilisateur (« pour les
  langues on fait fr es en, pas arabe »).
- Slugs traduits par locale (voir `src/i18n/routing.ts`), ex.
  `/auteurs` (fr) / `/authors` (en) / `/autores` (es).
- Polices : Cormorant Garamond (`--font-serif`, titres) et Inter
  (`--font-sans`, texte) — chargées via `next/font/google` dans le layout
  locale. Noto Naskh Arabic a été retirée avec l'arabe.
- **Les classes logiques restent la règle** — `ms-*`, `me-*`, `ps-*`,
  `pe-*`, `text-start`, `text-end` ; jamais `ml-*`, `mr-*`, `pl-*`,
  `pr-*`, `text-left`, `text-right`. Le site n'a plus de locale de droite
  à gauche, mais ces classes ne coûtent rien, valent exactement les
  autres, et sont ce qui rendrait le retour d'une telle langue possible
  sans tout réécrire. La lecture du sens (`document.documentElement.dir`)
  dans le carrousel et la bande est conservée pour la même raison : elle
  est inerte tant qu'aucune locale n'est RTL.

### Ce que le changement de locales a appris

Le sélecteur de langue n'affichait plus que FR et EN après la bascule,
sans qu'aucun contrôle ne s'en aperçoive. Sa table de libellés était typée
`Record<string, string>` : un tel type **accepte n'importe quelle clé et
n'en exige aucune**, donc `ar` y restait sans erreur et `es` y manquait
sans erreur. Défaut trouvé au navigateur, jamais par `tsc`.

Elle est désormais typée sur `routing.locales` : ajouter une locale sans
son libellé ne compile plus. **À vérifier partout où une table est indexée
par locale** — c'est la classe de défaut qui traverse ce genre de
migration.

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
