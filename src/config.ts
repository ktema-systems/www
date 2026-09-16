export const site = {
  name: 'Ktema',
  legalName: 'Ktema Systems',
  // The company does not exist yet, so wherever the entity is named as if it did
  // it carries this qualifier. The preprints use the same one on the affiliation
  // line.
  legalStatus: 'pre-incorporation',
  tagline: 'The machine remembers.',
  description:
    'Ktema answers multi-axis queries on a device with no operating system. The coordinate is the index: 4,309 bytes of live heap, no index structure, no OS.',
  github: 'https://github.com/ktema-systems',
  docs: 'https://docs.ssccs.org',
  // The address published on the documentation footer.
  contact: 'ktema@ssccs.org',
} as const;

export const nav = [
  { id: 'problem', label: 'Problem' },
  { id: 'why-now', label: 'Why now' },
  { id: 'insight', label: 'Insight' },
  { id: 'product', label: 'Product' },
  { id: 'proof', label: 'Proof' },
  { id: 'market', label: 'Market' },
  { id: 'competition', label: 'Competition' },
  { id: 'moat', label: 'Moat' },
] as const;

export const papers = [
  {
    title: 'Schema–Segment Composition Computing System',
    when: 'February 2026',
    href: 'https://doi.org/10.5281/zenodo.18759106',
  },
  {
    title: 'Tagma: Hashless spatial primitive on a fixed 16-bit Unicode, 3-axis composition space',
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
