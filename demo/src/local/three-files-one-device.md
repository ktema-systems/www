---
title: "Three files, one device"
description: >-
  Each artifact in a multi-domain build passes the check its own tool runs, and the assembled device can
  still make no sense. The check that holds is one invariant every layer answers, read back from the
  part.
ktma:
  order: 19
  line: "the-assembly-is-the-check"
  products: ["Ktema"]
  platforms: ["host", "fpga"]
  claim: >-
    A device assembled from separately valid artifacts is only as sound as the invariant that crosses
    them, and the device has to answer that invariant in its own arithmetic.
---

## Purpose

To name the failure the parts cannot see. A layout whose design rule check is clean, an image that boots, a parts list that matches its drawing: each of those is a statement about one artifact, made by the tool that produced it. None of them is a statement about the device the three become, and the assembled device can still make no sense.

This case holds the opposite arrangement. One invariant is written once, the software reference answers it, and the device answers it in its own arithmetic. The answer is read back from the part.

## Procedure

1. Assemble a device whose artifacts come from different tools: a placed layout, an image, and the record set the image writes.
2. Run each artifact's own check, and keep every report beside the assembled run.
3. Have the device answer the invariant from the values it is given, with no expected answer from the host in reach.
4. Move one value in the set and read the device's answer again.

## Preconditions

- An invariant the software reference computes and the device can compute independently.
- A device that can be wrong in a way its own checks do not see: a value exchanged between two records, or a bound taken from the host.

## Deliverable

A recorded assembly in which every local check passes, the device's answer fails, and the failing answer names a value a person can act on.

## Verification

The device's answer held against the software reference at the same addresses, with the local reports printed beside it, so a reader sees that passing them was never the claim.
