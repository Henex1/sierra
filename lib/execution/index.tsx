import _ from "lodash";

import prisma, {
  Prisma,
  User,
  SearchEndpoint,
  SearchConfiguration,
  Execution,
  SearchPhraseExecution,
  QueryTemplate,
  OffsetPagination,
  RulesetVersion,
} from "../prisma";
import { getQueryInterface, expandQuery } from "../searchendpoints";
import { userCanAccessSearchConfiguration } from "../searchconfigurations";
import { SortOptions, ShowOptions } from "../lab";
import * as scorers from "../scorers/algorithms";
import { percentiles } from "../math";
import { isNotEmpty } from "../../utils/array";

export type { Execution };

export type SearchPhraseExecutionResults = {
  id: string;
  explanation: Record<string, unknown>;
}[];

const executionSelect = {
  id: true,
  searchConfigurationId: true,
  meta: true,
  combinedScore: true,
  allScores: true,
};

export type ExposedExecution = Pick<Execution, keyof typeof executionSelect>;

const speSelect = {
  id: true,
  executionId: true,
  phrase: true,
  totalResults: true,
  results: true,
  combinedScore: true,
  allScores: true,
};

export type ExposedSearchPhraseExecution = Pick<
  SearchPhraseExecution,
  keyof typeof speSelect
>;

export function formatExecution(val: Execution): ExposedExecution {
  return _.pick(val, _.keys(executionSelect)) as ExposedExecution;
}

export function formatSearchPhraseExecution(
  val: SearchPhraseExecution
): ExposedSearchPhraseExecution {
  return _.pick(val, _.keys(speSelect)) as ExposedSearchPhraseExecution;
}

export async function getExecution(
  user: User,
  id: string
): Promise<Execution | null> {
  const execution = await prisma.execution.findFirst({
    where: { id, searchConfiguration: userCanAccessSearchConfiguration(user) },
  });
  return execution;
}

export async function getLatestExecution(
  sc: SearchConfiguration
): Promise<Execution | null> {
  const execution = await prisma.execution.findFirst({
    where: { searchConfigurationId: sc.id },
    orderBy: [{ createdAt: "desc" }],
  });
  return execution;
}

export async function listExecutions(
  sc: SearchConfiguration
): Promise<Execution[]> {
  const execution = await prisma.execution.findMany({
    where: { searchConfigurationId: sc.id },
    orderBy: [{ createdAt: "desc" }],
    take: 10,
  });
  return execution;
}

const sortMapping: Record<
  SortOptions,
  Prisma.SearchPhraseExecutionOrderByInput
> = {
  "search-phrase-asc": { phrase: "asc" },
  "search-phrase-desc": { phrase: "desc" },
  "score-asc": { combinedScore: "asc" },
  "score-desc": { combinedScore: "desc" },
  "errors-asc": { error: "asc" },
  "errors-desc": { error: "asc" },
  "search-results-asc": { totalResults: "asc" },
  "search-results-desc": { totalResults: "desc" },
};

const filterMapping: Record<
  ShowOptions,
  Prisma.SearchPhraseExecutionWhereInput
> = {
  all: {},
  "no-errors": { error: null },
  "errors-only": { error: { not: null } },
  "have-results": { totalResults: { gt: 0 } },
  "no-results": { totalResults: 0 },
};

type GetSearchPhraseOptions = OffsetPagination & {
  sort?: SortOptions;
  filter?: ShowOptions;
};

export async function getSearchPhrases(
  execution: Execution,
  {
    take = 20,
    skip = 0,
    sort = "search-phrase-asc",
    filter = "all",
  }: GetSearchPhraseOptions = {}
): Promise<SearchPhraseExecution[]> {
  const phrases = await prisma.searchPhraseExecution.findMany({
    where: { executionId: execution.id, AND: filterMapping[filter] ?? {} },
    orderBy: [sortMapping[sort]].filter(_.identity).concat([{ phrase: "asc" }]),
    take,
    skip,
  });
  return phrases;
}

export async function countSearchPhrases(
  execution: Execution
): Promise<number> {
  return await prisma.searchPhraseExecution.count({
    where: { executionId: execution.id },
  });
}

export type CombinedJudgementPhrase = {
  phrase: string;
  // Ordered list of [document ID, score] for this phrase
  results: [string, number][];
};

// getCombinedJudgements returns the aggregated score for all judged documents
// enabled on the given SearchConfiguration. Handles weighting the judgements.
export async function getCombinedJudgements(
  config: SearchConfiguration
): Promise<CombinedJudgementPhrase[]> {
  const results = await prisma.$queryRaw`
    SELECT JP."phrase", V."documentId", SUM(JSC."weight" * V."score") / SUM(JSC."weight") AS "score"
    FROM "JudgementSearchConfiguration" AS JSC
    INNER JOIN "JudgementPhrase" AS JP
    ON JP."judgementId" = JSC."judgementId"
    LEFT JOIN "Vote" AS V
    ON V."judgementPhraseId" = JP."id"
    WHERE JSC."searchConfigurationId" = ${config.id}
    GROUP BY JP."phrase", V."documentId"
    ORDER BY JP."phrase", V."documentId"
  `;
  // If documentId is NULL< it means there are no judgements for this phrase,
  // but we still need to return it to get the unjudged results.
  return _.map(_.groupBy(results, "phrase"), (records, phrase) => ({
    phrase,
    results: records[0]?.documentId
      ? records.map(({ documentId, score }) => [documentId, score])
      : [],
  }));
}

export async function getCombinedJudgementForPhrase(
  config: SearchConfiguration,
  phrase: string,
  documentIds?: string[]
): Promise<CombinedJudgementPhrase> {
  const results: Array<{
    documentId: string;
    score: number;
  }> = await prisma.$queryRaw`
    SELECT V."documentId", SUM(JSC."weight" * V."score") / SUM(JSC."weight") AS "score"
    FROM "JudgementSearchConfiguration" AS JSC
    INNER JOIN "JudgementPhrase" AS JP
    ON JP."judgementId" = JSC."judgementId"
    INNER JOIN "Vote" AS V
    ON V."judgementPhraseId" = JP."id"
    WHERE JSC."searchConfigurationId" = ${config.id}
    AND JP."phrase" = ${phrase}
    ${
      documentIds
        ? Prisma.sql`AND V."documentId" IN (${Prisma.join(documentIds)})`
        : Prisma.empty
    }
    GROUP BY V."documentId"
    ORDER BY V."documentId"
  `;
  if (results.length === 0) {
    return { phrase, results: [] };
  }
  return {
    phrase,
    results: results.map(({ documentId, score }) => [documentId, score]),
  };
}

function mean(input: [number, ...number[]]): number {
  return input.reduce((a, b) => a + b) / input.length;
}

export async function createExecution(
  config: SearchConfiguration
): Promise<Execution> {
  const tpl = (await prisma.queryTemplate.findFirst({
    where: { searchConfigurations: { some: { id: config.id } } },
  }))!;
  const endpoint = (await prisma.searchEndpoint.findFirst({
    where: { projects: { some: { queryTemplates: { some: { id: tpl.id } } } } },
  }))!;
  const rv = await prisma.rulesetVersion.findMany({
    where: { searchConfigurations: { some: { id: config.id } } },
  });
  const judgements = await getCombinedJudgements(config);
  const results: Prisma.SearchPhraseExecutionCreateWithoutExecutionInput[] = [];
  for (const j of judgements) {
    results.push(await newSearchPhraseExecution(endpoint, tpl, rv, j));
  }

  const combinedNumbers = results
    .map((r) => r.combinedScore)
    .filter(_.isNumber);
  const combinedScore = isNotEmpty(combinedNumbers) ? mean(combinedNumbers) : 0;
  const scorers = Object.keys(results.find((x) => x)?.allScores ?? {}) ?? [];

  const allScores = _.fromPairs(
    scorers.map((scorer) => {
      const allScoresNumbers = results
        .map((r) => (r.allScores as Record<string, number> | null)?.[scorer])
        .filter(_.isNumber);
      return [
        scorer,
        isNotEmpty(allScoresNumbers) ? mean(allScoresNumbers) : 0,
      ];
    })
  );
  const [tookP50, tookP95, tookP99] = percentiles(
    results,
    [0.5, 0.95, 0.99],
    (r) => r.tookMs
  );
  const execution = await prisma.execution.create({
    data: {
      searchConfigurationId: config.id,
      meta: { tookP50, tookP95, tookP99 },
      combinedScore,
      allScores,
      phrases: { create: results },
    },
  });
  return execution;
}

async function newSearchPhraseExecution(
  endpoint: SearchEndpoint,
  tpl: QueryTemplate,
  rv: RulesetVersion[],
  jp: CombinedJudgementPhrase
): Promise<Prisma.SearchPhraseExecutionCreateWithoutExecutionInput> {
  const iface = getQueryInterface(endpoint);
  const query = await expandQuery(endpoint, tpl, rv, undefined, jp.phrase);
  const queryResult = await iface.executeQuery(query);
  const allScores =
    jp.results.length > 0
      ? {
          "ap@5": scorers.ap(
            queryResult.results.slice(0, 5).map((r) => r.id),
            jp.results
          ),
        }
      : null;
  if (process.env.NODE_ENV === "development" && Math.random() < 0.1) {
    queryResult.error = "Randomly injected error (development mode)";
  }
  const allScoresNumbers = allScores ? Object.values(allScores) : null;
  const combinedScore =
    allScoresNumbers && isNotEmpty(allScoresNumbers)
      ? mean(allScoresNumbers)
      : null;
  return {
    phrase: jp.phrase,
    tookMs: queryResult.tookMs,
    totalResults: queryResult.totalResults,
    error: queryResult.error,
    results: queryResult.results,
    combinedScore,
    allScores,
  };
}

export async function getSearchPhraseExecution(
  user: User,
  speId: number
): Promise<SearchPhraseExecution | null> {
  return await prisma.searchPhraseExecution.findFirst({
    where: {
      execution: {
        searchConfiguration: userCanAccessSearchConfiguration(user),
      },
      id: speId,
    },
  });
}
