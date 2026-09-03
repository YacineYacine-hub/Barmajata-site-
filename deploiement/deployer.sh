#!/usr/bin/env bash
#
# Déploiement du site sur le VPS. Atomique et réversible.
#
#   ./deployer.sh                 déploie la révision courante de main
#   ./deployer.sh <ref-git>       déploie une révision précise
#
# Principe : chaque déploiement construit une release COMPLÈTE dans son
# propre dossier horodaté, et ne bascule le lien `courant` qu'une fois le
# build réussi. Le site en production n'est donc jamais dans un état
# à moitié construit — le défaut exact rencontré en local le 2026-09-02,
# où un build écrasant .next pendant qu'un serveur tournait faisait servir
# une page d'erreur 500 (voir next.config.ts, commentaire de distDir).
#
# Le retour arrière ne reconstruit rien : il repointe le lien sur la
# release précédente, qui est intacte. Quelques secondes.
#
# NON TESTÉ SUR LE VPS : écrit avant que la machine soit accessible. À
# éprouver une première fois à la main, étape par étape, avant de s'y fier.

set -euo pipefail

RACINE="${BARMAJATA_RACINE:-/home/vps/02_BARMAJATA_WEB}"
DEPOT="${BARMAJATA_DEPOT:-https://github.com/YacineYacine-hub/Barmajata-site-.git}"
SERVICE="${BARMAJATA_SERVICE:-barmajata}"
GARDER="${BARMAJATA_GARDER:-5}"     # nombre de releases conservées
REF="${1:-main}"

RELEASES="$RACINE/releases"
COURANT="$RACINE/courant"
HORODATAGE="$(date +%Y%m%d-%H%M%S)"
CIBLE="$RELEASES/$HORODATAGE"

echo "→ Déploiement de « $REF » dans $CIBLE"

# --- Garde-fou : le contenu de démonstration ne va JAMAIS en production.
# Dix livres factices en ligne sous le nom de la maison seraient pires
# qu'un catalogue vide.
if [ "${NEXT_PUBLIC_DEMO_CONTENT:-}" = "true" ]; then
  echo "✗ NEXT_PUBLIC_DEMO_CONTENT=true — refus de déployer du contenu de démonstration." >&2
  exit 1
fi

mkdir -p "$RELEASES"

# Un clone superficiel suffit pour une branche ; il échoue en revanche sur
# un SHA ou un tag ancien, d'où le repli sur un clone complet. Écrit en
# `if` et non en `A || B && C` : cette dernière forme se lit
# `(A || B) && C`, ce qui n'est jamais ce qu'on croit.
if ! git clone --depth 1 --branch "$REF" "$DEPOT" "$CIBLE" 2>/dev/null; then
  rm -rf "$CIBLE"
  git clone --quiet "$DEPOT" "$CIBLE"
  git -C "$CIBLE" checkout --quiet "$REF"
fi

# --- Les secrets vivent HORS des releases, et sont liés, pas copiés :
# une release effacée ne doit jamais emporter le fichier d'environnement.
if [ -f "$RACINE/.env.production" ]; then
  ln -sf "$RACINE/.env.production" "$CIBLE/.env.production"
else
  echo "⚠ $RACINE/.env.production absent — le club et les alertes resteront inertes."
fi

cd "$CIBLE"
# Toutes les dépendances, y compris de développement : `next build` a
# besoin de TypeScript et de Tailwind, qui sont en devDependencies.
# `--omit=dev` ferait échouer le build — piège vérifié en relisant
# package.json, pas supposé.
npm ci --no-audit --no-fund

# --- Même piège qu'en local : `next build` sait sortir en 0 après avoir
# imprimé des erreurs. On inspecte la SORTIE, pas seulement le code.
# Motifs identiques à .claude/push-si-vert.sh et à la CI.
JOURNAL="$CIBLE/build.log"
if ! npm run build >"$JOURNAL" 2>&1; then
  echo "✗ Build en échec. Rien n'a été mis en ligne." >&2
  tail -n 20 "$JOURNAL" >&2
  exit 1
fi
if grep -qE 'MISSING_MESSAGE|^Error:|^\s*⨯' "$JOURNAL"; then
  echo "✗ Build sorti en 0 mais signalant des erreurs. Rien n'a été mis en ligne." >&2
  grep -nE 'MISSING_MESSAGE|^Error:|^\s*⨯' "$JOURNAL" | head -n 8 >&2
  exit 1
fi

# --- Bascule atomique. `ln -sfn` remplace le lien en une seule opération :
# à aucun instant `courant` ne pointe vers rien.
PRECEDENTE="$(readlink -f "$COURANT" 2>/dev/null || true)"
ln -sfn "$CIBLE" "$COURANT"
echo "→ Lien basculé sur $HORODATAGE"

sudo systemctl restart "$SERVICE"

# --- Vérification réelle : on interroge le site, on ne suppose pas.
for essai in $(seq 1 30); do
  if curl -fsS --max-time 3 http://127.0.0.1:3000/fr >/dev/null 2>&1; then
    echo "✓ Le site répond."
    break
  fi
  if [ "$essai" = "30" ]; then
    echo "✗ Le site ne répond pas après 30 s. Retour arrière." >&2
    if [ -n "$PRECEDENTE" ]; then
      ln -sfn "$PRECEDENTE" "$COURANT"
      sudo systemctl restart "$SERVICE"
      echo "→ Revenu sur $(basename "$PRECEDENTE")." >&2
    fi
    exit 1
  fi
  sleep 1
done

# --- Ménage : on garde les dernières releases pour pouvoir revenir.
cd "$RELEASES"
ls -1dt */ | tail -n +"$((GARDER + 1))" | xargs -r rm -rf
echo "✓ Déploiement terminé — $HORODATAGE ($(ls -1d */ | wc -l | tr -d ' ') releases conservées)"
