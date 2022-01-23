import * as scorers from "./precision";

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

describe("Average Precision", () => {
  it("If all results in the window are relevant, then the AP is 1", () => {
    const scores: [string, number][] = FIFTEEN_SEARCH_HITS.map((id) => [id, 3]);

    // ap@10
    const ap10 = scorers.apAt5(FIFTEEN_SEARCH_HITS, scores);
    expect(ap10).toEqual(1);

    // ap@5
    const ap5 = scorers.apAt10(FIFTEEN_SEARCH_HITS, scores);
    expect(ap5).toEqual(1);
  });

  it("If no results in the window are relevant, then the AP is 0.", () => {
    const scores: [string, number][] = FIFTEEN_SEARCH_HITS.map((id) => [
      id + "_SUFFIX",
      3,
    ]);

    // ap@10
    const ap10 = scorers.apAt5(FIFTEEN_SEARCH_HITS, scores);
    expect(ap10).toEqual(0);

    // ap@5
    const ap5 = scorers.apAt10(FIFTEEN_SEARCH_HITS, scores);
    expect(ap5).toEqual(0);
  });

  it("Scenario: 10 judgments, 15 search results, 10 relevant results in top positions.", () => {
    const scores: [string, number][] = FIFTEEN_SEARCH_HITS.slice(
      0,
      10
    ).map((id) => [id, 3]);

    // ap@10
    const ap10 = scorers.apAt5(FIFTEEN_SEARCH_HITS, scores);
    expect(ap10).toEqual(1);

    // ap@5
    const ap5 = scorers.apAt10(FIFTEEN_SEARCH_HITS, scores);
    expect(ap5).toEqual(1);
  });

  it("Scenario: 10 judgments, 15 search results, 5 relevant results in top positions.", () => {
    const scores: [string, number][] = FIFTEEN_SEARCH_HITS.slice(
      0,
      10
    ).map((id) => [id, 3]);

    const hits = FIFTEEN_SEARCH_HITS.slice(0, 5).concat(
      FIFTEEN_SEARCH_HITS.slice(5, 15).map((id) => id + "_SUFFIX")
    );

    expect(scorers.ap(hits, scores, FIFTEEN_SEARCH_HITS.length)).toEqual(
      (1 / 10) * 5
    );
  });

  // it("Scenario: 10 judgments, 15 search results, 5 relevant results in middle positions.", () => {
  //   const scores: [string, number][] = FIFTEEN_SEARCH_HITS.slice(
  //     0,
  //     10
  //   ).map((id) => [id, 3]);
  //
  //   const hits = FIFTEEN_SEARCH_HITS.slice(0, 5)
  //     .map((id) => id + "_PRE")
  //     .concat(
  //       FIFTEEN_SEARCH_HITS.slice(5, 10).concat(
  //         FIFTEEN_SEARCH_HITS.slice(10, 15).map((id) => id + "_POST")
  //       )
  //     );
  //
  //   expect(scorers.ap(hits, scores)).toEqual(0.1772);
  // });
});
