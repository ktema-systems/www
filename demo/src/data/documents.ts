// The documents the center renders, as the site needs to read them.
//
// Astro parses each file; this file decides what a page may do with it. A document is repaired where the repair is
// obvious (a missing title is the file name, a missing description is the first line of the body, a platform outside
// the vocabulary is dropped) and left out where it is not, and every one of those decisions is printed with the
// document's path. A build never stops for a document: a page that cannot be drawn is a page that is not drawn.
import { warn } from './warn';
import { PLATFORMS } from './taxonomy';

/** What this project adds to a document. */
export interface Ktma {
  kind?: string;
  products?: unknown;
  platforms?: unknown;
  claim?: unknown;
  evidence?: unknown;
  source?: unknown;
  poster?: unknown;
  posterAlt?: unknown;
  status?: unknown;
  data?: unknown;
  facts?: unknown;
  recordings?: unknown;
  demonstration?: unknown;
  command?: unknown;
  href?: unknown;
  video?: unknown;
  /** Where the grid draws the artifact, lowest first. A document without one follows the ones that have it. */
  order?: unknown;
  /** The category the page belongs to, where no kind decides it. */
  category?: unknown;
  /** The address the entry opens, when it is a page that already exists rather than one the center draws. */
  page?: unknown;
  /** The claim it belongs to, in the register. */
  line?: unknown;
}

/** A document, with the header normalised and the body as Markdown. */
export interface Document {
  id: string;
  /** The file, for a message a person can act on. */
  path: string;
  title: string;
  description: string;
  date?: string;
  ktma: Ktma;
  body: string;
}

/** One document as a build hands it over: the name, the file, the parsed header, the body. No framework. */
export interface SourceEntry {
  id: string;
  /** The file, as the build names it. */
  path?: string;
  data?: unknown;
  body?: string;
}

type Entry = SourceEntry;

export const isText = (value: unknown): value is string => typeof value === 'string' && value.trim() !== '';

/** The file, as a person at the root of the repository reads it. */
function pathOf(entry: Entry): string {
  return entry.path ?? `demo/src/posts/${entry.id}.md`;
}

/** A document that is not drawn says so, with the file and the reason, and the build carries on. */
function discard(entry: Entry, reason: string): undefined {
  warn(`[documents] ${pathOf(entry)}: ${reason}; the page is not drawn`);
  return undefined;
}

function repair(entry: Entry, message: string): void {
  warn(`[documents] ${pathOf(entry)}: ${message}`);
}

/** A title from the file name: `one-node-any-scale` becomes `One node any scale`. */
function titleFromId(id: string): string {
  const words = id.split('/').pop()!.replace(/[-_]+/g, ' ');
  return words.charAt(0).toUpperCase() + words.slice(1);
}

/** The first line of the body that carries prose, for a document that states no description. */
function firstLine(body: string): string {
  const line = body
    .split('\n')
    .map((candidate) => candidate.trim())
    .find((candidate) => candidate !== '' && !candidate.startsWith('#') && !candidate.startsWith('<'));
  return line ?? '';
}

export function text(value: unknown): string | undefined {
  return isText(value) ? value.trim() : undefined;
}

export function strings(value: unknown): string[] {
  return Array.isArray(value) ? value.filter(isText) : [];
}

/** The platform tags a document carries, with the ones outside the vocabulary dropped and named. */
function platformsOf(entry: Entry, value: unknown): string[] {
  const known = new Set(Object.keys(PLATFORMS));
  const names = strings(value);
  for (const name of names) {
    if (!known.has(name)) repair(entry, `platform "${name}" is not one the center knows; dropped`);
  }
  return names.filter((name) => known.has(name));
}

function dateOf(entry: Entry, value: unknown, note: boolean): string | undefined {
  if (value === undefined || value === null || value === '') {
    if (note) repair(entry, 'a note is dated; the date is left out');
    return undefined;
  }
  const date = value instanceof Date ? value : new Date(String(value));
  if (Number.isNaN(date.getTime())) {
    repair(entry, `date "${String(value)}" is not a day; left out`);
    return undefined;
  }
  return date.toISOString().slice(0, 10);
}

function read(entry: Entry): Document | undefined {
  const data = (entry.data ?? {}) as Record<string, unknown>;
  const ktma = (data.ktma ?? {}) as Ktma;
  const body = entry.body ?? '';
  const note = ktma.demonstration !== undefined;

  if (!isText(data.title)) {
    if (body === '' && !isText(data.description)) {
      return discard(entry, 'no title and nothing to read it from');
    }
    repair(entry, 'no title; the file name is used');
  }
  if (!isText(data.description)) {
    const line = firstLine(body);
    if (line === '') return discard(entry, 'no description and no prose in the body');
    repair(entry, 'no description; the first line of the body is used');
  }

  return {
    id: entry.id,
    path: pathOf(entry),
    title: text(data.title) ?? titleFromId(entry.id),
    description: text(data.description) ?? firstLine(body),
    date: dateOf(entry, data.date, note),
    ktma: { ...ktma, platforms: platformsOf(entry, ktma.platforms), products: strings(ktma.products) },
    body,
  };
}

/** Every document in a set, repaired or left out, with the reason printed for each. */
export function readDocuments(entries: SourceEntry[]): Document[] {
  const documents: Document[] = [];
  for (const entry of entries) {
    const document = read(entry);
    if (document) documents.push(document);
  }
  return documents;
}

/** The documents a page draws: everything but a run's. */
export function pageDocuments(documents: Document[]): Document[] {
  return documents.filter((document) => !document.id.startsWith('runs/'));
}

/** The run documents, whose name is the address `/runs/<name>`. */
export function runDocuments(documents: Document[]): Document[] {
  return documents.filter((document) => document.id.startsWith('runs/'));
}

export function runName(id: string): string {
  return id.replace(/^runs\//, '');
}
