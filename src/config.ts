export const site = {
  name: 'Ktema',
  legalName: 'Ktema Systems',
  tagline: 'The coordinate is the index.',
  description:
    'Ktema answers multi-axis queries on a device with no operating system. The coordinate is the index: 4,309 bytes of live heap, no index structure, no OS.',
  logo: '/logo.png',
  github: 'https://github.com/ktema-systems',
  docs: 'https://docs.ssccs.org',
  rem: 'https://rem.ssccs.org',
  linkedin: 'https://www.linkedin.com/in/stells',
  // The shared address on the SSCCS documentation footer.
  contact: 'contact@ssccs.org',
} as const;

export const nav = [
  { id: 'problem', label: 'Problem' },
  { id: 'why-now', label: 'Why now' },
  { id: 'insight', label: 'Insight' },
  { id: 'product', label: 'Product' },
  { id: 'proof', label: 'Proof' },
  { id: 'market', label: 'Market' },
  { id: 'founder', label: 'Founder' },
] as const;

export const papers = [
  {
    title: 'SSCCS, the computing model the coordinate space belongs to',
    when: 'February 2026',
    href: 'https://doi.org/10.5281/zenodo.18759106',
  },
  {
    title: 'Tagma, the hashless coordinate space',
    when: 'July 2026',
    href: 'https://doi.org/10.5281/zenodo.21302508',
  },
  {
    title: 'The applied measurement',
    when: 'August 2026',
    href: 'https://doi.org/10.5281/zenodo.21888670',
  },
] as const;
