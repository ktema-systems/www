// One workload, measured three ways on one host.
//
// The record is identical in all three: three 60-byte addresses (fact, intent, hint), a 5-byte
// origin, a 10-byte media type, and a payload of about 55 bytes. Each engine stores that
// content in its own shape, so what the charts compare is the shape, not the workload.
//
// The engine's rows are not in this file. They are the corpus record the key below names, exported to
// `corpus-bench.json` by `ktema/corpus/export.sh`, so the page draws what a run measured rather than
// what someone typed here. A measurement is a run with a key, and the sentence under it is the run's own.
//
// A single volume stops at 4 GiB, because the format's offsets are 32 bits. At 495 bytes a
// record that is about 8.7M records, so 10M is not a volume this engine can hold: the ladder
// ends at a million and the ceiling is stated rather than drawn.

import corpus from './corpus-bench.json';

/**
 * One entry per subject: the record's own fields, and the payload as the run wrote it. The export declares no shape,
 * so a run's field names are read here rather than there.
 */
interface Entry<T> {
  key: string;
  subject: string;
  revision: string;
  created: string;
  claim: string;
  class: string;
  parameters: { sizes?: number[]; samples?: number; sqlite?: string };
  payload: T;
}

/** A rung of the engine's own sweep, as `bench/` writes it. */
interface VolumeRow {
  records: number;
  volume_bytes: number;
  open_us: number;
  point_read_us: number;
  point_read_medium_bytes: number;
  query_us: number;
  query_answers: number;
  query_medium_bytes: number;
  write_us: number;
}

/** A rung of the two baselines, as `bench/peers/` writes them. */
interface LogRow {
  records: number;
  volume_bytes: number;
  map_bytes: number;
  open_us: number;
  point_read_us: number;
  range_us: number;
  range_answers: number;
  write_us: number;
}

interface SqliteRow extends Omit<LogRow, 'map_bytes'> {
  cache_bytes: number;
  point_read_medium_bytes: number;
  range_medium_bytes: number;
}

const entries = corpus.bench as unknown as Entry<unknown>[];

/** The record this page draws. */
const measured = entries.find((entry) => entry.subject === 'volume-sweep')! as Entry<{ volumes: VolumeRow[] }>;

/** The two baselines the same host measured, from `ktema`'s `peer-baselines` record. */
const peers = entries.find((entry) => entry.subject === 'peer-baselines')! as Entry<{
  append_log: LogRow[];
  sqlite_rows: SqliteRow[];
}>;

export interface Row {
  records: number;
  /** Bytes the medium charges for one record. */
  bytes_per_record: number;
  /** Bytes the volume occupies. */
  volume_bytes: number;
  /** Time to make the volume answerable. */
  open_us: number;
  /** Time to fetch one record by its address. */
  point_read_us: number;
  /**
   * Bytes the store read from the medium to fetch that record. The engine counts them in its channel;
   * the database counts the pages its pager fetched, at its page size; the log maps its file, so its
   * reads are page faults no counter in this harness sees.
   */
  point_read_bytes?: number;
  /** Time to enumerate the addresses in a contiguous tenth of the range. */
  range_us: number;
  range_answers: number;
  /** Bytes the channel read to answer that range. Counted by the engine and by the database's pager; the log maps its file. */
  range_bytes?: number;
  /** Time to append one record once the volume is built. */
  write_us: number;
}

export interface Engine {
  id: 'ktema' | 'log' | 'sqlite';
  name: string;
  rows: Row[];
  color: string;
}

const volumeRows: Row[] = measured.payload.volumes.map((row) => ({
  records: row.records,
  bytes_per_record: Math.round(row.volume_bytes / row.records),
  volume_bytes: row.volume_bytes,
  open_us: row.open_us,
  point_read_us: row.point_read_us,
  point_read_bytes: row.point_read_medium_bytes,
  range_us: row.query_us,
  range_answers: row.query_answers,
  range_bytes: row.query_medium_bytes,
  write_us: row.write_us,
}));

const logRows: Row[] = peers.payload.append_log.map((row) => ({
  records: row.records,
  bytes_per_record: Math.round(row.volume_bytes / row.records),
  volume_bytes: row.volume_bytes,
  open_us: row.open_us,
  point_read_us: row.point_read_us,
  range_us: row.range_us,
  range_answers: row.range_answers,
  write_us: row.write_us,
}));

const sqliteRows: Row[] = peers.payload.sqlite_rows.map((row) => ({
  records: row.records,
  bytes_per_record: Math.round(row.volume_bytes / row.records),
  volume_bytes: row.volume_bytes,
  open_us: row.open_us,
  point_read_us: row.point_read_us,
  point_read_bytes: row.point_read_medium_bytes,
  range_us: row.range_us,
  range_answers: row.range_answers,
  range_bytes: row.range_medium_bytes,
  write_us: row.write_us,
}));

// The ladder is the rungs the engine's own record covers; the baselines measure further, and the memory
// note uses the rung beyond the ladder.
const rungs = new Set(volumeRows.map((row) => row.records));
const atLadder = (rows: Row[]): Row[] => rows.filter((row) => rungs.has(row.records));
const atLadderRaw = <T extends { records: number }>(rows: T[]): T[] => rows.filter((row) => rungs.has(row.records));
const fiveMillion = peers.payload.append_log.find((row) => row.records === 5_000_000)!;

export const engines: Engine[] = [
  {
    id: 'ktema',
    name: 'Ktema',
    color: 'var(--accent)',
    rows: volumeRows,
  },
  {
    id: 'log',
    name: 'Append log',
    color: 'var(--fg-2)',
    rows: atLadder(logRows),
  },
  {
    id: 'sqlite',
    name: 'SQLite',
    color: 'rgb(122, 121, 119)',
    rows: atLadder(sqliteRows),
  },
];

/**
 * The index a volume has to hold to answer by address.
 *
 * The bare log builds one map entry per record, and the bytes are what it allocated. The
 * engine's series is its optional structural index: a fixed array of alphabet-sized levels,
 * about 354 kB on a 32-bit target, whose size does not follow the record count. This
 * benchmark does not build it, because it opens the volume without record maps, so the
 * measured run answers a box query by walking the log instead. A database keeps its index in
 * a file, so the memory it holds is the page cache that file is read through, taken after the
 * range query; it grows to about the size the cache was configured with and stops there.
 */
export const indexMemory = {
  engine_bytes: 354 * 1024,
  log: atLadderRaw(peers.payload.append_log).map((row) => ({ records: row.records, bytes: row.map_bytes })),
  sqlite: atLadderRaw(peers.payload.sqlite_rows).map((row) => ({ records: row.records, bytes: row.cache_bytes })),
  /** Measured at five million, beyond the drawn ladder, for the projection the text states. */
  log_at_five_million: fiveMillion.map_bytes,
} as const;

/** The volume ceiling the format imposes, and what it costs at this record size. */
export const ceiling = {
  bytes: 4_294_967_295,
  records: Math.floor(4_294_967_295 / 495),
} as const;

/**
 * What one operation costs the medium, counted in the reads the engine asked it for. The probe reads the same record at
 * two volume sizes, so a cost that follows the volume shows up as a difference rather than as a trend nobody checks.
 */
export const reads = {
  probe: 'verify/reads/check.sh',
  recorded: '2026-11-13',
  rows: [
    { records: 64, framing: 1, fact: 3, listing: 0 },
    { records: 512, framing: 1, fact: 3, listing: 0 },
  ],
} as const;

/**
 * One box over a tenth of one axis, at a million records, through each store's own query path.
 *
 * The engine's address is computed, so a box costs the same whichever axis it constrains and it holds no index. A
 * database stores one order, so a box that matches that order is a range read and any other is a scan, or an index
 * built for that one shape. The indexed rows carry the bytes that index occupies.
 */
export const boxes = {
  records: 1_000_000,
  rows: [
    { store: 'Ktema, the leading axis', answers: 98_968, us: 314_402.333, bytes: 1_623_966_552, index_bytes: 0 },
    { store: 'Ktema, an inner axis', answers: 111_720, us: 318_724.833, bytes: 1_623_966_552, index_bytes: 0 },
    { store: 'SQLite, the key range', answers: 100_000, us: 11_509.125, bytes: 29_278_208, index_bytes: 0 },
    { store: 'SQLite, an inner axis', answers: 119_160, us: 228_587.625, bytes: 292_597_760, index_bytes: 0 },
    { store: 'SQLite, an inner axis, indexed', answers: 119_160, us: 73_419.792, bytes: 43_372_544, index_bytes: 141_832_784 },
  ],
} as const;

/** What produced the numbers, so a reader can reproduce them rather than trust them. */
export const source = {
  host: 'Apple arm64, 8 Performance cores, macOS 15.7.1',
  recorded: measured.created.slice(0, 10),
  samples: measured.parameters.samples ?? 0,
  /** The key the engine's rows came from, and the command those rows name. */
  engine: `ktema ${measured.revision}, ktema-bench ${volumeRows.map((row) => row.records).join(' ')}`,
  key: measured.key,
  peers: peers.key,
  sqlite: `${peers.parameters.sqlite ?? 'unknown'}, WAL, synchronous=NORMAL, cache_size=8 MB`,
} as const;
