import * as scorers from "./reciprocalRank";

const FIFTEEN_SEARCH_HITS = [
  "1",
  "87",
  "99",
  "001",
  "992",
  "15",
  "875",
  "995",
  "0015",
  "9925",
  "150",
  "8750",
  "9950",
  "00150",
  "99250",
];

const MAX_SCORE = 3;

describe("Reciprocal Rank", () => {
  it("If no relevant results, then RR is 0.", () => {
    const scores: [string, number][] = FIFTEEN_SEARCH_HITS.map((id) => [
      id + "_SUFFIX",
      MAX_SCORE,
    ]);

    expect(
      scorers.reciprocalRank(FIFTEEN_SEARCH_HITS, scores, 10, MAX_SCORE)
    ).toEqual(0);
  });

  it("If first result is the only one in relevant docs list, then RR is 1.", () => {
    const scores: [string, number][] = FIFTEEN_SEARCH_HITS.map((id) => [
      id + "_SUFFIX",
      MAX_SCORE,
    ]);
    scores.push(["1", MAX_SCORE]);

    expect(
      scorers.reciprocalRank(FIFTEEN_SEARCH_HITS, scores, 10, MAX_SCORE)
    ).toEqual(1);
  });
});
