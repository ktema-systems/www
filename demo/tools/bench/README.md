# The two baselines

The measurements page puts the engine beside the two things a buyer would otherwise reach for:
an append-only file with an in-memory address map, and SQLite. The engine's own numbers come
from `benches/run.sh` in the ktema checkout, because that bench owns the format. This directory
measures the other two over the same records, so the three rows are one comparison.

## What a record is

One record is the content the engine's bench writes:

| part | bytes |
|---|---:|
| fact address | 60 |
| intent address | 60 |
| hint address | 60 |
| origin | 5 |
| media type | 10 |
| payload | about 55 |

The addresses are fixed-width text, ordered the way the engine orders them. Storing less in a
peer would make that peer look leaner than it is, so the content is held identical and the
differences that follow belong to the formats.

## Run it

```sh
demo/tools/bench/run.sh
```

Needs a C compiler and `libsqlite3`. Writes `result/peers.json`. The ladder is 1k, 10k, 100k, 1M and 5M
records, and every figure is the median of 51 calls. The 5M rung is the largest volume the engine's own bench can
reserve under the format's 4 GiB medium, so it is the peer side of that ceiling; the page draws to 1M.

## What each number is

| field | meaning |
|---|---|
| `bytes_per_record` | what the medium charges for one record |
| `open_us` | time to make the volume answerable; the log rebuilds its address map here |
| `point_read_us` | one record by its address |
| `range_us` | the addresses in a contiguous tenth, enumerated rather than counted |
| `map_bytes` | bytes of address map the log allocated, which is its cost per record |
| `cache_bytes` | bytes of page cache the database held after the range query, which is how it answers by address without a map |

The range query enumerates addresses rather than counting them, because that is what the engine
returns. A count would let a database answer from its index alone and would measure a smaller
job for that peer.

## What this does not measure

A device. Both baselines need an operating system and a filesystem, so this is a host
comparison, and the engine's host path goes through a region channel that keeps no block cache.
The device tier is recorded by the runs under `../record` and by the engine's own gates.

A single engine volume stops at 4 GiB, because the format's offsets are 32 bits. At 484 bytes a
record that is about 8.9M records, so 10M is not a volume this engine can hold.
