// The kinds a page can be, in one place.
//
// The list is the vocabulary a document's `ktma.kind` is checked against, and `pages/[id].astro` types its map of
// components with it, so a kind cannot be named without the component that draws it. A surface that does not fit any
// of these is not a surface this center draws.
export const KINDS = ['live', 'video', 'document', 'runs', 'bench', 'device', 'package'] as const;

export type ArtifactKind = (typeof KINDS)[number];
