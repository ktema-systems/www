// The kinds a page can be, in one place.
//
// The list is the vocabulary a document's `ktma.kind` is checked against, and `pages/[id].astro` types its map of
// components with it, so a kind cannot be named without the component that draws it. A surface that does not fit any
// of these is not a surface this center draws.
export const KINDS = ['live', 'video', 'document', 'runs', 'bench', 'device', 'package'] as const;

export type ArtifactKind = (typeof KINDS)[number];

/**
 * What a page is, which is the tag a reader sees before opening it.
 *
 * `kind` says how a page is drawn; this says what the work is. The site carries demonstrations, measurements and plans
 * for both, so a reader is told which one a page is rather than inferring it from the shape of the page. The corpus
 * board reads the same field from the same documents, so one tag names one thing in both places.
 */
export const CATEGORIES = ['demonstration', 'bench', 'figure', 'planned'] as const;

export type Category = (typeof CATEGORIES)[number];

/** Whether a document named a category the center draws. */
export const isCategory = (value: unknown): value is Category =>
  typeof value === 'string' && (CATEGORIES as readonly string[]).includes(value);

/** The tag's word, and what it means where a reader asks. */
export const CATEGORY_TAGS: Record<Category, { label: string; title: string }> = {
  demonstration: { label: 'demo', title: 'a run recorded, or a surface standing in its own address' },
  bench: { label: 'bench', title: 'a measurement, with the numbers the run wrote' },
  figure: { label: 'figure', title: 'a still or a drawing that carries the work visually' },
  planned: { label: 'planned', title: 'a surface stated and not yet recorded' },
};

/** The category a page is: a plan is a page the center does not carry, which the corpus states by leaving `kind` out. */
export function categoryOf(kind: string | undefined, demonstration: unknown, declared?: unknown): Category {
  // A page that names its category decides it, for work no kind describes: a finished layout is drawn, not run.
  if (isCategory(declared)) return declared;
  if (demonstration !== undefined) return 'demonstration';
  if (kind === 'bench') return 'bench';
  // A plan is work stated and not delivered, and the corpus says so by writing no `kind` and a plan fact beside it. The
  // field is also read where a page states it outright, so a document may say `planned` and mean the same thing.
  if (kind === undefined || kind === '' || kind === 'planned') return 'planned';
  return 'demonstration';
}
