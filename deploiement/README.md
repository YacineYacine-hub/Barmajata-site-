# Déploiement

Le site n'a jamais été mis en ligne : il n'existait qu'en local. Ce
dossier contient de quoi l'installer, le déployer et **revenir en
arrière**, sur le VPS Hostinger.

> **Rien de tout ceci n'a été exécuté sur le VPS**, qui n'était pas
> accessible au moment de l'écriture (2026-09-03). Éprouver la première
> installation à la main, étape par étape, avant de se fier aux scripts.

## Ce que contient ce dossier

| Fichier | Rôle |
|---|---|
| `deployer.sh` | Construit une release complète, ne bascule qu'en cas de succès, vérifie que le site répond, revient en arrière tout seul sinon |
| `revenir-en-arriere.sh` | Repointe sur une release précédente. Ne reconstruit rien — quelques secondes |
| `barmajata.service` | Unité systemd : utilisateur dédié, écoute locale seulement, limite mémoire, cloisonnement |
| `nginx-barmajata.conf` | Façade HTTPS. **Ne pose aucun en-tête de sécurité** — voir plus bas |

## Le principe : des releases, jamais un dossier qu'on écrase

```
/home/vps/02_BARMAJATA_WEB/
├── releases/
│   ├── 20260903-081500/     ← une release complète, autonome
│   ├── 20260903-093000/
│   └── 20260903-141200/
├── courant -> releases/20260903-141200/
└── .env.production          ← les secrets, HORS des releases
```

Chaque déploiement construit **dans son propre dossier**, et ne bascule le
lien `courant` qu'une fois le build réussi. Le site en production n'est
donc jamais à moitié construit.

Ce n'est pas une précaution théorique : le même défaut a été rencontré en
local le 2026-09-02, où un build écrasant `.next` pendant qu'un serveur
tournait faisait servir une page d'erreur 500 aux visiteurs, le serveur
réclamant des fragments JavaScript qui n'existaient plus.

Le retour arrière ne reconstruit rien. C'est ce qui le rend utilisable
un dimanche soir.

## Première installation

```bash
# 1. Un utilisateur dédié — le service ne tourne jamais en root, et le VPS
#    héberge aussi l'usine et des bots de trading.
sudo adduser --system --group --home /home/vps/02_BARMAJATA_WEB barmajata

# 2. Node 22 (même version que la CI).
# 3. Les secrets, hors des releases, lisibles par le seul service.
sudo -u barmajata cp .env.example /home/vps/02_BARMAJATA_WEB/.env.production
sudo chmod 600 /home/vps/02_BARMAJATA_WEB/.env.production

# 4. Le service.
sudo cp barmajata.service /etc/systemd/system/
sudo systemctl daemon-reload && sudo systemctl enable --now barmajata

# 5. La façade, puis le certificat.
sudo cp nginx-barmajata.conf /etc/nginx/sites-available/barmajata
sudo ln -s /etc/nginx/sites-available/barmajata /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d barmajata.com -d www.barmajata.com
```

## Au quotidien

```bash
./deployer.sh                    # déploie main
./deployer.sh v1.2.0             # déploie une révision précise
./revenir-en-arriere.sh --lister # que peut-on restaurer ?
./revenir-en-arriere.sh          # revient d'un cran
```

## Trois pièges, dont deux coûteux

**1. nginx ne doit poser AUCUN en-tête de sécurité.** Ils viennent de
`next.config.ts`. Deux façons de tout casser sans s'en apercevoir : un
`add_header` en double — un navigateur qui reçoit deux politiques de
sécurité applique leur **intersection**, ce qui coupe des pages au
hasard ; et un `add_header` placé dans un bloc `location`, qui en nginx
**annule tous ceux du bloc parent**. Après la première mise en ligne,
vérifier ce qui sort réellement :

```bash
curl -sSI https://barmajata.com/fr | grep -i -E 'content-security|strict-transport|x-frame'
```

**2. Le contenu de démonstration ne va jamais en production.** Dix livres
factices en ligne sous le nom de la maison seraient pires qu'un catalogue
vide. `deployer.sh` refuse de partir si `NEXT_PUBLIC_DEMO_CONTENT=true`,
mais la variable ne doit tout simplement pas exister sur le VPS.

**3. Le service écoute sur `127.0.0.1` seulement.** nginx fait face à
l'internet, l'application non — même derrière un pare-feu. Ne pas
remplacer par `0.0.0.0` « pour tester ».

## Ce qui reste à faire

- **Sauvegardes hors du VPS**, et une restauration réellement essayée. Un
  instantané de l'hébergeur n'est pas une sauvegarde : il disparaît avec
  le compte.
- **Surveillance de disponibilité externe.** Une alerte de panne ne peut
  pas partir du serveur en panne.
- Déclencher `deployer.sh` depuis la CI plutôt qu'à la main, une fois la
  procédure éprouvée au moins une fois manuellement.
