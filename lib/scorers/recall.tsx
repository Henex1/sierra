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

/**
 * Recall measure
 * @param docIds list of documents returned
 * @param scores the judgments list, list of tuples docId x score
 * @param k window size of the results to consider as "found"
 * @param threshold the threshold of a document to be considered relevant
 */
export function recallAtK(
  docIds: string[],
  scores: [string, number][],
  k: number,
  threshold = 3
): number {
  return recall(docIds.slice(0, k), scores, threshold);
}

export function recallAt10(
  docIds: string[],
  scores: [string, number][],
  threshold = 3
): number {
  return recallAtK(docIds, scores, 10, threshold);
}
