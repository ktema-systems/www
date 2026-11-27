// The documents the center renders.
//
// Astro reads the frontmatter and hands a page the body as Markdown. There is no schema here on purpose: a document
// that does not fit is a document a person is in the middle of writing, so it is repaired where it can be repaired and
// left out where it cannot, with its path printed. `data/documents.ts` is where that happens.
//
// A run lives under `runs/`, so its id is `runs/<name>` and the page it opens at `/runs/<name>` cannot borrow the
// address of the artifact that lists it.
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';

export const collections = {
  documents: defineCollection({
    loader: glob({ pattern: '**/*.md', base: './src/posts' }),
  }),
  // The pages this repository owns rather than a producer: a surface about the work itself, filed beside the exported
  // corpus. They are read the same way and merged in `data/source.ts`, so a producer's export never carries them.
  local: defineCollection({
    loader: glob({ pattern: '**/*.md', base: './src/local' }),
  }),
};
