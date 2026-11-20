// A surface the center will carry and does not yet.
//
// A planned surface is a document with no `ktma.kind`: it states the claim the platform will prove, and its body
// holds the purpose, the procedure, the preconditions, the deliverable and the check that produces the evidence.
// Nothing here writes those sections; the document does.
import { pageDocuments, text, type Document } from './documents';
import type { Platform } from './taxonomy';

export interface Surface {
  /** The page's address: `/<id>`, the same shape a built demonstration uses. */
  id: string;
  title: string;
  products: string[];
  platforms: Platform[];
  /** What the platform will prove once the demonstration exists. */
  claim: string;
  summary: string;
  /** The claim it belongs to, in the register. */
  line?: string;
  /** Where the page stands in the grid. */
  order: number;
  /** The brief, as Markdown. */
  body: string;
}

/** A planned surface, where the document is one. */
function surfaceOf(document: Document, order: number): Surface {
  return {
    id: document.id,
    title: document.title,
    products: document.ktma.products as string[],
    platforms: document.ktma.platforms as Platform[],
    claim: text(document.ktma.claim) ?? document.description,
    summary: document.description,
    line: text(document.ktma.line),
    order,
    body: document.body,
  };
}

/** The planned surfaces, in the order the grid draws them. */
export function buildSurfaces(documents: Document[]): Surface[] {
  return pageDocuments(documents)
    .filter((document) => document.ktma.kind === undefined && document.ktma.demonstration === undefined)
    .map((document, index) => {
      const order = document.ktma.order;
      return surfaceOf(document, typeof order === 'number' && Number.isFinite(order) ? order : Number.POSITIVE_INFINITY + index);
    })
    .sort((a, b) => a.order - b.order || a.id.localeCompare(b.id));
}
