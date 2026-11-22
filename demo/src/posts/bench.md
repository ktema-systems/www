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
| Operating system | Not required | Required | Required |
| Filesystem | Not required; the medium is the volume | Required | Required |
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

The host rows are the engine's reference path: no record maps, no block cache, no index, so a box query walks the log.
A tenth of the addresses at a hundred thousand records reads {{volume_multiple}} times the volume, which is where its
time comes from.

The peers run with an operating system, a filesystem and a warm page cache. Neither runs on a part without one, and
the log's address map stops fitting before the volumes it serves. The engine's case is that tier.

The append figure is where runs spread widest: at a hundred thousand records the engine lands near 5 µs and the
database near 12, while the other three times stayed within a tenth of their value.

## The path this page does not measure

A volume opens two ways. The reference path answers by reading the log, which is what every number here measures. The
cached path builds record maps at 394 to 406 bytes a record on a 32-bit target, with the structural index at about
354 kB, so a read comes from memory. A part with 64 kB cannot take it.

Both paths hold the same record in the same format. The choice moves the cost between the medium and the memory.

## A box on any axis

A multi-dimensional query fixes ranges on some axes and asks for the records inside. One box over a tenth of one axis,
at a million records, through each store's own query path:

## What a box costs to hold

The engine answers both shapes in one pass and the same bytes, because the address is computed. The database's
inner-axis row costs {{box_bytes_ratio}} times the reads and {{box_time_ratio}} times the time, and an index of
{{box_index}} on a {{box_volume}} volume makes it cheap again.

The engine's flat cost is the namespace, walked once per query: {{box_bytes}} at a million records. A listing compares
each key once per segment, and a listing begins at a prefix, which a set of ranges is not.

Per answer: {{box_kb_engine}} kB read against {{box_kb_sqlite}} kB.

A volume stops at 4 GiB, {{ceiling_records}} records at {{bytes_ktema}} bytes each. A particle-physics ntuple is about
a hundred times that, so the unit here is the volume.

## What a read costs the medium

The engine counts the reads it asks the medium for. The count is {{read_framing}} framing read and {{read_fact}} fact
reads at any volume, and a prefix read does not read a record.

## The read contract

{{read_multiple}} times the volume changes neither count. The listing issues no byte read, which is the contract's "does
not read a record"; the directory walk is not a call this counter sees. The bytes behind the reads do grow, from
{{point_kb_small}} at a thousand records to {{point_kb_large}} at a million.
