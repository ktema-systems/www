// The claim register: the sentences the program is built to hold, and the evidence under each.
//
// A line is a claim the program is built to hold, not a phase. The demonstrations under it are what makes the claim
// readable without the source. Which line an entry belongs to is in the entry's document (`ktma.line`), so a new
// document attaches itself; a line that names an entry the center does not carry, an entry on no line, and an entry
// named on two lines are each reported and the register carries on.
import type { Artifact } from './artifacts';
import type { Surface } from './surfaces';
import type { Platform } from './taxonomy';
import { warn } from './warn';

export interface ClaimLine {
  /** The name a document writes in `ktma.line`. */
  id: string;
  /** What the line claims, as the heading a reader scans. */
  title: string;
  /** The claim in one sentence, in the words the demonstrations hold it to. */
  states: string;
}

export const claims: ClaimLine[] = [
  {
    id: 'record-on-the-machine',
    title: 'The record lives on the machine',
    states:
      'A part with no operating system over it writes its record into its own flash, and the boot after it reads every record back by the address it was written at, with no host in the loop.',
  },
  {
    id: 'medium-survives-the-cut',
    title: 'The medium survives the cut',
    states:
      'The rail is cut in the middle of a write and the volume opens; nothing appears at an address the writer did not put there, and a reader who never held the device answers from the bytes it left.',
  },
  {
    id: 'second-reader',
    title: 'The set is proved by a second reader',
    states:
      'A party holding only what the machine printed recomputes every value by another arithmetic, and refuses a set whose total cannot tell one file from another.',
  },
  {
    id: 'cost-stays-flat',
    title: 'Cost stays flat as the volume grows',
    states:
      'The read follows the depth of the coordinate rather than the size of the volume, measured from a thousand records to a million.',
  },
  {
    id: 'attaches-to-what-a-team-ships',
    title: 'The layer attaches to what a team ships',
    states:
      'The record layer arrives as a header and one partition. The drivers, the scheduler and the certificate of the platform stay where they are, and the layer claims none of them.',
  },
  {
    id: 'cockpit-over-the-record',
    title: 'The cockpit over the record',
    states:
      'A fleet, a cell and the people running them are read in one space, and every step, reading and reach resolves at one address.',
  },
];

/** A line's demonstrations, resolved to the entries the center draws. */
export interface PlacedLine extends Omit<ClaimLine, 'evidence'> {
  evidence: { id: string; title: string; platforms: Platform[]; poster?: string; page: string }[];
}

interface Entry {
  id: string;
  title: string;
  platforms: Platform[];
  poster?: string;
  page: string;
  line?: string;
  order: number;
}

/**
 * The lines, with each entry placed by the line its document names. An entry named twice keeps its first line, an
 * entry on no line is named once, and an entry whose line does not exist is named with the line it asked for.
 */
export function placeLines(artifacts: Artifact[], surfaces: Surface[]): PlacedLine[] {
  const entries: Entry[] = [
    ...artifacts.map((artifact) => ({
      id: artifact.id,
      title: artifact.title,
      platforms: artifact.platforms,
      poster: artifact.poster,
      page: artifact.page,
      line: artifact.line,
      order: artifact.order,
    })),
    ...surfaces.map((surface) => ({
      id: surface.id,
      title: surface.title,
      platforms: surface.platforms,
      page: `/${surface.id}`,
      line: surface.line,
      order: surface.order,
    })),
  ].sort((a, b) => a.order - b.order || a.id.localeCompare(b.id));

  const known = new Map(claims.map((line) => [line.id, line]));
  const placed = new Map<string, Entry[]>();
  for (const entry of entries) {
    if (entry.line === undefined) {
      warn(`[claims] /${entry.id} names no line; it stands in the grid and not in the register`);
      continue;
    }
    const line = known.get(entry.line);
    if (!line) {
      warn(`[claims] /${entry.id} names line "${entry.line}", which does not exist; it is not in the register`);
      continue;
    }
    const members = placed.get(entry.line) ?? [];
    members.push(entry);
    placed.set(entry.line, members);
  }

  return claims.map((line) => ({
    ...line,
    evidence: (placed.get(line.id) ?? []).map(({ id, title, platforms, poster, page }) => ({
      id,
      title,
      platforms,
      poster,
      page,
    })),
  }));
}
