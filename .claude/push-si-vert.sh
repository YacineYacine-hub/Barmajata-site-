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

for controle in "npx tsc --noEmit" "npm run lint" "npm run build"; do
  if ! eval "$controle" >"$JOURNAL" 2>&1; then
    rendre_compte "$(printf 'Push auto ANNULÉ — « %s » a échoué.\n\n%s\n\nRien n'"'"'a été publié : %s commit(s) restent en local.' \
      "$controle" "$(tail -n 15 "$JOURNAL")" "$A_POUSSER")"
    exit 0
  fi
done

if git push >"$JOURNAL" 2>&1; then
  rendre_compte "Contrôles verts (tsc, eslint, build) — $A_POUSSER commit(s) poussé(s). HEAD : $(git log --oneline -1)"
else
  rendre_compte "$(printf 'Contrôles verts, mais le push a été refusé :\n\n%s' "$(tail -n 10 "$JOURNAL")")"
fi

exit 0
