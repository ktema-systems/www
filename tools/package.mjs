#!/usr/bin/env node
// The package the center describes.
//
// The bundle itself is assembled in the engine's repository, by `./run.sh --release` there,
// and it lands in `dist/ktema-capi-<version>/`. This script reads that bundle and writes the
// one JSON the page renders, so the numbers, the targets and the prose on the page are the
// package's own rather than a second copy someone keeps in step by hand.
//
// The addresses the buttons point at are not decided here. Where a package is served from is
// a decision that outlives this page, so it arrives as PACKAGE_BASE_URL. Unset, the page
// describes the package and says its address is not published yet, which is what it should
// say before there is one: a download button that resolves to nothing is worse than none.
//
// Usage: node tools/package.mjs
//   KTEMA_DIR          the engine checkout (default: ../ktema)
//   PACKAGE_BASE_URL   where the assembled bundles are served, without a trailing slash
//                      (e.g. https://pub-<id>.r2.dev/capi)

import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const site = resolve(here, '..');
const engine = resolve(process.env.KTEMA_DIR ?? join(site, '..', 'ktema'));
const dist = join(engine, 'dist');
const base = (process.env.PACKAGE_BASE_URL ?? '').replace(/\/+$/, '');

const die = (message) => {
  console.error(`package: ${message}`);
  process.exit(1);
};

if (!existsSync(dist)) die(`no bundle at ${dist}; run './run.sh --release' in ${engine}`);

const bundles = readdirSync(dist)
  .filter((name) => name.startsWith('ktema-capi-'))
  .filter((name) => statSync(join(dist, name)).isDirectory())
  .sort();

if (bundles.length === 0) die(`no bundle directory under ${dist}`);
if (bundles.length > 1) die(`${bundles.length} bundles under ${dist}: ${bundles.join(', ')}; keep one`);

const name = bundles[0];
const bundle = join(dist, name);
const manifestPath = join(bundle, 'RELEASE');
if (!existsSync(manifestPath)) die(`${bundle} has no RELEASE`);

// The manifest is `key value` lines, and a key may repeat: `built` and `absent` do.
const fields = new Map();
const built = [];
const absent = [];
for (const line of readFileSync(manifestPath, 'utf8').split('\n')) {
  if (!line.trim()) continue;
  const [key, ...rest] = line.split(' ');
  const value = rest.join(' ');
  if (key === 'built') built.push(value);
  else if (key === 'absent') absent.push(value);
  else fields.set(key, value);
}

for (const key of ['version', 'abi', 'format', 'entry_points', 'revision']) {
  if (!fields.has(key)) die(`${manifestPath} states no ${key}`);
}

/** A path inside the package, addressed the way the bundle is served. */
const href = (path) => (base ? `${base}/${name}/${path}` : null);
const sizeOf = (path) => statSync(join(bundle, path)).size;

const targets = built.map((target) => ({
  target,
  bytes: sizeOf(join('targets', `${target}.tar.gz`)),
  href: href(`targets/${target}.tar.gz`),
}));

const documents = [
  { label: 'README', path: 'README.md' },
  { label: 'CHANGELOG', path: 'CHANGELOG.md' },
  { label: 'The format', path: `spec/ktema-format-${fields.get('format')}.md` },
  { label: 'The medium contract', path: `spec/ktema-medium-${fields.get('format')}.md` },
  { label: 'Digests', path: 'SHA256SUMS' },
]
  .filter((document) => existsSync(join(bundle, document.path)))
  .map((document) => ({
    label: document.label,
    bytes: sizeOf(document.path),
    href: href(document.path),
  }));

const read = (path) => (existsSync(join(bundle, path)) ? readFileSync(join(bundle, path), 'utf8') : '');

const payload = {
  name,
  version: fields.get('version'),
  abi: fields.get('abi'),
  format: fields.get('format'),
  entryPoints: fields.get('entry_points'),
  revision: fields.get('revision'),
  assembled: fields.get('assembled'),
  host: fields.get('host') ?? null,
  served: Boolean(base),
  built,
  absent,
  targets,
  documents,
  readme: read('README.md'),
  changelog: read('CHANGELOG.md'),
};

const out = join(site, 'demo', 'src', 'data', 'package-bundle.json');
writeFileSync(out, `${JSON.stringify(payload, null, 2)}\n`);

const megabytes = (bytes) => `${(bytes / 1024 / 1024).toFixed(1)} MB`;
const total = targets.reduce((sum, target) => sum + target.bytes, 0);
console.log(
  `package: ${name}, abi ${payload.abi}, ${payload.entryPoints} entry points, ` +
    `${targets.length} targets, ${megabytes(total)} of artifacts, ` +
    `${payload.served ? `served from ${base}` : 'no address yet'}`,
);
