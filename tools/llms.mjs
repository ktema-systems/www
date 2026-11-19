// An Astro integration that writes llms-full.txt: every page the build produced, as text.
//
// The sites carry their prose in .astro markup rather than a content collection, so the
// corpus has to come from the rendered pages. Chrome is what sits outside <main>. Inside it
// the decorative layers are dropped (scripts, inline SVG, canvases, the controls of an
// embedded player) along with anything marked aria-hidden, and headings and lists are kept
// so the text keeps the shape it has on the page.
//
// The parser is a tag walk rather than a DOM: the input is our own generated output, and a
// dependency for this would be larger than the code that reads it.

import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const VOID = new Set([
  'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr',
]);

// Subtrees that carry no prose a reader would want in a text corpus.
const DROP = new Set([
  'script', 'style', 'svg', 'noscript', 'template', 'canvas', 'video', 'audio', 'iframe', 'button', 'select', 'form', 'object',
]);

const BLOCK = new Set([
  'p', 'div', 'section', 'article', 'figure', 'figcaption', 'blockquote',
  'ul', 'ol', 'dl', 'table', 'tr', 'header', 'footer', 'main', 'pre',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
]);

const ENTITIES = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ',
  rsquo: '\u2019', lsquo: '\u2018', ldquo: '\u201c', rdquo: '\u201d',
  ndash: '\u2013', mdash: '\u2014', hellip: '\u2026', middot: '\u00b7',
  times: '\u00d7', minus: '\u2212', deg: '\u00b0', copy: '\u00a9', reg: '\u00ae', trade: '\u2122',
};

function decode(text) {
  return text.replace(/&(#x[0-9a-fA-F]+|#[0-9]+|[a-zA-Z][a-zA-Z0-9]*);/g, (whole, body) => {
    if (body[0] === '#') {
      const code = body[1] === 'x' ? parseInt(body.slice(2), 16) : parseInt(body.slice(1), 10);
      return Number.isFinite(code) ? String.fromCodePoint(code) : whole;
    }
    return ENTITIES[body] ?? whole;
  });
}

/** The text of an HTML fragment, with headings and lists kept and decoration dropped. */
function textOf(html) {
  const parts = [];
  const stack = [];
  let skipping = 0;
  let index = 0;

  // Inline elements carry no whitespace of their own, so their edges are marked and the mark
  // becomes a space only where two words would otherwise run together.
  const SEAM = '\u0000';

  const emit = (value) => {
    if (skipping === 0 && value) parts.push(value);
  };

  while (index < html.length) {
    const open = html.indexOf('<', index);
    if (open < 0) {
      emit(decode(html.slice(index)));
      break;
    }
    if (open > index) emit(decode(html.slice(index, open)));

    if (html.startsWith('<!--', open)) {
      const end = html.indexOf('-->', open + 4);
      index = end < 0 ? html.length : end + 3;
      continue;
    }

    const close = html.indexOf('>', open + 1);
    if (close < 0) break;
    const raw = html.slice(open + 1, close);
    index = close + 1;

    if (raw[0] === '!' || raw[0] === '?') continue;

    const name = (/^\/?\s*([a-zA-Z][\w:.-]*)/.exec(raw)?.[1] ?? '').toLowerCase();
    if (!name) continue;

    if (raw[0] === '/') {
      for (let at = stack.length - 1; at >= 0; at -= 1) {
        if (stack[at].name !== name) continue;
        if (stack[at].skips) skipping -= 1;
        stack.length = at;
        break;
      }
      if (BLOCK.has(name)) emit('\n\n');
      else if (!VOID.has(name) && !DROP.has(name)) emit(SEAM);
      continue;
    }

    const skips = DROP.has(name) || /aria-hidden\s*=\s*["']?true/.test(raw);
    const selfClosing = raw.endsWith('/');
    if (!VOID.has(name) && !selfClosing) {
      stack.push({ name, skips });
      if (skips) skipping += 1;
    }

    if (skips || skipping > 0) continue;

    if (name === 'br') emit('\n');
    else if (name === 'li' || name === 'dt') emit('\n- ');
    else if (name === 'dd') emit(': ');
    else if (/^h[1-6]$/.test(name)) emit(`\n\n${'#'.repeat(Number(name[1]))} `);
    else if (BLOCK.has(name)) emit('\n\n');
    else emit(SEAM);
  }

  return parts.join('');
}

function tidy(text) {
  return text
    .replace(/\r/g, '')
    .replace(/(?<![([\u2018\u201c])([^\s\u0000])\u0000+(?![.,;:!?\u2019\u201d)\]])/g, '$1 ')
    .replace(/\u0000/g, '')
    .replace(/[ \t\u00a0]+/g, ' ')
    .split('\n')
    .map((line) => line.trim())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    // A list item whose text sits in a block child leaves the marker on a line of its own.
    .replace(/^-$\n\n/gm, '- ')
    .trim();
}

const titleOf = (html, suffix) =>
  decode(/<title[^>]*>([\s\S]*?)<\/title>/i.exec(html)?.[1] ?? '')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(suffix, '')
    .trim();

/**
 * @param {object} options
 * @param {string} options.title  The heading the file opens with.
 * @param {string[]} [options.files] The names written at the site root.
 * @param {string[]} [options.references] Lines the file closes with, for addresses no page carries.
 * @param {string[]} [options.exclude] Path prefixes the corpus leaves out.
 * @param {string} [options.stripSuffix] A title suffix every page carries.
 */
export function llmsFullText({
  title,
  files = ['llms.txt', 'llms-full.txt'],
  references = [],
  exclude = [],
  stripSuffix = '',
}) {
  let origin = '';

  return {
    name: 'llms-full-text',
    hooks: {
      'astro:config:done': ({ config }) => {
        origin = config.site ? new URL(config.site).href.replace(/\/$/, '') : '';
      },

      'astro:build:done': async ({ dir, pages, logger }) => {
        const root = fileURLToPath(dir);
        // Astro reports each page's pathname without a leading slash, so the path and the
        // file name are both derived from the stripped form.
        const strip = (value) => value.replace(/^\//, '');
        const excluded = exclude.map(strip);
        const ordered = [...pages]
          .filter((page) => page.pathname === '' || page.pathname.endsWith('/') || page.pathname.endsWith('.html'))
          .map((page) => strip(page.pathname))
          .filter((path) => !path.startsWith('404'))
          .filter((path) => !excluded.some((prefix) => path.startsWith(prefix)))
          .sort((a, b) => {
            if (a === '') return -1;
            if (b === '') return 1;
            return a.localeCompare(b);
          });

        const blocks = [];
        for (const path of ordered) {
          const relative = path.endsWith('.html') ? path : `${path.replace(/\/?$/, '/')}index.html`;
          const html = await readFile(join(root, relative), 'utf8');
          const main = /<main[^>]*>([\s\S]*?)<\/main>/i.exec(html)?.[1] ?? /<body[^>]*>([\s\S]*?)<\/body>/i.exec(html)?.[1] ?? '';
          const heading = titleOf(html, stripSuffix);
          let body = tidy(textOf(main)).replace(
            /^(#{1,6}) /gm,
            (_, hashes) => `${'#'.repeat(Math.min(hashes.length + 2, 6))} `,
          );
          const [first] = body.split('\n');
          if (first?.startsWith('#') && first.replace(/^#+\s*/, '') === heading) {
            body = body.slice(first.length).replace(/^\n+/, '');
          }
          if (!body) continue;

          blocks.push([`## ${heading}`, `${origin}/${path}`, '', body, ''].join('\n'));
        }

        const text = [
          `# ${title}`,
          '',
          '> Every page this site publishes, in one file, as text. Generated at build time from the rendered pages.',
          '',
          ...blocks,
          ...(references.length > 0 ? ['## Links', '', ...references, ''] : []),
        ].join('\n');
        const written = `${text.trimEnd()}\n`;

        // The two names are conventions rather than a split: one file carries everything, and
        // a reader that asks for either name gets the corpus.
        for (const name of files) {
          await writeFile(join(root, name), written);
        }
        logger.info(`${files.join(', ')}: ${blocks.length} pages, ${Buffer.byteLength(written)} bytes`);
      },
    },
  };
}
