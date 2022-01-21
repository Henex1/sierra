// Average precision, the ratio of documents scored higher than threshold in
// the list of results.
export function ap(docIds: string[], scores: [string, number][]): number {
  // const k = docIds.length;
  // let total = 0;
  // docIds.forEach((id) => if (docIds.indexOf(id) !== -1) { total++ });
  const nRev = scores.reduce(
    (a: number, [id, _]: [string, number]) =>
      a + (docIds.indexOf(id) !== -1 ? 1 : 0),
    0
  );
  return nRev / Math.max(Math.min(docIds.length, scores.length), 1);
}

export function apAt5(docIds: string[], scores: [string, number][]): number {
  return ap(docIds.slice(0, 5), scores);
}

export function apAt10(docIds: string[], scores: [string, number][]): number {
  return ap(docIds.slice(0, 10), scores);
}
