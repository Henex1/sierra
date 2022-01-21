/**
 * Recall measure
 * @param docIds list of documents returned
 * @param scores the judgments list, list of tuples docId x score
 * @param threshold the threshold of a document to be considered relevant
 */
export function recall(
  docIds: string[],
  scores: [string, number][],
  threshold = 3
): number {
  const scoresDict: { [p: string]: number } = scores.reduce(
    (a, x) => ({ ...a, [x[0]]: x[1] }),
    {}
  );

  const relevantDocuments: number = scores.filter((x) => x[1] >= threshold)
    .length;
  if (relevantDocuments == 0) return docIds.length === 0 ? 1 : 0;

  const relevantItemsFound = docIds
    .map((x) => scoresDict[x])
    .filter((x) => x >= threshold).length;
  return relevantItemsFound / relevantDocuments;
}
