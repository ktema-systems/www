// What the center shows.
//
// An artifact is one thing a reader can open, and the center knows three things about it: how to present it, what it is
// called, and where it lives. Nothing here knows how an artifact is built or what it contains, which is what lets a
// hardware run, an FPGA board and a cockpit stand beside each other: each is a URL and a name.
//
// A surface that is not built yet is a separate list rather than an entry with an empty address, because an entry with
// no address would still be a page. What is planned is a label and a sentence, and the grid draws it as what it is.

/** `live` is a deployed application; the center draws a page in front of it and links out. */
export type ArtifactKind = 'live' | 'video' | 'document' | 'runs' | 'bench' | 'device' | 'package';

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
  /** For a `runs` artifact: the runs it lists. */
  recordings?: Recording[];
  /** The long form of a page, as Markdown, where a summary is not enough. */
  body?: string;
  /** What a reader is looking at, in the order that answers it: the layer this is, what it is not, and what the data is. */
  about?: string[];
  /** The numbers the page states, in the order it states them. */
  facts?: ArtifactFact[];
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
    body: 'Thirteen steps over a volume: writes at two clocks, six window queries over the time axis, a listing and a flush. Each step states what it expects, and the run reports each one as it happens.\n\nThe run ends on the digest 0x299bd5d0e1821fab, the same digest the device tier and the host converge on. The scenario is a text file: the run and the device-tier check read the same source.',
    command: 'target/debug/ktema-sim verify/scenarios/smoke.txt target/demo/smoke --reset',
    href: 'https://asciinema.org/a/mysRyRmijvsN4OKB',
    poster: '/proofs/smoke.png',
    posterAlt:
      'A terminal replaying the thirteen-step scenario: writes at two clocks, six window queries, a listing and a flush, ending on the digest 0x299bd5d0e1821fab.',
    video: '/proofs/smoke.mp4',
  },
  {
    id: 'c-abi',
    label: 'One test body, two architectures',
    detail:
      'The same C test body linked from C and run under QEMU on a Cortex-M4 and a RISC-V core, with the same fifteen measurements on both.',
    body: 'The C test body is shared: verify/capi/test.c is 2,182 lines, and only the platform hooks and the linker script differ. The session links it for a Cortex-M4 and for a RISC-V core, runs both under QEMU, and compares the measurement lines.\n\nBoth report the same fifteen measurements, from the read path per record to the peak footprint inside a 65,536-byte arena. That is what architecture neutrality is worth once it is run rather than asserted.',
    command: 'demo/tools/record/proof-capi-arch.sh',
    href: 'https://asciinema.org/a/qKmoAREJtuVC2hej',
    poster: '/proofs/c-abi.png',
    posterAlt:
      'A terminal replaying the C surface on a Cortex-M4 and on a RISC-V core: both report the same fifteen measurements, ending with PASS: C surface round trip.',
    video: '/proofs/c-abi.mp4',
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
    id: 'witness',
    title: 'One record set, two readers, one power cut',
    products: ['Ktema'],
    kind: 'video',
    summary:
      'An engine on a part with no operating system keeps the record of what the machine did, a second reader with nothing but the data recomputes it, and the set is read again after the power is cut. The address comes from the record\u2019s own fields, so there is no index to build and the audit needs no network.',
    source:
      'https://pub-836aff2583c345ec8edfbd9fc6083ef0.r2.dev/demo/esp32s3_fpga-litewing_icesugarpro-witness/20261117-132019.mp4',
    poster: '/proofs/witness.jpg',
    posterAlt:
      'The LiteWing flight controller on the left and the iCESugar-Pro on the right, the ECP5 lit green under its RGB LED after the die agreed with the record set the drone wrote.',
    body: `## What the engine is

  A machine that records what it did usually has a filesystem under it. This part has none. The firmware links one C header, hands the engine an arena, and writes its records into the part's own flash. A record's address is computed from the record's own fields, so the address is the index and there is no index structure to build, store, or keep consistent.

  ## What runs

  The layout has four axes: flight, subsystem, event, and severity, which is seventy-two points. The part writes one record at each point into its own flash, and it reads every one of them back by its own address in the same boot. Two box queries follow, answered from the record keys alone: eight records in 2.1 ms, nine in 1.9 ms.

  A host then carries the identifiers the part printed, unchanged, to an ECP5 on an iCESugar-Pro. The die recomputes the value behind every line and compares it with the pack the line carries. Its answer is one pin: green when all fourteen hundred and forty lines agree, red when one does not.

  The two implementations share nothing but the identifiers. The host divides, and the die multiplies by a reciprocal.

  ## What the die is handed

  The control is the same set of lines with two packs exchanged. Every value stays where it was, the total over the set is unchanged, and the decoder's answer for those two lines no longer matches. The console prints both totals and names the two lines that moved, so the identity is read rather than asserted. The die answers red. A sum over the set cannot tell those two files apart.

  Then the lines the part wrote go in, and the die answers green.

  ## The power cut

  The drone's switch cuts the whole rail, the bridge included. When the part comes back it reads seventy-two records from the flash it was writing to, by the same addresses, and the die still holds its answer.

  ## Questions the demo invites

  Q. Is the engine running on the FPGA?

  A. No. The die has no core. It holds the identifiers and a decoder that recomputes the value behind each one, which makes it a second reader of the set rather than a second copy of the engine.

  Q. Is this another database, or a blockchain?

  A. Neither. A database stores and retrieves, and a blockchain needs consensus among parties that do not trust each other. This is a record layer: the address comes from the record itself, so there is no index to maintain and one machine proves its own history without asking anyone.

  Q. Why a part with no operating system instead of a server?

  A. A machine that records what happened in the field has no server under it and no network above it. The engine runs in an arena of about ten kilobytes on the part, and the record lives in the part's own flash, so the next boot reads it by the address it was written at.

  Q. What does a firmware team link?

  A. One C header and a static library built for the target. The header and the library are checked against each other in the artifact the engine ships, so the contract cannot drift from the implementation. Nothing else in the application changes.

  Q. What does the die add that a checksum does not?

  A. It refuses a set whose total is unchanged. The two files differ by two exchanged packs, every line keeps its own value, and the sum over all lines is the same, so a total accepts both and the per-value comparison accepts one.

  Q. Can a second party check a record without the machine?

  A. Yes. The check is the encoding: a party holding the identifiers recomputes the value behind each line with no access to the machine or to any network it was on. That is what the die does here, and it is what an audit by someone else needs.

  Q. What survives a power cut?

  A. The record. It is on the flash rather than in the process, so the boot after the cut finds every record at the address it was written at and re-deposits the same set without growing the volume.

  Q. Does the drone derive the identifiers the die checks?

  A. No. It prints them. The host takes that list from the console and compares the file it builds with the file the die's image was built from, so the only thing the two devices share is what the part wrote.

  Q. Do two machines that never talk arrive at the same address?

  A. Yes. The address is a function of the record's own fields and of nothing else, so a machine given the same fields computes the same address with no channel between them. This take shows one writer and a second reader of the same set.`,
    facts: [
      { label: 'Records written', value: '72, one per point of flight 4 x subsystem 3 x event 3 x severity 2' },
      { label: 'Read back by address', value: '72 of 72, none holding another point' },
      { label: 'Box answers', value: '8 of 8 in 2.1 ms, 9 of 9 in 1.9 ms' },
      { label: 'The medium, the first write', value: '34,185 bytes for 72 records, about 475 a record' },
      { label: 'The medium, a boot that already holds them', value: '1 write, 25 bytes' },
      { label: 'Lines handed to the die', value: '1,440, one value a line' },
      { label: 'Total both files reach', value: '288, printed as 00000120 by the host' },
      { label: 'Part', value: 'LiteWing, ESP32-S3 revision v0.2; the arena it hands the engine is 64 KB, and the run peaks at about ten kilobytes' },
      { label: 'Check image', value: 'iCESugar-Pro, ECP5-25F: 166 LUT4, 133 flip-flops, 138.01 MHz against a 40 MHz constraint' },
    ],
  },
  {
    id: 'delta',
    title: 'Fleet operations',
    products: ['Kletos', 'Delta'],
    kind: 'live',
    summary:
      'The cockpit for a working fleet: intents and records on the left, the cell in the middle, the ground on the right, the timeline below. Ten scenes, opening on a factory cell in Penang. Read-only, on mock data.',
    source: DELTA,
    poster: '/delta-run.jpg',
    posterAlt:
      "Delta's cockpit over Rescue Wing: Island Fire. The intents and records on the left, the cell view of survey, thermal, photo and relay drones with crawlers and boats in the middle, the island and its shoreline on the right, and the timeline below.",
    about: [
      'Delta is the operating layer of the stack: one space where a fleet, a cell, and the people running them are read together.',
      'It reads the record. It does not keep it: the engine that keeps a record and answers from it is Ktema, and it is not part of this screen.',
      'Execution and judgment are other layers. Kletos turns an ask into verified work, and Krisis decides what the work may do.',
      'Transport and authorization are other layers too. Telos moves live state, and Kleis proves who was in control.',
      'This deployment is read-only. No command reaches a machine, and nothing here writes to a fleet.',
      'It can run over any backend. On the Ktema stack it is the accountable cockpit, reading the record the engine keeps.',
      'Every campaign, machine, reading, and operator in this demonstration is synthetic. Delta is planned to be open source.',
    ],
  },
  {
      id: 'fpga',
      title: 'A wrong value turns the light red',
      products: ['Ktema'],
      kind: 'video',
      summary:
        'What a system measured, what happened, and what an audit asks later all resolve at one address, without a search. The read costs the same at 64 records and at 3,601. The same run hands 512 of those addresses to an FPGA: one value changed turns the light red, and the passing set is recomputed by an arithmetic the host does not share.',
      source:
        'https://pub-836aff2583c345ec8edfbd9fc6083ef0.r2.dev/demo/fpga-icesugarpro-audit/20261115-083500-v3.mp4',
      poster: '/proofs/fpga.jpg',
      posterAlt:
        'The iCESugar-Pro board, lit and connected, with the ECP5 under the RGB LED that carries the verdict.',
      body: `## A constructed scenario
  
  A valve station in a field with no network writes its line pressure once a second for an hour. At 14:02:05 the pressure falls, and the station writes what that second meant as well as what it measured: the limit it was given, the intent it acted on, and the fact the intent produced. Six months later the audit asks for that one address and gets all four records back without a search.
  
  ## What the part does
  
  The board is an iCESugar-Pro with an ECP5-25F on it. It is handed 512 of the volume's addresses, twenty values each, and checks two things: that every value is inside the alphabet the engine writes, and that the values reach the sum the host computed. The host divides and the die multiplies by a reciprocal, so agreement is not the same code run twice.
  
  One value moved to 11,172, the first value outside the alphabet, is counted as invalid and kept out of the sum: the pin reads 0 and the LED is red. The volume's own values reach the same sum on both sides: the pin reads 1 and the LED is green.

  ## Questions the demo invites

  Q. Is this another database, or a blockchain?

  A. Neither. A database stores and retrieves, and a blockchain needs consensus among parties that do not trust each other. This is a record layer: the address comes from the record itself, so there is no index to maintain and no consensus needed for one machine to prove its own history.

  Q. Why a board, when the host can run the same check? Is checking the host with the host not a conflict of interest?

  A. It is, which is why the second opinion comes from outside the host. The host computes 512 addresses by division and the die computes them by reciprocal multiplication, so agreement is two methods reaching one value rather than one program run twice. Two parties who share no method and no channel reach the same value and find out months later.

  Q. Does the board prove cryptographic integrity?

  A. No, and it does not claim to. It shows two narrower things: every value handed to it is inside the alphabet the engine writes, and independent arithmetic reaches the sum the host computed. Tamper-evident sealing and signatures belong to Kleis, and the demo keeps the two apart.

  Q. Does a lookup cost more as the volume grows?

  A. No. A point read is one framing read and three fact reads at 64 records and at 3,601. The cost follows the depth of the coordinate, not the size of the volume.

  Q. What happens when the network drops or the power fails?

  A. The engine writes to the local medium and keeps going. The address a writer computes is the address a reader computes later, so a restart has nothing to rebuild. The device-tier recording cuts the last append at the point a power loss would leave it, and the run after it converges on the same volume.`,
      facts: [
        { label: 'Records written', value: '3,600 readings, one a second for an hour' },
        { label: 'Records in the volume', value: "3,601: the readings and the incident's conclusion" },
        { label: 'A point read, at 64 and at 3,601 records', value: '1 framing read, 3 fact reads, 0 listing reads' },
        { label: 'Addresses handed to the die', value: '512' },
        { label: 'Values the die checks', value: '10,240, twenty per address' },
        { label: 'Sum both implementations reach', value: '00035CC3, over 10,240 values' },
        { label: 'Board', value: 'iCESugar-Pro v1.3, ECP5-25F, 24,288 LUT, 56 x 16 kbit, 28 multipliers' },
      ],
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
      'The smallest host in the claim: a microcontroller with no operating system, 8 MB of flash and 64 kB of working memory, writing a record that survives a reset. The same build runs on every host above it, and a deployment can be a field of these nodes.',
    source: 'firmware/litewing',
    poster: '/board.jpg',
    posterAlt:
      'The ESP32-S3 module on its board, lit and connected, the part that holds the engine and its records.',
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
  // The package, held back until there is an address to download it from.
  //
  // The page is written and the data is regenerated by `tools/package.mjs`, so bringing this
  // back is uncommenting the entry: the grid draws a tile, `[id].astro` builds the page, and
  // the sitemap picks it up. Until the bundle is served somewhere, a page whose buttons lead
  // nowhere is worse than no page, and a tile that opens one is the first thing a reader
  // would try.
  //
  // {
  //   id: 'package',
  //   title: 'The package, for a firmware team',
  //   products: ['Ktema'],
  //   kind: 'package',
  //   summary:
  //     'The C surface as a static library and a header, for a team that will link it and not read it: three targets built, the format specification beside them, and a program that runs in five minutes without an operating system under it.',
  //   source: '/package',
  //   status: 'downloadable',
  //   data: 'assembled from one revision',
  // },
];

// The order here is the order the grid draws them in. They sit beside the artifacts rather than under them, because a
// reader who came for one demonstration still learns what the center is going to be. Each names the work it stands for,
// which is what the devlogs carry rather than a description of what a video is. A planned surface is a tile with a badge
// instead of an address, and each one is a part that is on the bench, so the bay states what the part will show rather
// than what a page might say.
export const planned: PlannedSurface[] = [
  {
    title: 'A robot that answers for its walk',
    products: ['Delta'],
    summary:
      'A walking robot as the room a device answers in: every step, sensor reading and phone reach recorded at one address.',
  },
];
