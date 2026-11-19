---
title: The light for a value outside the alphabet
description: Five hundred and twelve addresses, ten thousand two hundred and forty values, and one value the die keeps out of the sum and refuses.
date: "2026-11-15"
ktma:
  platforms: [fpga]
  products: [Ktema]
  poster: /proofs/fpga.jpg
  posterAlt: The iCESugar-Pro on the bench, lit and connected, with the ECP5 under the RGB LED that carries the verdict.
  demonstration: /fpga
---

A valve station in a field with no network writes its line pressure once a second for an hour. At
14:02:05 the pressure falls, and the station writes what that second meant as well as what it
measured: the limit it was given, the intent it acted on, and the fact the intent produced. Six
months later the audit asks for that one address and gets all four records back without a search.
The read costs the same at sixty-four records and at three thousand six hundred and one.

The same run hands five hundred and twelve of the volume's addresses to an iCESugar-Pro, twenty
values each, and the ECP5 checks two things. Every value has to be inside the alphabet the engine
writes, which is 11,172 values per axis. And the values have to reach the sum the host computed,
00035CC3 over ten thousand two hundred and forty values. The host divides and the die multiplies by
a reciprocal, so agreement is not the same code run twice.

One value is then moved to 11,172, the first value outside the alphabet. The die counts it as
invalid and keeps it out of the sum, the pin reads 0 and the light is red. The volume's own values
reach the same sum on both sides, the pin reads 1 and the light is green.

A sum over the set would not survive the same test. Two files with values exchanged between them have
the same total, and the die's answer is a property of each line rather than of the set.
