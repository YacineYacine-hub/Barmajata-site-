#!/usr/bin/env bash
#
# Publie sur origin UNIQUEMENT si les trois contrôles de la CI passent en
# local : `tsc --noEmit`, `eslint`, `npm run build`.
#
# Lancé automatiquement après chaque `git commit` par le hook PostToolUse
# déclaré dans .claude/settings.local.json (fichier personnel, non versionné).
# Peut aussi être lancé à la main : ./.claude/push-si-vert.sh
#
# Ne bloque JAMAIS la session : sort toujours en 0, et rend compte par le
# champ `systemMessage` attendu par le harness.
#
# Raison d'être : un commit poussé sur un dépôt public est publié, et la CI
# tourne sur `push`. Le Lot F a laissé un build cassé passer inaperçu parce
# que `tsc` et `eslint` passaient — seul `npm run build` le voyait.

set -uo pipefail

REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO" || exit 0

JOURNAL="$(mktemp -t push-si-vert)"
trap 'rm -f "$JOURNAL"' EXIT

# Rend compte au harness. python3 fait l'échappement JSON (un message peut
# contenir des guillemets, des sauts de ligne, des accents).
rendre_compte() {
  python3 -c 'import json,sys; print(json.dumps({"systemMessage": sys.argv[1]}))' "$1"
}

# Pas de branche de suivi : on ne devine pas la destination.
if ! git rev-parse --abbrev-ref --symbolic-full-name '@{u}' >/dev/null 2>&1; then
  rendre_compte "Push auto : aucune branche de suivi configurée, rien n'a été fait. Lancer une fois \`git push -u origin <branche>\`."
  exit 0
fi

# Rien de nouveau à publier : silence complet, c'est le cas le plus fréquent
# (un `git commit` qui a échoué, ou une branche déjà à jour).
if [ -z "$(git log --oneline '@{u}..HEAD' 2>/dev/null)" ]; then
  exit 0
fi

A_POUSSER="$(git log --oneline '@{u}..HEAD' | wc -l | tr -d ' ')"

# ATTENTION — le code de sortie ne suffit pas.
#
# `next build` imprime certaines erreurs et sort quand même en 0. Mesuré
# sur ce projet : retirer `pages.books.description` de messages/fr.json
# fait imprimer « Error: MISSING_MESSAGE » pendant la génération statique,
# et le build sort en 0. C'est exactement la panne du Lot F, celle qui a
# motivé ce script : s'y fier seule le rendrait inutile.
#
# On inspecte donc aussi la sortie. Motifs retenus : les erreurs de clé de
# traduction manquante, et toute ligne `Error:` en début de ligne.
MOTIFS_ECHEC='MISSING_MESSAGE|^Error:|^\s*⨯'

# Montre les lignes qui accusent, pas la fin du journal : `next build`
# imprime son tableau de routes après les erreurs, donc un simple `tail`
# afficherait la liste des routes au lieu de la panne.
extrait_utile() {
  local trouve
  trouve="$(grep -nE "$MOTIFS_ECHEC" "$JOURNAL" | head -n 8)"
  if [ -n "$trouve" ]; then
    printf '%s' "$trouve"
  else
    tail -n 15 "$JOURNAL"
  fi
}

echouer() {
  rendre_compte "$(printf 'Push auto ANNULÉ — %s\n\n%s\n\nRien n'"'"'a été publié : %s commit(s) restent en local.' \
    "$1" "$(extrait_utile)" "$A_POUSSER")"
  exit 0
}

# Le build va dans `.next-verif`, jamais dans `.next` : sinon il écrase le
# build de démonstration d'un serveur local en cours d'exécution, qui se met
# alors à servir une page d'erreur 500 (fragments JavaScript disparus).
# Voir le commentaire de `distDir` dans next.config.ts.
for controle in "npx tsc --noEmit" "npm run lint" "npm test" "NEXT_DIST_DIR=.next-verif npm run build"; do
  if ! eval "$controle" >"$JOURNAL" 2>&1; then
    echouer "« $controle » a échoué."
  fi
  if grep -qE "$MOTIFS_ECHEC" "$JOURNAL"; then
    echouer "« $controle » est sorti en 0 mais a signalé des erreurs dans sa sortie."
  fi
done

if git push >"$JOURNAL" 2>&1; then
  rendre_compte "Contrôles verts (tsc, eslint, build) — $A_POUSSER commit(s) poussé(s). HEAD : $(git log --oneline -1)"
else
  rendre_compte "$(printf 'Contrôles verts, mais le push a été refusé :\n\n%s' "$(tail -n 10 "$JOURNAL")")"
fi

exit 0
