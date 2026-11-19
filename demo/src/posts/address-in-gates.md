---
title: "Address derivation in gates"
description: >-
  The die stops checking values a host computed and derives the address itself, so the fabric is a
  second implementation of the address form rather than a checker of the host’s answer.
ktma:
  order: 14
  line: "second-reader"
  products: ["Ktema"]
  platforms: ["fpga"]
  claim: >-
    The address a record is filed under is recomputed from the record in gates, with no processor
    in the path.
---

## Purpose

To establish that the address form is small enough to exist twice: a record and its address both recomputed in gates, so a disagreement is visible without a processor to explain it.

## Procedure

1. Derive the content hash and the base-11172 address from the record, in the fabric.
2. Hand the die a record and the address the host derived, and compare the two.
3. Change one byte of the record and confirm the die derives another address.
4. Report the resources and the clock the design takes on the part.

## Preconditions

- The derivation as a new top in the demonstration directory, never in the standard RTL.
- A record set whose addresses both sides derive.

## Deliverable

A take of the die deriving addresses, with the resources and the timing beside the disagreement.

## Verification

A gate-level recomputation compared with the host.
