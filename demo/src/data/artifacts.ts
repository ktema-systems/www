// What the center shows.
//
// An artifact is one thing a reader can open, and the center knows three things about it: how to present it, what it is
// called, and where it lives. Nothing here knows how an artifact is built or what it contains, which is what lets a
// hardware run, an FPGA board and a cockpit stand beside each other: each is a URL and a name.
//
// Adding one is adding an entry. A new kind of thing is a component in `src/kinds` and a line in the map the page reads.

export type ArtifactKind = 'live' | 'video' | 'document';

export interface Artifact {
  /** What the address names: `/delta` is this artifact's page. */
  id: string;
  title: string;
  kind: ArtifactKind;
  /** What a reader learns before opening it, in one or two sentences. */
  summary: string;
  /** A live application's address, a video's file, or a document's page. */
  source: string;
  /** What the surface is, where the artifact says so: read-only, recorded, simulated. */
  status?: string;
  /** The still a reader sees before opening it. */
  poster?: string;
}

// The cockpit is deployed on its own, so the center names its address rather than importing it. `PUBLIC_DELTA_URL` is
// what a build points at when the artifact moves; the default is where it is published.
const DELTA = import.meta.env.PUBLIC_DELTA_URL ?? 'https://delta.demo.ktema.systems/';

export const artifacts: Artifact[] = [
  {
    id: 'delta',
    title: 'Delta',
    kind: 'live',
    status: 'read-only',
    summary:
      'The cockpit for a working fleet: intents and records on the left, the cell in the middle, the ground on the right, the timeline below. Ten scenes, opening on a factory cell in Penang. Read-only, and every record in it is mock data.',
    source: DELTA,
    poster: '/delta-run.jpg',
  },
];
