---
title: "The walk, recorded end to end"
description: >-
  A walking robot as the room a device answers in: every step, sensor reading and phone reach
  recorded at one address.
ktma:
  order: 18
  line: "cockpit-over-the-record"
  products: ["Kletos"]
  platforms: ["browser", "host"]
  claim: >-
    A walk's steps, sensor readings and phone reaches resolve at one address, and an audit that
    never met the robot finds them.
---

## Purpose

To establish the whole stack in one room: a machine whose work, the readings it acted on, and the limits it was given are one record, watchable while it walks and answerable afterwards without the robot.

## Procedure

1. Run the engine on the robot's host and record a walk as facts, intents and hints.
2. Serve the cockpit over that same volume, so the walk is visible while it happens.
3. Cut the link mid-walk, keep recording, and restore it.
4. Ask one address afterwards from a machine that never met the robot.

## Preconditions

- The robot host's first saved dataset, since the cockpit reads mock data today.
- A recording of the walk that a reader can follow beside the page.

## Deliverable

A recorded walk with the cockpit beside it, and one address asked after the fact.

## Verification

A recorded walk, audited offline.
