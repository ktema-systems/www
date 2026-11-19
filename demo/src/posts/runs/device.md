---
title: "The device and the host agree"
description: >-
  A RISC-V device tier and the host write the same volume, byte for byte: 0x299bd5d0e1821fab on
  both.
ktma:
  command: "verify/device/check.sh"
  href: "https://asciinema.org/a/8UfhlLz8SXaISjrS"
  poster: "/proofs/device.png"
  posterAlt: >-
    A terminal replaying the device-tier check: the scenario runs on a RISC-V board, the host
    writes the same volume, and both report the digest 0x299bd5d0e1821fab.
  video: "/proofs/device.mp4"
---

The same scenario runs twice: once on a RISC-V device tier over a byte region at 0x80062000, and once on the host over a region of the same kind. The two regions are compared byte for byte, and both runs converge on the digest 0x299bd5d0e1821fab.

The check then cuts the last append at the point a power loss would leave it, reads the volume again, and confirms the run after that converges on the same volume. There is no host process in the device path and no database under either.
