import assert from 'node:assert/strict';
import { test } from 'node:test';
import { loadNotes, readNote, splitDocument } from './index.mjs';

const document = (header, body = 'A paragraph.\n') => `---\n${header}---\n\n${body}`;

const complete = (extra = '') => document(`title: A note\ndescription: One sentence.\ndate: "2026-11-17"\n${extra}`);

test('the header is separated from the body', () => {
  const { header, body } = splitDocument('a.md', complete());
  assert.equal(header.title, 'A note');
  assert.equal(body, 'A paragraph.');
});

test('the project attributes are read from the ktma map', () => {
  const note = readNote(
    'src/posts/a.md',
    complete('ktma:\n  platforms: [bare-metal, fpga]\n  products: [Ktema]\n  demonstration: /witness\n'),
  );
  assert.deepEqual(note.platforms, ['bare-metal', 'fpga']);
  assert.deepEqual(note.products, ['Ktema']);
  assert.equal(note.demonstration, '/witness');
});

test('an attribute at the top level is not read', () => {
  const note = readNote('src/posts/a.md', complete('platforms: [bare-metal]\n'));
  assert.deepEqual(note.platforms, []);
});

test('a document without a header is refused', () => {
  assert.throws(() => splitDocument('a.md', 'A paragraph.\n'), /no YAML header/);
});

test('a header without an end is refused', () => {
  assert.throws(() => splitDocument('a.md', '---\ntitle: A note\n'), /no end to its YAML header/);
});

test('a document needs a title, a description, and a date', () => {
  assert.throws(() => readNote('a.md', document('description: One.\ndate: "2026-11-17"\n')), /needs a title/);
  assert.throws(() => readNote('a.md', document('title: A.\ndate: "2026-11-17"\n')), /needs a description/);
  assert.throws(() => readNote('a.md', document('title: A.\ndescription: One.\n')), /needs a date/);
});

test('a date is normalised to the day', () => {
  assert.equal(readNote('a.md', complete()).date, '2026-11-17');
  const stamped = readNote('a.md', document('title: A.\ndescription: One.\ndate: 2026-11-17T09:30:00Z\n'));
  assert.equal(stamped.date, '2026-11-17');
});

test('a date that is not a day is refused', () => {
  assert.throws(() => readNote('a.md', document('title: A.\ndescription: One.\ndate: "last winter"\n')), /not a day/);
});

test('the name comes from the file, and two files may not share one', () => {
  assert.equal(readNote('src/posts/two-readers.md', complete()).id, 'two-readers');
  assert.throws(() => loadNotes({ 'a/one.md': complete(), 'b/one.md': complete() }), /two notes are named one/);
});

test('a note with no text is refused', () => {
  assert.throws(() => readNote('a.md', complete('').replace('A paragraph.', '')), /no text/);
});

test('a list of names that is not a list is refused', () => {
  assert.throws(() => readNote('a.md', complete('ktma:\n  platforms: bare-metal\n')), /not a list of names/);
});

test('the notes are newest first, and a day ties are ordered by name', () => {
  const sources = {
    'old.md': complete().replace('2026-11-17', '2026-11-15'),
    'new.md': complete().replace('2026-11-17', '2026-11-19'),
    'tie.md': complete().replace('2026-11-17', '2026-11-19'),
  };
  assert.deepEqual(
    loadNotes(sources).map((note) => note.id),
    ['new', 'tie', 'old'],
  );
});

test('a set that is not a map is refused', () => {
  assert.throws(() => loadNotes(null), /map of path to text/);
});
