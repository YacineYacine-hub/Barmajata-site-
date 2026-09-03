# BARMAJATA — Master checklist

Issue de la réunion du 2026-09-02. Le dépouillement brut, avec le détail
des risques, reste dans `docs/reunion-2026-09-02.md` — ce document-ci est
la version ordonnée, celle qu'on déroule.

---

## Règle de séparation

**Trois chantiers distincts, qui ne se mélangent pas.** Ils partagent une
machine et une marque, rien d'autre. Confondre leurs tâches, c'est se
retrouver à traiter du dépôt légal en plein travail de code, et à croire
le site en retard alors qu'il attend un contrat.

| Rail | Ce que c'est | Où ça vit |
|---|---|---|
| **A — LE SITE** | Ce qu'on fait ici : pages, back-office, paiement, redirecteur, club, bots, alertes | `~/barmajata` |
| **B — L'USINE** | L'outillage de production éditoriale et la conception du livre | `~/usine-editoriale` (mémoire séparée depuis le 2026-09-02) |
| **C — LA MAISON** | Ce qui n'est pas du logiciel : structure, contrats, ISBN, dépôt légal, prix, fiscalité, comptes | Hors dépôt |
| **D — LE SOCLE** | Le VPS Hostinger, qui héberge A, B et le bot de trading | Transversal |

*Hypothèse retenue : « l'usine » et « la conception du livre » forment un
seul rail (B), l'outil et son usage. À corriger si tu les veux séparés.*

**Ce document détaille le rail A.** Les rails B, C et D y figurent pour ce
qui bloque le site — et seulement pour cela.

---

## Bloc 0 — Huit décisions à rendre avant de coder

Chacune commande des dizaines de tâches. Tant qu'elles ne sont pas
tranchées, avancer c'est deviner.

| # | Décision | Ce qu'elle commande |
|---|---|---|
| ~~D1~~ | **Carnet ou livre ? → C'EST UN LIVRE** *(tranché le 2026-09-02)* | Ouvrage hybride, mais le contenu justifie le livre. **Loi Lang applicable** : 5 % de remise maximum, frais de port jamais offerts. ISBN, dépôt légal et TVA du livre s'appliquent. Voir « Ce que D1 ferme et ouvre » ci-dessous. |
| D2 | **Catalogue en base, ou en fichiers ?** | Le back-office, le rendu statique ou dynamique, la vitesse, l'hébergement. Premier arbitrage technique. |
| D3 | **Vente directe : oui, et à partir de quand ?** | Stripe, CGV opposables, rétractation, médiateur, SAV, tests, environnement de recette. Le plus gros bloc du programme. |
| D4 | **Où atterrit l'exploitation BARMAJATA ?** | Bot Telegram, PDF, Lulu, logs. Trois dossiers annoncés, quatre besoins. |
| D5 | **Mesure d'audience : avec ou sans traceurs ?** | Sans cookie, pas de bandeau. Avec les pixels Meta/TikTok, bandeau obligatoire et conforme. |
| ~~D6~~ | **Quelles langues ? → FR, EN, ES** *(tranché le 2026-09-02)* | L'arabe est retiré, l'espagnol le remplace. **L'allemand est écarté comme langue mais pas comme marché** : vendre en Allemagne demandait Amazon.de dans la table des marketplaces, pas une traduction. |
| D7 | **Un bot, ou trois ?** | Telegram, ManyChat, assistant du site. Trois systèmes, trois tons, trois endroits où une réponse fausse peut sortir. |
| D8 | **Le domaine définitif est-il arrêté ?** | Il part à l'encre dans chaque exemplaire. Après la première impression, il n'est plus changeable. |

### Qui est l'éditeur, et ce qu'est BARMAJATA

**Stratégie arrêtée le 2026-09-03 : auto-édition sous label.**

- **L'éditrice est l'autrice elle-même**, personne physique. ISBN AFNIL à
  son nom, compte Amazon KDP à son nom, **droits jamais cédés**.
- **BARMAJATA est une marque déposée à l'INPI**, utilisée comme label
  d'imprint sur les ouvrages et comme nom commercial du site. Pas une
  société, et il n'y en a pas.
- La LLC américaine est abandonnée, et la maison d'édition avec — trop
  complexe et trop coûteuse pour ce qu'elle apporterait aujourd'hui.

**La ligne qui obligera à une structure n'est ni la marque, ni le site,
ni Amazon : c'est la vente directe.** Tant que l'achat se conclut chez
Amazon, rien n'est requis. Le jour où le site encaisse par Stripe, la
vente régulière en nom propre devient une activité à déclarer, et
**Stripe exige un SIRET**. Une micro-entreprise suffit — gratuite, sans
capital ni comptable. Ne pas confondre « structure » et « société ».

- [ ] 👤 **Vérifier les classes du dépôt INPI.** Pour une marque de
      livres, ce sont les classes **16** (produits imprimés) et **41**
      (services d'édition). La **42** est l'informatique — si le dépôt a
      été fait dessus, la marque ne couvre pas l'activité d'édition.
- [ ] ⚠ Ne jamais produire de récit de sélection éditoriale — « retenue
      par les éditions… », comité de lecture, catalogue d'auteurs
      inexistants. Utiliser le nom comme label est irréprochable ; laisser
      croire à une maison qui choisit ses auteurs est une pratique
      commerciale trompeuse. Vaut pour `/la-maison`, `/manuscrits` et tout
      texte de marque.

Quatre conséquences, dont deux bonnes :

- **Les pages légales ne sont plus bloquées par une société.** Il suffit
  d'une identité d'éditrice, et elle existe. **Décision : on prépare
  l'outil, on remplit les informations obligatoires à la mise en ligne,
  pas avant.** Le code est bâti pour — `src/lib/legal.ts` vide, pages en
  attente. **Ne plus rebloquer le travail du site là-dessus.**
- **La question de l'anonymat se résout d'elle-même** : c'est l'autrice
  qui est nommée comme éditrice, sur les ISBN, chez KDP et dans les
  mentions. Personne d'autre n'apparaît.
- **L'alerte ISBN est levée pour l'instant** : l'AFNIL attribue aux
  éditeurs établis en France, ce qui est le cas. Elle reviendra le jour de
  la cession à une structure américaine — un préfixe AFNIL ne se transfère
  pas à un éditeur étranger.
- **Le dépôt légal BnF s'applique bien**, puisque l'éditeur est français.
  La question du dépôt de l'imprimeur reste ouverte si l'impression est
  faite à l'étranger.

### Arbitrage en cours : société émiratie avant publication

Annoncé le 2026-09-03. Une société d'édition sera créée **aux Émirats
avant la publication**. Deux voies envisagées, et elles ne mènent pas au
même endroit :

**(a)** publier sous l'ISBN AFNIL de l'autrice, puis céder les droits à
BARMAJATA — **(b)** attendre un ISBN émirati et publier une seule fois.

**Le fait qui tranche : un préfixe ISBN ne se transfère pas.** Il
appartient à l'éditeur qui l'a obtenu, et la cession de droits ne le fait
pas suivre. La voie (a) ne devient donc jamais la voie (b) : elle crée
**deux éditions** du même livre.

**Le coût caché : Amazon KDP.** Déplacer un titre d'un compte vers un
autre est impossible — il faut dépublier et republier. On perd les avis,
le classement et l'historique de ventes, définitivement. Or les avis sont
ce sur quoi repose toute la stratégie arrêtée au Lot H14.

- [ ] [?] **Trancher (a) ou (b).** Recommandation : publier **une seule
      fois, sous l'éditeur définitif**. Attendre coûte du délai ; migrer
      coûte des avis, et ça ne se récupère pas. La voie (a) reste
      acceptable si le délai émirati est long — mais comme choix assumé
      (première édition à son nom, seconde sous la marque), pas comme un
      accident découvert après coup.
- [ ] ⚠ Une structure hors UE réactive trois points : **représentant dans
      l'Union** exigé par l'article 27 du RGPD dès que le club collecte
      des e-mails européens ; **loi Lang**, où c'est alors l'importateur
      qui fixe le prix pour la France ; **TVA** d'une société hors UE
      vendant à des consommateurs européens.
- [x] Pour le site, cela ne change presque rien : seuls le fichier
      d'identité et deux paragraphes de la politique de confidentialité
      bougeront. Le reste est déjà écrit et tient quelle que soit l'issue.

### Ce que D1 ferme, et ce qu'elle ouvre

**Fermé, définitivement.** Le levier prix n'existe quasiment plus :

- Aucun code promo au-delà de **5 %**. Le « OFFRE10 » de la Phase 3 est
  mort, ainsi que tout code de relance de panier au-delà du plafond.
- **Décision du 2026-09-03 : les codes promo sont abandonnés**, non pour
  raison juridique mais parce que les marges ne les portent pas. Ils
  restent envisagés, plus tard, sur des articles ciblés. La capacité doit
  donc exister sans être utilisée — **mais elle ne peut pas être
  construite avant le tunnel de paiement** : une remise a besoin de
  quelque chose à remiser. Ce qui est fait dès maintenant, c'est
  d'inscrire la contrainte pour que la logique naisse plafonnée plutôt que
  d'être corrigée après coup.
- ⚠ **L'Allemagne est plus stricte que la France.** La
  *Buchpreisbindung* n'autorise **aucune remise** sur un livre neuf — zéro,
  pas cinq pour cent. Toute mécanique de réduction devra donc distinguer
  le marché, pas seulement le produit.
- **Frais de port jamais offerts** sur un livre neuf.
- Le bot d'accueil et ManyChat ne peuvent proposer aucune remise
  supérieure à 5 %.

**Ouvert, et c'est la bonne nouvelle.** Puisque le prix ne peut plus être
l'argument, l'avantage doit être **non tarifaire** — et le programme le
contient déjà, sans l'avoir vu comme tel : le **bonus PDF déverrouillé par
le QR**, l'accès au bot, la dédicace, le contenu réservé. C'est là que la
séduction doit se jouer. Réorienter les relances des phases 6 et 7 vers le
contenu offert plutôt que vers la réduction, et le plafond cesse d'être une
contrainte pour devenir une direction.

**Activé aussi** : ISBN par langue et par reliure, dépôt légal éditeur et
imprimeur, TVA au taux réduit du livre — à confirmer par le comptable vu
la structure hors Union européenne.

---

## Rail A — LE SITE

### Bloc 1 — Ce qui ne dépend de rien, et débloque tout

À faire en premier : aucune de ces lignes n'attend une décision.

- [x] `.gitignore` protégeant `DOSSIER ENV./` et `*.notepad` — commité.
- [ ] Double authentification sur le **compte Hostinger** d'abord — il
      permet de réinitialiser root, d'ouvrir une console et de changer les
      DNS. Qui tient le compte tient le serveur, quel que soit SSH.
- [ ] Double authentification sur registrar, GitHub, Stripe, KDP, Lulu,
      Telegram, fournisseur d'e-mail, réseaux sociaux.
- [ ] Codes de secours récupérés et stockés **hors du téléphone et hors du
      VPS**.
- [x] Domaine : **vérifié le 2026-09-02.** `barmajata.com`, registrar
      Hostinger, enregistré le 21 août 2026, **expire le 21 août 2027**,
      verrou de transfert actif (`client transfer prohibited`).
- [ ] ⚠ **Étendre l'enregistrement à plusieurs années et activer le
      renouvellement automatique, AVANT toute impression.** Une seule année
      de réservation face à un QR imprimé à l'encre : si le domaine tombe en
      août 2027, tous les exemplaires en circulation meurent avec lui.
- [ ] Le domaine sert aujourd'hui la **page par défaut de Hostinger**
      (« Vous êtes prêt à partir ! ») sur l'apex et sur `www`. À remplacer
      par le site au bloc 2.
- [x] **SPF, DKIM : présents et corrects pour la messagerie Hostinger**
      (vérifié le 2026-09-02). SPF `include:_spf.mail.hostinger.com ~all`,
      DKIM délégué sur trois sélecteurs `hostingermail-a/b/c`.
- [ ] ⚠ **Le fournisseur d'envoi du club n'est couvert par rien.** SPF
      n'autorise que Hostinger : dès que Brevo ou Resend enverra, il sera un
      expéditeur non autorisé et non signé. Ajouter son `include:` SPF et
      ses enregistrements DKIM **le jour où le fournisseur est choisi** —
      c'est là que se joue le risque du double opt-in muet, pas dans
      l'absence de SPF.
- [x] **DMARC rendu utile — fait le 2026-09-02.** Il valait
      `v=DMARC1; p=none` sans adresse de rapport : ni protection, ni
      visibilité. Il vaut désormais
      `v=DMARC1; p=none; rua=mailto:dmarc@barmajata.com; fo=1`, vérifié sur
      les deux serveurs autoritaires et trois résolveurs publics, un seul
      enregistrement, SPF et DKIM intacts. La propagation côté Hostinger a
      pris près d'une heure, avec une phase où les serveurs autoritaires se
      contredisaient — c'est normal, pas une erreur de saisie.
- [ ] Ranger les rapports quotidiens (XML, un par fournisseur) dans un
      dossier dédié — sinon ils encombrent et finissent supprimés.
- [ ] Durcir vers `p=quarantine` **seulement** quand les rapports montreront
      que tous les expéditeurs légitimes passent. Durcir à l'aveugle
      enverrait nos propres e-mails à la corbeille.
- [ ] Boîtes professionnelles (contact, presse, droits, manuscrits). La
      messagerie Hostinger est déjà en place (MX `mx1`/`mx2.hostinger.com`).
- [ ] Surveillance de disponibilité **externe** — une alerte de panne ne
      peut pas partir du serveur en panne.
- [~] **Mentions légales et confidentialité : ÉCRITES, EN ATTENTE.** Les
      textes existent dans les trois langues ; les pages gardent leur état
      d'attente tant que `src/lib/legal.ts` est vide. Il ne reste qu'à le
      remplir — nom de l'éditeur, adresse, e-mail, hébergeur.
      **Ne pas rebloquer la suite là-dessus** : la question de l'anonymat
      et celle de la structure relèvent du rail C, pas du site.

### Bloc 2 — Mettre en ligne le site tel qu'il est

Le site n'existe aujourd'hui **qu'en local**. C'est la première marche.

- [ ] Déployer sur le VPS (voir rail D pour le durcissement).
- [x] **En-têtes de sécurité — faits le 2026-09-02.** HSTS (sans
      `preload`, volontairement), `nosniff`, `Referrer-Policy`,
      `Permissions-Policy`, `X-Frame-Options`, suppression de
      `X-Powered-By`, et une **CSP en mode bloquant** vérifiée au
      navigateur sur huit types de pages dans les trois langues. Sans
      nonce, par contrainte d'architecture : une CSP à nonce rendrait tout
      le site dynamique.
- [ ] Certificat SSL et redirection HTTPS (au déploiement).
- [ ] ⚠ Vérifier que le reverse proxy ou le CDN **relaie** ces en-têtes —
      posés côté Next, ils se perdent si un intermédiaire les remplace.
- [ ] Sauvegardes automatiques hors du VPS, **et une restauration de test
      réellement effectuée**.
- [x] **Kit de déploiement écrit** *(2026-09-03, dossier `deploiement/`)* :
      releases horodatées avec bascule atomique, retour arrière en une
      commande qui ne reconstruit rien, unité systemd sous utilisateur
      dédié et écoute locale seule, façade nginx. **Non exécuté sur le
      VPS**, qui n'était pas accessible — première installation à éprouver
      à la main.
- [ ] Éprouver le kit sur le VPS, puis déclencher le déploiement depuis la
      CI plutôt qu'à la main.
- [ ] 👤 Contenu réel minimal : au moins un auteur et un livre. Le
      catalogue est vide, tout ce qu'on voit en local est factice.
- [ ] 👤 Les quatre URL de réseaux sociaux, ou le maintien de la rangée
      masquée.
- [ ] Canaux d'alerte : e-mail prioritaire, WhatsApp, et un canal **séparé**
      pour les remontées clients. Définir les niveaux de gravité.
- [x] **Audit d'accessibilité outillé** *(2026-09-02, axe-core)* : cinq
      pages, trois langues, zéro violation après correction.
- [x] **`CLAUDE.md`, `.env.example` et le journal des lots remis à jour**
      (2026-09-02). Huit décrochages corrigés dans la référence ; le
      journal, arrêté au lot H12 alors que le code était au H43, a été
      rattrapé à partir des messages de commit — donc de ce qui avait été
      consigné sur le moment, non reconstitué après coup.

### Bloc 3 — Le club réellement fonctionnel

Tout est écrit et **rien n'a jamais tourné avec de vraies clés**.

- [ ] 👤 Choisir le fournisseur d'e-mail, poser les clés.
- [ ] Test de bout en bout : inscription, e-mail reçu, lien cliqué, contact
      ajouté à la liste.
- [ ] Vérifier l'acheminement réel vers les principaux fournisseurs de
      messagerie *(dépend du bloc 1)*.
- [ ] Enregistrer la **preuve du consentement** : date, texte affiché,
      horodatage. Rien n'est stocké aujourd'hui.
- [ ] Page newsletter : ce qu'on envoie, à quelle fréquence, archive
      publique des numéros, désinscription accessible.
- [ ] Ne pas mélanger liste transactionnelle et liste de prospection.

### Bloc 4 — QR codes

Le redirecteur `/b/<code>` **existe déjà** et répond au besoin : code figé,
destination modifiable, jamais de 404. *(Bloqué par D8 et le domaine.)*

- [ ] Attribuer le code **dès la création de la fiche**, en brouillon.
- [x] **Plusieurs codes par ouvrage, par usage** : `bonus`, `livre` et
      `avis` — ce dernier menant à la fiche ancrée sur son bloc d'avis,
      c'est le QR de fin d'ouvrage.
- [x] **Codes opaques, non séquentiels, jamais réutilisés** : 25 signes
      sans voyelle ni caractère ambigu, tirés cryptographiquement, vérifiés
      contre tous les codes ayant existé.
- [x] **Visuel vectoriel généré** par `outils/creer-code-qr.mjs`, en
      correction d'erreur « H » et zone de silence normalisée.
- [x] **Registre** : champs `tirage`, `imprimeLe` et `note` au schéma,
      purement documentaires — pour qu'on sache dans deux ans ce que pointe
      un code trouvé sur un exemplaire.
- [ ] **Scan réel sur l'épreuve imprimée**, jamais seulement à l'écran.
- [x] **Tranché et implémenté** *(2026-09-03)* : un livre en brouillon
      mène au club plutôt qu'à l'accueil. Et un défaut plus grave a été
      corrigé au passage — un code pointant vers un slug inexistant menait
      à une **404**, ce que la doctrine interdit. La décision est passée
      dans une fonction pure testée (`resoudreCibleQr`).

### Bloc 5 — Base de données et back-office *(bloqué par D2)*

- [ ] Base sur le VPS, jamais exposée sur l'internet, utilisateur à
      privilèges limités.
- [ ] Migration des fichiers JSON vers la base : script réversible et
      rejouable.
- [ ] Back-office : authentification forte — **clé d'accès plutôt qu'OTP,
      seule à résister à l'hameçonnage**.
- [ ] Création et modification des livres, auteurs, éditions par langue,
      formats, prix, ISBN.
- [ ] Téléversement des visuels et versionnage des PDF d'impression.
- [ ] Prévisualisation avant publication, dans les trois langues.
- [ ] Les contrôles de cohérence deviennent des messages lisibles, au lieu
      de faire échouer le build.
- [ ] Journal des modifications, retour arrière.
- [ ] **Retrait d'un ouvrage** : distinguer dépublier / retirer / supprimer.
      Jamais de 404. Ne jamais emporter les commandes ni les factures.

### Bloc 6 — Vente directe *(bloqué par D1 et D3)*

Le plus lourd, et celui qui change la nature juridique du site : avec
Stripe, **c'est nous le vendeur**, plus Amazon.

- [ ] 👤 CGV opposables, droit de rétractation de 14 jours, information
      précontractuelle, délai de livraison annoncé.
- [ ] 👤 Adhésion à un médiateur de la consommation, mentionnée sur le site.
- [ ] 👤 Calculer le prix public **avant** de le déclarer : commission
      Stripe, coût d'impression, port, retours qui ne se remettent pas en
      stock, abonnements mensuels. La loi Lang interdit tout rattrapage
      ultérieur par des remises.
- [ ] Stripe Checkout hébergé — aucune donnée de carte sur notre serveur.
      Préserver ce choix.
- [ ] Le montant est recalculé côté serveur, jamais reçu du navigateur.
- [ ] Lulu : commande déclenchée par le paiement, **file d'attente avec
      réessais** et état de commande persistant. Un échec après
      encaissement laisse un client qui a payé sans rien recevoir.
- [ ] Webhooks Stripe et Lulu : signature vérifiée, traitement idempotent.
- [ ] Second canal Amazon, avec redirection contournable par le visiteur.
- [x] **Premiers tests automatisés** *(2026-09-03)* : 49 tests sur le
      jeton du club, les liens Amazon, le choix d'édition, le prix affiché
      et les catégories. Ajoutés à la CI et au garde-fou de push. Leur
      capacité à détecter un vrai défaut a été prouvée en introduisant
      trois régressions volontaires — six tests sont tombés.
- [ ] Étendre aux tests du paiement et de la commande d'impression quand
      ils existeront.
- [ ] Environnement de recette : Stripe en mode test, Lulu en bac à sable.
- [ ] Facturation : mentions obligatoires, numérotation sans trou,
      conservation dix ans.
- [ ] SAV : colis perdu ou abîmé, qui réimprime et qui paie.

### Bloc 7 — Croissance *(en dernier, et seulement là)*

Rien ici n'a de sens tant qu'il n'y a pas de livre à vendre.

- [ ] Bot Telegram : accueil au scan, bonus PDF, recommande.
- [ ] Assistant conversationnel sur l'accueil — **tenu au catalogue, sans
      liberté d'invention**, avec mention explicite qu'on parle à une
      machine.
- [ ] ManyChat sur les réseaux, messages privés automatiques.
- [ ] Page de liens maison plutôt qu'un service tiers ; liens courts
      redirigeables, un par réseau et par campagne.
- [ ] Pixels Meta et TikTok — **et donc un bandeau de consentement
      conforme**, qui n'existe pas aujourd'hui *(voir D5)*.
- [ ] Relances de panier abandonné et séquence d'accueil, dans le respect
      des règles de prospection.
- [ ] Test à blanc du parcours complet, exemplaire de test commandé.

---

## Rail B — L'USINE *(l'espace d'une autre session)*

**L'usine n'est pas un sous-dossier du site : c'est le territoire de sa
propre session Claude.** Listé ici pour mémoire, jamais traité ici.

- Conception et fabrication du livre, gabarits, mise en page.
- PDF intérieurs et couvertures avec tranche, validés pour l'impression.
- Ce que le site attend d'elle : les PDF prêts, la couverture de catalogue,
  les trois textures du livre en volume, l'épaisseur.

### Transmission

Fil unique : **`~/usine-editoriale/docs/notes-du-site.md`** — une entrée par
transmission, la plus récente en haut, écrite par la session site et lue par
la session usine.

- [ ] Y écrire à chaque décision qui touche la fabrication, l'infrastructure
      partagée, ou les données attendues de l'usine.
- [ ] Prévenir la session vivante quand il y en a une.
- [ ] Ne jamais modifier son `CLAUDE.md` ni sa mémoire : c'est à elle de
      décider si elle référence la note.
- [x] Première note déposée et transmise le 2026-09-02 — séparation des
      rails, QR imprimé, mentions obligatoires, ce que le site consomme,
      infrastructure, et les trois décisions qui bloquent un gabarit.

---

## Rail C — LA MAISON *(hors logiciel)*

Ce qui bloque le site figure ici ; le reste appartient à la maison.

- [ ] [?] **Structure juridique ajournée.** Une LLC américaine était
      envisagée ; l'édition se fait pour l'instant à titre personnel. Le
      jour où la structure est créée, la fiscalité transfrontalière devra
      être validée par un comptable, et un représentant dans l'Union
      désigné pour le RGPD (article 27) — obligations qui ne se posent pas
      tant que l'éditeur est français.
- [ ] 👤 **Contrat d'édition écrit pour chaque ouvrage.** Sans écrit, la
      cession de droits n'est pas valablement constituée.
- [ ] 👤 Reddition de comptes annuelle aux auteurs — suppose de compter les
      ventes par canal et par format. *Le site doit fournir ces chiffres.*
- [ ] 👤 Traçabilité des manuscrits reçus et des refus.
- [x] **Préfixe ISBN AFNIL obtenu**, à titre personnel *(2026-09-03)*.
- [ ] 👤 Attribuer un ISBN par langue **et par reliure**, et renseigner les
      métadonnées. Le prix y figure — donc après le calcul de coûts.
- [ ] [?] Le jour de la cession à une structure étrangère, revoir la
      question : un préfixe AFNIL ne suit pas l'éditeur hors de France.
- [ ] 👤 Dépôt légal BnF, éditeur **et** imprimeur — question à poser
      explicitement avec une impression à la demande étrangère.
- [ ] 👤 Mentions obligatoires dans l'ouvrage : achevé d'imprimer, nom et
      adresse de l'imprimeur, dépôt légal, ISBN, prix.
- [ ] 👤 Vérifier que **BARMAJATA est réellement déposé**, dans quelles
      classes et sur quels territoires.
- [ ] 👤 Comptes marchands : Stripe, et KDP **en version non exclusive** —
      KDP Select interdirait la vente directe.
- [ ] 👤 Licences des polices et droits sur les visuels : écran et
      impression ne se licencient pas pareil.

---

## Rail D — LE SOCLE *(le VPS partagé)*

- [ ] Migrer site, usine et bot de trading sur le VPS, dans des dossiers
      séparés *(voir D4 pour l'exploitation)*.
- [ ] **Isolation réelle entre les trois locataires** : un dossier n'est
      pas une frontière. Un serveur qui encaisse et détient une base
      clients ne devrait pas partager sa surface d'attaque avec des bots
      porteurs de clés d'API d'échange. Conteneurs, utilisateurs séparés,
      ou seconde machine.
- [ ] Pare-feu : tout fermé sauf SSH, 80, 443.
- [ ] SSH par clé seule, root interdit, port déplacé, `fail2ban`.
- [ ] Mises à jour de sécurité automatiques.
- [ ] Aucun service ne tourne en root.
- [ ] Inventaire des secrets et politique de rotation.
- [ ] Journalisation centralisée, alerte à chaque connexion réussie.
- [ ] Plan d'incident écrit : quoi faire, dans quel ordre, avec quels accès
      de secours, si le serveur est compromis un dimanche.
- [ ] Plan de notification de violation — 72 heures pour prévenir la CNIL,
      cela ne s'improvise pas le jour venu.

---

## Les risques, triés

### Bloquants — rien ne s'ouvre au public avant

| Risque | Rail |
|---|---|
| Pages légales vides alors que le club recueille des e-mails | A |
| Remise supérieure à 5 % sur un livre (loi Lang) | A + C |
| Frais de port offerts sur un livre neuf | A + C |
| Pixels publicitaires sans bandeau de consentement | A |
| Vente directe sans CGV, rétractation ni médiateur | A + C |
| Publier sans contrat d'édition écrit | C |
| SPF/DKIM/DMARC absents : double opt-in en échec silencieux | A |
| Preuve du consentement non conservée | A |
| Prix fixé avant le calcul des coûts | C |
| Panneau d'hébergement non protégé | D |
| Alerte de panne émise par le serveur en panne | D |

### À cadrer avant d'y toucher

Fiscalité transfrontalière · KDP Select contre vente directe · RGPD du bot
Telegram · sous-traitance Lulu et adresse postale · dépôt légal de
l'imprimeur étranger · assistant qui invente un prix ou une date ·
transparence « vous parlez à une machine » · accessibilité devenue
obligation · rétractation qui coûte le tirage · réclamations transitant
par Meta.

### À surveiller

Cohabitation trading / encaissement · webhooks non signés · échec Lulu
après encaissement · domaine imprimé à l'encre · lien en bio non
redirigeable · raccourcisseurs tiers · ISBN recyclé · sauvegarde jamais
restaurée · OTP sans plafond de tentatives · coût de l'assistant · écart
entre langues du site et ISBN · sept phases menées de front.

---

## Ta part — ce qui n'avance pas sans toi

1. Les huit décisions du bloc 0, à commencer par **carnet ou livre**.
2. Les informations d'entreprise, pour les mentions légales.
3. Le contenu réel : au moins un auteur, un livre.
4. Les comptes et les clés : hébergeur, e-mail, Stripe, Lulu, KDP.
5. Le calcul des coûts, avant tout prix et tout ISBN.
6. Les contrats d'auteur.

## Ma part — ce qui n'attend rien

Blocs 1 et 2 pour la partie technique, remise à jour de la documentation,
durcissement du socle, et le déploiement dès que le VPS est accessible.
