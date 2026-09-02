import { z } from "zod";

/**
 * Statuts possibles d'une édition. Le statut conditionne entièrement
 * l'affichage : "brouillon" est invisible (catalogue, fiche, sitemap),
 * les deux autres sont visibles avec un appel à l'action différent.
 * Porté par l'édition (et non par le livre) : un même livre peut être
 * publié en français et à paraître en anglais.
 */
export const CONTENT_STATUSES = ["brouillon", "a_paraitre", "publie"] as const;
export type ContentStatus = (typeof CONTENT_STATUSES)[number];

/** Statuts affichables publiquement (tout sauf "brouillon"). */
export const VISIBLE_STATUSES = ["a_paraitre", "publie"] as const;
export type VisibleStatus = (typeof VISIBLE_STATUSES)[number];

/** Langues du site, dupliqué volontairement pour ne pas coupler ce module
 * de contenu à `src/i18n/routing.ts` (mêmes valeurs que `routing.locales`). */
export const CONTENT_LOCALES = ["fr", "en", "es"] as const;
export type ContentLocale = (typeof CONTENT_LOCALES)[number];

export const BOOK_FORMAT_TYPES = ["broche", "epub", "pdf"] as const;
export type BookFormatType = (typeof BOOK_FORMAT_TYPES)[number];

/**
 * Genres figés. Distinct du champ `formats[].type` (broché/epub/
 * pdf, le format physique/numérique) : la catégorie ne touche jamais à
 * ce champ. Slugs canoniques utilisés dans les fichiers de contenu — la
 * traduction par locale (URL du filtre `?categorie=`) vit dans
 * `src/lib/content/categories.ts`.
 */
export const BOOK_CATEGORIES = [
  "famille",
  "psychologie",
  "thriller",
  "histoire-vraie",
  "enfance",
  "developpement-personnel",
  "poesie-pensees",
] as const;
export type BookCategory = (typeof BOOK_CATEGORIES)[number];

const slugSchema = z
  .string()
  .min(1)
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "Le slug doit être en kebab-case (minuscules, chiffres, tirets).",
  );

const isoDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "La date doit être au format ISO 8601 (AAAA-MM-JJ).");

const isbnSchema = z
  .string()
  .transform((value) => value.replace(/[-\s]/g, ""))
  .pipe(
    z.string().regex(/^(?:\d{9}[\dX]|\d{13})$/, "ISBN invalide (10 ou 13 caractères)."),
  );

const asinSchema = z
  .string()
  .regex(/^[A-Z0-9]{10}$/, "ASIN invalide (10 caractères alphanumériques majuscules).");

const urlSchema = z.url();

const formatSchema = z.object({
  type: z.enum(BOOK_FORMAT_TYPES),
  isbn: isbnSchema.optional(),
  // Identifiant produit Amazon, utilisé par buildAmazonUrl() (voir
  // src/lib/amazon/marketplaces.ts) pour générer le lien de la
  // marketplace choisie. Le prix Amazon réel reste hors de notre
  // contrôle (voir prixIndicatif ci-dessous).
  asin: asinSchema.optional(),
  pages: z.number().int().positive().optional(),
  // Toujours indicatif : jamais affiché comme un prix ferme (voir
  // getMinPrice() plus bas, et la mention "À partir de" sur les pages).
  prixIndicatif: z.number().positive(),
  // Échappatoire pour un lien de vente qui ne correspond pas au schéma
  // https://www.amazon.{domaine}/dp/{asin} (ex. marketplace non couverte
  // par la table, lien de campagne). Prioritaire sur `asin` s'il est présent.
  urlOverride: urlSchema.optional(),
});
export type BookFormatEntry = z.infer<typeof formatSchema>;

const editionSchema = z
  .object({
    langue: z.enum(CONTENT_LOCALES),
    titre: z.string().min(1),
    sousTitre: z.string().optional(),
    resumeCourt: z.string().min(1),
    resumeLong: z.string().min(1),
    extrait: z.string().optional(),
    statut: z.enum(CONTENT_STATUSES),
    dateParution: isoDateSchema.optional(),
    formats: z.array(formatSchema).optional(),
    // Textures du livre en volume (BookSolid, fiche livre) — distinctes de
    // `couverture` (niveau livre, vignette 2D plate du catalogue/de la
    // fiche). Optionnelles : sans elles, aplats colorés (voir BookSolid.tsx).
    couvertureImage: z.string().min(1).optional(),
    quatriemeImage: z.string().min(1).optional(),
    dosImage: z.string().min(1).optional(),
    // Épaisseur en mm. Si absente, dérivée du format broché :
    // pages × 0.07 (voir getEpaisseurMm()).
    epaisseurMm: z.number().positive().optional(),
  })
  .superRefine((edition, ctx) => {
    if (edition.statut === "publie") {
      const hasSellableFormat = edition.formats?.some(
        (format) => format.asin || format.urlOverride,
      );
      if (!hasSellableFormat) {
        ctx.addIssue({
          code: "custom",
          path: ["formats"],
          message:
            'Au moins un format avec asin (ou urlOverride) est requis quand statut vaut "publie".',
        });
      }
    }

    if (edition.statut === "a_paraitre" && !edition.dateParution) {
      ctx.addIssue({
        code: "custom",
        path: ["dateParution"],
        message: 'dateParution est requis quand statut vaut "a_paraitre".',
      });
    }
  });
export type Edition = z.infer<typeof editionSchema>;

const seoOverrideSchema = z.object({
  titre: z.string().optional(),
  description: z.string().optional(),
});

export const bookSchema = z
  .object({
    // Identifiant unique, indépendant des éditions.
    slug: slugSchema,
    auteurSlug: slugSchema,
    couverture: z.string().min(1).optional(),
    // Un livre peut porter plusieurs genres. Optionnel : un livre sans
    // catégorie n'apparaît simplement dans aucun filtre par genre.
    categories: z.array(z.enum(BOOK_CATEGORIES)).min(1).optional(),
    // Surcharges SEO optionnelles, une entrée par langue présente dans
    // `editions` (pas forcément les 3 locales du site).
    seo: z.record(z.enum(CONTENT_LOCALES), seoOverrideSchema).optional(),
    editions: z.array(editionSchema).min(1),
  })
  .superRefine((book, ctx) => {
    const seen = new Set<string>();
    book.editions.forEach((edition, index) => {
      if (seen.has(edition.langue)) {
        ctx.addIssue({
          code: "custom",
          path: ["editions", index, "langue"],
          message: `Langue en double dans editions[] : "${edition.langue}".`,
        });
      }
      seen.add(edition.langue);
    });
  });
export type Book = z.infer<typeof bookSchema>;

export function isVisibleStatus(statut: ContentStatus): statut is VisibleStatus {
  return (VISIBLE_STATUSES as readonly ContentStatus[]).includes(statut);
}

export function hasVisibleEdition(book: Book): boolean {
  return book.editions.some((edition) => isVisibleStatus(edition.statut));
}

/**
 * Résout l'édition à afficher pour une locale donnée : celle de la locale
 * active si elle existe et est visible, sinon la première édition visible
 * du tableau (édition "d'origine") — jamais un brouillon.
 */
export function resolveEdition(book: Book, locale: ContentLocale): Edition | undefined {
  const forLocale = book.editions.find(
    (edition) => edition.langue === locale && isVisibleStatus(edition.statut),
  );
  if (forLocale) return forLocale;

  return book.editions.find((edition) => isVisibleStatus(edition.statut));
}

export function getMinPrice(edition: Edition): number | undefined {
  if (!edition.formats?.length) return undefined;
  return Math.min(...edition.formats.map((format) => format.prixIndicatif));
}

const MM_PER_PAGE = 0.07;

/** Épaisseur en mm : explicite si fournie, sinon dérivée des pages du
 * format broché (pages × 0.07). undefined si aucune des deux n'existe —
 * BookSolid retombe alors sur une épaisseur par défaut. */
export function getEpaisseurMm(edition: Edition): number | undefined {
  if (edition.epaisseurMm) return edition.epaisseurMm;
  const pages = edition.formats?.find((format) => format.type === "broche")?.pages;
  return pages ? pages * MM_PER_PAGE : undefined;
}

const NEW_RELEASE_MONTHS = 12;

/** "Nouveautés" est un filtre calculé, jamais stocké : publié et paru
 * dans les NEW_RELEASE_MONTHS derniers mois (jamais dans le futur). */
export function isNewRelease(edition: Edition, referenceDate: Date = new Date()): boolean {
  if (edition.statut !== "publie" || !edition.dateParution) return false;
  const parution = new Date(edition.dateParution);
  if (Number.isNaN(parution.getTime()) || parution > referenceDate) return false;
  const cutoff = new Date(referenceDate);
  cutoff.setMonth(cutoff.getMonth() - NEW_RELEASE_MONTHS);
  return parution >= cutoff;
}

const authorLinkSchema = z.object({
  label: z.string().min(1),
  url: urlSchema,
});
export type AuthorLink = z.infer<typeof authorLinkSchema>;

export const authorSchema = z.object({
  slug: slugSchema,
  nom: z.string().min(1),
  // Dérivées de CONTENT_LOCALES plutôt qu'énumérées à la main : au Lot
  // H46, la liste écrite en dur ici était le seul endroit du schéma
  // resté sur l'arabe après le changement de locales.
  bioCourte: z.object(Object.fromEntries(CONTENT_LOCALES.map((l) => [l, z.string()])) as Record<ContentLocale, z.ZodString>),
  bioLongue: z.object(Object.fromEntries(CONTENT_LOCALES.map((l) => [l, z.string()])) as Record<ContentLocale, z.ZodString>),
  portrait: z.string().min(1).optional(),
  liens: z.array(authorLinkSchema).optional(),
});
export type Author = z.infer<typeof authorSchema>;

/** Entrée de src/content/qr/codes.json — un QR code physique (livre, carte,
 * etc.) redirigeant /b/[code] vers /bonus/[destination]. */
/** Où mène un QR code physique. "bonus" (défaut) ouvre la page de contenu
 *  déverrouillé ; "livre" mène à la fiche du livre, donc à son bloc d'avis
 *  — c'est le cas d'usage « QR imprimé dans l'ouvrage ». */
export const QR_DESTINATION_TYPES = ["bonus", "livre"] as const;
export type QrDestinationType = (typeof QR_DESTINATION_TYPES)[number];

export const qrCodeSchema = z.object({
  code: z.string().min(1),
  destination: z.string().min(1),
  libelle: z.string().min(1),
  actif: z.boolean(),
  // Absent = "bonus", pour que les entrées existantes restent valides.
  type: z.enum(QR_DESTINATION_TYPES).optional(),
});
export type QrCode = z.infer<typeof qrCodeSchema>;
