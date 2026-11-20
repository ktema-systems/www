// One workload, measured three ways on one host.
//
// The record is identical in all three: three 60-byte addresses (fact, intent, hint), a 5-byte
// origin, a 10-byte media type, and a payload of about 55 bytes. Each engine stores that
// content in its own shape, so what the charts compare is the shape, not the workload.
//
// The engine's row comes from `benches/run.sh` in the ktema checkout, which owns the format, at
// commit 18cbe34. The two baselines come from `tools/bench/run.sh` here, which is the reproduction
// command this comparison is obliged to ship. The three were measured on one machine on one day.
//
// A single volume stops at 4 GiB, because the format's offsets are 32 bits. At 495 bytes a
// record that is about 8.7M records, so 10M is not a volume this engine can hold: the ladder
// ends at a million and the ceiling is stated rather than drawn.

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

export const engines: Engine[] = [
  {
    id: 'ktema',
    name: 'Ktema',
    color: 'var(--accent)',
    rows: [
      { records: 1_000, bytes_per_record: 485, volume_bytes: 485_019, open_us: 428.916, point_read_us: 0.958, point_read_bytes: 3_195, range_us: 95.416, range_answers: 101, range_bytes: 567_577, write_us: 4.625 },
      { records: 10_000, bytes_per_record: 493, volume_bytes: 4_931_941, open_us: 401.25, point_read_us: 1.166, point_read_bytes: 7_458, range_us: 1_301.208, range_answers: 1_001, range_bytes: 8_290_652, write_us: 4.958 },
      { records: 100_000, bytes_per_record: 493, volume_bytes: 49_275_418, open_us: 11_059.125, point_read_us: 1.333, point_read_bytes: 11_149, range_us: 22_021.833, range_answers: 10_008, range_bytes: 109_232_615, write_us: 13.166 },
      { records: 1_000_000, bytes_per_record: 495, volume_bytes: 495_261_336, open_us: 42_446.792, point_read_us: 2.0, point_read_bytes: 20_544, range_us: 305_129.792, range_answers: 98_968, range_bytes: 1_620_870_132, write_us: 28.417 },
    ],
  },
  {
    id: 'log',
    name: 'Append log',
    color: 'var(--fg-2)',
    rows: [
      { records: 1_000, bytes_per_record: 254, volume_bytes: 253_890, open_us: 48.833, point_read_us: 0.042, range_us: 4.375, range_answers: 100, write_us: 1.833 },
      { records: 10_000, bytes_per_record: 255, volume_bytes: 2_548_890, open_us: 473.75, point_read_us: 0.042, range_us: 40.667, range_answers: 1_000, write_us: 1.667 },
      { records: 100_000, bytes_per_record: 256, volume_bytes: 25_588_890, open_us: 6_948.292, point_read_us: 0.042, range_us: 492.583, range_answers: 10_000, write_us: 1.833 },
      { records: 1_000_000, bytes_per_record: 257, volume_bytes: 256_888_890, open_us: 114_553.625, point_read_us: 0.042, range_us: 5_306.667, range_answers: 100_000, write_us: 2.5 },
    ],
  },
  {
    id: 'sqlite',
    name: 'SQLite',
    color: 'rgb(122, 121, 119)',
    rows: [
      { records: 1_000, bytes_per_record: 303, volume_bytes: 303_104, open_us: 238.125, point_read_us: 2.417, point_read_bytes: 12_288, range_us: 7.667, range_answers: 100, range_bytes: 40_960, write_us: 11.125 },
      { records: 10_000, bytes_per_record: 294, volume_bytes: 2_936_832, open_us: 220.208, point_read_us: 2.667, point_read_bytes: 16_384, range_us: 57.375, range_answers: 1_000, range_bytes: 307_200, write_us: 12.5 },
      { records: 100_000, bytes_per_record: 293, volume_bytes: 29_270_016, open_us: 226.833, point_read_us: 2.542, point_read_bytes: 20_480, range_us: 562.75, range_answers: 10_000, range_bytes: 2_949_120, write_us: 12.333 },
      { records: 1_000_000, bytes_per_record: 293, volume_bytes: 292_589_568, open_us: 234.208, point_read_us: 2.667, point_read_bytes: 24_576, range_us: 12_212.75, range_answers: 100_000, range_bytes: 29_278_208, write_us: 10.0 },
    ],
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
  log: [
    { records: 1_000, bytes: 65_536 },
    { records: 10_000, bytes: 524_288 },
    { records: 100_000, bytes: 4_194_304 },
    { records: 1_000_000, bytes: 67_108_864 },
  ],
  sqlite: [
    { records: 1_000, bytes: 53_504 },
    { records: 10_000, bytes: 336_384 },
    { records: 100_000, bytes: 3_143_424 },
    { records: 1_000_000, bytes: 8_753_152 },
  ],
  /** Measured at 5M, beyond the drawn ladder, for the projection the text states. */
  log_at_five_million: 268_435_456,
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

/** What produced the numbers, so a reader can reproduce them rather than trust them. */
export const source = {
  host: 'Apple arm64, 8 Performance cores, macOS 15.7.1',
  recorded: '2026-11-20',
  samples: 51,
  engine: 'ktema 18cbe34, ktema-bench 1000 10000 100000 1000000',
  peers: 'demo/tools/bench/run.sh',
  sqlite: '3.43.2, WAL, synchronous=NORMAL, cache_size=8 MB',
} as const;
