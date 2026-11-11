// What the center shows.
//
// An artifact is one thing a reader can open, and the center knows three things about it: how to present it, what it is
// called, and where it lives. Nothing here knows how an artifact is built or what it contains, which is what lets a
// hardware run, an FPGA board and a cockpit stand beside each other: each is a URL and a name.
//
// A surface that is not built yet is a separate list rather than an entry with an empty address, because an entry with
// no address would still be a page. What is planned is a label and a sentence, and the grid draws it as what it is.

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
  /** Where the records in it came from, when that is not a real system. */
  data?: string;
  /** The still a reader sees before opening it. */
  poster?: string;
  /** What the still shows, for a reader who cannot see it. */
  posterAlt?: string;
}

/** A surface the center will carry and does not yet. */
export interface PlannedSurface {
  title: string;
  summary: string;
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
    data: 'mock data',
    summary:
      'The cockpit for a working fleet: intents and records on the left, the cell in the middle, the ground on the right, the timeline below. Ten scenes, opening on a factory cell in Penang. Read-only, and every record in it is mock data.',
    source: DELTA,
    poster: '/delta-run.jpg',
    posterAlt:
      "Delta's cockpit over Rescue Wing: Island Fire. The intents and records on the left, the cell view of survey, thermal, photo and relay drones with crawlers and boats in the middle, the island and its shoreline on the right, and the timeline below.",
  },
];

// The order here is the order the grid draws them in. They sit beside the artifacts rather than under them, because a
// reader who came for one demonstration still learns what the center is going to be.
export const planned: PlannedSurface[] = [
  {
    title: 'Terminal proof',
    summary: 'A run recorded as it was typed, replayable from the first byte.',
  },
  {
    title: 'Hardware edge',
    summary: 'A board on the bench, filmed while it answers.',
  },
];
