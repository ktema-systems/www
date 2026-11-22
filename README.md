# www

The Ktema Systems site. Two Astro roots in one repository: `home/` is the company
site, `demo/` is the demonstration center. Static output.

## Run

```
npm install
npm run dev          # home
npm run dev:demo     # corpus hub
npm run build        # home into dist/
npm run build:demo   # corpus hub into demo-dist/
npm run test:packages
```

`./run.sh` serves both sites locally, with the cockpit from a sibling `kletos`
checkout. `npm run demo` starts the center beside a local cockpit and stops the
preview with it. `DELTA_URL` points the center at a cockpit this host does not
serve.

## Layout

| path | what |
|---|---|
| `home/` | the company site: pages, one component per section, `config.ts` |
| `demo/` | the demonstration center: pages, `kinds/`, `posts/`, `data/` |
| `lib/` | the palette, the type stacks and the fonts both sites import |
| `packages/astro-llms/` | the text of every page, at `/llms.txt` and `<path>/index.md` |
| `tools/demo.mjs` | the command that runs the center beside a cockpit |

Each site has its own `astro.config` and `public/`. Styles two sites share live
in `lib/`; anything one site's components share lives in its `global.css`.

## The center's documents

A page is a Markdown file under `demo/src/posts` with a YAML header:

```
---
title: One record set, two readers, one power cut
description: The line the grid draws under the title.
date: "2026-11-17"          # a note carries one
ktma:
  kind: video               # recorded: live, video, document, runs, bench, device, package
  # demonstration: /witness # a note instead, linked from that page
  # neither kind nor demonstration: a planned surface, with the brief in the body
  order: 1                  # where the grid draws it
  line: second-reader       # the roadmap line it belongs to
  products: [Ktema]
  platforms: [bare-metal, fpga]
  claim: The sentence the page proves.
  source: https://…         # where the recording, the application or the document lives
  poster: /proofs/x.jpg
  facts: [{ label: Records written, value: 72 }]
---

## A heading

Markdown, with HTML wherever a page needs a figure or a table.
```

A run is its own document under `demo/src/posts/runs/`, drawn at `/runs/<id>`.
A note is drawn at `/notes/<id>` and linked from the page it names.

A document that does not fit never stops the build. `demo/src/data/documents.ts`
repairs what it can (a missing title is the file name, a missing description the
first line of the body), leaves out what it cannot draw, and prints the file path
once. In `demo/src/data/`, only `source.ts` imports Astro; the rest takes plain
entries, so another build can draw the center from the same files.

## Addresses

`https://ktema.systems` and `https://demo.ktema.systems`, each declared in its own
config. Every build writes a sitemap, a markdown version of each page at
`<path>/index.md`, and an index at `/llms.txt`. The social card is `og.png`,
1200 by 630, captured from the built page at that viewport.
