// A note is a Markdown document with a YAML header.
//
// The header carries the three keys every document build already understands (`title`,
// `description`, `date`) and one map of this project's attributes under `ktma`. The namespace is
// the point: a top-level `products`, `poster` or `platforms` is a name another renderer may already
// own, and a collision at the top level is how a build silently takes one tool's meaning for
// another's.
//
// Nothing here knows about Astro. `loadNotes` takes a map of path to text, so a directory read, a
// bundler's glob, or another site's build can hand it the same thing.
import { parse } from 'yaml';

const REQUIRED = ['title', 'description', 'date'];

/** Split a document into its YAML header and its body. */
export function splitDocument(path, source) {
  if (typeof source !== 'string') throw new Error(`${path} is not text`);
  if (!source.startsWith('---')) throw new Error(`${path} has no YAML header`);
  const close = source.indexOf('\n---', 3);
  if (close === -1) throw new Error(`${path} has no end to its YAML header`);
  const header = parse(source.slice(3, close));
  if (header === null || typeof header !== 'object' || Array.isArray(header)) {
    throw new Error(`${path} has a YAML header that is not a map`);
  }
  return { header, body: source.slice(close + 4).trim() };
}

function idOf(path) {
  const name = path.slice(path.lastIndexOf('/') + 1);
  if (!name.endsWith('.md')) throw new Error(`${path} is not a .md document`);
  return name.slice(0, -'.md'.length);
}

function day(value, path) {
  const date = value instanceof Date ? value.toISOString().slice(0, 10) : String(value).slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error(`${path} has a date that is not a day: ${value}`);
  return date;
}

function names(value, path, key) {
  if (value === undefined) return [];
  if (!Array.isArray(value) || value.some((name) => typeof name !== 'string' || name === '')) {
    throw new Error(`${path} has a ${key} that is not a list of names`);
  }
  return value;
}

function label(value, path, key) {
  if (value === undefined) return undefined;
  if (typeof value !== 'string' || value === '') throw new Error(`${path} has a ${key} that is not a name`);
  return value;
}

/** One document, as a note. */
export function readNote(path, source) {
  const { header, body } = splitDocument(path, source);
  for (const key of REQUIRED) {
    if (typeof header[key] !== 'string' || header[key].trim() === '') {
      throw new Error(`${path} needs a ${key}`);
    }
  }
  const ktma = header.ktma ?? {};
  if (typeof ktma !== 'object' || Array.isArray(ktma)) throw new Error(`${path} has a ktma header that is not a map`);
  if (body === '') throw new Error(`${path} has a header and no text`);
  return {
    id: idOf(path),
    title: header.title,
    date: day(header.date, path),
    summary: header.description,
    platforms: names(ktma.platforms, path, 'ktma.platforms'),
    products: names(ktma.products, path, 'ktma.products'),
    poster: label(ktma.poster, path, 'ktma.poster'),
    posterAlt: label(ktma.posterAlt, path, 'ktma.posterAlt'),
    demonstration: label(ktma.demonstration, path, 'ktma.demonstration'),
    body,
  };
}

/** Every document in a set, newest first, with one note per name. */
export function loadNotes(sources) {
  if (sources === null || typeof sources !== 'object') throw new Error('notes were not given as a map of path to text');
  const notes = Object.entries(sources).map(([path, source]) => readNote(path, source));
  const seen = new Set();
  for (const note of notes) {
    if (seen.has(note.id)) throw new Error(`two notes are named ${note.id}`);
    seen.add(note.id);
  }
  return notes.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : a.id.localeCompare(b.id)));
}
