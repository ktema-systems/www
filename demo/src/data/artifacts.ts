// What the center shows.
//
// An artifact is one thing a reader can open, and the center knows three things about it: how to present it, what it is
// called, and where it lives. Nothing here knows how an artifact is built or what it contains, which is what lets a
// hardware run, an FPGA board and a cockpit stand beside each other: each is a URL and a name.
//
// A surface that is not built yet is a separate list rather than an entry with an empty address, because an entry with
// no address would still be a page. What is planned is a label and a sentence, and the grid draws it as what it is.

/** `live` is a deployed application the reader is sent to; the center draws the other three itself. */
export type ArtifactKind = 'live' | 'video' | 'document' | 'terminal';

/** A recorded run, hosted as a replay rather than stored here: a label, what it proves, and its address. */
export interface Recording {
  label: string;
  detail: string;
  href: string;
}

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
  /** For a `terminal` artifact: the recordings it lists beside the one it leads with. */
  recordings?: Recording[];
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
      'The cockpit for a working fleet: intents and records on the left, the cell in the middle, the ground on the right, the timeline below. Ten scenes, opening on a factory cell in Penang.',
    source: DELTA,
    poster: '/delta-run.jpg',
    posterAlt:
      "Delta's cockpit over Rescue Wing: Island Fire. The intents and records on the left, the cell view of survey, thermal, photo and relay drones with crawlers and boats in the middle, the island and its shoreline on the right, and the timeline below.",
  },
  {
    id: 'terminal',
    title: 'Terminal proof',
    kind: 'terminal',
    status: 'recorded',
    summary:
      'The engine outside a browser. A RISC-V device tier and the host write the same volume byte for byte, a power cut at every byte of the log recovers, and the C surface runs on a Cortex-M4.',
    source: 'https://asciinema.org/a/hHFP3JtpfHOq5B59',
    poster: 'https://asciinema.org/a/hHFP3JtpfHOq5B59.png',
    posterAlt:
      'A terminal replaying the device-tier check: the scenario runs on a RISC-V board, the host writes the same volume, and both report the digest 0x299bd5d0e1821fab.',
    recordings: [
      {
        label: 'A power cut at every byte',
        detail:
          'The log is cut at each byte, every run opens it, and none finds a record that was not there.',
        href: 'https://asciinema.org/a/Xl2xHlTCZESS1dMy',
      },
      {
        label: 'A record round trip',
        detail: 'Thirteen steps, eight records, one digest: the same run the device tier converges on.',
        href: 'https://asciinema.org/a/k8B3QIaUWfnm36BH',
      },
      {
        label: 'The C surface on a Cortex-M4',
        detail: 'The test body linked from C, 6,672 bytes of a 65,536-byte arena at peak.',
        href: 'https://asciinema.org/a/6PPKR4qVCa55UCHt',
      },
      {
        label: 'Three refusals',
        detail:
          'A medium that refuses a write, a worn medium, and a channel that holds a write past the end of the run.',
        href: 'https://asciinema.org/a/ngG0AIfvC4oDosGW',
      },
    ],
  },
];

// The order here is the order the grid draws them in. They sit beside the artifacts rather than under them, because a
// reader who came for one demonstration still learns what the center is going to be. Each names the work it stands for,
// which is what the devlogs carry rather than a description of what a video is.
export const planned: PlannedSurface[] = [
  {
    title: 'Hardware edge',
    summary:
      'An ESP32-S3 keeping its records in its own flash, read back after a reset. Still to run on the board: a power cut mid-write, and a full region retiring its oldest segment.',
  },
];
