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
export const CATEGORIES = ['demonstration', 'bench', 'planned'] as const;

export type Category = (typeof CATEGORIES)[number];

/** The tag's word, and what it means where a reader asks. */
export const CATEGORY_TAGS: Record<Category, { label: string; title: string }> = {
  demonstration: { label: 'demo', title: 'a run recorded, or a surface standing in its own address' },
  bench: { label: 'bench', title: 'a measurement, with the numbers the run wrote' },
  planned: { label: 'planned', title: 'a surface stated and not yet recorded' },
};

/** The category a page is, from what it states: a plan says `kind: planned` and nothing else is one. */
export function categoryOf(kind: string | undefined, demonstration: unknown): Category {
  if (demonstration !== undefined) return 'demonstration';
  if (kind === 'bench') return 'bench';
  // A plan is a page that says it is one. An absent kind cannot tell a plan from a page whose writer forgot the field, so
  // a page that states nothing is read as the demonstration it has always been drawn as.
  if (kind === 'planned') return 'planned';
  return 'demonstration';
}
