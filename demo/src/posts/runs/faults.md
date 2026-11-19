---
title: "Three refusals"
description: >-
  A medium that refuses a write, a worn medium, and a channel that holds a write past the end of
  the run.
ktma:
  command: "verify/faults/check.sh"
  href: "https://asciinema.org/a/8QtqYOV6IhY6CIXY"
  poster: "/proofs/faults.png"
  posterAlt: >-
    A terminal replaying the fault check: three runs that each report what the run believed and
    what the medium holds.
  video: "/proofs/faults.mp4"
---

Three runs that leave the medium in a state a restart has to read: a medium that refuses a write and then stops, a medium that refuses from a point onwards, and a channel that holds a write past the end of the run.

What the check reads is the medium rather than the report. A second run opens the same volume and counts, which is what a restart after a power loss does, and every medium left behind opens cleanly.
