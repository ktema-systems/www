---
title: Measurements
description: >-
  Three stores over one workload, from a thousand records to a million: bytes on the medium, the volume, the open, a
  point read, and the index each one has to hold.
ktma:
  line: "cost-stays-flat"
  order: 4
  kind: bench
  products: [Ktema]
  platforms: [host]
  claim: >-
    What an open, a point read and an index cost from a thousand records to a million, in one table per store.
  evidence: A bench run over one workload on a host.
  source: /bench
  poster: /bench-thumb.png
  posterAlt: >-
    The memory chart: the append log's address map rises past the engine's fixed index and reaches 64 MB at a million
    records, while the engine's line stays flat.
---

## What the three are

| | Ktema | Append log | SQLite |
|---|---|---|---|
| What it is | An addressable history, written where the event happened | A record of what happened, and nothing else | Rows a program queries and changes |
| Host it needs | A part; the OS is optional | An OS and a filesystem | An OS and a filesystem |
| How an address is found | Computed from the record itself | A map entry per record, rebuilt at every mount | An index on disk, walked at each read |
| Bytes per record, at 1M | {{bytes_ktema}} | {{bytes_log}} | {{bytes_sqlite}} |
| Index the volume holds, at 1M | {{index_ktema}} | {{index_log}} | {{index_sqlite}} |
| Append one record, at 100k | {{append_ktema}} | {{append_log}} | {{append_sqlite}} |
| Open, at 100k | {{open_ktema}} | {{open_log}} | {{open_sqlite}} |
| One record by address, at 100k | {{point_ktema}} | {{point_log}} | {{point_sqlite}} |
| A tenth, by address, at 100k | {{tenth_ktema}} | {{tenth_log}} | {{tenth_sqlite}} |
| Where it stops | A volume of 4 GiB, about {{ceiling_records}} records | When the address map no longer fits the memory it has | Where its filesystem does not exist |
| Right tool when | The host has no operating system and the history is the product | The only question is what happened, on a host of a few kilobytes | The data changes and the questions are not known in advance |

## Reading the times

The host rows are the engine's reference path, opened without record maps. That is the device's path: it reads the
medium in bytes, keeps no block cache, and builds no index, so a box query walks the log. A tenth of the addresses at
a hundred thousand records reads {{volume_multiple}} times the volume, which is where its time comes from. The section
below prices the other path.

The append log and the database are at their best on a host, with an operating system, a filesystem and a warm page
cache. Neither of them runs on a part with no operating system, and the log's address map stops fitting long before
the volumes it is meant to serve. The engine's case is that tier.

The append figure is where runs spread widest: across repeated runs at a hundred thousand records the engine and the
database both land between 10 and 19 µs, while the other three times stayed within a tenth of their value. Each row is
one median of one run.

## The path this page does not measure

A volume opens two ways. The reference path builds nothing and answers by reading the log, which is what every number
above measures. The cached path builds the record maps, at 394 to 406 bytes a record on a 32-bit target, and carries
the structural index at about 354 kB, so a read is served from memory rather than from the medium. A host, or a part
with memory to spare, can take that path. A part with 64 kB cannot, and that is the reason this page measures the
reference path: it is the one that runs in both places.

Both paths hold the same record in the same format, so the choice does not change what the volume is. It changes where
the cost lands, on the medium or in the memory. What stays the same either way is the bytes each record takes, the
4 GiB a volume can address, and the record being written where the event happened.
