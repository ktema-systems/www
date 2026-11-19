# astro-notes

Reads a set of Markdown documents into notes: a title, a description, a date, the project's own
attributes, and the body as Markdown.

The package does not know about Astro. It takes a map of path to text and returns an array, so a
bundler's glob, a directory walk in Node, or another site's build can all hand it the same thing.

## The document

```md
---
title: Two readers, one power cut
description: A part with no operating system records a flight, and a die recomputes it.
date: "2026-11-17"
ktma:
  platforms: [bare-metal, fpga]
  products: [Ktema]
  poster: /proofs/witness.jpg
  posterAlt: The board on the bench, lit.
  demonstration: /witness
---

The body, as Markdown.
```

`title`, `description` and `date` stay at the top because every document build already understands
them. Everything this project adds sits under `ktma`, because a top-level `platforms` or `poster` is
a name another renderer may own, and a collision at the top level is how a build silently takes one
tool's meaning for another's.

A date is normalised to the day, so `2026-11-17` and `2026-11-17T09:30:00Z` both read as
`2026-11-17`.

## Use

```js
import { loadNotes } from '@ktema-systems/astro-notes';

const sources = {
  'posts/two-readers.md': readFileSync('posts/two-readers.md', 'utf8'),
};
const notes = loadNotes(sources); // newest first
```

From Astro, a glob hands it the same shape:

```js
import { loadNotes } from '../../packages/astro-notes/index.mjs';

const notes = loadNotes(import.meta.glob('../posts/*.md', { eager: true, query: '?raw', import: 'default' }));
```

## What it refuses

A build stops rather than publishing a document with no header, no title, no description, no date,
no body, a date that is not a day, a `ktma` map that is not a map, a list of names that is not a
list, or two documents with the same name.

## Test

```sh
npm test
```

## Licence

Apache-2.0, as the rest of this repository.
