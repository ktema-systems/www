---
title: "One record set, two readers, one power cut"
description: >-
  An engine on a part with no operating system keeps the record of what the machine did, a second
  reader with nothing but the data recomputes it, and the set is read again after the power is
  cut. The address comes from the record’s own fields, so there is no index to build and the audit
  needs no network.
ktma:
  id: "esp32s3_fpga-litewing_icesugarpro-witness"
  line: "second-reader"
  order: 1
  kind: "video"
  products: ["Ktema"]
  platforms: ["bare-metal", "fpga"]
  claim: >-
    A record set written by a part with no operating system is recomputed by a second reader on a
    die, and survives the power cut.
  evidence: "A two-reader check on the part, replayed from the console."
  source: "/proofs/witness-take.mp4"
  poster: "/proofs/witness.jpg"
  posterAlt: >-
    The LiteWing flight controller on the left and the iCESugar-Pro on the right, the ECP5 lit
    green under its RGB LED after the die agreed with the record set the drone wrote.
  facts:
    - label: "Records written"
      value: "72, one per point of flight 4 x subsystem 3 x event 3 x severity 2"
    - label: "Read back by address"
      value: "72 of 72, none holding another point"
    - label: "Box answers"
      value: "8 of 8 in 2.1 ms, 9 of 9 in 1.9 ms"
    - label: "The medium, the first write"
      value: "34,185 bytes for 72 records, about 475 a record"
    - label: "The medium, a boot that already holds them"
      value: "1 write, 25 bytes"
    - label: "Lines handed to the die"
      value: "1,440, one value a line"
    - label: "Total both files reach"
      value: "288, printed as 00000120 by the host"
    - label: "Part"
      value: "LiteWing, ESP32-S3 revision v0.2; the arena it hands the engine is 64 KB, and the run peaks at about ten kilobytes"
    - label: "Check image"
      value: "iCESugar-Pro, ECP5-25F: 166 LUT4, 133 flip-flops, 138.01 MHz against a 40 MHz constraint"
---

## What the engine is

  A machine that records what it did usually has a filesystem under it. This part has none. The firmware links one C header, hands the engine an arena, and writes its records into the part's own flash. A record's address is computed from the record's own fields, so the address is the index and there is no index structure to build, store, or keep consistent.

  ## What runs

  The layout has four axes: flight, subsystem, event, and severity, which is seventy-two points. The part writes one record at each point into its own flash, and it reads every one of them back by its own address in the same boot. Two box queries follow, answered from the record keys alone: eight records in 2.1 ms, nine in 1.9 ms.

  A host then carries the identifiers the part printed, unchanged, to an ECP5 on an iCESugar-Pro. The die recomputes the value behind every line and compares it with the pack the line carries. Its answer is one pin: green when all fourteen hundred and forty lines agree, red when one does not.

  The two implementations share nothing but the identifiers. The host divides, and the die multiplies by a reciprocal.

  ## What the die is handed

  The control is the same set of lines with two packs exchanged. Every value stays where it was, the total over the set is unchanged, and the decoder's answer for those two lines no longer matches. The console prints both totals and names the two lines that moved, so the identity is read rather than asserted. The die answers red. A sum over the set cannot tell those two files apart.

  Then the lines the part wrote go in, and the die answers green.

  ## The power cut

  The drone's switch cuts the whole rail, the bridge included. When the part comes back it reads seventy-two records from the flash it was writing to, by the same addresses, and the die still holds its answer.

  ## Questions the demo invites

  Q. Is the engine running on the FPGA?

  A. No. The die has no core. It holds the identifiers and a decoder that recomputes the value behind each one, which makes it a second reader of the set rather than a second copy of the engine.

  Q. Is this another database, or a blockchain?

  A. Neither. A database stores and retrieves, and a blockchain needs consensus among parties that do not trust each other. This is a record layer: the address comes from the record itself, so there is no index to maintain and one machine proves its own history without asking anyone.

  Q. Why a part with no operating system instead of a server?

  A. A machine that records what happened in the field has no server under it and no network above it. The engine runs in an arena of about ten kilobytes on the part, and the record lives in the part's own flash, so the next boot reads it by the address it was written at.

  Q. What does a firmware team link?

  A. One C header and a static library built for the target. The header and the library are checked against each other in the artifact the engine ships, so the contract cannot drift from the implementation. Nothing else in the application changes.

  Q. What does the die add that a checksum does not?

  A. It refuses a set whose total is unchanged. The two files differ by two exchanged packs, every line keeps its own value, and the sum over all lines is the same, so a total accepts both and the per-value comparison accepts one.

  Q. Can a second party check a record without the machine?

  A. Yes. The check is the encoding: a party holding the identifiers recomputes the value behind each line with no access to the machine or to any network it was on. That is what the die does here, and it is what an audit by someone else needs.

  Q. What survives a power cut?

  A. The record. It is on the flash rather than in the process, so the boot after the cut finds every record at the address it was written at and re-deposits the same set without growing the volume.

  Q. Does the drone derive the identifiers the die checks?

  A. No. It prints them. The host takes that list from the console and compares the file it builds with the file the die's image was built from, so the only thing the two devices share is what the part wrote.

  Q. Do two machines that never talk arrive at the same address?

  A. Yes. The address is a function of the record's own fields and of nothing else, so a machine given the same fields computes the same address with no channel between them. This take shows one writer and a second reader of the same set.
