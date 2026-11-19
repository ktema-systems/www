// The shapes `index.mjs` returns. Kept beside it so a TypeScript site can import the package
// without a declaration of its own.

export interface Note {
  /** The address: the file name without its extension. */
  id: string;
  title: string;
  /** The day the document is dated, as `YYYY-MM-DD`. */
  date: string;
  /** The `description`, which the list and the previews read. */
  summary: string;
  /** `ktma.platforms`. */
  platforms: string[];
  /** `ktma.products`. */
  products: string[];
  /** `ktma.poster`. */
  poster?: string;
  /** `ktma.posterAlt`. */
  posterAlt?: string;
  /** `ktma.demonstration`: where the note's subject is demonstrated. */
  demonstration?: string;
  /** The document, with the header removed. */
  body: string;
}

export function splitDocument(path: string, source: string): { header: Record<string, unknown>; body: string };
export function readNote(path: string, source: string): Note;
export function loadNotes(sources: Record<string, string>): Note[];
