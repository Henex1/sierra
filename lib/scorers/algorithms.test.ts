import * as scorers from "./algorithms";

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

describe("algorithms test", () => {
  it("RRE10 judgments, 15 search results, 10 relevant results in top positions.", () => {
    let ids = FIFTEEN_SEARCH_HITS.slice(0, 10);
    let scores: [string, number][] = ids.map((id) => [id, 3]);

    // ap@10
    const ap10 = scorers.ap(ids, scores);
    expect(ap10).toEqual(1);

    // ap@5
    ids = FIFTEEN_SEARCH_HITS.slice(0, 5);
    scores = ids.map((id) => [id, 3]);
    const ap5 = scorers.ap(ids, scores);
    expect(ap5).toEqual(1);
  });
});
