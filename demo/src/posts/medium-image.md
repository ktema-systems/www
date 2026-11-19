---
title: "The medium read off the device"
description: >-
  The partition a device wrote is dumped and opened on a host, so a reader needs the medium rather
  than the device or a network.
ktma:
  order: 11
  line: "medium-survives-the-cut"
  products: ["Ktema"]
  platforms: ["host"]
  claim: >-
    A device medium is opened on another machine, one address answers, and the time its node
    stamped survives.
---

## Purpose

To establish that a reader who never held the device can answer one address from the bytes it left behind, and see the time the recording node wrote rather than the time of the read.

## Procedure

1. Take the dump the cold-boot demonstration produces.
2. Open it on a host with the audit tool and list the addresses it holds.
3. Ask one address and print the origin, the creator, and the time the node stamped.
4. Ask the same address on the device itself, and put the two answers side by side.

## Preconditions

- The dump from the cold-boot demonstration.
- The address list the audit tool prints, which a device log does not otherwise hand over.

## Deliverable

A terminal take: one address asked on two machines, with the same record and the same time back from each.

## Verification

An audit of a dumped partition.
