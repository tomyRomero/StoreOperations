// Splits text around the first place the query appears, ignoring case, so the match can be marked in
// place: "Fine Brush" and "brush" give ["Fine ", "Brush", ""]. Null when it doesn't appear.
export function matchParts(text: string, query: string): [before: string, match: string, after: string] | null {
  const needle = query.trim().toLowerCase();
  if (!needle) return null;
  const at = text.toLowerCase().indexOf(needle);
  if (at < 0) return null;
  return [text.slice(0, at), text.slice(at, at + needle.length), text.slice(at + needle.length)];
}
