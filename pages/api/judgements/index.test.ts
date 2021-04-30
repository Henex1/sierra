import prisma, {
  Prisma,
  mockModels,
  mockSql,
} from "../../../lib/__mocks__/prisma";
import {
  handleCreateJudgement,
  handleUpdateJudgement,
  handleSetVotes,
} from "./index";
import { getApiRoute, TEST_PROJECT, TEST_JUDGEMENT } from "../../../lib/test";

describe("api/judgements", () => {
  it("/create", async () => {
    mockModels("project")
      .action("findFirst")
      .with({ where: { AND: { id: TEST_PROJECT.id } } })
      .resolvesTo(TEST_PROJECT);
    const initialInfo = {
      name: "A Judgement",
      projectId: TEST_PROJECT.id,
    };
    mockModels("judgement")
      .action("create")
      .with({ data: { name: initialInfo.name, project: { connect: { id: initialInfo.projectId } } } })
      .resolvesTo({ id: 42, ...initialInfo });
    const { judgement } = await getApiRoute(
      handleCreateJudgement,
      initialInfo,
      { method: "POST" }
    );
    expect(judgement).toHaveProperty("id");
    expect(judgement).toMatchObject(initialInfo);
  });

  it("/update", async () => {
    const initialInfo = {
      id: TEST_JUDGEMENT.id,
      name: "A Renamed Judgement",
    };
    mockModels("judgement")
      .action("findFirst")
      .with({ where: { AND: { id: initialInfo.id } } })
      .resolvesTo(initialInfo);
    const newInfo = { id: initialInfo.id, name: "Updated Name" };
    mockModels("judgement")
      .action("update")
      .with({ where: { id: initialInfo.id } })
      .resolvesTo({ ...initialInfo, ...newInfo });
    const { judgement } = await getApiRoute(
      handleUpdateJudgement,
      initialInfo,
      { method: "POST" }
    );
    expect(judgement).toHaveProperty("id");
    expect(judgement).toMatchObject(newInfo);
  });

  it("/setVotes", async () => {
    mockModels("judgement")
      .action("findFirst")
      .with({ where: { AND: { id: TEST_JUDGEMENT.id } } })
      .resolvesTo(TEST_JUDGEMENT);
    const info = {
      id: TEST_JUDGEMENT.id,
      votes: { "phrase a": { "doc 1": 4 } },
    };
    mockModels("judgementPhrase")
      .action("createMany")
      .with({
        data: [{ judgementId: TEST_JUDGEMENT.id, phrase: "phrase a" }],
      })
      .resolvesTo({ count: 4 });
    mockSql("$executeRaw")
      .with(
        Prisma.sql`
          INSERT INTO "Vote" ("judgementPhraseId", "documentId", "score", "createdAt", "updatedAt")
            SELECT "JudgementPhrase"."id", "documentId", "score", NOW(), NOW()
            FROM (
              VALUES (${"phrase a"}, ${"doc 1"}, cast(${"4"}::text as double precision))
            )
            AS "inputs" ("phrase", "documentId", "score")
            INNER JOIN "JudgementPhrase"
            ON "JudgementPhrase"."phrase" = "inputs"."phrase"
          ON CONFLICT ("judgementPhraseId", "documentId")
          DO UPDATE SET "score" = EXCLUDED."score", "updatedAt" = NOW()
        `
      )
      .resolvesTo(12);
    const { success } = await getApiRoute(handleSetVotes, info, {
      method: "POST",
    });
  });
});
