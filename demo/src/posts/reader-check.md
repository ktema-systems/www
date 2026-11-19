---
title: "Payload verification at the call site"
description: >-
  The check a reader makes instead of trusting the writer, taken on a host where a byte can be
  changed and the answer compared.
ktma:
  order: 12
  line: "second-reader"
  products: ["Ktema"]
  platforms: ["host"]
  claim: >-
    A read hands over the bytes on the medium, and one call says whether they are the record the
    address names.
---

## Purpose

To establish what a read does and does not tell a reader: the bytes come back as they are on the medium, and one call is what says whether they are the record.

## Procedure

1. Write a record, ask the check, and read it back intact.
2. Change one byte of the payload on the medium and ask again, so the two hashes are printed side by side.
3. Read the same address without the check, and show the changed bytes arriving as a record.
4. Reopen the volume and state what a pass over it can tell and what it cannot, including the damage it cannot see.

## Preconditions

- The entry points that already exist, on the C surface and in the engine.
- A take recorded against a real medium rather than a test fixture.

## Deliverable

A terminal take of one call in three states, and the list of damage it does not catch.

## Verification

A corruption test on one record.
