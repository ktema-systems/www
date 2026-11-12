// The engine's measurement set, as `benches/run.sh` recorded it. Each volume is built once and every number is the
// median of 51 samples. The host's seconds and the medium's bytes answer different questions, so each chart carries one
// unit. Nothing here is generated at build time: a page that measured on every render would be a benchmark, not a demo.

export interface Volume {
  records: number;
  open_us: number;
  write_us: number;
  write_medium_bytes: number;
  point_read_us: number;
  point_read_medium_bytes: number;
  query_us: number;
  query_answers: number;
  query_medium_bytes: number;
  volume_bytes: number;
  region_bytes: number;
}

export const volumes: Volume[] = [
  {
    records: 1_000,
    open_us: 17.042,
    write_us: 4.334,
    write_medium_bytes: 482,
    point_read_us: 1.083,
    point_read_medium_bytes: 5_799,
    query_us: 129.167,
    query_answers: 101,
    query_medium_bytes: 751_735,
    volume_bytes: 496_776,
    region_bytes: 4_962_304,
  },
  {
    records: 10_000,
    open_us: 67.791,
    write_us: 5.375,
    write_medium_bytes: 483,
    point_read_us: 1.583,
    point_read_medium_bytes: 16_537,
    query_us: 2_475.333,
    query_answers: 1_001,
    query_medium_bytes: 15_324_827,
    volume_bytes: 4_942_075,
    region_bytes: 11_874_304,
  },
  {
    records: 100_000,
    open_us: 179.625,
    write_us: 13.208,
    write_medium_bytes: 484,
    point_read_us: 4.584,
    point_read_medium_bytes: 65_942,
    query_us: 116_888.417,
    query_answers: 10_008,
    query_medium_bytes: 470_931_292,
    volume_bytes: 49_495_101,
    region_bytes: 80_994_304,
  },
];

/** What produced the numbers, so a reader can reproduce them rather than trust them. */
export const source = {
  commit: '19be5aa',
  recorded: '2026-11-06',
  samples: 51,
  command: 'benches/run.sh 1000 10000 100000',
} as const;
