---
title: Two readers, one power cut
description: A part with no operating system records a flight, a die recomputes the same values by another arithmetic, and the rail is cut between the one and the other.
date: "2026-11-17"
ktma:
  platforms: [bare-metal, fpga]
  products: [Ktema]
  poster: /proofs/witness.jpg
  posterAlt: The LiteWing flight controller on the left and the iCESugar-Pro on the right, the ECP5 lit green after the die agreed with the record set.
  demonstration: /witness
---

The flight controller is an ESP32-S3 with no operating system under it. The firmware links one C
header, hands the engine an arena, and writes its records into the part's own flash. A record's
address is computed from the record's own fields, so the address is the index and there is no index
structure to build, store, or keep consistent.

The layout has four axes, flight, subsystem, event and severity, which is seventy-two points. The
part writes one record at each point and reads every one of them back by its own address in the
same boot. Two box queries follow, answered from the record keys alone: eight records in 2.1 ms,
nine in 1.9 ms.

A host then carries the identifiers the part printed to an ECP5 on an iCESugar-Pro, unchanged. The
die recomputes the value behind each of the fourteen hundred and forty lines and compares the result
with the pack the line carries. Its answer is one pin: green when every line agrees, red when one
does not. The two implementations share nothing but the identifiers, because the host divides and
the die multiplies by a reciprocal.

The control is the same set of lines with two packs exchanged. Every value stays where it was and the
total over the set is unchanged, so a sum over the set cannot tell the two files apart. The die can,
because it does not read the total: it names the two lines that moved and answers red. Handing it the
lines the part wrote returns green.

The drone's switch then cuts the whole rail, the bridge included. On the next boot the part reads
seventy-two records from the flash it was writing to, by the same addresses, and the die still holds
its answer.
