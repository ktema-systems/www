---
title: "Cold boot on the part"
description: >-
  The LiteWing on the bench, switched on with nothing recorded, taking the record of a flight into
  its own flash and showing what the next boot reads.
ktma:
  order: 10
  line: "record-on-the-machine"
  products: ["Ktema"]
  platforms: ["bare-metal"]
  claim: >-
    The engine writes into the part's own flash from a cold boot and reports the counts the next
    boot finds.
---

## Purpose

To establish, on the part itself, that a machine with nothing recorded can keep its own history: the record is written while the part is doing the work, and the next boot reads it back by address with no host in the loop.

## Procedure

1. Link the C surface into the firmware and give it a flash partition of its own.
2. Power on with the volume empty, fly, and let the part write the record as it goes.
3. Cut the rail in the middle of a write, restore it, and have the firmware print the addresses it finds and the counts it holds.
4. Dump the partition and compare it byte for byte with the same volume opened on a host.

## Preconditions

- The LiteWing's chip confirmed on the bench, since the firmware and the partition table target the ESP32-S3.
- A partition table that leaves room for the record on a 4 MB part.
- A flash medium the channel layer already models, wired to the part.

## Deliverable

A recorded take of the two boots, with the counts the firmware prints and the addresses it names, and the dump opened beside it.

## Verification

A device check on the part's own flash.
