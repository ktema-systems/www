// The bytes the hub states by reference.
//
// A corpus record states what a run measured; this states the files a run
// produced, which do not belong in a git repository and are reached by url
// instead. The build copies the hub's own `index.json` here, so a page lists what
// the hub says it holds rather than what this repository happens to know.
//
// An entry whose row states no signature is unsigned, and says so. A bundle is the
// one kind that must carry one, and the hub refuses to publish a bundle without it,
// so a bundle that reached this far was signed; a row with no signature is a video
// or a log, and stating it as unsigned is the truth rather than a gap.

import index from './hub-index.json';

export type DeliveryKind = 'bundle' | 'demo' | 'bench';

/** One file the hub names, as a page draws it. */
export interface Delivery {
  kind: DeliveryKind;
  /** What the file is called, which is what a recipient saves it as. */
  name: string;
  /** Where to fetch it. */
  url: string;
  /** `sha256:<64 hex>`, the form the hub states and a reader checks. */
  sha256: string;
  /** The member a bundle carries its signature in, absent for anything unsigned. */
  signature?: string;
  /** The size in bytes, as the hub measured it. */
  bytes: number;
}

interface Row {
  kind?: unknown;
  name?: unknown;
  url?: unknown;
  sha256?: unknown;
  signature?: unknown;
  bytes?: unknown;
}

const KINDS: DeliveryKind[] = ['bundle', 'demo', 'bench'];

function isKind(value: unknown): value is DeliveryKind {
  return typeof value === 'string' && (KINDS as string[]).includes(value);
}

/** The hub's format is checked by the hub that writes it; this refuses what a page cannot draw. */
function toDelivery(row: Row, at: number, source: string): Delivery {
  const where = `${source} artifacts[${at}]`;
  if (!isKind(row.kind)) throw new Error(`${where}: kind is ${JSON.stringify(row.kind)}`);
  for (const field of ['name', 'url', 'sha256'] as const) {
    if (typeof row[field] !== 'string' || row[field] === '') {
      throw new Error(`${where}: ${field} is missing`);
    }
  }
  if (typeof row.bytes !== 'number') throw new Error(`${where}: bytes is not a number`);
  return {
    kind: row.kind,
    name: row.name as string,
    url: row.url as string,
    sha256: row.sha256 as string,
    signature: typeof row.signature === 'string' ? row.signature : undefined,
    bytes: row.bytes as number,
  };
}

/**
 * Every file the hub names, in the order it states them.
 *
 * A hub written before version 0.3 carries no `artifacts` key; it states an empty
 * list rather than failing, because a corpus recorded before there were files to
 * name is still a corpus a page can draw.
 */
export function getDeliveries(): Delivery[] {
  const rows = (index as { artifacts?: unknown }).artifacts;
  if (rows === undefined) return [];
  if (!Array.isArray(rows)) throw new Error('hub-index.json: artifacts is not an array');
  return rows.map((row: Row, at: number) => toDelivery(row, at, 'hub-index.json'));
}

/** The rows of one kind, which is how a page groups them. */
export function byKind(deliveries: Delivery[], kind: DeliveryKind): Delivery[] {
  return deliveries.filter((delivery) => delivery.kind === kind);
}
