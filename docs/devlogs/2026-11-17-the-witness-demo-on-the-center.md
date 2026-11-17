# The witness demo on the center

date: 2026-11-17
project: ktema_www
related:

- demo center (demo.ktema.systems)
- ktema, `demo/esp32s3_fpga-litewing_icesugarpro-witness`
- ktema, `docs/devlogs/2026-11-15-the-witness-is-a-second-implementation.md`

## Where the footage lives

The take is 49.6 MiB, over the 25 MiB per-file limit on Cloudflare Pages, so it is on R2 with the
other published takes.

| | |
|---|---|
| Bucket | `ktema-demo-media` |
| Key | `demo/esp32s3_fpga-litewing_icesugarpro-witness/20261117-132019.mp4` |
| Public URL | `https://pub-836aff2583c345ec8edfbd9fc6083ef0.r2.dev/demo/esp32s3_fpga-litewing_icesugarpro-witness/20261117-132019.mp4` |
| Cache | `public, max-age=31536000, immutable` |
| Range | answered with 206, which is what seeking needs |

The key carries the take's identity rather than a version, so a recut is a new key and a link that
already plays keeps playing what it played.

## The poster

`demo/public/proofs/witness.jpg` is a frame of the film at the second the die turns green, scaled to
1280 by 720 and committed at 82 kB. Both boards are in it: the part that keeps the record on the
left, the part that recomputes it on the right, and the LED the verdict arrives on.

## What the page claims

- the part writes seventy-two records into its own flash and reads every one back by its own address
  in the same boot
- the host carries the identifiers the part printed, and derives none of them
- the die recomputes the value behind every line and answers on one pin
- the control is a set whose total is unchanged, and the die refuses it
- the power cut and the boot after it are one take

The numbers on the page are the run's own: 72 records, 1,440 lines, a total of 288, eight and nine
records answered in about two milliseconds, and an image of 166 LUT4 closing at 138.01 MHz against
a 40 MHz constraint.

## What it does not claim

The engine does not run on the die. The ECP5 has no core, and what it holds is the identifiers and
a decoder that recomputes them. The page says so in the first answer, because a reader who takes the
board for the engine is reading a different demonstration.

## Where it sits

First in the grid, which is the lead tile: the two-column figure the center opens on. The rest of
the grid follows it, and the cockpit second.
