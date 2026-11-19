---
title: "One test body, two architectures"
description: >-
  The same C test body linked from C and run under QEMU on a Cortex-M4 and a RISC-V core, with the
  same fifteen measurements on both.
ktma:
  command: "demo/tools/record/proof-capi-arch.sh"
  href: "https://asciinema.org/a/qKmoAREJtuVC2hej"
  poster: "/proofs/c-abi.png"
  posterAlt: >-
    A terminal replaying the C surface on a Cortex-M4 and on a RISC-V core: both report the same
    fifteen measurements, ending with PASS: C surface round trip.
  video: "/proofs/c-abi.mp4"
---

The C test body is shared: verify/capi/test.c is 2,182 lines, and only the platform hooks and the linker script differ. The session links it for a Cortex-M4 and for a RISC-V core, runs both under QEMU, and compares the measurement lines.

Both report the same fifteen measurements, from the read path per record to the peak footprint inside a 65,536-byte arena. That is what architecture neutrality is worth once it is run rather than asserted.
