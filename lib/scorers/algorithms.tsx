// This is the minimum score which qualifies a document as "relevant" to the
// search phrase.
const IS_RELEVANT = 2;

// Average precision, the ratio of documents scored higher than threshold in
// the list of results.
export function ap(docIds: string[], scores: [string, number][]): number {
  const nRev = scores.reduce(
    (a: number, [id, score]: [string, number]) =>
      a + (score >= IS_RELEVANT && docIds.indexOf(id) !== -1 ? 1 : 0),
    0
  );
  return nRev / Math.max(Math.min(docIds.length, scores.length), 1);
}
