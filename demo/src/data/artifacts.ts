// What the center shows.
//
// An artifact is one document under `demo/src/posts`, and this file is the adapter: it places the documents in the
// order the grid draws them and hands each page the shape it renders. Nothing here carries prose, which is what lets
// a hardware run, an FPGA board and a cockpit stand beside each other: each is a header, a body, and a name.
//
// A demonstration that is specified and not yet recorded is a separate list rather than an entry with an empty
// address, because an entry with no address would still be a page.

import { warn } from './warn';
import { isText, pageDocuments, runDocuments, runName, strings, text, type Document } from './documents';
import { KINDS, type ArtifactKind } from './kinds';
import type { Platform } from './taxonomy';

/** Re-exported for the page that maps each kind to the component that draws it. */
export type { ArtifactKind } from './kinds';

/** A recorded run of the engine: a page of its own, a still, and the video its page plays with native controls. */
export interface Recording {
  /** The run's address: `/runs/<id>`. */
  id: string;
  label: string;
  detail: string;
  /** The prose its page carries. Paragraphs are separated by a blank line. */
  body: string;
  /** The command that produced the recording. */
  command: string;
  /** Where the recording can be replayed. */
  href: string;
  poster: string;
  posterAlt: string;
  /** The recording as a video, so a reader can pause it, resume it, and scrub through the run. */
  video: string;
}

export interface ArtifactFact {
  label: string;
  value: string;
}

export interface Artifact {
  /** What the address names: `/runs` is this artifact's page. */
  id: string;
  /** What the surface is, rather than which product it belongs to. */
  title: string;
  /** What the surface belongs to, drawn as small tags. A cockpit runs over every stack, so it can carry more than one. */
  products: string[];
  /** Where the claim is checked, drawn as the second tag row. A demonstration that spans two environments carries two. */
  platforms: Platform[];
  /** The one sentence the surface proves, in the words its page uses. */
  claim: string;
  /** What a reader runs or opens to check the claim. */
  evidence?: string;
  kind: ArtifactKind;
  /** What a reader learns before opening it, in one or two sentences. */
  summary: string;
  /** A live application's address, a video's file, a document's page, a run inside a set, or the source a device run names. */
  source: string;
  /** What the surface is, where the artifact says so: read-only, recorded, simulated. */
  status?: string;
  /** Where the records in it came from, when that is not a real system. */
  data?: string;
  /** The still a reader sees before opening it. */
  poster?: string;
  /** What the still shows, for a reader who cannot see it. */
  posterAlt?: string;
  /** The claim it belongs to, in the register. */
  line?: string;
  /** Where the page stands in the grid: the document's `ktma.order`. */
  order: number;
  /** For a `runs` artifact: the runs it lists. */
  recordings?: Recording[];
  /** The long form of a page, as Markdown, where a summary is not enough. */
  body?: string;
  /** The numbers the page states, in the order it states them. */
  facts?: ArtifactFact[];
}

const isKind = (value: unknown): value is ArtifactKind => KINDS.includes(value as ArtifactKind);

/** Where the grid draws the artifact: `ktma.order`, lowest first, and the ones that state none after them. */
function orderOf(document: Document): number {
  const value = document.ktma.order;
  return typeof value === 'number' && Number.isFinite(value) ? value : Number.POSITIVE_INFINITY;
}

/** A page that cannot be drawn says so, with its path, and the grid carries the rest. */
function skip(document: Document, reason: string): undefined {
  warn(`[artifacts] ${document.path}: ${reason}; the page is not drawn`);
  return undefined;
}

function recordingOf(document: Document): Recording | undefined {
  const run = document.ktma;
  for (const key of ['command', 'href', 'poster', 'posterAlt', 'video'] as const) {
    if (!isText(run[key])) {
      warn(`[runs] ${document.path}: ktma.${key} is missing; the run is not drawn`);
      return undefined;
    }
  }
  return {
    id: runName(document.id),
    label: document.title,
    detail: document.description,
    body: document.body,
    command: run.command as string,
    href: run.href as string,
    poster: run.poster as string,
    posterAlt: run.posterAlt as string,
    video: run.video as string,
  };
}

function artifactOf(document: Document, runs: Map<string, Document>, liveSource?: string): Artifact | undefined {
  const artifact = document.ktma;
  if (!isKind(artifact.kind)) {
    return skip(
      document,
      `ktma.kind "${String(artifact.kind)}" is not one the center draws (${KINDS.join(', ')})`,
    );
  }
  const claim = text(artifact.claim) ?? document.description;
  const source = text(artifact.source);
  if (!source) return skip(document, 'ktma.source is missing');

  const recordings: Recording[] = [];
  for (const id of strings(artifact.recordings)) {
    const run = runs.get(id);
    if (!run) {
      warn(`[artifacts] ${document.path}: lists /runs/${id}, which has no document; the run is left out`);
      continue;
    }
    const recording = recordingOf(run);
    if (recording) recordings.push(recording);
  }

  const facts = Array.isArray(artifact.facts)
    ? artifact.facts.filter(
        (fact): fact is ArtifactFact =>
          typeof fact === 'object' &&
          fact !== null &&
          isText((fact as ArtifactFact).label) &&
          isText((fact as ArtifactFact).value),
      )
    : undefined;

  return {
    id: document.id,
    title: document.title,
    products: strings(artifact.products),
    platforms: strings(artifact.platforms) as Platform[],
    claim,
    evidence: text(artifact.evidence),
    kind: artifact.kind,
    summary: document.description,
    // The cockpit is deployed on its own, so a build can point at where it moved without editing the document.
    source: artifact.kind === 'live' ? (liveSource ?? source) : source,
    status: text(artifact.status),
    data: text(artifact.data),
    poster: text(artifact.poster),
    posterAlt: text(artifact.posterAlt),
    recordings: artifact.recordings ? recordings : undefined,
    body: document.body,
    line: text(artifact.line),
    order: orderOf(document),
    facts,
  };
}

/** Where a build serves a deployed application from, when it is not the address in the document. */
export interface BuildOptions {
  liveSource?: string;
}

/** The artifacts, in the order the grid draws them. */
export function buildArtifacts(documents: Document[], options: BuildOptions = {}): Artifact[] {
  const runs = new Map(runDocuments(documents).map((document) => [runName(document.id), document]));
  const pages = pageDocuments(documents)
    .filter((document) => document.ktma.kind !== undefined)
    .sort((a, b) => orderOf(a) - orderOf(b) || a.id.localeCompare(b.id));
  const artifacts: Artifact[] = [];
  for (const page of pages) {
    const artifact = artifactOf(page, runs, options.liveSource);
    if (artifact) artifacts.push(artifact);
  }
  return artifacts;
}
