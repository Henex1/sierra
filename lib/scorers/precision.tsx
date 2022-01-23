// Average precision, the ratio of documents scored higher than threshold in
// the list of results.
export function ap(
  docIds: string[],
  scores: [string, number][],
  k: number
): number {
  if (scores.length === 0) {
    return docIds.length ? 1 : 0;
  }

  const scoresDict: { [p: string]: number } = scores.reduce(
    (a, x) => ({ ...a, [x[0]]: x[1] }),
    {}
  );

  docIds = docIds.splice(0, k);

  const howManyRelevantDocuments = scores.length;
  const relevantItemsFound = docIds.filter((id) => id in scoresDict).length;

  return docIds.reduce((previousValue, docId, index) => {
    const currentPrecision = relevantItemsFound / (index + 1);
    const currentRecall =
      howManyRelevantDocuments === 1
        ? 1
        : relevantItemsFound / howManyRelevantDocuments;
    return previousValue + currentPrecision * (currentRecall - previousValue);
  }, 0);
}

export function apAt5(docIds: string[], scores: [string, number][]): number {
  return ap(docIds, scores, 5);
}

export function apAt10(docIds: string[], scores: [string, number][]): number {
  return ap(docIds, scores, 10);
}
