// The binding between a document's sentence and the number a renderer supplies.
//
// A document writes `{{name}}` where a measurement belongs, and the page hands the values in. The corpus's assembly is
// where the two sides are compared: every name the document asks for has a value, and every value is asked for. What
// is left here is the renderer's half, which stops on a name it was not handed rather than publishing a placeholder.

/** The document with every `{{name}}` replaced, or a build that stops on the name it could not fill. */
export function filled(source: string, values: Record<string, string>): string {
  return source.replace(/\{\{\s*([a-zA-Z0-9_-]+)\s*\}\}/g, (_match, name: string) => {
    const value = values[name];
    if (value === undefined) throw new Error(`the document asks for a value it was not given: ${name}`);
    return value;
  });
}

/** One `##` section of a document, by the heading a reader sees. */
export interface Section {
  name: string;
  body: string;
}

/** A document's sections, in the order it states them. The text before the first heading is not a section. */
export function sectionsOf(source: string): Section[] {
  const lines = source.split('\n');
  const sections: Section[] = [];
  let name: string | null = null;
  let body: string[] = [];
  const push = () => {
    if (name !== null) sections.push({ name, body: body.join('\n').trim() });
  };
  for (const line of lines) {
    const heading = /^##\s+(.+?)\s*$/.exec(line);
    if (heading) {
      push();
      name = heading[1];
      body = [];
      continue;
    }
    if (name !== null) body.push(line);
  }
  push();
  return sections;
}
