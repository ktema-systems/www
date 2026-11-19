---
title: "The record round trip"
description: "Thirteen steps, eight records, one digest: the same run the device tier converges on."
ktma:
  command: "target/debug/ktema-sim verify/scenarios/smoke.txt target/demo/smoke --reset"
  href: "https://asciinema.org/a/mysRyRmijvsN4OKB"
  poster: "/proofs/smoke.png"
  posterAlt: >-
    A terminal replaying the thirteen-step scenario: writes at two clocks, six window queries, a
    listing and a flush, ending on the digest 0x299bd5d0e1821fab.
  video: "/proofs/smoke.mp4"
---

Thirteen steps over a volume: writes at two clocks, six window queries over the time axis, a listing and a flush. Each step states what it expects, and the run reports each one as it happens.

The run ends on the digest 0x299bd5d0e1821fab, the same digest the device tier and the host converge on. The scenario is a text file: the run and the device-tier check read the same source.
