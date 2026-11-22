import type { APIRoute } from 'astro';
import { getArtifacts, getSurfaces } from '../data/source';
import digest from '../data/corpus-digest.txt?raw';

/**
 * The pages this site published, as the list another surface navigates by.
 *
 * A center that frames the site needs the site's own index rather than a second copy of it, so the index is generated
 * from the same data the pages are. A page added to the corpus is in this list and in the sitemap on the next build.
 */
export const GET: APIRoute = async () => {
  const [artifacts, surfaces] = await Promise.all([getArtifacts(), getSurfaces()]);
  const runs = artifacts.find((artifact) => artifact.kind === 'runs')?.recordings ?? [];
  const pages = [
    ...artifacts.map((artifact) => ({
      id: artifact.id,
      title: artifact.title,
      url: `/${artifact.id}`,
      kind: artifact.kind,
    })),
    ...surfaces.map((surface) => ({
      id: surface.id,
      title: surface.title,
      url: `/${surface.id}`,
      kind: 'planned',
    })),
    ...runs.map((run) => ({
      id: `runs/${run.id}`,
      title: run.label,
      url: `/runs/${run.id}`,
      kind: 'run',
    })),
  ];

  return new Response(JSON.stringify({ digest: digest.trim(), pages }), {
    headers: {
      'content-type': 'application/json; charset=utf-8',
      // A public index, read by the center on another origin.
      'access-control-allow-origin': '*',
      'cache-control': 'public, max-age=60',
    },
  });
};
