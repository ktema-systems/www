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
    'Ktema Systems makes autonomous machines answerable: a deterministic record on the device, a cockpit that replays any decision, and a key that proves who was in control.',
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
    'Ktema is the deterministic storage engine that answers multi-dimensional queries on hardware that cannot run a database. It needs no index structure and no operating system.',
} as const;

// Delta is the Single Space Agentic AI Operation Platform, with the cockpit as the surface a
// person commands the run from. A campaign is one run inside a project, and a
// finished run is a package that can be replayed and compared.
export const delta = {
  name: 'Delta',
  href: '/delta',
  title: 'the Single Space Agentic AI Operation Platform',
  tagline: 'Every kind of autonomous workforce in one space.',
  description:
    'Delta is the Single Space Agentic AI Operation Platform where every kind of autonomous workforce is commanded in one space. It can run over any backend; on the Ktema stack it becomes the accountable mission control.',
} as const;

// The three lines that state the three layers. The first two are the wings as they
// are already published; the third completes them for the governance layer.
export const creed = [
  { product: 'Ktema', line: 'Machine answers.' },
  { product: 'Kletos', line: 'Intent delivers.' },
  { product: 'Krisis', line: 'Judgment governs.' },
] as const;

// The three lines as one, for the masthead-height slot on the home page. It is the
// three products' own promises in one breath, which is what the page goes on to show.
export const creedLine = creed.map((entry) => entry.line).join(' ');

export type NavLink = { label: string; href: string; note?: string };

export type NavItem = { label: string; href: string; items?: readonly NavLink[] };

// The products the strip's Products item opens. Every product has a page of its
// own, so the menu is the way between them.
export const productMenu: readonly NavLink[] = [
  { label: 'Ktema', note: 'the black box', href: product.href },
  { label: 'Kletos', note: 'the autopilot', href: '/kletos' },
  { label: 'Krisis', note: 'the authority', href: '/krisis' },
  { label: 'Delta', note: 'the cockpit', href: delta.href },
  { label: 'Telos', note: 'the transport', href: '/telos' },
  { label: 'Kleis', note: 'the seal', href: '/kleis' },
];

// Each page carries its own strip, and the anchor hrefs are relative to the page
// that renders them. The strip is what the masthead scrolls sideways, and the call
// to action beside it is the one link the page is trying to earn.
export const companyNav: readonly NavItem[] = [
  { label: 'Products', href: '#products', items: productMenu },
  { label: 'Cases', href: '#cases' },
  { label: 'Partners', href: '#partners' },
  { label: 'Contact', href: '#contact' },
];

export const companyCta: NavItem = { label: 'Get in touch', href: '#contact' };

export const deltaNav: readonly NavItem[] = [
  { label: 'The loop', href: '#loop' },
  { label: 'Campaigns', href: '#campaigns' },
  { label: 'Contact', href: '#contact' },
];

export const deltaCta: NavItem = { label: 'Get in touch', href: '#contact' };

export const productNav: readonly NavItem[] = [
  { label: 'Overview', href: '#product' },
  { label: 'Proof', href: '#proof' },
  { label: 'Contact', href: '#contact' },
];

export const productCta: NavItem = { label: 'Get in touch', href: '#contact' };

// The strip a product page carries. It holds no Products entry: the page arrives
// with the panel unfolded, so the panel is the menu, and an entry that opens it
// would be the second way to do what is already done.
export const productPageNav: readonly NavItem[] = [{ label: 'Contact', href: '#contact' }];

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
