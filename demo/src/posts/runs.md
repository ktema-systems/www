---
title: "Headless runs"
description: >-
  Most of what we build is infrastructure, with no front end to open. The demonstration is the
  execution itself, recorded in a terminal: a device and the host writing the same bytes, a power
  cut at every byte, and one C surface on two architectures.
ktma:
  line: "medium-survives-the-cut"
  order: 6
  kind: "runs"
  products: ["Ktema"]
  platforms: ["bare-metal", "host"]
  claim: >-
    A device and a host write the same bytes, a power cut lands at every byte, and one C surface
    runs on two architectures.
  evidence: "A set of recorded runs, replayed from a terminal."
  source: "https://asciinema.org/a/8UfhlLz8SXaISjrS"
  poster: "/proofs/device-tile.png"
  posterAlt: >-
    A terminal still from the device check: the device converged on 0x299bd5d0e1821fab and the
    host tier wrote the same volume, under a footprint of 1136 live bytes and a 3504-byte peak.
  recordings: ["device", "region", "smoke", "c-abi", "faults"]
---


