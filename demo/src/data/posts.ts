// The notes, as this site reads them.
//
// A note is a document about a demonstration. It is one of the documents every page is drawn from, so it is read the
// same way and differs only in declaring the demonstration it belongs to. A note without a date is still a note; the
// date is left off the page and the missing date is printed where the document was read.
import { pageDocuments, text, type Document } from './documents';
import { warn } from './warn';
import type { Platform } from './taxonomy';

export interface Note {
  /** The address: `/notes/<id>`, taken from the file name. */
  id: string;
  title: string;
  /** The day the note is dated, where it states one. */
  date?: string;
  summary: string;
  platforms: Platform[];
  products: string[];
  poster?: string;
  posterAlt?: string;
  /** The demonstration the note is about. */
  demonstration?: string;
  /** The document, as Markdown, with the header removed. */
  body: string;
}

function noteOf(document: Document): Note {
  return {
    id: document.id,
    title: document.title,
    date: document.date,
    summary: document.description,
    platforms: document.ktma.platforms as Platform[],
    products: document.ktma.products as string[],
    poster: text(document.ktma.poster),
    posterAlt: text(document.ktma.posterAlt),
    demonstration: text(document.ktma.demonstration),
    body: document.body,
  };
}

/**
 * The notes, newest first. A note is linked from the demonstration it names, and one demonstration links one note: the
 * newest. The rest keep their addresses and are named here, so a second note for the same run is visible in the build.
 */
export function buildNotes(documents: Document[]): Note[] {
  const notes = pageDocuments(documents)
    .filter((document) => document.ktma.demonstration !== undefined)
    .map(noteOf)
    .sort((a, b) => {
      if ((a.date ?? '') !== (b.date ?? '')) return (a.date ?? '') < (b.date ?? '') ? 1 : -1;
      return a.id.localeCompare(b.id);
    });

  const linked = new Map<string, Note>();
  for (const note of notes) {
    if (!note.demonstration) continue;
    const previous = linked.get(note.demonstration);
    if (previous) {
      warn(
        `[notes] ${note.id} and ${previous.id} both name ${note.demonstration}; the demonstration links ${note.id} and ${previous.id} keeps its own address`,
      );
    }
    linked.set(note.demonstration, note);
  }
  return notes;
}

/** The note a demonstration links: the newest one that names it. */
export function noteFor(notes: Note[], demonstration: string): Note | undefined {
  return notes.find((note) => note.demonstration === demonstration);
}
