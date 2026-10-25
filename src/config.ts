// The company's own site: the root is Ktema Systems, and the engine has its own
// page under it. Everything that names the entity, its products, or its links is
// read from here, so the two pages cannot drift apart.
export const site = {
  name: 'Ktema Systems',
  // The masthead carries the whole name while the bar has room for it and the short
  // one below that, because the name, the strip and the call to action share one row.
  short: 'Ktema',
  legalName: 'Ktema Systems',
  // The company does not exist yet, so wherever the entity is named as if it did
  // it carries this qualifier. The preprints use the same one on the affiliation
  // line.
  legalStatus: 'pre-incorporation',
  tagline: 'Machine answers.',
  description:
    'Ktema Systems makes autonomous machines answerable: a record engine that keeps a machine\'s whole history at a fixed cost in memory and time, a cockpit that replays the run, and a key that proves who was in control.',
  github: 'https://github.com/ktema-systems',
  docs: 'https://docs.ktema.systems',
  // The address published on the documentation footer.
  contact: 'hello@ktema.systems',
} as const;

// The storage engine, which is the first product and the one with a page of its
// own. Its description is the engine's own claim, and it is what the product page
// publishes in its metadata.
export const product = {
  name: 'Ktema',
  href: '/ktema',
  description:
    'Ktema is the record engine whose address is the index: a record costs the same with a thousand in the log or ten thousand, and a question is answered from the address.',
} as const;

// Delta is the Single Space Agentic AI Operation Platform, with the cockpit as the surface a
// person commands the run from. A campaign is one run inside a project, and a
// finished run is a package that can be replayed and compared.
export const delta = {
  name: 'Delta',
  href: '/delta',
  title: 'the Single Space Agentic AI Operation Platform',
  tagline: 'Every agentic entity in one space.',
  description:
    'Delta is the Single Space Agentic AI Operation Platform where every kind of autonomous workforce is commanded in one space. It can run over any backend; on the Ktema stack it becomes the accountable mission control.',
} as const;

// The three lines that state the three layers. The first two are the wings as they
// are already published; the third completes them for the governance layer.
export const creed = [
  { product: 'Ktema', line: 'Deterministic Record.' },
  { product: 'Kletos', line: 'Accountable Execution.' },
  { product: 'Krisis', line: 'Portable Control.' },
] as const;

// The three lines as one, for the masthead-height slot on the home page. It is the
// three products' own promises in one breath, which is what the page goes on to show.
export const creedLine = creed.map((entry) => entry.line).join(' ');

export type NavLink = { label: string; href: string; note?: string };

export type NavItem = { label: string; href: string; items?: readonly NavLink[] };

// The products the strip's Products item opens. Every product has a page of its
// own, so the menu is the way between them.
export const productMenu: readonly NavLink[] = [
  { label: 'Ktema', note: 'Record', href: product.href },
  { label: 'Kletos', note: 'Execution', href: '/kletos' },
  { label: 'Krisis', note: 'Judgment', href: '/krisis' },
  { label: 'Delta', note: 'Operation', href: delta.href },
  { label: 'Telos', note: 'Transport', href: '/telos' },
  { label: 'Kleis', note: 'Authorization', href: '/kleis' },
];

// One definition of the homepage's sections drives both the page and the header, so
// a label or an anchor cannot drift between them. The page renders in this order.
export const homeSections = {
  cases: { label: 'Cases', id: 'cases' },
  stack: { label: 'Stack', id: 'products' },
  device: { label: 'Validation', id: 'device' },
  operations: { label: 'Operations', id: 'delta' },
  fit: { label: 'Fit', id: 'partners' },
  contact: { label: 'Contact', id: 'contact' },
} as const;

export const homeSectionOrder = [
  'cases',
  'stack',
  'device',
  'operations',
  'fit',
  'contact',
] as const;

export const companyNav: readonly NavItem[] = homeSectionOrder.map((key) => ({
  label: homeSections[key].label,
  href: `#${homeSections[key].id}`,
  ...(key === 'stack' ? { items: productMenu } : {}),
}));

export const companyCta: NavItem = { label: 'Get in touch', href: '#contact' };

export const deltaNav: readonly NavItem[] = [
  { label: 'Operations', href: '#operations' },
  { label: 'The seat', href: '#seat' },
  { label: 'The loop', href: '#loop' },
  { label: 'Campaigns', href: '#campaigns' },
  { label: 'Contact', href: '#contact' },
];

export const deltaCta: NavItem = { label: 'Get in touch', href: '#contact' };

export const productNav: readonly NavItem[] = [
  { label: 'Why', href: '#why' },
  { label: 'Engine', href: '#engine' },
  { label: 'Proof', href: '#proof' },
  { label: 'Device', href: '#device-run' },
  { label: 'Product', href: '#product' },
  { label: 'Contact', href: '#contact' },
];

export const productCta: NavItem = { label: 'Get in touch', href: '#contact' };

export const papers = [
  {
    title: 'Schema–Segment Composition Computing System',
    when: 'February 2026',
    href: 'https://doi.org/10.5281/zenodo.18759106',
  },
  {
    title: 'Tagma: Hashless coordinate primitive in the fixed 16-bit Unicode composition block',
    when: 'July 2026',
    href: 'https://doi.org/10.5281/zenodo.21302508',
  },
  {
    title: "Coordinate-indexed addressing for ROOT TTree I/O overhead for CERN's HEP analytics",
    when: 'August 2026',
    href: 'https://doi.org/10.5281/zenodo.21888670',
  },
  {
    title:
      'neXus: Peer-to-peer state fabric for agents and storage, from microcontrollers to data centers',
    when: 'September 2026',
    href: 'https://doi.org/10.5281/zenodo.22303887',
  },
] as const;
