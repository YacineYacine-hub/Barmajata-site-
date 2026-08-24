# Journal des lots — BARMAJATA

Récit chronologique de la refonte visuelle (lots H0 à H43, 23–24 août 2026).

**Ce fichier n'est PAS chargé automatiquement** : contrairement à
`CLAUDE.md`, il n'entre pas dans le contexte de chaque séance. Il est là
pour retrouver *pourquoi* une décision a été prise, quand la lire devient
nécessaire.

Attention : **il contient des directions abandonnées**. Les lots H2 et H3
décrivent un système à deux registres « Encre / Papier », le lot H5 un
accueil en papier vieilli — tous deux écartés au lot H8 au profit du
registre moderne. Ne jamais s'en servir comme référence de l'état actuel :
pour cela, voir `CLAUDE.md`.

---

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

