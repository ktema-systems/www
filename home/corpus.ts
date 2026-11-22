import { corpusHub, corpusViewer, papers, site } from './config';

// The line the index carries under its name. The site states it once, in config.ts.
export const summary = site.description;

// The addresses the corpus cannot state as page text: the papers, which live off the site,
// and the places the company is reached. Everything else the corpus carries is a page.
export const references: string[] = [
  ...papers.map((paper) => `- [${paper.title}](${paper.href}): published ${paper.when}`),
  `- [${corpusHub.label}](${corpusHub.href})`,
  `- [${corpusViewer.label}](${corpusViewer.href}): the hub as a board, whose entries open the page they belong to.`,
  `- [${corpusHub.label} as text](${new URL('llms.txt', corpusHub.href).href}): the index that links every surface, run, and bay.`,
  `- [Email](mailto:${site.contact})`,
  `- [Documentation](${site.docs})`,
  `- [Source](${site.github})`,
];
