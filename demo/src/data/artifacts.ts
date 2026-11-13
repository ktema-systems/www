// What the center shows.
//
// An artifact is one thing a reader can open, and the center knows three things about it: how to present it, what it is
// called, and where it lives. Nothing here knows how an artifact is built or what it contains, which is what lets a
// hardware run, an FPGA board and a cockpit stand beside each other: each is a URL and a name.
//
// A surface that is not built yet is a separate list rather than an entry with an empty address, because an entry with
// no address would still be a page. What is planned is a label and a sentence, and the grid draws it as what it is.

/** `live` is a deployed application the reader is sent to; the center draws the other four itself. */
export type ArtifactKind = 'live' | 'video' | 'document' | 'runs' | 'bench' | 'device';

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

export interface Artifact {
  /** What the address names: `/runs` is this artifact's page. */
  id: string;
  /** What the surface is, rather than which product it belongs to. */
  title: string;
  /** What the surface belongs to, drawn as small tags. A cockpit runs over every stack, so it can carry more than one. */
  products: string[];
  kind: ArtifactKind;
  /** What a reader learns before opening it, in one or two sentences. */
  summary: string;
  /** A live application's address, a video's file, a document's page, a run inside a set, or the source a device run names. */
  source: string;
  /** The still a reader sees before opening it. */
  poster?: string;
  /** What the still shows, for a reader who cannot see it. */
  posterAlt?: string;
  /** For a `runs` artifact: the runs it lists. */
  recordings?: Recording[];
}

/** A surface the center will carry and does not yet. */
export interface PlannedSurface {
  title: string;
  products: string[];
  summary: string;
}

// The cockpit is deployed on its own, so the center names its address rather than importing it. `PUBLIC_DELTA_URL` is
// what a build points at when the artifact moves; the default is where it is published.
const DELTA = import.meta.env.PUBLIC_DELTA_URL ?? 'https://delta.demo.ktema.systems/';

// The recorded runs, in the order the page lays them out. Each still and animation is rendered from the cast, so a
// card shows the run it opens rather than a generic picture of a terminal.
const RUNS: Recording[] = [
  {
    id: 'device',
    label: 'The device and the host agree',
    detail:
      'A RISC-V device tier and the host write the same volume, byte for byte: 0x299bd5d0e1821fab on both.',
    body: 'The same scenario runs twice: once on a RISC-V device tier over a byte region at 0x80062000, and once on the host over a region of the same kind. The two regions are compared byte for byte, and both runs converge on the digest 0x299bd5d0e1821fab.\n\nThe check then cuts the last append at the point a power loss would leave it, reads the volume again, and confirms the run after that converges on the same volume. There is no host process in the device path and no database under either.',
    command: 'verify/device/check.sh',
    href: 'https://asciinema.org/a/8UfhlLz8SXaISjrS',
    poster: '/proofs/device.png',
    posterAlt:
      'A terminal replaying the device-tier check: the scenario runs on a RISC-V board, the host writes the same volume, and both report the digest 0x299bd5d0e1821fab.',
    video: '/proofs/device.mp4',
  },
  {
    id: 'region',
    label: 'A power cut at every byte',
    detail:
      'The log is cut at each byte of its last record and every sixty-fourth byte after it. Every run opens, and none finds a record that was not there.',
    body: 'The region medium is the byte region a device holds at a fixed address, kept in a file. The check writes a volume, cuts the log at every byte of the last record and at every sixty-fourth byte of the rest, and opens what is left. It then changes every byte of the region header and every 128th byte of the log, which is the hazard a cut does not produce.\n\nEvery run opens, and none finds a record that was not there. The header refuses the eight bytes of magic and the four of version, checks the segment size, and does not read the rest. This is the durability claim as a sweep rather than a case someone reasoned about.',
    command: 'verify/region/check.sh',
    href: 'https://asciinema.org/a/tdsX5GReAen6H0ua',
    poster: '/proofs/region.png',
    posterAlt:
      'A terminal replaying the power-cut sweep: the cuts and the runs after them, ending with the volume converging on 0x299bd5d0e1821fab.',
    video: '/proofs/region.mp4',
  },
  {
    id: 'smoke',
    label: 'A record round trip',
    detail: 'Thirteen steps, eight records, one digest: the same run the device tier converges on.',
    body: 'Thirteen steps over a volume: writes at two clocks, six window queries over the time axis, a listing and a flush. Each step states what it expects, and the run reports each one as it happens.\n\nThe run ends on the digest 0x299bd5d0e1821fab, the same digest the device tier and the host converge on. The scenario is a text file, so the demonstration and the check read the same source.',
    command: 'target/debug/ktema-sim verify/scenarios/smoke.txt target/demo/smoke --reset',
    href: 'https://asciinema.org/a/mysRyRmijvsN4OKB',
    poster: '/proofs/smoke.png',
    posterAlt:
      'A terminal replaying the thirteen-step scenario: writes at two clocks, six window queries, a listing and a flush, ending on the digest 0x299bd5d0e1821fab.',
    video: '/proofs/smoke.mp4',
  },
  {
    id: 'capi-arm',
    label: 'One test body, two architectures',
    detail:
      'The same C test body linked from C and run under QEMU on a Cortex-M4 and a RISC-V core, with the same fifteen measurements on both.',
    body: 'The C test body is shared: verify/capi/test.c is 2,182 lines, and only the platform hooks and the linker script differ. The session links it for a Cortex-M4 and for a RISC-V core, runs both under QEMU, and compares the measurement lines.\n\nBoth report the same fifteen measurements, from the read path per record to the peak footprint inside a 65,536-byte arena. That is what architecture neutrality is worth once it is run rather than asserted.',
    command: 'demo/tools/record/proof-capi-arch.sh',
    href: 'https://asciinema.org/a/qKmoAREJtuVC2hej',
    poster: '/proofs/capi-arm.png',
    posterAlt:
      'A terminal replaying the C surface on a Cortex-M4 and on a RISC-V core: both report the same fifteen measurements, ending with PASS: C surface round trip.',
    video: '/proofs/capi-arm.mp4',
  },
  {
    id: 'faults',
    label: 'Three refusals',
    detail:
      'A medium that refuses a write, a worn medium, and a channel that holds a write past the end of the run.',
    body: 'Three runs that leave the medium in a state a restart has to read: a medium that refuses a write and then stops, a medium that refuses from a point onwards, and a channel that holds a write past the end of the run.\n\nWhat the check reads is the medium rather than the report. A second run opens the same volume and counts, which is what a restart after a power loss does, and every medium left behind opens cleanly.',
    command: 'verify/faults/check.sh',
    href: 'https://asciinema.org/a/8QtqYOV6IhY6CIXY',
    poster: '/proofs/faults.png',
    posterAlt:
      'A terminal replaying the fault check: three runs that each report what the run believed and what the medium holds.',
    video: '/proofs/faults.mp4',
  },
];

export const artifacts: Artifact[] = [
  {
    id: 'delta',
    title: 'Fleet operations',
    products: ['All stacks', 'Delta'],
    kind: 'live',
    summary:
      'The cockpit for a working fleet: intents and records on the left, the cell in the middle, the ground on the right, the timeline below. Ten scenes, opening on a factory cell in Penang. Read-only, on mock data.',
    source: DELTA,
    poster: '/delta-run.jpg',
    posterAlt:
      "Delta's cockpit over Rescue Wing: Island Fire. The intents and records on the left, the cell view of survey, thermal, photo and relay drones with crawlers and boats in the middle, the island and its shoreline on the right, and the timeline below.",
  },
  {
    id: 'runs',
    title: 'Headless runs',
    products: ['Ktema'],
    kind: 'runs',
    summary:
      'Most of what we build is infrastructure, with no front end to open. The demonstration is the execution itself, recorded in a terminal: a device and the host writing the same bytes, a power cut at every byte, and one C surface on two architectures.',
    source: RUNS[0].href,
    recordings: RUNS,
    poster: '/proofs/device-tile.png',
    posterAlt:
      "A terminal still from the device check: the device converged on 0x299bd5d0e1821fab and the host tier wrote the same volume, under a footprint of 1136 live bytes and a 3504-byte peak.",
  },
  {
    id: 'bench',
    title: 'Measurements',
    products: ['Ktema'],
    kind: 'bench',
    summary:
      'Three stores over one workload, from a thousand records to a million: bytes on the medium, the volume, the open, a point read, and the index each one has to hold.',
    source: '/bench',
    poster: '/bench-thumb.png',
    posterAlt:
      "The memory chart: the append log's address map rises past the engine's fixed index and reaches 64 MB at a million records, while the engine's line stays flat.",
  },
  {
    id: 'device',
    title: 'One node, any scale',
    products: ['Ktema'],
    kind: 'device',
    summary:
      'The smallest host in the claim: an ESP32-S3 with no operating system, 8 MB of flash and 64 kB of working memory, writing a record that survives a reset. The same build runs on every host above it, and a deployment can be a field of these nodes.',
    source: 'firmware/litewing',
    poster: '/board.jpg',
    posterAlt:
      'The ESP32-S3 module on its board, lit and connected, the part that holds the engine and its records.',
  },
];

// The order here is the order the grid draws them in. They sit beside the artifacts rather than under them, because a
// reader who came for one demonstration still learns what the center is going to be. Each names the work it stands for,
// which is what the devlogs carry rather than a description of what a video is. A planned surface is a tile with a badge
// instead of an address, and each one is a part that is on the bench, so the bay states what the part will show rather
// than what a page might say.
export const planned: PlannedSurface[] = [
  {
    title: 'Two nodes, one address',
    products: ['Ktema'],
    summary:
      'Two ESP32-S3 modules with nothing passing between them, each handed the same fields. The address is computed from the fields, so the two arrive at the same coordinate without a conversation, and each board prints the one it reached.',
  },
  {
    title: 'The address in gates',
    products: ['Ktema'],
    summary:
      'The tagma stack\'s addressing as RTL on an iCESugar-Pro: the 16-bit coordinate over 11,172 valid states, produced by a decoder and a datapath in fabric rather than by arithmetic on a core. Synthesis returns the cell count, which is where a stack becomes a part.',
  },
  {
    title: 'A robot that answers for its walk',
    products: ['All stacks', 'Delta'],
    summary:
      'A SpiderPi Pro, a Raspberry Pi 5 with eight gigabytes, as the room a device answers in. The bridge the runtime calls already passes the device check; the three sensor calls, the Pi\'s own run and the reach from a phone are what this bay waits on.',
  },
];
