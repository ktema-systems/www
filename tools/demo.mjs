// The demonstration center's commands.
//
//   npm run demo           the center beside a cockpit, both started and stopped together
//   npm run demo:deploy    take the corpus, build the center, and publish it to its Pages project
//   npm run corpus:sync    take the corpus alone, for a local run
//   npm run corpus:show    export, take, build, and serve the center
//
// The two are one file because they are one subject: what the center is made of, and where it goes. Nothing here is a
// shell script, so the same command works wherever npm does.
//
// Environment, all optional:
//   CENTER_PORT   the center's port on this host (4321)
//   DELTA_PORT    the cockpit's port on this host (5276)
//   DELTA_DIR     a cockpit checkout, relative to this repository (../kletos/apps/delta)
//   DELTA_URL     a cockpit this host is not serving; no preview server is started
//   DEMO_REBUILD  1 rebuilds the cockpit before showing it
//   CENTER_PAGES_PROJECT  the Pages project the deploy targets (ktema-demo)

import { spawn, spawnSync } from 'node:child_process';
import { copyFileSync, cpSync, existsSync, readFileSync, readdirSync, rmSync } from 'node:fs';
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

  // The served page is the volume's own, so a run takes the export in first when the checkout has one.
  if (existsSync(join(resolve(ROOT, process.env.KTEMA_DIR ?? '../ktema'), 'corpus/export/bench.json'))) corpus();

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
 * The records this center draws, taken from the ktema checkout.
 *
 * The center holds no measurement of its own: `bench.json` is the rows a page draws, `corpus.json` is every record
 * with the claim each one rests on, and `values.json` is the strings a document's placeholders ask for. All three are
 * written by `corpus/assembly/export.sh`, so publishing reads them rather than restating them. A checkout that has not
 * run a bench has no export, and that is a failure rather than an empty page.
 */
function corpus() {
  const ktema = resolve(ROOT, process.env.KTEMA_DIR ?? '../ktema');
  for (const [from, to] of pairs()) {
    const source = join(ktema, from);
    if (!existsSync(source)) {
      fail(`${source} is not there: run './run.sh --bench' in the ktema checkout, or set KTEMA_DIR`);
    }
    copyFileSync(source, join(ROOT, to));
    say(`corpus: ${from} -> ${to}`);
  }

  // The documents are the fact in the form a person reads, so the center renders the corpus's own text rather than a
  // copy kept here. The directory is replaced whole, so a document the corpus dropped stops being a page.
  const docs = join(ktema, 'corpus/export/docs');
  if (!existsSync(docs)) fail(`${docs} is not there: run corpus/assembly/export.sh in the ktema checkout`);
  rmSync(join(ROOT, 'demo/src/posts'), { recursive: true, force: true });
  cpSync(docs, join(ROOT, 'demo/src/posts'), { recursive: true });
  say('corpus: corpus/export/docs -> demo/src/posts');
}

/**
 * The whole pipeline, from the volume to a served page.
 *
 * The corpus is taken first, which means running ktema's export against the volume already there and then copying what
 * it wrote. Nothing is measured: a preview reads what earlier runs left, which is the property the corpus exists to
 * give. The center is built and served, and Control-C stops it.
 */
function show() {
  const ktema = resolve(ROOT, process.env.KTEMA_DIR ?? '../ktema');
  const exporter = join(ktema, 'corpus/assembly/export.sh');
  if (!existsSync(exporter)) fail(`${exporter} is not there: set KTEMA_DIR to the ktema checkout`);
  say(`corpus: ${exporter}`);
  if (exec('bash', [exporter], { cwd: ktema, stdio: 'inherit' }) !== 0) fail('the export did not run');

  corpus();

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
    ['corpus/export/bench.json', 'demo/src/data/corpus-bench.json'],
    ['corpus/export/corpus.json', 'demo/src/data/corpus.json'],
    ['corpus/export/values.json', 'demo/src/data/corpus-values.json'],
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
  const ktema = resolve(ROOT, process.env.KTEMA_DIR ?? '../ktema');
  const wanted = pairs();
  if (wanted.some(([from]) => !existsSync(join(ktema, from)))) {
    say('corpus: no export beside this checkout, so the committed copy is what is served');
    return;
  }
  const drift = [];
  for (const [from, to] of wanted) {
    if (!existsSync(join(ROOT, to))) drift.push(`${to} is missing`);
    else if (!readFileSync(join(ktema, from)).equals(readFileSync(join(ROOT, to)))) drift.push(`${to} is not ${from}`);
  }
  const docs = join(ktema, 'corpus/export/docs');
  const posts = join(ROOT, 'demo/src/posts');
  if (existsSync(docs)) {
    const left = treeOf(docs);
    const right = existsSync(posts) ? treeOf(posts) : [];
    for (const file of left) {
      if (!existsSync(join(posts, file))) drift.push(`demo/src/posts/${file} is missing`);
      else if (!readFileSync(join(docs, file)).equals(readFileSync(join(posts, file)))) {
        drift.push(`demo/src/posts/${file} is not ${join('corpus/export/docs', file)}`);
      }
    }
    for (const file of right) {
      if (!left.includes(file)) drift.push(`demo/src/posts/${file} is not in the export`);
    }
  }
  if (drift.length) {
    for (const line of drift) process.stderr.write(`demo: ${line}\n`);
    fail('the center is not the export: run npm run corpus:sync');
  }
  say('corpus: the center is the export it was taken from');
}

function deploy() {
  const project = process.env.CENTER_PAGES_PROJECT ?? 'ktema-demo';

  corpus();

  if (exec('npx', ['--yes', 'wrangler@4', 'whoami'], { cwd: ROOT, stdio: 'ignore' }) !== 0) {
    fail('Wrangler is not logged in: run `npx wrangler@4 login`, or set CLOUDFLARE_API_TOKEN');
  }

  say('building the center');
  if (exec('npm', ['run', 'build:demo'], { cwd: ROOT, stdio: 'inherit' }) !== 0) {
    fail('the center did not build');
  }

  // A build that exits zero without a home page would publish a shell with nothing in it.
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
} else if (mode === 'check') {
  check();
} else if (mode === 'show') {
  show();
} else {
  fail(`unknown command '${mode}': use run, show, deploy, corpus, or check`);
}
