import assert from 'node:assert/strict';
import { test } from 'node:test';
import { textOf, tidy } from './index.mjs';

const markdown = (html) => tidy(textOf(html));

test('headings keep their level', () => {
  assert.equal(markdown('<h2>Title</h2>'), '## Title');
  assert.equal(markdown('<h1>One</h1><h3>Three</h3>'), '# One\n\n### Three');
});

test('paragraphs are separated by a blank line', () => {
  assert.equal(markdown('<p>One.</p><p>Two.</p>'), 'One.\n\nTwo.');
});

test('list items carry a marker', () => {
  assert.equal(markdown('<ul><li>One</li><li>Two</li></ul>'), '- One\n- Two');
});

test('a definition list reads as a labelled line', () => {
  assert.equal(markdown('<dl><dt>Records</dt><dd>72</dd></dl>'), '- Records: 72');
});

test('inline elements do not run two words together', () => {
  assert.equal(markdown('<span>Record</span><span>Ktema</span>'), 'Record Ktema');
  assert.equal(markdown("<span>Ktema</span><span>'s</span>"), "Ktema's");
});

test('decoration is dropped with its element', () => {
  const html = [
    '<p>Kept.</p>',
    '<script>var dropped = 1;</script>',
    '<style>.dropped{}</style>',
    '<svg><text>dropped</text></svg>',
    '<div aria-hidden="true"><p>dropped</p></div>',
    '<button>dropped</button>',
  ].join('');
  assert.equal(markdown(html), 'Kept.');
});

test('an aria-hidden subtree does not leak after it closes', () => {
  const html = '<div aria-hidden="true">gone</div><p>Kept.</p>';
  assert.equal(markdown(html), 'Kept.');
});

test('entities are decoded', () => {
  assert.equal(markdown('<p>A &amp; B &#39;C&#39; &rsquo;D&rsquo;</p>'), "A & B 'C' \u2019D\u2019");
});

test('blank runs collapse and no seam survives', () => {
  const text = markdown('<p>One.</p><p></p><p></p><p>Two.</p>');
  assert.equal(text, 'One.\n\nTwo.');
  assert.equal(text.includes('\u0000'), false);
});

test('a list marker left on its own line joins the text below', () => {
  assert.equal(tidy('- \n\nPump 03:14'), '- Pump 03:14');
});
