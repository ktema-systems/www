// One workload, measured three ways on one host.
//
// The record is the same in all three: three 60-byte addresses (fact, intent, hint), a 5-byte
// origin, a 10-byte media type, and a payload of about 55 bytes. Each engine stores that
// content in its own shape, so what the charts compare is the shape rather than the workload.
//
// The engine's row comes from `benches/run.sh` in the ktema checkout, which owns the format.
// The two baselines come from `tools/bench/run.sh` here, which is the reproduction command
// this comparison is obliged to ship. Both were run on the same machine on the same day.

export interface Row {
  records: number;
  /** Bytes the medium charges for one record. */
  bytes_per_record: number;
  /** Time to make the volume answerable. */
  open_us: number;
  /** Time to fetch one record by its address. */
  point_read_us: number;
  /** Time to enumerate the addresses in a contiguous tenth of the range. */
  range_us: number;
  range_answers: number;
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
      { records: 1_000, bytes_per_record: 482, open_us: 16.708, point_read_us: 1.209, range_us: 132.125, range_answers: 101, write_us: 4.792 },
      { records: 10_000, bytes_per_record: 483, open_us: 68.625, point_read_us: 1.667, range_us: 2_585.958, range_answers: 1_001, write_us: 5.75 },
      { records: 100_000, bytes_per_record: 484, open_us: 187.459, point_read_us: 5.0, range_us: 120_178.417, range_answers: 10_008, write_us: 12.25 },
    ],
  },
  {
    id: 'log',
    name: 'Append log',
    color: 'var(--fg-2)',
    rows: [
      { records: 1_000, bytes_per_record: 254, open_us: 47.542, point_read_us: 0.042, range_us: 4.375, range_answers: 100, write_us: 1.792 },
      { records: 10_000, bytes_per_record: 255, open_us: 494.5, point_read_us: 0.042, range_us: 40.375, range_answers: 1_000, write_us: 1.708 },
      { records: 100_000, bytes_per_record: 256, open_us: 7_514.583, point_read_us: 0.042, range_us: 522.667, range_answers: 10_000, write_us: 1.625 },
    ],
  },
  {
    id: 'sqlite',
    name: 'SQLite',
    color: 'rgb(122, 121, 119)',
    rows: [
      { records: 1_000, bytes_per_record: 303, open_us: 251.667, point_read_us: 2.417, range_us: 7.958, range_answers: 100, write_us: 10.667 },
      { records: 10_000, bytes_per_record: 294, open_us: 251.417, point_read_us: 2.5, range_us: 59.542, range_answers: 1_000, write_us: 11.583 },
      { records: 100_000, bytes_per_record: 293, open_us: 253.75, point_read_us: 2.542, range_us: 555.958, range_answers: 10_000, write_us: 12.375 },
    ],
  },
];

/** The address map the bare log builds at open, which is the cost a device pays for a lookup. */
export const logMap: { records: number; bytes: number }[] = [
  { records: 1_000, bytes: 65_536 },
  { records: 10_000, bytes: 524_288 },
  { records: 100_000, bytes: 4_194_304 },
];

/** Bytes of address map per record, which is the rate the projection at scale is drawn from. */
export const logMapBytesPerRecord = 41.9;

/** What produced the numbers, so a reader can reproduce them rather than trust them. */
export const source = {
  host: 'Apple M1 Max, macOS 15.7.1',
  recorded: '2026-11-12',
  samples: 51,
  engine: 'ktema/benches/run.sh 1000 10000 100000',
  peers: 'demo/tools/bench/run.sh',
  sqlite: '3.43.2, WAL, synchronous=NORMAL, cache_size=8 MB',
} as const;
