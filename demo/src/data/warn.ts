// A report is printed once.
//
// The same document is read by the grid, the register and the notes, so a document that needed repair would otherwise
// say so three times. The build prints the first one and keeps going, because a document is a person's work in
// progress and the page can wait for it.
const said = new Set<string>();

export function warn(message: string): void {
  if (said.has(message)) return;
  said.add(message);
  console.warn(message);
}
