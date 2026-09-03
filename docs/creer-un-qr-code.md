# Créer le QR code d'un livre — marche à suivre

De bout en bout, du slug du livre au fichier envoyé à l'imprimeur.

> **Aujourd'hui, cela passe par une commande dans le terminal.** Il n'y a
> pas d'interface : le back-office n'existe pas encore, et il attend la
> décision « catalogue en base ou en fichiers » (D2 de la master
> checklist). Le jour où il existera, ce sera un bouton.

---

## Ce qu'il faut savoir avant de commencer

**Le code est attribué AVANT la publication.** C'est même le cas normal :
on décide le code, on l'imprime, et on branche la destination plus tard.
Le livre doit simplement **exister comme fiche**, même en brouillon.

**Ce qui est imprimé, c'est `barmajata.com/b/<code>`** — jamais l'adresse
de la fiche. C'est ce qui permet de rediriger un QR **déjà imprimé** : si
le livre change de slug, ou si on décide qu'il mène ailleurs, on modifie
la table, pas les exemplaires.

**Un code n'est jamais réutilisé**, même après retrait d'un ouvrage. Des
exemplaires en circulation le portent à vie.

---

## 1. La fiche du livre doit exister

Le slug du livre, c'est le nom de son fichier.

```bash
cp src/content/books/_template.json src/content/books/mon-livre.json
```

Puis remplir au moins `slug`, `auteurSlug` et une édition. **Le statut peut
rester `brouillon`** : le livre reste invisible partout, et c'est très bien.

*L'outil refuse de créer un code vers un slug inexistant, et affiche la
liste de ceux qui existent. Une faute de frappe produirait un QR qui
redirige vers l'accueil — découvert seulement après impression.*

## 2. Choisir l'usage du code

Un ouvrage en porte souvent **plusieurs**, à des endroits différents :

| `--type` | Où mène le scan | Où l'imprimer |
|---|---|---|
| `livre` | La fiche du livre | 4e de couverture |
| `avis`  | La fiche, **ancrée sur le bloc d'avis** | Dernière page |
| `bonus` | Une page de contenu déverrouillé | Là où le bonus est annoncé |

## 3. Créer le code

```bash
node outils/creer-code-qr.mjs \
  --type avis \
  --destination mon-livre \
  --libelle "Donner son avis" \
  --tirage "1er tirage, 500 ex."
```

L'outil affiche le code produit et écrit deux choses :

- l'entrée dans **`src/content/qr/codes.json`** — à commiter, c'est elle
  qui fait autorité ;
- le visuel dans **`qr-a-imprimer/<code>.svg`** — à envoyer à l'imprimeur,
  non versionné, il se régénère.

## 4. Envoyer le SVG à l'imprimeur

C'est du **vectoriel** : il s'agrandit sans perte, quelle que soit la
taille retenue. Trois consignes à transmettre :

- **ne pas rogner la marge blanche** — c'est la zone de silence exigée par
  la norme, la réduire fait échouer des lecteurs ;
- **ne pas recolorier** — noir sur blanc, contraste franc ;
- **taille minimale ~15 mm de côté** pour un livre tenu en main.

## 5. Scanner l'épreuve — et pas l'écran

**L'étape qu'on saute et qu'on regrette.** Un QR validé sur un moniteur
peut échouer une fois imprimé : encre qui bave, vernis brillant, pliure
trop proche. Le code est produit en correction d'erreur haute, ce qui
tolère environ 30 % de symbole abîmé — mais cela se vérifie sur le papier.

Scanner avec **deux téléphones différents**, dont un ancien.

## 6. Commiter la table

```bash
git add src/content/qr/codes.json && git commit -m "QR : <code> pour mon-livre"
```

---

## Après l'impression

**Le code ne bouge plus. La destination, si.**

- Le livre change de slug → modifier `destination` dans `codes.json`.
- Le livre est retiré → mettre `actif: false`. Le scan mène alors à
  l'accueil, jamais à une erreur.
- Le livre n'est pas encore publié → le scan mène au club, pour que le
  lecteur soit prévenu de la sortie.

**Ce qu'il ne faut jamais faire** : supprimer une entrée de `codes.json`
pour « faire le ménage ». Un code supprimé pourrait être réattribué plus
tard à un autre ouvrage, et les exemplaires déjà vendus mèneraient au
mauvais livre. `actif: false` est fait pour cela.
