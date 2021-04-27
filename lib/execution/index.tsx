import prisma, {
  SearchConfiguration,
  Execution,
  SearchPhraseExecution,
} from "../prisma";

export type { Execution };

const speSelect = {
  id: true,
  executionId: true,
  phrase: true,
  combinedScore: true,
  allScores: true,
};

export type SearchPhraseExecutionInfo = Pick<
  SearchPhraseExecution,
  keyof typeof speSelect
>;

export async function getLatestExecution(
  sc: SearchConfiguration
): Promise<Execution | null> {
  const execution = await prisma.execution.findFirst({
    where: { searchConfigurationId: sc.id },
    orderBy: [{ createdAt: "desc" }],
  });
  return execution;
}

export async function getSearchPhrases(
  execution: Execution
): Promise<SearchPhraseExecutionInfo[]> {
  const phrases = await prisma.searchPhraseExecution.findMany({
    where: { executionId: execution.id },
    select: speSelect,
    orderBy: [{ phrase: "desc" }],
    take: 20,
  });
  return phrases;
}
