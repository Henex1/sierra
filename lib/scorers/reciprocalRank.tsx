/**
 * Mean Reciprocal Rank
 * Docs: https://en.wikipedia.org/wiki/Mean_reciprocal_rank
 * @param docIds
 * @param scores
 * @param k
 * @param threshold
 */
export function reciprocalRank(
  docIds: string[],
  scores: [string, number][],
  k: number = docIds.length,
  threshold = 3
): number {
  const scoresDict: { [p: string]: number } = scores.reduce(
    (a, x) => ({ ...a, [x[0]]: x[1] }),
    {}
  );

  const p = Math.min(k, docIds.length);
  let maxScore = 0,
    maxScoreRank = 0;
  for (let i = 0; i < p; i++) {
    const scoreAtI: number = scoresDict[docIds[i]] || 0;
    if (scoreAtI >= threshold && scoreAtI > maxScore) {
      maxScore = scoreAtI;
      maxScoreRank = i + 1;
    }
  }
  return maxScoreRank > 0 ? 1 / maxScoreRank : 0;
}
