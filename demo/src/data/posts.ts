// The notes, as this site reads them.
//
// The reading itself is the package under packages/astro-notes, so the same documents can be read
// by another build. This file is the adapter: a glob for the sources, and the site's platform
// vocabulary applied to what the package returns.
import { loadNotes } from '../../../packages/astro-notes/index.mjs';
import type { Platform } from './taxonomy';

export interface Note {
  /** The address: `/notes/<id>`, taken from the file name. */
  id: string;
  title: string;
  date: string;
  summary: string;
  platforms: Platform[];
  products: string[];
  poster?: string;
  posterAlt?: string;
  /** The demonstration the note is about, where there is one. */
  demonstration?: string;
  /** The document, as Markdown, with the header removed. */
  body: string;
}

const sources = import.meta.glob('../posts/*.md', {
  eager: true,
  query: '?raw',
  import: 'default',
}) as Record<string, string>;

export const notes: Note[] = loadNotes(sources).map((note) => ({
  ...note,
  platforms: note.platforms as Platform[],
}));
