---
title: "Reclaiming a full volume"
description: >-
  A device that never stops recording runs out of slot rather than time: the newest record is
  kept, the oldest is retired, and the boundary is read rather than discovered.
ktma:
  order: 13
  line: "record-on-the-machine"
  products: ["Ktema"]
  platforms: ["host"]
  claim: >-
    A volume that fills keeps recording by retiring its oldest records, and a reader is told what
    a wrap retired.
---

## Purpose

To establish the behaviour of a device that records for years: a full volume keeps the newest records, retires the oldest, and reports the boundary instead of leaving a silent gap.

## Procedure

1. Fill a volume past its capacity on a host, then on a part.
2. Read the newest records and the oldest, and show where the boundary sits.
3. State which records a wrap retired and what a reader gets when it asks for one.
4. Measure what a wrap costs the medium.

## Preconditions

- A statement of the retired set that the format can carry.
- A volume small enough to wrap inside a recorded take.

## Deliverable

A take of a volume wrapping, with the boundary read before and after.

## Verification

A check of a volume after it wraps.
