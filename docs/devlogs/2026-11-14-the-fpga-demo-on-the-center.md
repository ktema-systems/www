# The FPGA demo on the center

date: 2026-11-14
project: ktema_www
related:

- demo center (demo.ktema.systems)
- ktema, `demo/fpga-icesugarpro-audit`
- ktema, `docs/devlogs/2026-11-14-the-demo-portfolio.md`

## Context

The ECP5 demonstration was recorded in the engine checkout and had stood on the center
as a planned tile. This note records what changed when it became an artifact: where the
footage lives, what the page claims, and what it deliberately does not.

## Where the footage lives

The take is 23.9 MB, which is close enough to the 25 MiB per-file limit on Cloudflare
Pages that the next recording would not fit, so it is not committed beside the other
proofs. It was uploaded to R2 instead.

| | |
|---|---|
| Bucket | `ktema-demo-media`, created for this |
| Key | `demo/fpga-icesugarpro-audit/20261114-180434-v2.mp4` |
| Public URL | `https://pub-836aff2583c345ec8edfbd9fc6083ef0.r2.dev/demo/fpga-icesugarpro-audit/20261114-180434-v2.mp4` |
| Access | the bucket's r2.dev URL, enabled with `wrangler r2 bucket dev-url enable` |
| Cache | `public, max-age=31536000, immutable` |

A key is immutable because the cache says so. A recut is uploaded under a new key and the data file names it, which is why the take carries `-v2`: the first key holds the small board inset, the second the half-frame board with the LED labels. The first object stays where it is, so an old link still plays what it played.

Two facts about the URL. It is the bucket's development host, which Cloudflare rate limits; attaching a custom domain is the production step, and it changes one line in `demo/src/data/artifacts.ts`. The object supports range requests, which is what the player needs to seek, and it is served without CORS: a video element does not need a CORS header, and nothing here draws the frames into a canvas.

The other proofs stay under `demo/public/proofs/` because each is under a megabyte. A
recording that stays small belongs there; this one does not.

## What the artifact says

The page plays the take and the summary states what the console and the board do.

- The run: an hour of readings, the incident, the audit at one address six months later,
  and a point read whose cost does not grow with the volume.
- The part: 512 of the volume's addresses are handed to the ECP5, a value moved outside
  the alphabet turns the verdict red, and the passing set is recomputed by an arithmetic
  the host does not share.

The board does not store a record and does not run the engine. The engine checkout states
the same boundary in `demo/README.md`, and the narration in the take says the host divides
and the die multiplies by a reciprocal.

## The poster

The still is the board itself: `board-ecp5.jpg` cropped to sixteen by nine and committed
at `demo/public/proofs/fpga.jpg`. A reader sees the part that answers before opening the
video.

## The page

The page carries more than a summary, because a hardware demonstration cannot state its
environment on the board. Under the video it holds the prose, the take's numbers as rows,
and two bar charts drawn from the data: the reads a point read costs at 64 and at 11,172
records, and the seconds each LED stage is held. The prose and the table use the document
measure the measurement page already sets.

The board inset is half the frame, 960 by 540, and the four stage colours are labelled in
frame as `[LED] blue, blink 1 s` and so on. The labels are drawn at the times the stage
commands appear in the cast, so a viewer can check the board against the console at the
same second. The cost is that a console line wider than sixty-three columns runs under
the inset; the summary and the facts table carry the numbers those lines state.

## Publish

`npm run demo:deploy` builds the center and uploads `demo-dist` to the `ktema-demo`
project. The deployment that carried this artifact is
`https://20f99ac0.ktema-demo.pages.dev`, served at `https://demo.ktema.systems/fpga/`.
