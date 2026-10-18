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
    'Ktema Systems builds the layers an autonomous system runs on: the record it keeps, the work it performs, the judgement over both, and the cockpit where intent enters, down to hardware that cannot run a database.',
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
    'Ktema answers multi-axis queries on a device that cannot run a database. The coordinate is the index, with no index structure and no operating system.',
} as const;

// Delta is the cockpit and its campaigns. A campaign is one run inside a project,
// and a finished run is a package that can be replayed and compared.
export const delta = {
  name: 'Delta',
  href: '/delta',
  title: 'the cockpit for the run',
  tagline: 'The cockpit where intent enters the run.',
  description:
    'Delta is the cockpit where a person enters intent while an autonomous system is running. It shows what is moving, who claimed it, what bounded it, and what changed.',
} as const;

// The three lines that state the three layers. The first two are the wings as they
// are already published; the third completes them for the governance layer.
export const creed = [
  { product: 'Ktema', line: 'Machine answers.' },
  { product: 'Kletos', line: 'Intent delivers.' },
  { product: 'Krisis', line: 'Judgment governs.' },
] as const;

// The three lines as one, for the masthead-height slot on the home page.
export const creedLine = creed.map((entry) => entry.line).join(' ');

export type NavLink = { label: string; href: string; note?: string };

export type NavItem = { label: string; href: string; items?: readonly NavLink[] };

// The products the strip's Products item opens. Each link is an anchor on the
// company page, so the menu is a shortcut to a section rather than a second page.
export const productMenu: readonly NavLink[] = [
  { label: 'Ktema', note: 'the record', href: product.href },
  { label: 'Kletos', note: 'the execution', href: '/#product-kletos' },
  { label: 'Krisis', note: 'the constraints and judgment', href: '/#product-krisis' },
  { label: 'Delta', note: 'the cockpit', href: delta.href },
];

// Each page carries its own strip, and the anchor hrefs are relative to the page
// that renders them. The strip is what the masthead scrolls sideways, and the call
// to action beside it is the one link the page is trying to earn.
export const companyNav: readonly NavItem[] = [
  { label: 'Cases', href: '#cases' },
  { label: 'Products', href: '#products', items: productMenu },
  { label: 'Partners', href: '#partners' },
  { label: 'Contact', href: '#contact' },
];

export const companyCta: NavItem = { label: 'Get in touch', href: '#contact' };

export const deltaNav: readonly NavItem[] = [
  { label: 'The loop', href: '#loop' },
  { label: 'Cockpit', href: '#cockpit' },
  { label: 'Products', href: '#loop', items: productMenu },
  { label: 'Contact', href: '#contact' },
];

export const deltaCta: NavItem = { label: 'Get in touch', href: '#contact' };

export const productNav: readonly NavItem[] = [
  { label: 'Product', href: '#product' },
  { label: 'Proof', href: '#proof' },
  { label: 'Why now', href: '#why-now' },
  { label: 'Competition', href: '#competition' },
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
