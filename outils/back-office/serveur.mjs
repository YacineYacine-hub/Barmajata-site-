#!/usr/bin/env node
/**
 * Back-office LOCAL de BARMAJATA.
 *
 *   npm run admin        puis http://localhost:4317
 *
 * POURQUOI IL VIT ICI ET NON DANS LE SITE
 *
 * C'est un serveur autonome, hors du dossier `src/app` : il ne peut donc
 * PAS être déployé par accident avec le site. Un back-office qui ne
 * traverse jamais la frontière de production ne peut pas fuiter.
 *
 * Il n'écoute que sur 127.0.0.1 — jamais joignable depuis le réseau.
 * Aucune authentification n'est donc nécessaire : la protection est
 * physique, c'est ta machine.
 *
 * CE QU'IL FAIT
 *
 * Il lit et écrit les fichiers de `src/content/` et les visuels de
 * `public/`. Rien d'autre. Pas de base de données, pas de session, pas de
 * compte. Git reste l'historique et l'annulation : une bêtise se répare
 * avec `git checkout`.
 *
 * VALIDATION
 *
 * Tout enregistrement passe par le MÊME schéma Zod que le build
 * (`src/lib/content/schema.ts`). Un livre refusé ici l'aurait été au
 * build : on découvre l'erreur en la saisissant plutôt qu'en déployant.
 */
import { createServer } from "node:http";
import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync, unlinkSync } from "node:fs";
import { dirname, join, extname } from "node:path";
import { fileURLToPath } from "node:url";
import { bookSchema, authorSchema } from "../../src/lib/content/schema.ts";
import { creerCodeUnique, urlDuCode } from "../../src/lib/content/qr-codes.ts";
import QRCode from "qrcode";

const RACINE = join(dirname(fileURLToPath(import.meta.url)), "../..");
const LIVRES = join(RACINE, "src/content/books");
const AUTEURS = join(RACINE, "src/content/authors");
const VISUELS = join(RACINE, "public/couvertures");
const TABLE_QR = join(RACINE, "src/content/qr/codes.json");
const QR_SORTIE = join(RACINE, "qr-a-imprimer");
const SITE_URL = "https://www.barmajata.com";
// 4000 est un port très courant — il était déjà pris sur la machine.
// Surchargeable si besoin : BARMAJATA_ADMIN_PORT=5000 npm run admin
const PORT = Number(process.env.BARMAJATA_ADMIN_PORT ?? 4317);

const TYPES_IMAGE = { ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png",
                      ".webp": "image/webp", ".svg": "image/svg+xml" };

function fiches(dossier) {
  if (!existsSync(dossier)) return [];
  return readdirSync(dossier)
    .filter((f) => f.endsWith(".json") && !f.startsWith("_"))
    .map((f) => JSON.parse(readFileSync(join(dossier, f), "utf-8")));
}

function ecrire(dossier, slug, donnees) {
  if (!existsSync(dossier)) mkdirSync(dossier, { recursive: true });
  writeFileSync(join(dossier, `${slug}.json`), JSON.stringify(donnees, null, 2) + "\n", "utf-8");
}

function json(res, code, corps) {
  res.writeHead(code, { "content-type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(corps));
}

async function corpsJson(req) {
  const morceaux = [];
  for await (const m of req) morceaux.push(m);
  return JSON.parse(Buffer.concat(morceaux).toString("utf-8"));
}

const routes = {
  "GET /api/livres": (req, res) => json(res, 200, fiches(LIVRES)),
  "GET /api/auteurs": (req, res) => json(res, 200, fiches(AUTEURS)),

  "GET /api/gabarit": (req, res) => {
    /*
     * Le gabarit contient des commentaires : ce n'est volontairement pas
     * du JSON strict (voir _template.json). On renvoie donc une structure
     * minimale écrite ici, plutôt que de le parser.
     */
    json(res, 200, {
      slug: "", auteurSlug: "", couverture: "", categories: [],
      editions: [{
        langue: "fr", titre: "", resumeCourt: "", resumeLong: "",
        statut: "brouillon", formats: [],
      }],
    });
  },

  "POST /api/livre": async (req, res) => {
    const donnees = await corpsJson(req);

    // Même schéma que le build : ce qui passe ici passera au déploiement.
    const verdict = bookSchema.safeParse(donnees);
    if (!verdict.success) {
      return json(res, 400, {
        erreur: "validation",
        details: verdict.error.issues.map((i) => `${i.path.join(".") || "(racine)"} : ${i.message}`),
      });
    }

    // L'auteur référencé doit exister, sinon le BUILD échouera — mieux
    // vaut le dire maintenant qu'au déploiement.
    const auteurs = fiches(AUTEURS).map((a) => a.slug);
    if (!auteurs.includes(donnees.auteurSlug)) {
      return json(res, 400, {
        erreur: "auteur",
        details: [`L'auteur « ${donnees.auteurSlug} » n'existe pas.`,
                  auteurs.length ? `Auteurs connus : ${auteurs.join(", ")}` : "Aucun auteur n'est encore créé."],
      });
    }

    ecrire(LIVRES, donnees.slug, donnees);
    json(res, 200, { ok: true, chemin: `src/content/books/${donnees.slug}.json` });
  },

  "POST /api/auteur": async (req, res) => {
    const donnees = await corpsJson(req);
    const verdict = authorSchema.safeParse(donnees);
    if (!verdict.success) {
      return json(res, 400, {
        erreur: "validation",
        details: verdict.error.issues.map((i) => `${i.path.join(".") || "(racine)"} : ${i.message}`),
      });
    }
    ecrire(AUTEURS, donnees.slug, donnees);
    json(res, 200, { ok: true, chemin: `src/content/authors/${donnees.slug}.json` });
  },

  "POST /api/visuel": async (req, res) => {
    /*
     * L'image arrive encodée en base64 dans du JSON, plutôt qu'en
     * multipart : cela évite une dépendance de plus pour un outil qui
     * tourne en local et manipule des fichiers de quelques centaines de
     * kilo-octets.
     */
    const { nom, donneesBase64 } = await corpsJson(req);
    const ext = extname(nom).toLowerCase();
    if (!TYPES_IMAGE[ext]) {
      return json(res, 400, { erreur: "type", details: [`Extension refusée : ${ext}. Attendu : ${Object.keys(TYPES_IMAGE).join(", ")}`] });
    }
    // Le nom est reconstruit à partir du slug fourni : jamais celui du
    // fichier déposé, qui pourrait contenir des séparateurs de chemin.
    const sain = nom.replace(/[^a-z0-9._-]/gi, "-").toLowerCase();
    if (!existsSync(VISUELS)) mkdirSync(VISUELS, { recursive: true });
    const octets = Buffer.from(donneesBase64.split(",").pop(), "base64");
    writeFileSync(join(VISUELS, sain), octets);
    json(res, 200, { ok: true, chemin: `/couvertures/${sain}` });
  },

  "GET /api/qr": (req, res) =>
    json(res, 200, JSON.parse(readFileSync(TABLE_QR, "utf-8"))),

  "POST /api/qr": async (req, res) => {
    const { type = "bonus", destination, libelle, tirage } = await corpsJson(req);

    if (!destination || !libelle) {
      return json(res, 400, { erreur: "champs", details: ["Destination et libellé sont requis."] });
    }
    if (!["bonus", "livre", "avis"].includes(type)) {
      return json(res, 400, { erreur: "type", details: [`Type inconnu : ${type}`] });
    }

    /*
     * Même garde-fou que l'outil en ligne de commande : un code vers un
     * slug inexistant produit un QR qui redirige vers l'accueil, et cela
     * ne se découvre qu'après impression.
     */
    if (type === "livre" || type === "avis") {
      const slugs = fiches(LIVRES).map((l) => l.slug);
      if (!slugs.includes(destination)) {
        return json(res, 400, {
          erreur: "destination",
          details: [`Aucun livre nommé « ${destination} ».`,
                    slugs.length ? `Livres existants : ${slugs.join(", ")}` : "Crée d'abord le livre, même en brouillon."],
        });
      }
    }

    const codes = JSON.parse(readFileSync(TABLE_QR, "utf-8"));
    // Contre TOUS les codes ayant existé, actifs ou non : un code retiré
    // ne doit jamais être réattribué.
    const code = creerCodeUnique(codes.map((c) => c.code));

    const entree = { code, destination, libelle, actif: true, type };
    if (tirage) entree.tirage = tirage;
    entree.imprimeLe = new Date().toISOString().slice(0, 10);
    codes.push(entree);
    writeFileSync(TABLE_QR, JSON.stringify(codes, null, 2) + "\n", "utf-8");

    const url = urlDuCode(SITE_URL, code);
    // Vectoriel et correction « H » : un QR imprimé vit dans le monde réel.
    const svg = await QRCode.toString(url, {
      type: "svg", errorCorrectionLevel: "H", margin: 4,
      color: { dark: "#000000", light: "#ffffff" },
    });
    if (!existsSync(QR_SORTIE)) mkdirSync(QR_SORTIE, { recursive: true });
    writeFileSync(join(QR_SORTIE, `${code}.svg`), svg, "utf-8");

    json(res, 200, { ok: true, code, url, svg, fichier: `qr-a-imprimer/${code}.svg` });
  },

  "POST /api/qr/actif": async (req, res) => {
    // On ne SUPPRIME jamais une entrée : elle pourrait être réattribuée,
    // et les exemplaires déjà vendus mèneraient au mauvais livre.
    const { code, actif } = await corpsJson(req);
    const codes = JSON.parse(readFileSync(TABLE_QR, "utf-8"));
    const entree = codes.find((c) => c.code === code);
    if (!entree) return json(res, 404, { erreur: "inconnu", details: [`Code ${code} introuvable.`] });
    entree.actif = Boolean(actif);
    writeFileSync(TABLE_QR, JSON.stringify(codes, null, 2) + "\n", "utf-8");
    json(res, 200, { ok: true });
  },

  "DELETE /api/livre": async (req, res) => {
    const { slug } = await corpsJson(req);
    const f = join(LIVRES, `${slug}.json`);
    if (existsSync(f)) unlinkSync(f);
    json(res, 200, { ok: true });
  },
};

createServer(async (req, res) => {
  const chemin = req.url.split("?")[0];
  const cle = `${req.method} ${chemin}`;

  if (routes[cle]) {
    try {
      return await routes[cle](req, res);
    } catch (e) {
      return json(res, 500, { erreur: "serveur", details: [String(e.message ?? e)] });
    }
  }

  if (chemin === "/" || chemin === "/index.html") {
    const html = readFileSync(join(dirname(fileURLToPath(import.meta.url)), "index.html"), "utf-8");
    res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    return res.end(html);
  }

  // Les visuels déjà déposés, pour l'aperçu.
  if (chemin.startsWith("/couvertures/")) {
    const f = join(RACINE, "public", chemin);
    if (existsSync(f)) {
      res.writeHead(200, { "content-type": TYPES_IMAGE[extname(f).toLowerCase()] ?? "application/octet-stream" });
      return res.end(readFileSync(f));
    }
  }

  res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
  res.end("Introuvable");
})
  // 127.0.0.1 et non 0.0.0.0 : l'interface n'est joignable QUE depuis
  // cette machine. C'est ce qui rend l'absence d'authentification
  // acceptable — ne jamais changer cette adresse.
  .listen(PORT, "127.0.0.1", () => {
    console.log(`Back-office BARMAJATA — http://localhost:${PORT}`);
    console.log("Ferme avec Ctrl+C. Pense à committer ce que tu modifies.");
  });
