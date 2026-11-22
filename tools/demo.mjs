// The corpus hub's commands.
//
//   npm run corpus:source  take the export a producer published, and check it against its digest
//   npm run corpus:take    take it into this site and the board, and check both
//   npm run corpus:build   build the site and the board from what was taken
//   npm run corpus:flow    take and check, from what a producer published
//   npm run corpus:publish build and publish both to their Pages projects
//   npm run demo           the site beside a cockpit, both started and stopped together
//
// Two pipelines share this file. One runs in a checkout with the producers beside it (a person's machine, where
// KTEMA_DIR and DELTA_DIR name them): it exports the volume and builds everything from the sources. The other runs
// where the producers are not (CI, where their repositories are private): it fetches the export they published, refuses
// one that does not match its digest, and builds the site from it. `corpus:source`, `corpus:take` and `corpus:publish`
// are the second; `corpus:flow` asks for an export and then builds it, which is the whole of the second.
//
// Environment, all optional:
//   CORPUS_SOURCE   an export beside this checkout, which is copied rather than fetched
//   CORPUS_URL      the published export as a URL, which is what CI uses
//   KTEMA_DIR       a ktema checkout, so a local run can take the export it builds here
//   DELTA_DIR       a cockpit checkout, relative to this repository (../kletos/apps/delta)
//   CENTER_PORT     the site's port on this host (4321)
//   DELTA_PORT      the cockpit's port on this host (5276)
//   CENTER_PAGES_PROJECT, DELTA_PAGES_PROJECT  the Pages projects the publish targets

import { spawn, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { copyFileSync, cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const say = (line) => process.stdout.write(`demo: ${line}\n`);

const fail = (line) => {
  process.stderr.write(`demo: ${line}\n`);
  process.exit(1);
};

/** Runs a command to completion, or stops the run with the reason it could not start. */
function exec(command, args, options) {
  const result = spawnSync(command, args, options);
  if (result.error) fail(`${command} did not run: ${result.error.message}`);
  return result.status ?? 1;
}

/** Waits until an address answers, so the center is not opened on a frame with nothing behind it. */
async function answered(url, tries = 40) {
  for (let attempt = 0; attempt < tries; attempt += 1) {
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(1500) });
      if (response.ok) return;
    } catch {
      // The server is still starting. The last attempt is what reports the failure.
    }
    await new Promise((done) => setTimeout(done, 250));
  }
  fail(`the cockpit did not answer on ${url}`);
}

async function run() {
  const centerPort = process.env.CENTER_PORT ?? '4321';
  const deltaPort = process.env.DELTA_PORT ?? '5276';
  const deltaDir = resolve(ROOT, process.env.DELTA_DIR ?? '../kletos/apps/delta');

  const astro = join(ROOT, 'node_modules/.bin/astro');
  if (!existsSync(astro)) fail('the center is not installed here: run npm install');

  // The served page and the board are the volume's own, so a run takes the export in first when one was named. `run.sh`
  // resolves where it is and passes it here; nothing is guessed from a sibling directory.
  if (process.env.CORPUS_URL || process.env.CORPUS_SOURCE) take();

  // A cockpit address given is a cockpit this host is not serving, which is what a run against a deployment is.
  let deltaUrl = process.env.DELTA_URL?.replace(/\/$/, '');
  let cockpit = null;

  if (!deltaUrl) {
    const vite = join(deltaDir, 'node_modules/.bin/vite');
    if (!existsSync(vite)) {
      fail(`no cockpit at ${deltaDir}: set DELTA_DIR to a checkout, or DELTA_URL to a cockpit already served`);
    }
    deltaUrl = `http://localhost:${deltaPort}`;

    // The preview server answers from the build, not from the sources, so a cockpit whose sources moved on is rebuilt
    // here unless the caller says the build in hand is the one to show.
    if (process.env.DEMO_REBUILD === '1' || !existsSync(join(deltaDir, 'dist-demo/index.html'))) {
      say('building the cockpit');
      if (exec('npm', ['run', 'build:demo'], { cwd: deltaDir, stdio: 'inherit' }) !== 0) {
        fail('the cockpit did not build');
      }
    }

    say(`the cockpit on ${deltaUrl}`);
    cockpit = spawn(vite, ['preview', '--port', deltaPort], {
      cwd: deltaDir,
      env: { ...process.env, DELTA_DEMO: '1' },
      stdio: 'inherit',
    });
    cockpit.on('error', (error) => fail(`the cockpit did not start: ${error.message}`));
    await answered(deltaUrl);
  }

  say(`the center on http://localhost:${centerPort}`);

  const center = spawn(astro, ['dev', '--root', 'demo', '--port', centerPort, '--force'], {
    cwd: ROOT,
    env: { ...process.env, PUBLIC_DELTA_URL: `${deltaUrl}/` },
    stdio: 'inherit',
  });
  center.on('error', (error) => fail(`the center did not start: ${error.message}`));

  // Both are stopped from here rather than left to the terminal's process group, because the cockpit is this command's
  // child and nothing else would take it down.
  const stop = () => {
    cockpit?.kill('SIGTERM');
    center.kill('SIGTERM');
    process.exit(130);
  };
  process.on('SIGINT', stop);
  process.on('SIGTERM', stop);

  center.on('exit', (code) => {
    cockpit?.kill('SIGTERM');
    process.exit(code ?? 0);
  });
}

/**
 * The export, taken from wherever it is published.
 *
 * A local export is copied; a URL is fetched. Either way the whole export is in hand before anything is written, and
 * its digest is checked first, so a build never assembles from a corpus somebody edited after publishing it.
 *
 * Nothing is assumed about where a producer keeps its export: a tree that was not named is not read, so a build without
 * `CORPUS_URL` or `CORPUS_SOURCE` says so rather than assembling from a directory that happens to exist.
 */
function sourceOf() {
  const named = process.env.CORPUS_SOURCE ?? process.env.CORPUS_URL;
  if (!named) {
    fail('no corpus: set CORPUS_URL to the published export, or CORPUS_SOURCE to one beside this checkout');
  }
  // A path is a directory that is already there; anything else is an address to fetch from. `run.sh` passes a sibling
  // checkout's build directory through the same variable, so the two are one answer to "where is the export".
  if (existsSync(named)) return resolve(ROOT, named);
  if (!/^[a-z][a-z0-9+.-]*:\/\//i.test(named)) {
    fail(`${named} is not there: set CORPUS_URL to the published export, or CORPUS_SOURCE to a directory`);
  }
  const url = named;
  const into = join(ROOT, '.corpus');
  rmSync(into, { recursive: true, force: true });
  mkdirSync(into, { recursive: true });
  say(`corpus: fetching ${url}`);
  for (const name of ['bench.json', 'corpus.json', 'runs.json', 'values.json', 'digest']) {
    if (!fetchFile(`${url}/${name}`, join(into, name))) fail(`${url}/${name} did not answer`);
  }
  say('corpus: fetching the documents');
  for (const file of indexOf(url)) {
    const target = join(into, 'docs', file);
    mkdirSync(join(target, '..'), { recursive: true });
    if (!fetchFile(`${url}/docs/${file}`, target)) fail(`${url}/docs/${file} did not answer`);
  }
  return into;
}

/** One file, fetched into place, as whether it arrived. */
function fetchFile(url, into) {
  const got = spawnSync('curl', ['-fsS', '-L', '--max-time', '60', '-o', into, url], { stdio: 'ignore' });
  return got.status === 0;
}

/**
 * The documents an export publishes, read from the export itself.
 *
 * `documents.txt` states the names, including the ones under a directory, so a raw host answers it directly and no
 * listing call is made. A hub that holds the export as a git tree is read the same way a local checkout is.
 */
function indexOf(url) {
  const listing = join(ROOT, '.corpus', 'documents.txt');
  if (!fetchFile(`${url}/documents.txt`, listing)) {
    fail(`${url}/documents.txt did not answer: an export states the documents it carries`);
  }
  return readFileSync(listing, 'utf8')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

/**
 * An export checked against its own digest.
 *
 * The digest is computed over the four files and the documents, by the same rule the producer's assembly uses. A source
 * that does not match its digest is an export somebody edited after publishing, and a site built from it would state a
 * run nobody made.
 */
function digestOf(directory) {
  const names = ['bench.json', 'corpus.json', 'runs.json', 'values.json'];
  const lines = names.map((name) => {
    const file = join(directory, name);
    if (!existsSync(file)) fail(`${file} is missing: the export states four files and its digest`);
    return `${sha256(readFileSync(file))}  ${name}`;
  });
  const docs = join(directory, 'docs');
  if (!existsSync(docs)) fail(`${docs} is missing: the export carries its documents`);
  for (const file of treeOf(docs)) {
    lines.push(`${sha256(readFileSync(join(docs, file)))}  ${join('docs', file)}`);
  }
  // The listing the producer digests names its files relative to the export, and the newline at its end belongs to it:
  // the digest is over the bytes of the file, not over the lines read out of it.
  return sha256(Buffer.from(`${lines.join('\n')}\n`));
}

/** The sha256 of bytes, in the form `shasum -a 256` writes. */
function sha256(bytes) {
  return createHash('sha256').update(bytes).digest('hex');
}

/**
 * The export this site was built from, taken from wherever it is published.
 *
 * The source is checked against its digest first, so a copy this build takes is the one the producer stated. Nothing is
 * written before the whole export is in hand: a half-taken corpus would be a page a corpus apart from its documents.
 */
function source() {
  const from = sourceOf();
  if (!existsSync(from)) {
    fail(`${from} is not there: set CORPUS_SOURCE to a published export, or run the producer's export`);
  }
  const held = existsSync(join(from, 'digest')) ? readFileSync(join(from, 'digest'), 'utf8').trim() : '';
  if (!held) fail(`${join(from, 'digest')} is missing: an export states the digest of its own contents`);
  const now = digestOf(from);
  if (now !== held) {
    fail(`${from} does not match its digest: ${held.slice(0, 12)}, and its contents digest to ${now.slice(0, 12)}`);
  }
  say(`corpus: the source matches its digest (${held.slice(0, 12)})`);
  return from;
}

/**
 * The records this site draws, taken from the export.
 *
 * The site holds no measurement of its own: `bench.json` is the rows a page draws, `corpus.json` is every record with the
 * claim each one rests on, and `values.json` is the strings a document's placeholders ask for. All of them are written by
 * the producer's assembly, so publishing reads them rather than restating them.
 */
function corpus() {
  source();
  const exported = sourceOf();
  for (const [from, to] of pairs()) {
    const source = join(exported, from);
    if (!existsSync(source)) {
      fail(`${source} is not there: run corpus/assembly/export.sh in the ktema checkout`);
    }
    copyFileSync(source, join(ROOT, to));
    say(`corpus: ${from} -> ${to}`);
  }

  // The documents are the fact in the form a person reads, so the center renders the corpus's own text rather than a
  // copy kept here. The directory is replaced whole, so a document the corpus dropped stops being a page.
  const docs = join(exported, 'docs');
  if (!existsSync(docs)) fail(`${docs} is not there: run corpus/assembly/export.sh in the ktema checkout`);
  rmSync(join(ROOT, 'demo/src/posts'), { recursive: true, force: true });
  cpSync(docs, join(ROOT, 'demo/src/posts'), { recursive: true });
  say('corpus: corpus/export/docs -> demo/src/posts');
}

/**
 * The whole pipeline, from the volume to both consumers.
 *
 * The corpus is measured by its producers, exported once, and taken into the site and the board. Each consumer's own
 * check runs here, so a copy that is not the export stops the flow rather than being served.
 */
function take() {
  const exported = sourceOf();
  corpus();

  const delta = resolve(ROOT, process.env.DELTA_DIR ?? '../kletos/apps/delta');
  const corpusTool = join(delta, 'tools/corpus.mjs');
  if (existsSync(corpusTool)) {
    say('the board takes the corpus');
    const steps = [
      [corpusTool, '--take', exported],
      [join(delta, 'tools/corpus-board.mjs')],
      [join(delta, 'tools/board.mjs'), '--set', 'corpus'],
    ];
    for (const [script, ...args] of steps) {
      if (exec(process.execPath, [script, ...args], { cwd: delta, stdio: 'inherit' }) !== 0) {
        fail('the board did not take the corpus');
      }
    }
    const checks = [
      [corpusTool, '--check'],
      [join(delta, 'tools/corpus-board.mjs'), '--check'],
      [join(delta, 'tools/board.mjs'), '--set', 'corpus', '--check'],
    ];
    for (const [script, ...args] of checks) {
      if (exec(process.execPath, [script, ...args], { cwd: delta, stdio: 'inherit' }) !== 0) {
        fail('the board is not the corpus');
      }
    }
  } else {
    say(`no cockpit at ${delta}: the site is the only consumer taken`);
  }

  check();
}

/**
 * The whole flow here: take what the producer published, build, and check.
 *
 * The export is the producer's. This command reads it, refuses it when it does not match its digest, and builds both
 * renderings from it, so the pipeline a CI job runs is the one a person runs.
 */
function flow() {
  take();

  say('building the site and the board');
  if (exec('npm', ['run', 'build:demo'], { cwd: ROOT, stdio: 'inherit' }) !== 0) fail('the site did not build');
  const delta = resolve(ROOT, process.env.DELTA_DIR ?? '../kletos/apps/delta');
  if (existsSync(join(delta, 'package.json'))) {
    if (exec('npm', ['run', 'build:demo'], { cwd: delta, stdio: 'inherit' }) !== 0) fail('the board did not build');
  }
}

/**
 * The whole pipeline, from the volume to a served page.
 *
 * The corpus is taken first, which means running ktema's export against the volume already there and then copying what
 * it wrote. Nothing is measured: a preview reads what earlier runs left, which is the property the corpus exists to
 * give. The center is built and served, and Control-C stops it.
 */
function show() {
  flow();

  say('building the center');
  if (exec('npm', ['run', 'build:demo'], { cwd: ROOT, stdio: 'inherit' }) !== 0) fail('the center did not build');
  if (!existsSync(join(ROOT, 'demo-dist', 'index.html'))) fail('demo-dist/index.html is missing');

  const port = process.env.CENTER_PORT ?? '4321';
  say(`serving http://localhost:${port}/ (Control-C stops it)`);
  const served = spawn('npm', ['run', 'preview:demo', '--', '--port', port], { cwd: ROOT, stdio: 'inherit' });
  for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => served.kill(signal));
  served.on('exit', (code) => process.exit(code ?? 0));
}

/**
 * The files the center is drawn from, as the pairs the export owns.
 *
 * A pair is the corpus's own name and the file the site imports. Keeping the two names in one list is what lets the
 * check, the take, and a reader of this file agree about which copies are copies.
 */
function pairs() {
  return [
    ['bench.json', 'demo/src/data/corpus-bench.json'],
    ['corpus.json', 'demo/src/data/corpus.json'],
    ['values.json', 'demo/src/data/corpus-values.json'],
    ['digest', 'demo/src/data/corpus-digest.txt'],
  ];
}

/** Every file under a directory, as relative paths, so two trees are compared whole. */
function treeOf(directory) {
  return readdirSync(directory, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => relative(directory, join(entry.parentPath ?? entry.path, entry.name)))
    .sort();
}

/**
 * Whether the center is still the export it was taken from.
 *
 * A checkout of this repository alone has no volume beside it, and the committed copy is then the only copy: the check
 * skips rather than calling that a failure. Where the export is there, a difference is a page that would quote a run
 * nobody made, so the run stops and names the command that fixes it.
 */
function check() {
  const exported = sourceOf();
  const wanted = pairs();
  if (wanted.some(([from]) => !existsSync(join(exported, from)))) {
    say('corpus: no export beside this checkout, so the committed copy is what is served');
    return;
  }
  const drift = [];
  for (const [from, to] of wanted) {
    if (!existsSync(join(ROOT, to))) drift.push(`${to} is missing`);
    else if (!readFileSync(join(exported, from)).equals(readFileSync(join(ROOT, to)))) drift.push(`${to} is not ${from}`);
  }
  const docs = join(exported, 'docs');
  const posts = join(ROOT, 'demo/src/posts');
  if (existsSync(docs)) {
    const left = treeOf(docs);
    const right = existsSync(posts) ? treeOf(posts) : [];
    for (const file of left) {
      if (!existsSync(join(posts, file))) drift.push(`demo/src/posts/${file} is missing`);
      else if (!readFileSync(join(docs, file)).equals(readFileSync(join(posts, file)))) {
        drift.push(`demo/src/posts/${file} is not ${join('docs', file)}`);
      }
    }
    for (const file of right) {
      if (!left.includes(file)) drift.push(`demo/src/posts/${file} is not in the export`);
    }
  }
  if (drift.length) {
    for (const line of drift) process.stderr.write(`demo: ${line}\n`);
    fail('the site is not the export: run npm run corpus:take');
  }
  say('corpus: the center is the export it was taken from');
}

/**
 * Both renderings of one export, published from here.
 *
 * This repository assembles a corpus into its artifacts: the site, and the board that names the site's pages. So one
 * command builds both from the export it took and publishes each to its own Pages project. They are published in one
 * run because they are two renderings of one corpus: a site a corpus apart from the board would be a board whose drift
 * note is the only thing it can say.
 */
function publish() {
  const site = process.env.CENTER_PAGES_PROJECT ?? 'ktema-corpus';
  const center = process.env.DELTA_PAGES_PROJECT ?? 'ktema-delta';
  const delta = resolve(ROOT, process.env.DELTA_DIR ?? '../kletos/apps/delta');

  take();

  if (exec('npx', ['--yes', 'wrangler@4', 'whoami'], { cwd: ROOT, stdio: 'ignore' }) !== 0) {
    fail('Wrangler is not logged in: run `npx wrangler@4 login`, or set CLOUDFLARE_API_TOKEN');
  }

  say('building the hub');
  if (exec('npm', ['run', 'build:demo'], { cwd: ROOT, stdio: 'inherit' }) !== 0) fail('the hub did not build');
  // A build that exits zero without a home page would publish a shell with nothing in it.
  if (!existsSync(join(ROOT, 'demo-dist', 'index.html'))) fail('demo-dist/index.html is missing');

  say('building the viewer');
  if (exec('npm', ['run', 'build:demo'], { cwd: delta, stdio: 'inherit' }) !== 0) fail('the board did not build');
  const built = join(delta, 'dist-demo');
  for (const need of ['index.html', 'projects.json', '_redirects']) {
    if (!existsSync(join(built, need))) fail(`the board has no ${need} in its build`);
  }

  // The hub first: the viewer names its pages, so the page a reader opens is the one this run published.
  say(`uploading demo-dist to Cloudflare Pages (${site})`);
  const first = exec(
    'npx',
    ['--yes', 'wrangler@4', 'pages', 'deploy', 'demo-dist', `--project-name=${site}`, '--commit-dirty=true'],
    { cwd: ROOT, stdio: 'inherit' },
  );
  if (first !== 0) fail('the hub did not publish');

  say(`uploading the viewer to Cloudflare Pages (${center})`);
  const second = exec(
    'npx',
    ['--yes', 'wrangler@4', 'pages', 'deploy', 'dist-demo', `--project-name=${center}`, '--commit-dirty=true'],
    { cwd: delta, stdio: 'inherit' },
  );
  if (second !== 0) fail('the viewer did not publish');
}

/**
 * The hub alone, for a deployment that publishes one surface.
 *
 * `npm run demo:deploy` is that case. The full pipeline is `corpus:publish`, which publishes the hub and the viewer
 * together; this is kept for a deployment that reaches one of them.
 */
function deploy() {
  const project = process.env.CENTER_PAGES_PROJECT ?? 'ktema-corpus';
  take();
  if (exec('npx', ['--yes', 'wrangler@4', 'whoami'], { cwd: ROOT, stdio: 'ignore' }) !== 0) {
    fail('Wrangler is not logged in: run `npx wrangler@4 login`, or set CLOUDFLARE_API_TOKEN');
  }
  say('building the hub');
  if (exec('npm', ['run', 'build:demo'], { cwd: ROOT, stdio: 'inherit' }) !== 0) fail('the hub did not build');
  if (!existsSync(join(ROOT, 'demo-dist', 'index.html'))) fail('demo-dist/index.html is missing');
  say(`uploading demo-dist to Cloudflare Pages (${project})`);
  const uploaded = exec(
    'npx',
    ['--yes', 'wrangler@4', 'pages', 'deploy', 'demo-dist', `--project-name=${project}`, '--commit-dirty=true'],
    { cwd: ROOT, stdio: 'inherit' },
  );
  if (uploaded !== 0) fail('the upload did not complete');
}

const mode = process.argv[2] ?? 'run';

if (mode === 'run') {
  await run();
} else if (mode === 'deploy') {
  deploy();
} else if (mode === 'corpus') {
  corpus();
} else if (mode === 'take') {
  take();
} else if (mode === 'flow') {
  flow();
} else if (mode === 'source') {
  source();
} else if (mode === 'check') {
  check();
} else if (mode === 'show') {
  show();
} else if (mode === 'publish') {
  publish();
} else {
  fail(`unknown command '${mode}': use run, source, take, flow, check, show, publish, deploy, or corpus`);
}
