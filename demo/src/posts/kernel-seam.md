---
title: "The medium contract at a kernel boundary"
description: >-
  The seam written down rather than a port attempted: what a certified layer must hand over for
  the record to hold above it.
ktma:
  order: 17
  line: "attaches-to-what-a-team-ships"
  products: ["Ktema"]
  platforms: ["microkernel"]
  claim: >-
    The kernel's certificate is its owner's; the record layer attaches through the medium contract
    and adds none of it.
---

## Purpose

To separate what a certified kernel provides from what this layer provides, so a team that already holds the first can attach the second without either vouching for the other.

## Procedure

1. State the medium contract in the kernel vocabulary: what a component supplies, and what it may assume.
2. Name what this layer does not provide and will not: isolation, attestation, scheduling.
3. Work one example through on paper, with every call mapped to the contract.
4. Take the seam to the kernel owner for review before any implementation is proposed.

## Preconditions

- A counterpart who owns a certified kernel build.
- Their review, since an unreviewed seam is the port this demonstration exists to avoid.

## Deliverable

A written seam reviewed by the layer that owns the certificate: a document, not a take.

## Verification

A review of the seam by the layer's owner.
