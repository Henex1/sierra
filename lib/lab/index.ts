export type SearchPhrase = {
  id: number;
  name: string;
  score: {
    sierra: number;
    "ndcg@5": number;
    "ap@5": number;
    "p@5": number;
  };
  results: number;
};

export type ShowOptions = "all" | "no-errors" | "errors-only" | "have-results" | "no-results";
export type SortOptions = "search-phrase-asc" | "search-phrase-desc" | "score-asc" | "score-desc" | "errors-asc" | "errors-desc" | "search-results-asc" | "search-results-desc"

export function getSearchPhrases(opts: {sort?: string; show?: string}): SearchPhrase[] {
  if (opts.show ==="errors-only" || opts === "no-results") {
    return []
  }
  
  return [
    {
      id: 0,
      name: "notebook",
      score: {
        sierra: 100,
        "ndcg@5": 100,
        "ap@5": 100,
        "p@5": 100,
      },
      results: 123,
    },
    {
      id: 1,
      name: "fruits",
      score: {
        sierra: 75,
        "ndcg@5": 75,
        "ap@5": 75,
        "p@5": 75,
      },
      results: 318,
    },
    {
      id: 2,
      name: "tote bags",
      score: {
        sierra: 50,
        "ndcg@5": 50,
        "ap@5": 50,
        "p@5": 50,
      },
      results: 251,
    },
    {
      id: 3,
      name: "briefcase",
      score: {
        sierra: 25,
        "ndcg@5": 25,
        "ap@5": 25,
        "p@5": 25,
      },
      results: 32,
    },
    {
      id: 4,
      name: "suitcase",
      score: {
        sierra: 1,
        "ndcg@5": 1,
        "ap@5": 1,
        "p@5": 1,
      },
      results: 112,
    },
  ];
}
