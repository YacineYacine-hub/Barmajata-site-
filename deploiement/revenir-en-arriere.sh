#!/usr/bin/env bash
#
# Retour arrière : repointe `courant` sur la release précédente et
# redémarre. Ne reconstruit RIEN — c'est ce qui le rend rapide et sûr.
#
#   ./revenir-en-arriere.sh              revient d'un cran
#   ./revenir-en-arriere.sh <horodatage> revient à une release précise
#   ./revenir-en-arriere.sh --lister     montre ce qui est disponible

set -euo pipefail

RACINE="${BARMAJATA_RACINE:-/home/vps/02_BARMAJATA_WEB}"
SERVICE="${BARMAJATA_SERVICE:-barmajata}"
RELEASES="$RACINE/releases"
COURANT="$RACINE/courant"

ACTUELLE="$(basename "$(readlink -f "$COURANT")")"

if [ "${1:-}" = "--lister" ]; then
  echo "Releases disponibles (la plus récente en premier) :"
  ls -1dt "$RELEASES"/*/ | while read -r r; do
    nom="$(basename "$r")"
    [ "$nom" = "$ACTUELLE" ] && echo "  $nom  ← en ligne" || echo "  $nom"
  done
  exit 0
fi

if [ -n "${1:-}" ]; then
  CIBLE="$RELEASES/$1"
else
  # La release juste avant celle qui est en ligne.
  CIBLE="$(ls -1dt "$RELEASES"/*/ | grep -v "/$ACTUELLE/$" | head -n 1)"
fi

[ -d "$CIBLE" ] || { echo "✗ Release introuvable : $CIBLE" >&2; exit 1; }

echo "→ Retour de $ACTUELLE vers $(basename "$CIBLE")"
ln -sfn "${CIBLE%/}" "$COURANT"
sudo systemctl restart "$SERVICE"

for essai in $(seq 1 30); do
  curl -fsS --max-time 3 http://127.0.0.1:3000/fr >/dev/null 2>&1 && { echo "✓ Le site répond."; exit 0; }
  sleep 1
done
echo "✗ Le site ne répond toujours pas — la panne ne venait pas de la release." >&2
exit 1
