// The one file that knows this build.
//
// Astro parses the documents and a build names where a deployed application is served from. Everything that decides
// what a page is, what it says and what happens to a document that does not fit lives beside this file with no import
// from Astro, so another build can hand the same documents over and draw the center.
import { getCollection, type CollectionEntry } from 'astro:content';
import { readDocuments, type SourceEntry } from './documents';
import { buildArtifacts, type Artifact } from './artifacts';
import { buildNotes, type Note } from './posts';
import { buildSurfaces, type Surface } from './surfaces';

function pathOf(id: string, filePath: string | undefined): string {
  const path = filePath ?? `src/posts/${id}.md`;
  return path.startsWith('demo/') ? path : `demo/${path}`;
}

async function read(): Promise<ReturnType<typeof readDocuments>> {
  const entries = await getCollection('documents');
  return readDocuments(
    entries.map(
      (entry: CollectionEntry<'documents'>): SourceEntry => ({
        id: entry.id,
        path: pathOf(entry.id, entry.filePath),
        data: entry.data,
        body: entry.body,
      }),
    ),
  );
}

/** The artifacts, in the order the grid draws them. */
export async function getArtifacts(): Promise<Artifact[]> {
  return buildArtifacts(await read(), { liveSource: import.meta.env.PUBLIC_DELTA_URL });
}

/** The notes, newest first. */
export async function getNotes(): Promise<Note[]> {
  return buildNotes(await read());
}

/** The planned surfaces, in the order the grid draws them. */
export async function getSurfaces(): Promise<Surface[]> {
  return buildSurfaces(await read());
}
