---
title: "The red light on a wrong value"
description: >-
  What a system measured, what happened, and what an audit asks later all resolve at one address,
  without a search. The read costs the same at 64 records and at 3,601. The same run hands 512 of
  those addresses to an FPGA: one value changed turns the light red, and the passing set is
  recomputed by an arithmetic the host does not share.
ktma:
  id: "fpga-icesugarpro-audit"
  line: "second-reader"
  order: 3
  kind: "video"
  products: ["Ktema"]
  platforms: ["fpga"]
  claim: >-
    Every value the die is handed is inside the alphabet, and one value outside it is refused
    rather than summed.
  evidence: "A gate-level recomputation of the values, on the part."
  source: "/proofs/fpga-take.mp4"
  poster: "/proofs/fpga.jpg"
  posterAlt: >-
    The iCESugar-Pro board, lit and connected, with the ECP5 under the RGB LED that carries the
    verdict.
  facts:
    - label: "Records written"
      value: "3,600 readings, one a second for an hour"
    - label: "Records in the volume"
      value: "3,601: the readings and the incident's conclusion"
    - label: "A point read, at 64 and at 3,601 records"
      value: "1 framing read, 3 fact reads, 0 listing reads"
    - label: "Addresses handed to the die"
      value: "512"
    - label: "Values the die checks"
      value: "10,240, twenty per address"
    - label: "Sum both implementations reach"
      value: "00035CC3, over 10,240 values"
    - label: "Board"
      value: "iCESugar-Pro v1.3, ECP5-25F, 24,288 LUT, 56 x 16 kbit, 28 multipliers"
---

## The scenario
  
  A valve station in a field with no network writes its line pressure once a second for an hour. At 14:02:05 the pressure falls, and the station writes what that second meant as well as what it measured: the limit it was given, the intent it acted on, and the fact the intent produced. Six months later the audit asks for that one address and gets all four records back without a search.
  
  ## What the part does
  
  The board is an iCESugar-Pro with an ECP5-25F on it. It is handed 512 of the volume's addresses, twenty values each, and checks two things: that every value is inside the alphabet the engine writes, and that the values reach the sum the host computed. The host divides and the die multiplies by a reciprocal, so agreement is not the same code run twice.
  
  One value moved to 11,172, the first value outside the alphabet, is counted as invalid and kept out of the sum: the pin reads 0 and the LED is red. The volume's own values reach the same sum on both sides: the pin reads 1 and the LED is green.

  ## Questions the demo invites

  Q. Is this another database, or a blockchain?

  A. Neither. A database stores and retrieves, and a blockchain needs consensus among parties that do not trust each other. This is a record layer: the address comes from the record itself, so there is no index to maintain and no consensus needed for one machine to prove its own history.

  Q. Why a board, when the host can run the same check? Is checking the host with the host not a conflict of interest?

  A. It is, which is why the second opinion comes from outside the host. The host computes 512 addresses by division and the die computes them by reciprocal multiplication, so agreement is two methods reaching one value rather than one program run twice. Two parties who share no method and no channel reach the same value and find out months later.

  Q. Does the board prove cryptographic integrity?

  A. No, and it does not claim to. It shows two narrower things: every value handed to it is inside the alphabet the engine writes, and independent arithmetic reaches the sum the host computed. Tamper-evident sealing and signatures belong to Kleis, and the demo keeps the two apart.

  Q. Does a lookup cost more as the volume grows?

  A. No. A point read is one framing read and three fact reads at 64 records and at 3,601. The cost follows the depth of the coordinate, not the size of the volume.

  Q. What happens when the network drops or the power fails?

  A. The engine writes to the local medium and keeps going. The address a writer computes is the address a reader computes later, so a restart has nothing to rebuild. The device-tier recording cuts the last append at the point a power loss would leave it, and the run after it converges on the same volume.
