import fs from "node:fs";
import path from "node:path";
import { z } from "zod";
import {
  authorSchema,
  bookSchema,
  hasVisibleEdition,
  qrCodeSchema,
  type Author,
  type Book,
  type QrCode,
} from "./schema";

// Contenu de démonstration (src/content/_demo/) : chargé uniquement quand
// NEXT_PUBLIC_DEMO_CONTENT=true (fixé au build, comme toute variable
// NEXT_PUBLIC_*). Absent/false → dossiers _demo/ jamais lus, comportement
// strictement identique à avant. À ne jamais activer sur Vercel en
// production — voir CLAUDE.md.
const DEMO_CONTENT_ENABLED = process.env.NEXT_PUBLIC_DEMO_CONTENT === "true";

const BOOKS_DIRS = [
  path.join(process.cwd(), "src/content/books"),
  ...(DEMO_CONTENT_ENABLED ? [path.join(process.cwd(), "src/content/_demo/books")] : []),
];
const AUTHORS_DIRS = [
  path.join(process.cwd(), "src/content/authors"),
  ...(DEMO_CONTENT_ENABLED ? [path.join(process.cwd(), "src/content/_demo/authors")] : []),
];

function readContentFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((file) => file.endsWith(".json") && !file.startsWith("_"));
}

function loadAllFromDirs<T>(dirs: string[], schema: z.ZodType<T>, kind: string): T[] {
  return dirs.flatMap((dir) =>
    readContentFiles(dir).map((file) => loadEntry(dir, file, schema, kind)),
  );
}

function loadEntry<T>(dir: string, file: string, schema: z.ZodType<T>, kind: string): T {
  const raw = fs.readFileSync(path.join(dir, file), "utf-8");

  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch (cause) {
    throw new Error(`Fichier ${kind} invalide (JSON illisible) : ${file}`, { cause });
  }

  const result = schema.safeParse(json);
  if (!result.success) {
    const details = result.error.issues
      .map((issue) => `- ${issue.path.join(".") || "(racine)"}: ${issue.message}`)
      .join("\n");
    throw new Error(`Fichier ${kind} invalide : ${file}\n${details}`);
  }

  return result.data;
}

/** Tous les auteurs du dossier de contenu, triés par slug. */
export function getAllAuthors(): Author[] {
  return loadAllFromDirs(AUTHORS_DIRS, authorSchema, "auteur").sort((a, b) =>
    a.slug.localeCompare(b.slug),
  );
}

export function getAuthorBySlug(slug: string): Author | undefined {
  return getAllAuthors().find((author) => author.slug === slug);
}

/** Date la plus récente parmi les éditions visibles d'un livre, pour le tri. */
function latestDate(book: Book): string | undefined {
  const dates = book.editions
    .filter((edition) => edition.dateParution)
    .map((edition) => edition.dateParution as string);
  if (dates.length === 0) return undefined;
  return dates.reduce((latest, date) => (date > latest ? date : latest));
}

function compareBooks(a: Book, b: Book): number {
  const dateA = latestDate(a);
  const dateB = latestDate(b);
  if (dateA && dateB) return dateB.localeCompare(dateA);
  if (dateA) return -1;
  if (dateB) return 1;
  return a.slug.localeCompare(b.slug);
}

/** Tous les livres du dossier de contenu, éditions "brouillon" incluses, triés. */
export function getAllBooks(): Book[] {
  const authors = getAllAuthors();
  const books = loadAllFromDirs(BOOKS_DIRS, bookSchema, "livre");

  for (const book of books) {
    if (hasVisibleEdition(book) && !authors.some((author) => author.slug === book.auteurSlug)) {
      throw new Error(
        `Livre "${book.slug}" référence un auteur introuvable : "${book.auteurSlug}".`,
      );
    }
  }

  return books.sort(compareBooks);
}

export type BookFilter = {
  auteurSlug?: string;
};

/** Livres ayant au moins une édition publiquement affichable. */
export function getVisibleBooks(filter: BookFilter = {}): Book[] {
  return getAllBooks().filter((book) => {
    if (!hasVisibleEdition(book)) return false;
    if (filter.auteurSlug && book.auteurSlug !== filter.auteurSlug) return false;
    return true;
  });
}

/** Un livre, uniquement s'il a au moins une édition visible (jamais un livre 100% brouillon). */
export function getVisibleBookBySlug(slug: string): Book | undefined {
  return getAllBooks().find((book) => book.slug === slug && hasVisibleEdition(book));
}

/**
 * Un livre, **visible ou non**. À n'utiliser que là où l'existence du
 * slug importe indépendamment de sa visibilité — c'est le cas du
 * redirecteur de QR codes, qui doit distinguer un ouvrage encore en
 * brouillon (« masqué », donc on propose d'être prévenu) d'un slug qui
 * n'existe pas du tout (« absent », donc accueil).
 *
 * **Ne jamais s'en servir pour afficher une page** : un brouillon doit
 * rester invisible partout, y compris par URL directe. Pour cela,
 * `getVisibleBookBySlug()`.
 */
export function getBookBySlug(slug: string): Book | undefined {
  return getAllBooks().find((book) => book.slug === slug);
}

/** Livres publiquement affichables d'un auteur donné. */
export function getBooksByAuthor(auteurSlug: string): Book[] {
  return getVisibleBooks({ auteurSlug });
}

/**
 * Livre précédent/suivant partageant au moins une catégorie avec `book`,
 * dans l'ordre du catalogue (compareBooks). Sans catégorie sur `book`,
 * aucun voisin n'est retourné (rien de pertinent à comparer).
 */
export function getAdjacentBooks(book: Book): { previous?: Book; next?: Book } {
  if (!book.categories?.length) return {};

  const siblings = getVisibleBooks().filter(
    (candidate) =>
      candidate.slug !== book.slug &&
      candidate.categories?.some((category) => book.categories?.includes(category)),
  );
  const ordered = [...siblings, book].sort(compareBooks);
  const index = ordered.findIndex((candidate) => candidate.slug === book.slug);

  return {
    previous: index > 0 ? ordered[index - 1] : undefined,
    next: index < ordered.length - 1 ? ordered[index + 1] : undefined,
  };
}

const QR_CODES_FILE = path.join(process.cwd(), "src/content/qr/codes.json");

/** Tous les codes QR déclarés (src/content/qr/codes.json), actifs ou non. */
export function getAllQrCodes(): QrCode[] {
  if (!fs.existsSync(QR_CODES_FILE)) return [];

  const raw = fs.readFileSync(QR_CODES_FILE, "utf-8");
  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch (cause) {
    throw new Error("Fichier codes QR invalide (JSON illisible) : src/content/qr/codes.json", {
      cause,
    });
  }

  const result = z.array(qrCodeSchema).safeParse(json);
  if (!result.success) {
    const details = result.error.issues
      .map((issue) => `- ${issue.path.join(".") || "(racine)"}: ${issue.message}`)
      .join("\n");
    throw new Error(`Fichier codes QR invalide : src/content/qr/codes.json\n${details}`);
  }

  return result.data;
}

export function getQrCodeByCode(code: string): QrCode | undefined {
  return getAllQrCodes().find((entry) => entry.code === code);
}
