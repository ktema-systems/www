import { demoCta, papers, site } from './config';

// The addresses the corpus cannot state as page text: the papers, which live off the site,
// and the places the company is reached. Everything else the corpus carries is a page.
export const references: string[] = [
  ...papers.map((paper) => `- [${paper.title}](${paper.href}): published ${paper.when}`),
  `- [${demoCta.label}](${demoCta.href})`,
  `- [${demoCta.label} as text](${new URL('llms.txt', demoCta.href).href}): every surface, run, and bay, in one file.`,
  `- [Email](mailto:${site.contact})`,
  `- [Documentation](${site.docs})`,
  `- [Source](${site.github})`,
];
