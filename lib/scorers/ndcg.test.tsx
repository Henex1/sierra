import * as scorers from "./ndcg";

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

describe("NDCG", () => {
  it("If all results in the window are relevant, then the NDCG is 1.", () => {
    const scores: [string, number][] = FIFTEEN_SEARCH_HITS.map((id) => [id, 3]);

    expect(scorers.ndcgAt10(FIFTEEN_SEARCH_HITS, scores)).toEqual(1);
  });

  it("If no results in the window are relevant, then the NDCG is 0.", () => {
    const scores: [string, number][] = FIFTEEN_SEARCH_HITS.map((id) => [
      id + "_SUFFIX",
      3,
    ]);

    expect(scorers.ndcgAt10(FIFTEEN_SEARCH_HITS, scores)).toEqual(0);
  });

  it("Scenario: 15 judgments, 15 search results, 10 relevant results in top positions. NDCG = 1", () => {
    const scores: [string, number][] = FIFTEEN_SEARCH_HITS.slice(
      0,
      10
    ).map((id) => [id, 3]);

    expect(scorers.ndcgAt10(FIFTEEN_SEARCH_HITS, scores)).toEqual(1);
  });

  it("Scenario: 10 judgments, 15 search results, 5 relevant results in top positions.", () => {
    const scores: [string, number][] = FIFTEEN_SEARCH_HITS.slice(
      0,
      10
    ).map((id) => [id, 3]);

    const hits = FIFTEEN_SEARCH_HITS.slice(0, 5).concat(
      FIFTEEN_SEARCH_HITS.slice(5, 15).map((id) => id + "_SUFFIX")
    );

    expect(scorers.ndcgAt10(hits, scores)).toEqual(0.6489315753318466);
  });

  it("Scenario: 10 judgments, 15 search results, 5 relevant results from 5th position.", () => {
    const scores: [string, number][] = FIFTEEN_SEARCH_HITS.slice(
      0,
      10
    ).map((id) => [id, 3]);

    const hits = FIFTEEN_SEARCH_HITS.slice(0, 5)
      .map((id) => id + "_PRE")
      .concat(
        FIFTEEN_SEARCH_HITS.slice(5, 10).concat(
          FIFTEEN_SEARCH_HITS.slice(10, 15).map((id) => id + "_POST")
        )
      );

    expect(scorers.ndcgAt10(hits, scores)).toEqual(0.35106842466815336);
  });

  it("Scenario: 5 judgments, 10 search results, 5 relevant results from first position.", () => {
    const scores: [string, number][] = FIFTEEN_SEARCH_HITS.slice(
      0,
      5
    ).map((id) => [id, 3]);

    const hits = FIFTEEN_SEARCH_HITS.slice(0, 5).concat(
      FIFTEEN_SEARCH_HITS.slice(5, 10).map((id) => id + "_POST")
    );

    expect(scorers.ndcgAt10(hits, scores)).toEqual(1);
  });

  it("Scenario: 6 judgments, 10 search results, different scores.", () => {
    const tmp = [3, 3, 2, 1, 0, 3, 3, 2, 0, 0];
    const scores: [string, number][] = FIFTEEN_SEARCH_HITS.slice(
      0,
      10
    ).map((id, index) => [id, tmp[index]]);

    expect(scorers.ndcgAt10(FIFTEEN_SEARCH_HITS.slice(0, 10), scores)).toEqual(
      0.9329847446717803
    );
  });
});
