---
title: "Integration with a shipped RTOS"
description: "The same engine as a member of an RTOS build, for a team whose product already has one."
ktma:
  order: 16
  line: "attaches-to-what-a-team-ships"
  products: ["Ktema"]
  platforms: ["rtos"]
  claim: >-
    A firmware keeps its platform and gains a record layer in one partition, with no rewrite of
    its drivers.
---

## Purpose

To establish, for a team that already ships an operating system, that the record layer arrives as one partition and one module, with the firmware around it unchanged.

## Procedure

1. Wrap the engine as a module of one RTOS build for one board.
2. Hand it a flash partition and the clocks the RTOS already keeps.
3. Write from a task, reboot, and read back by address.
4. Run the bare-metal scenario on this build too, and compare the two volumes byte for byte.

## Preconditions

- A board the RTOS supports with a spare partition.
- A decision on which RTOS build is first, which the same work answers for the others.

## Deliverable

A take of the module inside a firmware the team did not write for us, and the volume it produced.

## Verification

An integration check on one board.
