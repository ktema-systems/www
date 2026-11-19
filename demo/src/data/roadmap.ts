// The map: the parts of the work, and the demonstration that establishes each one.
//
// A line is a claim the program is built to hold, not a phase. The demonstrations under it are what makes the claim
// readable without the source, so an entry appears exactly once and a line with no entry is not a line. The check at
// the bottom runs at build time: a demonstration the map omits, or an id the map names that does not exist, stops the
// build rather than publishing a map that is quietly incomplete.
import { artifacts, planned } from './artifacts';
import type { Platform } from './taxonomy';

export interface RoadmapLine {
  /** What the line claims, as the heading a reader scans. */
  title: string;
  /** The claim in one sentence, in the words the demonstrations hold it to. */
  states: string;
  /** The addresses of the demonstrations under this line, in the order they are worth reading. */
  demos: string[];
}

export const roadmap: RoadmapLine[] = [
  {
    title: 'The record lives on the machine',
    states:
      'A part with no operating system over it writes its record into its own flash, and the boot after it reads every record back by the address it was written at, with no host in the loop.',
    demos: ['device', 'cold-boot', 'full-volume'],
  },
  {
    title: 'The medium survives the cut',
    states:
      'The rail is cut in the middle of a write and the volume opens; nothing appears at an address the writer did not put there, and a reader who never held the device answers from the bytes it left.',
    demos: ['runs', 'medium-image'],
  },
  {
    title: 'The set is proved by a second reader',
    states:
      'A party holding only what the machine printed recomputes every value by another arithmetic, and refuses a set whose total cannot tell one file from another.',
    demos: ['witness', 'fpga', 'reader-check', 'address-in-gates'],
  },
  {
    title: 'Cost stays flat as the volume grows',
    states:
      'The read follows the depth of the coordinate rather than the size of the volume, measured from a thousand records to a million.',
    demos: ['bench'],
  },
  {
    title: 'The layer attaches to what a team ships',
    states:
      'The record layer arrives as a header and one partition. The drivers, the scheduler and the certificate of the platform stay where they are, and the layer claims none of them.',
    demos: ['archive', 'rtos-module', 'kernel-seam'],
  },
  {
    title: 'The cockpit over the record',
    states:
      'A fleet, a cell and the people running them are read in one space, and every step, reading and reach resolves at one address.',
    demos: ['delta', 'robot'],
  },
];

/** Every entry the center carries, by address. */
interface MapEntry {
  id: string;
  title: string;
  platforms: Platform[];
  poster?: string;
}

export const entriesById = new Map<string, MapEntry>(
  [...artifacts, ...planned].map((entry) => [
    entry.id,
    { id: entry.id, title: entry.title, platforms: entry.platforms, poster: 'poster' in entry ? entry.poster : undefined },
  ]),
);

const placed: string[] = [];
for (const line of roadmap) {
  for (const id of line.demos) {
    if (!entriesById.has(id)) throw new Error(`the map names /${id}, which the center does not carry`);
    if (placed.includes(id)) throw new Error(`the map places /${id} twice`);
    placed.push(id);
  }
}
for (const id of entriesById.keys()) {
  if (!placed.includes(id)) throw new Error(`the center carries /${id}, which the map does not place`);
}
