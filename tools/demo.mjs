// The demonstration center's commands.
//
//   npm run demo           the center beside a cockpit, both started and stopped together
//   npm run demo:deploy    build the center and publish it to its Pages project
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
import { existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
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

function deploy() {
  const project = process.env.CENTER_PAGES_PROJECT ?? 'ktema-demo';

  if (exec('npx', ['--yes', 'wrangler@4', 'whoami'], { cwd: ROOT, stdio: 'ignore' }) !== 0) {
    fail('Wrangler is not logged in: run `npx wrangler@4 login`, or set CLOUDFLARE_API_TOKEN');
  }

  say('building the center');
  if (exec('npm', ['run', 'build:demo'], { cwd: ROOT, stdio: 'inherit' }) !== 0) {
    fail('the center did not build');
  }

  // A build that exits zero without a home page or the artifact page would publish a shell with nothing in it.
  for (const need of ['index.html', 'delta/index.html']) {
    if (!existsSync(join(ROOT, 'demo-dist', need))) fail(`demo-dist/${need} is missing`);
  }

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
} else {
  fail(`unknown command '${mode}': use run or deploy`);
}
