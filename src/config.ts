export const site = {
  name: 'Ktema',
  legalName: 'Ktema Systems',
  // The company does not exist yet, so wherever the entity is named as if it did
  // it carries this qualifier. The preprints use the same one on the affiliation
  // line.
  legalStatus: 'pre-incorporation',
  // The base the company runs from. The site states where the team works, not
  // where the entity may be registered.
  base: 'Europe',
  tagline: 'The machine answers.',
  description:
    'Ktema answers multi-axis queries on a device that cannot run a database. The coordinate is the index, with no index structure and no operating system.',
  github: 'https://github.com/ktema-systems',
  docs: 'https://docs.ktema.systems',
  // The address published on the documentation footer.
  contact: 'hello@ktema.systems',
} as const;

export const nav = [
  { id: 'product', label: 'Product' },
  { id: 'proof', label: 'Proof' },
  { id: 'why-now', label: 'Why now' },
  { id: 'competition', label: 'Competition' },
] as const;

export const papers = [
  {
    title: 'Schema–Segment Composition Computing System',
    when: 'February 2026',
    href: 'https://doi.org/10.5281/zenodo.18759106',
  },
  {
    title: 'Tagma: Hashless spatial primitive on a fixed 16-bit, 3-axis Unicode composition space',
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
      'neXus: A heterogeneous coordinate-addressed runtime network for agents and executable systems',
    when: 'September 2026',
    href: 'https://doi.org/10.5281/zenodo.22303887',
  },
] as const;
