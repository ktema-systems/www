// The words a demonstration is filed under.
//
// The product says whose surface it is; the platform says where the claim is checked. They are two
// axes rather than one because a product appears at several depths, and because the platform is
// what decides what a demonstration may claim: a die with no processor cannot demonstrate a store,
// and a laptop cannot demonstrate a cold boot.
//
// A tag is one execution environment and nothing else, spelled the way the industry spells it.
// Where a demonstration spans two of them it carries two tags rather than a compound label, so the
// coverage of a platform can be read off the set.
//
// The vocabulary is closed here rather than written into prose, so the grid, the map, and a post
// about one of these demonstrations can name the same pair and be filtered by it later.

export const PLATFORMS = {
  'bare-metal': {
    label: 'Bare metal',
    proves: 'the record sits on the part and survives a power cut with nothing between it and the medium',
  },
  rtos: {
    label: 'RTOS',
    proves: 'a firmware keeps its scheduler and gains a record layer in one partition',
  },
  microkernel: {
    label: 'Microkernel',
    proves: "the kernel's certificate stays its owner's, and the record attaches through the medium contract",
  },
  host: {
    label: 'Host',
    proves: 'a service answers at an address in constant cost, and the audit runs offline',
  },
  browser: {
    label: 'Browser',
    proves: 'the record opens in a page with no server behind it',
  },
  fpga: {
    label: 'FPGA',
    proves: 'the address form exists a second time in gates, so verification depends on no writer',
  },
} as const;

export type Platform = keyof typeof PLATFORMS;


/** The platform as the center writes it: a label, and the one thing only that platform shows. */
export const platformOf = (platform: Platform) => PLATFORMS[platform];

/** The platforms a set of demonstrations covers, in the order the vocabulary lists them. */
export const platformsCovered = (platforms: readonly Platform[]): Platform[] =>
  (Object.keys(PLATFORMS) as Platform[]).filter((name) => platforms.includes(name));
