export type MockSearchPhrase = {
  id: number;
  phrase: string;
  score: {
    sierra: number;
    "ndcg@5": number;
    "ap@5": number;
    "p@5": number;
  };
  results: number;
};

export type MockSearchResult = {
  id: number;
  title: string;
  description: string;
  url: string;
  score: number;
  matches: {
    scores: {
      name: string;
      score: number;
    }[];
    explanation: {
      summary: string;
      json: any;
    };
  };
};

export type ShowOptions =
  | "all"
  | "no-errors"
  | "errors-only"
  | "have-results"
  | "no-results";
export type SortOptions =
  | "search-phrase-asc"
  | "search-phrase-desc"
  | "score-asc"
  | "score-desc"
  | "errors-asc"
  | "errors-desc"
  | "search-results-asc"
  | "search-results-desc";
