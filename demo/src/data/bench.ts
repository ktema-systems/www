// One workload, measured three ways on one host.
//
// The record is identical in all three: three 60-byte addresses (fact, intent, hint), a 5-byte
// origin, a 10-byte media type, and a payload of about 55 bytes. Each engine stores that
// content in its own shape, so what the charts compare is the shape, not the workload.
//
// The engine's row comes from `benches/run.sh` in the ktema checkout, which owns the format.
// The two baselines come from `tools/bench/run.sh` here, which is the reproduction command
// this comparison is obliged to ship. All rows are one run on one machine on one day.
//
// A single volume stops at 4 GiB, because the format's offsets are 32 bits. At 484 bytes a
// record that is about 8.9M records, so 10M is not a volume this engine can hold: the ladder
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
  /** Bytes the channel read from the medium to fetch that record. The engine reports this; the peers do not. */
  point_read_bytes?: number;
  /** Time to enumerate the addresses in a contiguous tenth of the range. */
  range_us: number;
  range_answers: number;
  /** Bytes the channel read to answer that range. */
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
      { records: 1_000, bytes_per_record: 497, volume_bytes: 496_776, open_us: 16.625, point_read_us: 1.083, point_read_bytes: 5_799, range_us: 127.417, range_answers: 101, range_bytes: 751_735, write_us: 4.584 },
      { records: 10_000, bytes_per_record: 494, volume_bytes: 4_942_075, open_us: 67.875, point_read_us: 1.584, point_read_bytes: 16_537, range_us: 2_573.0, range_answers: 1_001, range_bytes: 15_324_827, write_us: 5.625 },
      { records: 100_000, bytes_per_record: 495, volume_bytes: 49_495_101, open_us: 181.5, point_read_us: 4.75, point_read_bytes: 65_942, range_us: 123_679.25, range_answers: 10_008, range_bytes: 470_931_292, write_us: 17.666 },
      { records: 1_000_000, bytes_per_record: 496, volume_bytes: 495_890_153, open_us: 1_130.792, point_read_us: 71.542, point_read_bytes: 661_296, range_us: 20_233_510.625, range_answers: 98_968, range_bytes: 42_720_268_547, write_us: 222.5 },
    ],
  },
  {
    id: 'log',
    name: 'Append log',
    color: 'var(--fg-2)',
    rows: [
      { records: 1_000, bytes_per_record: 254, volume_bytes: 253_890, open_us: 48.167, point_read_us: 0.042, range_us: 4.25, range_answers: 100, write_us: 1.75 },
      { records: 10_000, bytes_per_record: 255, volume_bytes: 2_548_890, open_us: 483.042, point_read_us: 0.042, range_us: 41.167, range_answers: 1_000, write_us: 1.75 },
      { records: 100_000, bytes_per_record: 256, volume_bytes: 25_588_890, open_us: 7_589.875, point_read_us: 0.042, range_us: 531.833, range_answers: 10_000, write_us: 1.583 },
      { records: 1_000_000, bytes_per_record: 257, volume_bytes: 256_888_890, open_us: 117_276.25, point_read_us: 0.042, range_us: 5_451.708, range_answers: 100_000, write_us: 2.917 },
    ],
  },
  {
    id: 'sqlite',
    name: 'SQLite',
    color: 'rgb(122, 121, 119)',
    rows: [
      { records: 1_000, bytes_per_record: 303, volume_bytes: 303_104, open_us: 257.917, point_read_us: 2.417, range_us: 7.375, range_answers: 100, write_us: 13.708 },
      { records: 10_000, bytes_per_record: 294, volume_bytes: 2_936_832, open_us: 224.292, point_read_us: 2.5, range_us: 56.583, range_answers: 1_000, write_us: 14.083 },
      { records: 100_000, bytes_per_record: 293, volume_bytes: 29_270_016, open_us: 228.333, point_read_us: 2.625, range_us: 554.417, range_answers: 10_000, write_us: 18.792 },
      { records: 1_000_000, bytes_per_record: 293, volume_bytes: 292_589_568, open_us: 219.208, point_read_us: 2.625, range_us: 12_084.792, range_answers: 100_000, write_us: 10.333 },
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
  records: Math.floor(4_294_967_295 / 496),
} as const;

/** What produced the numbers, so a reader can reproduce them rather than trust them. */
export const source = {
  host: 'Apple arm64, 8 Performance cores, macOS 15.7.1',
  recorded: '2026-11-12',
  samples: 51,
  engine: 'ktema 91aff9d, ktema-bench 1000 10000 100000 1000000',
  peers: 'demo/tools/bench/run.sh',
  sqlite: '3.43.2, WAL, synchronous=NORMAL, cache_size=8 MB',
} as const;
