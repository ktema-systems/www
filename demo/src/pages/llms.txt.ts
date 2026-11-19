import type { APIRoute } from 'astro';
import { artifacts, planned } from '../data/artifacts';

// The center's llms.txt (https://llmstxt.org): every surface the center carries, in one
// request. The lists come from the same data the grid draws, so a surface the center shows
// cannot be missing from the index, and a surface it drops cannot linger here.
//
// A section is emitted only when it has entries, so a center that carries no runs or no
// planned bay ends on the sections it does have rather than on an empty heading.
export const GET: APIRoute = ({ site }) => {
  const base = site ?? new URL('https://demo.ktema.systems');
  const url = (path: string) => new URL(path, base).href;

  const recordings = artifacts.find((artifact) => artifact.kind === 'runs')?.recordings ?? [];
  const live = artifacts.filter((artifact) => artifact.kind === 'live');

  const section = (heading: string, entries: string[]) =>
    entries.length > 0 ? ['', `## ${heading}`, '', ...entries] : [];

  const surfaces = artifacts.map((artifact) => {
    const tags = artifact.products.length > 0 ? ` (${artifact.products.join(', ')})` : '';
    return `- [${artifact.title}](${url(`/${artifact.id}`)})${tags}: ${artifact.summary}`;
  });

  const runs = recordings.map((run) => `- [${run.label}](${url(`/runs/${run.id}`)}): ${run.detail}`);

  const applications = live.map(
    (artifact) => `- [${artifact.title}, the deployed application](${artifact.source}): the surface opened directly, without its page.`,
  );

  const bays = planned.map((item) => `- ${item.title} (${item.products.join(', ')}): ${item.summary}`);

  const text = [
    '# Ktema Systems Demo Center',
    '',
    '> The surfaces Ktema Systems builds, running: deployed applications, runs of the engine recorded in a terminal, and hardware on the bench.',
    '',
    'Every surface has a page that states what it is and what it does not claim, and the page opens the artifact itself. A surface without an address is a bay that is still being built.',
    ...section('Surfaces', surfaces),
    ...section('Recorded runs', runs),
    ...section('Applications', applications),
    ...section('Planned', bays),
    '',
    '## Contact',
    '',
    '- [Email](mailto:demo@ktema.systems)',
    '',
    '## Optional',
    '',
    '- [Ktema Systems](https://ktema.systems/): the company and the stack this center demonstrates.',
    '- [Documentation](https://docs.ktema.systems)',
    '- [Company index](https://ktema.systems/llms.txt): the stack as one file.',
    '',
  ].join('\n');

  return new Response(text, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
