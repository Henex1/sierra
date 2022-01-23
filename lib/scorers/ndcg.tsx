/**
 * This will return the Cumulative Gain metric for any given position >= docIds.length
 * Docs: https://en.wikipedia.org/wiki/Discounted_cumulative_gain
 * @param docIds Document IDs for actual results
 * @param scores List of pairs [docId, rank] of judgments
 */
export function cg(docIds: string[], scores: [string, number][]): number {
  return scores.reduce((a: number, [id, score]: [string, number]) => {
    return a + (docIds.indexOf(id) !== -1 ? score : 0);
  }, 0);
}

/**
 * This will return the Discounted Cumulative Gain metric for any given position >= docIds.length
 * Docs: https://en.wikipedia.org/wiki/Discounted_cumulative_gain#Discounted_Cumulative_Gain
 * @param docIds
 * @param scores
 * @param k
 */
export function dcg(
  docIds: string[],
  scores: [string, number][],
  k: number
): number {
  const scoresDict: { [p: string]: number } = scores.reduce(
    (a, x) => ({ ...a, [x[0]]: x[1] }),
    {}
  );
  let dcg = 0;
  for (let i = 0; i < k; i++) {
    const p = i + 1;
    const relOfi: number = scoresDict[docIds[i]] || 0;
    const n = Math.pow(2, relOfi) - 1;
    const d = Math.log2(p + 1);
    dcg += d ? n / d : 0;
  }
  return dcg;
}

export function ndcg(
  docIds: string[],
  scores: [string, number][],
  k: number
): number {
  scores.sort((a, b) => b[1] - a[1]); // TODO confirm / apply sorting before passing to func
  const ideal = scores.slice(0, k).map((x) => x[0]);
  const n = dcg(docIds, scores, k);
  const d = dcg(ideal, scores, k);
  return d ? n / d : 0;
}

export function ndcgAt10(docIds: string[], scores: [string, number][]): number {
  return ndcg(docIds, scores, 10);
}
