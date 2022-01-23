/**
 * Average precision, the ratio of documents scored higher than threshold in
 * the list of results. The threshold is by definition binary - relevant or not.
 * @param docIds Document IDs for actual results
 * @param scores List of pairs [docId, rank] of judgments
 * @param k position to measure at, defaults to length of results set
 */
export function ap(
  docIds: string[],
  scores: [string, number][],
  k: number = docIds.length
): number {
  const scoresDict: { [p: string]: number } = scores.reduce(
    (a, x) => ({ ...a, [x[0]]: x[1] }),
    {}
  );

  docIds = docIds.slice(0, k);

  const howManyRelevantDocuments = scores.filter((x) => x[1] > 0).length;
  if (howManyRelevantDocuments === 0) {
    return docIds.length ? 1 : 0;
  }

  let lastCollectedRecallLevel = 0;
  return docIds.reduce((previousValue, docId, index) => {
    const relevantItemsFound = docIds
      .slice(0, index + 1)
      .filter((id) => id in scoresDict && scoresDict[id] > 0).length;

    const currentPrecision = relevantItemsFound / (index + 1);
    const currentRecall =
      howManyRelevantDocuments === 1
        ? 1
        : relevantItemsFound / howManyRelevantDocuments;

    const retValue =
      previousValue +
      currentPrecision * (currentRecall - lastCollectedRecallLevel);
    lastCollectedRecallLevel = currentRecall;
    return retValue;
  }, 0);
}

export function apAt5(docIds: string[], scores: [string, number][]): number {
  return ap(docIds, scores, 5);
}

export function apAt10(docIds: string[], scores: [string, number][]): number {
  return ap(docIds, scores, 10);
}
