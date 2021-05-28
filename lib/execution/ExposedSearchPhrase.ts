interface Base {
  id: number;
  phrase: string;
}

export interface ScoredSearchPhraseExecution extends Base {
  __type: "ScoredSearchPhraseExecution";
  combinedScore: number | null;
  allScores: Record<string, number> | null;
  results: number;
  tookMs: number;
}

export const isSearchPhrase = (
  v: ExposedSearchPhrase
): v is ScoredSearchPhraseExecution =>
  v.__type === "ScoredSearchPhraseExecution";

export interface FailedSearchPhraseExecution extends Base {
  __type: "FailedSearchPhraseExecution";
  error: string;
}

export const isError = (
  v: ExposedSearchPhrase
): v is FailedSearchPhraseExecution =>
  v.__type === "FailedSearchPhraseExecution";

export type ExposedSearchPhrase =
  | ScoredSearchPhraseExecution
  | FailedSearchPhraseExecution;
