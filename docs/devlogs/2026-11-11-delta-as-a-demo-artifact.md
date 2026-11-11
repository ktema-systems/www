# Delta as a demo artifact

date: 2026-11-11
project: ktema_www
related:

- demo center (demo.ktema.systems)
- the access layer ahead of the demo center (2026-11-11)
- delta demo board and the frame's static host seam (skene)

## Context

The demo center is the first priority: `demo.ktema.systems`, named Ktema Systems Demo Center, an independent section of this site that gathers the artifacts one run at a time, video where the subject is hardware, a live surface where the subject is software.

Delta is the only artifact that is an application rather than footage, and it is a product that runs an agent loop. The question this note answers is how one source tree becomes two deliveries, the product and a read-only web demo, without a second copy of the application.

## The boundary already exists

The split is not a design to be invented. Delta reaches its stack through one object, and in a browser that object has no shell.

| Where | What it does |
|---|---|
| `src/kletos/host.ts` | `reachable` reads the Tauri bridge. `ask` refuses with `NO_SHELL` when there is none. `roomByDefault` answers `stack` only when a shell exists, `sim` otherwise. |
| `src/kletos/boot.ts` | Subscribes to a shell event, reads the launcher's front, then proves the credential. Without a shell every one of those refuses, so a browser build makes no request to the stack at all. |
| `src/kletos/works.ts` | `DEFAULT_URL` is `https://klet.ktema.systems`, and it is the connect form's default rather than an address the application dials. |
| `tauri.conf.json` | `frontendDist` is `../../delta/dist`, so the desktop app wraps the same build the web demo would serve. |

Analytic conclusion: a turn runs through the shell, the shell is the desktop process, and the browser has none. The web demo cannot run an LLM, and that is a property of the current wiring rather than a policy to be enforced.

Counterargument, and it matters: the wiring can be changed. A hosted stack exists as an address in the source, and a build that pointed the connect form at it would give the browser a live agent loop. That turns the demo into a server product with a secret, a spend, and a gate, which is the subject of the other note. The choice is real; it is not made by the current code.

## Where the seam leaks

One place already checked and one that is not.

Checked. `packages/frame/src/stores/scenario.ts` honours `host().static` for the board and the runs, and `hooks/useRecordSource.ts` honours it for the stream socket. A host that declares `static: true` is never dialled for either.

Not checked. `packages/frame/src/stores/chat.ts` `roomOf` takes the project's declared channel, falls back to `sim`, and asks the room regardless of `static`. The sim room fetches `http://127.0.0.1:8790`. Delta's board declares `channel: "sim"` on nine projects and `"stack"` on one, so a static demo reads loopback as soon as a chat panel asks for the roster. That is the same defect the board seam was added to close, one store further in.

Fact, by line: `chat.ts` `roomOf` has no `static` guard, and `chat.ts` `base()` defaults to `http://127.0.0.1:8790`.

The fix belongs in the frame, one guard beside the two that exist, with a test that a static host makes no room call. It is not a delta change, and it is not duplication.

## What a web build shows

Everything the files carry, which is most of what a reader needs: the board, ten projects, every run in `scenario/`, the chain, the graph, the map, the keyspace, the evidence panel. What it cannot show is a turn, a thread, an approval, or a live record from a volume. Those four are the shell's.

Assets that need an origin before the build is served anywhere:

| Item | State | Work |
|---|---|---|
| `projects.json`, `scenario/` | copied into `dist` by `boardIntoBuild()` | none |
| `/media/robot_1.mp4`, `/media/robot_2.mp4` | absolute paths, served in dev by the Vite proxy to an R2 bucket that sends no CORS header | serve beside the assets, or set the bucket's CORS |
| `/space`, `/graph`, `/records`, `/act` | SPA routes | `_redirects` with `/* /index.html 200` |
| brand | carries no demo or read-only statement | `Brand.note` and `about`, both of which the frame draws |

## Two entries or a flag

A flag threaded through `host.ts` would work and would put demo conditionals in product code. A second entry is nearly free here, because `src/main.tsx` is ten lines and holds no logic: `index.demo.html` and `src/demo.tsx` mount the same `Frame` with the same `brand` and a different host, `host.demo.ts`, whose `reachable` is false, `static` is true, and which supplies no connect form, no prove, and no boot. The rest of the tree is untouched, including every view.

Value judgment, and it is the one thing worth spending on: the second entry keeps the demo's differences declarative and in one file, so the product's host cannot drift into demo behaviour and the demo cannot grow product behaviour. The cost is a second Rollup input and one build command (`build:demo`, output `dist-demo`).

If read-only needs to be visible rather than merely true, the demo's brand says it in `note` and `about`, and the board may drop `act` from each project's `views.on` so the panel is not offered rather than offered and refusing. That is a data transform on the demo's copy of the board, generated at build time, and it stays out of the product's `projects.json`.

## The delivery shape

| Shape | Cost | Consequence |
|---|---|---|
| Same Pages project, `/demo/delta` path | one deploy | The application is a full-viewport router with its own address state (`?project`, `?at`, `?pace`). A subpath works but every route and every relative asset must be base-correct, and the marketing chrome shares the origin. |
| Separate Pages project, `delta.demo.ktema.systems` | one more job, one more project | Independent deploy cadence, a clean origin, and a gate later applies to that host alone. The center links to it, or frames it. |
| Copy `dist` into `public/` | none at deploy | The build output is committed and drifts from the source. Rejected. |

Recommendation: the second. One repo per artifact holds its build and its deploy, which is what the neXus board already does, and the center holds links and posters rather than other projects' builds.

## The center above the artifacts

The center is a site of its own and the applications are artifacts in it. It was first sketched the other way round, as a project on delta's board whose neighbourhood was the index, and that shape was dropped: a center that can only be reached by opening delta is not a center, and an index that lives in a rail cannot list a video, a document, or a surface that is not a frame deployment.

An artifact is data. `demo/src/data/artifacts.ts` holds one entry per thing a reader can open: an id, a title, a kind, a summary and an address. The center knows nothing about how an artifact is built or what it contains, which is what lets an FPGA board, a recorded hardware run and a cockpit stand beside each other.

A kind is a component under `demo/src/kinds` and a line in the map `demo/src/pages/[id].astro` reads. `live` embeds an application in an iframe with the viewport below the bar, `video` plays footage, and `document` points at prose that stays where it is written. A new sort of surface is one component.

Embedding is an iframe rather than a route. The frame owns the viewport and installs its own router, so a parent that mounted it would have to teach it a base path and share a router; an iframe keeps each application whole and each deploy independent. What the boundary costs is a shared address: the artifact's own URL state lives inside the frame, and the center's page names the artifact, not its project or its frame.

## The two hosts

`demo.ktema.systems` is the center, published from this repository to the `ktema-demo` Pages project. Each live artifact is published to a project of its own; delta's is `ktema-delta-demo`, at `delta.demo.ktema.systems`. Neither publishes to the other's project, so an artifact can be redeployed, broken or withdrawn without touching the center.

The center builds with its own root (`astro build --root demo`), so it shares this repository's toolchain and none of its source. The deploy workflows are separate and are triggered by their own paths.

## Where each change lands

| Repository | Change |
|---|---|
| skene | `roomOf` honours `host().static`, and `project.ts` reads a declared channel as a name on a shipped board |
| kletos (delta) | `src/demo/main.tsx`, the `DELTA_DEMO` switch in `vite.config.ts`, `build:demo`, `functions/media`, and `--demo-deploy` in `run.sh` |
| ktema_www | `demo/` as its own Astro root, the artifact data file, the kinds, `tools/demo.mjs`, and `.github/workflows/deploy-center.yml` |

## Open decisions

- Whether a live artifact beyond delta joins the center, and which one it is.
- Whether the demo is read-only or joins a hosted stack. The first needs a build target, the second needs a server and a gate.
- Whether `act` is dropped from the demo board or left in place and visibly refusing.
- Which projects the demo board carries, all ten or a chosen few.
- Whether the center's iframe is the right boundary for a surface that wants the center's own bar and navigation inside it.
