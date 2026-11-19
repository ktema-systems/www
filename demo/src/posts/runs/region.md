---
title: "The power cut at every byte"
description: >-
  The log is cut at each byte of its last record and every sixty-fourth byte after it. Every run
  opens, and none finds a record that was not there.
ktma:
  command: "verify/region/check.sh"
  href: "https://asciinema.org/a/tdsX5GReAen6H0ua"
  poster: "/proofs/region.png"
  posterAlt: >-
    A terminal replaying the power-cut sweep: the cuts and the runs after them, ending with the
    volume converging on 0x299bd5d0e1821fab.
  video: "/proofs/region.mp4"
---

The region medium is the byte region a device holds at a fixed address, kept in a file. The check writes a volume, cuts the log at every byte of the last record and at every sixty-fourth byte of the rest, and opens what is left. It then changes every byte of the region header and every 128th byte of the log, which is the hazard a cut does not produce.

Every run opens, and none finds a record that was not there. The header refuses the eight bytes of magic and the four of version, checks the segment size, and does not read the rest. This is the durability claim as a sweep rather than a case someone reasoned about.
