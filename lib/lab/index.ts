export type {
  ExposedSearchPhrase,
  FailedSearchPhraseExecution,
} from "../execution/ExposedSearchPhrase";

export type MockSearchResult = {
  id: number;
  title: string;
  description: string;
  url: string;
  score: number | undefined;
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
