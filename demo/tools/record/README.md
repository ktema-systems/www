# Recorded proofs

The terminal proofs on `/terminal` are recordings of real runs of the engine. A cast is
not kept in this repository: the recording lives on asciinema.org and the still is what the
demo center commits. This directory is what makes each one reproducible.

## What the proofs are

| Name | What it shows | Where the session runs |
|---|---|---|
| `device` | A RISC-V device tier and the host write the same volume, byte for byte | `verify/device/check.sh` in the engine checkout |
| `region` | The log is cut at each byte and every run recovers; the header refuses a change | `verify/region/check.sh` |
| `smoke` | A thirteen-step record round trip, hashed to one digest | `ktema-sim` over `verify/scenarios/smoke.txt` |
| `capi-arm` | The same C test body on a Cortex-M4 and a RISC-V core, with the same measurements | `proof-capi-arch.sh` in this directory |
| `faults` | A refused write, a worn medium, and a buffered write past the end of a run | `verify/faults/check.sh` |

## Re-record one or all

```sh
demo/tools/record/record.sh                 # every proof
demo/tools/record/record.sh faults          # one proof
demo/tools/record/record.sh smoke capi-arm  # a few
```

Each run records a cast at `120x30`, renders the last frame to
`demo/public/proofs/<name>.png`, and leaves the cast in a temporary directory. The
terminal geometry is fixed because the still's shape is the card's shape.

The engine checkout is `../ktema` by default. `KTEMA_DIR` points at another one.

The still is the cast's last frame at `--font-size 18`, converted with `sips` on macOS or
`ffmpeg` elsewhere. A proof whose session should end on a summary has to print it last,
because that is the frame the card shows.

## Publish a new recording

```sh
demo/tools/record/record.sh --upload device
```

This records, renders the still, uploads the cast as an unlisted recording, and prints the
new URL. Replace that proof's `href` in `demo/src/data/artifacts.ts` with it, then commit
the still and the data change together. The proof's label and detail are in the same array.

The recordings are unlisted: reachable by the URL the center links to, absent from the
account's listings.
