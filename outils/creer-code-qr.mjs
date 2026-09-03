#!/usr/bin/env node
/**
 * Crée un QR code : un identifiant opaque, son entrée dans la table, et
 * le visuel VECTORIEL à envoyer à l'imprimeur.
 *
 *   node outils/creer-code-qr.mjs --type livre --destination mon-livre \
 *        --libelle "Fiche du livre" --tirage "1er tirage, 500 ex."
 *
 * Options : --type bonus|livre|avis (défaut bonus) · --destination (requis)
 *           --libelle (requis) · --tirage · --note · --actif false
 *
 * CE QUE CET OUTIL NE FAIT PAS, ET POURQUOI
 *
 * Il n'imprime rien et ne décide de rien. Il écrit une entrée dans
 * src/content/qr/codes.json et un SVG dans qr-a-imprimer/. Le fichier de
 * codes se relit et se commite comme n'importe quel contenu.
 *
 * L'URL encodée est TOUJOURS https://<site>/b/<code>, jamais l'adresse
 * finale : c'est ce qui permet de rediriger un QR déjà imprimé. Voir
 * src/lib/content/qr.ts.
 */
import { readFileSync, readdirSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import QRCode from "qrcode";
import { creerCodeUnique, urlDuCode, codeValide } from "../src/lib/content/qr-codes.ts";

const RACINE = join(dirname(fileURLToPath(import.meta.url)), "..");
const TABLE = join(RACINE, "src/content/qr/codes.json");
const SORTIE = join(RACINE, "qr-a-imprimer");
const SITE_URL = "https://www.barmajata.com";

function argument(nom, defaut) {
  const i = process.argv.indexOf(`--${nom}`);
  return i !== -1 && process.argv[i + 1] ? process.argv[i + 1] : defaut;
}

const type = argument("type", "bonus");
const destination = argument("destination");
const libelle = argument("libelle");
const tirage = argument("tirage");
const note = argument("note");
const actif = argument("actif", "true") !== "false";

if (!destination || !libelle) {
  console.error("✗ --destination et --libelle sont requis.");
  console.error("  node outils/creer-code-qr.mjs --type livre --destination mon-livre --libelle \"Fiche\"");
  process.exit(1);
}
if (!["bonus", "livre", "avis"].includes(type)) {
  console.error(`✗ Type inconnu : ${type}. Attendu : bonus, livre ou avis.`);
  process.exit(1);
}

/*
 * Pour un code qui vise un livre, on vérifie que le slug existe VRAIMENT.
 *
 * Sans ce contrôle, une faute de frappe produit un QR qui redirige vers
 * l'accueil — silencieusement, et découvert seulement après impression.
 * On avertit sans bloquer : le livre peut légitimement être encore en
 * brouillon, ce qui est même le cas normal, puisqu'un code s'attribue dès
 * la création de la fiche.
 */
if (type === "livre" || type === "avis") {
  const dossiers = [
    join(RACINE, "src/content/books"),
    join(RACINE, "src/content/_demo/books"),
  ].filter(existsSync);
  const slugs = dossiers.flatMap((d) =>
    readdirSync(d)
      .filter((f) => f.endsWith(".json") && !f.startsWith("_"))
      .map((f) => f.replace(/\.json$/, "")),
  );
  if (!slugs.includes(destination)) {
    console.error(`✗ Aucun livre nommé « ${destination} » dans src/content/books/.`);
    console.error("  Un QR vers un slug inexistant redirige vers l'accueil — et");
    console.error("  cela ne se découvre qu'après impression.");
    console.error("");
    console.error("  Crée d'abord la fiche du livre, même en brouillon :");
    console.error("    cp src/content/books/_template.json src/content/books/" + destination + ".json");
    console.error("");
    if (slugs.length) console.error("  Livres existants : " + slugs.join(", "));
    process.exit(1);
  }
}

const codes = JSON.parse(readFileSync(TABLE, "utf-8"));

// Tous les codes ayant EXISTÉ, actifs ou non : un code retiré ne doit
// jamais être réattribué, des exemplaires le portent à vie.
const code = creerCodeUnique(codes.map((c) => c.code));
if (!codeValide(code)) {
  console.error("✗ Code produit invalide — anomalie, rien n'a été écrit.");
  process.exit(1);
}

const entree = { code, destination, libelle, actif, type };
if (tirage) entree.tirage = tirage;
if (note) entree.note = note;
entree.imprimeLe = new Date().toISOString().slice(0, 10);

codes.push(entree);
writeFileSync(TABLE, JSON.stringify(codes, null, 2) + "\n", "utf-8");

const url = urlDuCode(SITE_URL, code);
if (!existsSync(SORTIE)) mkdirSync(SORTIE, { recursive: true });
const fichier = join(SORTIE, `${code}.svg`);

/*
 * Vectoriel, et correction d'erreur HAUTE.
 *
 * Vectoriel parce qu'une image matricielle se dégrade à l'impression et
 * qu'on ignore la taille finale. Correction « H » parce qu'un QR imprimé
 * vit dans le monde réel : encre qui bave, pliure, vernis, doigts. Elle
 * tolère environ 30 % du symbole abîmé.
 *
 * `margin: 4` est la zone de silence exigée par la norme. La réduire fait
 * échouer des lecteurs — ne pas y toucher pour gagner de la place.
 */
const svg = await QRCode.toString(url, {
  type: "svg",
  errorCorrectionLevel: "H",
  margin: 4,
  color: { dark: "#000000", light: "#ffffff" },
});
writeFileSync(fichier, svg, "utf-8");

console.log(`✓ Code créé : ${code}`);
console.log(`  URL encodée : ${url}`);
console.log(`  Entrée ajoutée dans src/content/qr/codes.json`);
console.log(`  Visuel : ${fichier}`);
console.log("");
console.log("  À FAIRE AVANT LE TIRAGE : scanner le QR sur l'ÉPREUVE IMPRIMÉE.");
console.log("  Un code validé à l'écran et raté au vernis se découvre sur tout le tirage.");
