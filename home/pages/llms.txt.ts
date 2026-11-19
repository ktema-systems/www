import type { APIRoute } from 'astro';
import { demoCta, papers, productMenu, site } from '../config';

// The llms.txt index (https://llmstxt.org): what a model reads before the pages, so the
// stack is legible in one request. Product names, order, and links come from config.ts, so
// the index cannot list a page the navigation dropped.
//
// Each blurb is a line a reader can scan rather than a copy of the page metadata. The loop
// below refuses a product the menu carries and this table does not describe, so a new
// product fails the build instead of shipping an index that omits it.
const productLines: Record<string, string> = {
  Ktema:
    'A portable multi-dimensional query engine: working memory does not grow with the log, and a question is answered without an index to maintain.',
  Kletos:
    'The execution layer: an ask, the work it becomes, and the result stay one record, and the layer drives the software, signals, hardware, people, and outside systems that do the work.',
  Krisis:
    'The governance layer: it bounds the range a record has narrowed, declares the terms a deployment acts under, and withholds work that leaves them.',
  Delta:
    'The Single-Space Agentic Operations Platform, where every kind of autonomous workforce is read in one space. It can run over any backend; on the Ktema stack it becomes the accountable cockpit.',
  Telos:
    'The transport layer: the operator stands where the work is, work is named by the place it belongs to, and a live run travels between machines.',
  Kleis:
    'The authorization layer: a key wakes the machine, the record is sealed to its carrier, and the acts that cannot be undone take two keys.',
};

// The demonstration line is the only sentence here without a home in config.ts: the
// navigation carries the link and the label, and the card copy is this index's own.
const demoLine = 'The cockpit, the engine’s recorded runs, and hardware on the bench, in one place.';

export const GET: APIRoute = ({ site: origin }) => {
  const base = origin ?? new URL('https://ktema.systems');
  const url = (path: string) => new URL(path, base).href;

  const missing = productMenu.filter((item) => !(item.label in productLines));
  if (missing.length > 0) {
    throw new Error(
      `llms.txt has no line for ${missing.map((item) => item.label).join(', ')}: ` +
        'add one to productLines in home/pages/llms.txt.ts',
    );
  }

  const text = [
    `# ${site.name}`,
    '',
    `> ${site.tagline}`,
    '',
    site.description,
    '',
    `The whole site is also available as one file: [llms-full.txt](${url('/llms-full.txt')}).`,
    '',
    '## Products',
    '',
    ...productMenu.map((item) => `- [${item.label}](${url(item.href)}): ${productLines[item.label]}`),
    '',
    '## Papers',
    '',
    ...papers.map((paper) => `- [${paper.title}](${paper.href}): published ${paper.when}`),
    '',
    '## Demonstration',
    '',
    `- [${demoCta.label}](${demoCta.href}): ${demoLine}`,
    `- [${demoCta.label} index](${new URL('llms.txt', demoCta.href).href}): every surface, recorded run, and planned bay in the center.`,
    '',
    '## Contact',
    '',
    `- [Email](mailto:${site.contact})`,
    '',
    '## Optional',
    '',
    `- [Documentation](${site.docs})`,
    `- [Source](${site.github})`,
    '',
  ].join('\n');

  return new Response(text, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
