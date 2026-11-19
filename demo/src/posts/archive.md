---
title: "The release that checks itself"
description: >-
  What a firmware team is handed: a header, a library per target, the specification, and an
  example that links and exits zero.
ktma:
  order: 15
  line: "attaches-to-what-a-team-ships"
  products: ["Ktema"]
  platforms: ["bare-metal", "host"]
  claim: >-
    The archive a team receives builds its own example, runs it, and counts the entry points it
    carries.
---

## Purpose

To establish that what a team receives checks itself before it is linked: every target class built from one revision, the example run from the unpacked archive, and the entry points counted against the header.

## Procedure

1. Assemble the release bundle for each target class the host can build.
2. Unpack the archive into an empty directory, build the example from it, and run it.
3. Compare the entry points the library exports with the ones the header declares.
4. Publish the bundle at an address the demonstration can link to.

## Preconditions

- An address to serve the archive from.
- The licence terms an evaluation copy is distributed under.

## Deliverable

A download, its manifest, and the counts the example printed.

## Verification

A packaging check of the released archive.
