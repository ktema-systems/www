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
  tagline: 'Every act, answerable.',
  description:
    'Ktema Systems makes every autonomous act answerable: a portable record engine with memory that does not grow with the log, an execution layer that binds intent to work, a cockpit that replays the run, governance over what the work may do, and a key that proves who was in control.',
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
    'Ktema is a portable multi-dimensional query engine: working memory does not grow with the log, and a question is answered without an index to maintain.',
} as const;

// Delta is the Single-Space Agentic Operations Platform, with the cockpit as the surface a
// person commands the run from. A campaign is one run inside a project, and a
// finished run is a package that can be replayed and compared.
export const delta = {
  name: 'Delta',
  href: '/delta',
  title: 'the Single-Space Agentic Operations Platform',
  category: 'Single-Space Agentic Operations Platform',
  tagline: 'Every agent, mobilized in one space.',
  description:
    'Delta is the Single-Space Agentic Operations Platform where every kind of autonomous workforce is commanded in one space. It can run over any backend; on the Ktema stack it becomes the accountable mission control.',
} as const;

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

// The fallback strip for a page that carries no nav of its own. The homepage passes
// its own sections, because an anchor points at a section that page carries.
export const defaultNav: readonly NavItem[] = [
  { label: 'Products', href: '/#products', items: productMenu },
  { label: 'Contact', href: '/#contact' },
];

export const companyCta: NavItem = { label: 'Contact', href: '#contact' };

// The demo center is where the surfaces run, so the homepage's call to action opens it. The bar carries the same one:
// its copy is only shown once the hero's has passed under it, so the two are one button that moves.
export const demoCta: NavItem = { label: 'Open the demo center', href: 'https://demo.ktema.systems/' };

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
      'neXus: Content-Addressed State Fabric for Heterogeneous Systems',
    when: 'September 2026',
    href: 'https://doi.org/10.5281/zenodo.22303887',
  },
] as const;
