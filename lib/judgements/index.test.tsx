import { mockModels, mockSql, Prisma, Judgement } from "../__mocks__/prisma";
import { setVotes } from "./index";
import { TEST_JUDGEMENT } from "../test";

function addVotesSql(votes: [string, string, number][]) {
  return Prisma.sql`
    INSERT INTO "Vote" ("judgementPhraseId", "documentId", "score", "createdAt", "updatedAt")
      SELECT "JudgementPhrase"."id", "documentId", "score", NOW(), NOW()
      FROM (
        VALUES ${Prisma.join(
          votes.map(
            ([phr, doc, sco]) =>
              Prisma.sql`(${phr}, ${doc}, cast(${sco.toString()}::text as double precision))`
          )
        )}
      )
      AS "inputs" ("phrase", "documentId", "score")
      INNER JOIN "JudgementPhrase"
      ON "JudgementPhrase"."phrase" = "inputs"."phrase"
    ON CONFLICT ("judgementPhraseId", "documentId")
    DO UPDATE SET "score" = EXCLUDED."score", "updatedAt" = NOW()
  `;
}

// These are snapshot tests of the SQL access patterns. If you modify these
// test cases, you need to manually verify that the underlying behavior is
// actually correct.  We really need to spin up a postgres instance to test the
// end-to-end behavior here.
describe("setVotes", () => {
  it("adds Votes in bulk", async () => {
    mockModels("judgementPhrase")
      .action("createMany")
      .with({
        data: [
          { judgementId: TEST_JUDGEMENT.id, phrase: "phrase a" },
          { judgementId: TEST_JUDGEMENT.id, phrase: "phrase b" },
        ],
      })
      .resolvesTo([{}, {}]);
    mockSql("$executeRaw")
      .with(
        addVotesSql([
          ["phrase a", "doc_1", 4],
          ["phrase a", "doc_2", 3],
          ["phrase b", "doc_3", 4],
        ])
      )
      .resolvesTo(3);
    await setVotes(TEST_JUDGEMENT as Judgement, {
      "phrase a": { doc_1: 4, doc_2: 3 },
      "phrase b": { doc_3: 4 },
    });
  });

  it("adds JudgementPhrases", async () => {
    mockModels("judgementPhrase")
      .action("createMany")
      .with({
        data: [
          { judgementId: TEST_JUDGEMENT.id, phrase: "phrase a" },
          { judgementId: TEST_JUDGEMENT.id, phrase: "phrase b" },
        ],
      })
      .resolvesTo([{}, {}]);
    await setVotes(TEST_JUDGEMENT as Judgement, {
      "phrase a": {},
      "phrase b": {},
    });
  });

  it("deletes Votes in bulk", async () => {
    mockModels("vote")
      .action("deleteMany")
      .with({
        where: {
          phrase: { judgementId: TEST_JUDGEMENT.id },
          AND: {
            phrase: { phrase: "phrase b" },
            documentId: "doc_3",
            OR: {
              phrase: { phrase: "phrase a" },
              documentId: "doc_2",
              OR: {
                phrase: { phrase: "phrase a" },
                documentId: "doc_1",
              },
            },
          },
        },
      })
      .resolvesTo({ count: 3 });
    mockModels("judgementPhrase")
      .action("createMany")
      .with({
        data: [
          { judgementId: TEST_JUDGEMENT.id, phrase: "phrase a" },
          { judgementId: TEST_JUDGEMENT.id, phrase: "phrase b" },
        ],
      })
      .resolvesTo([{}, {}]);
    await setVotes(TEST_JUDGEMENT as Judgement, {
      "phrase a": {
        doc_1: null,
        doc_2: null,
      },
      "phrase b": {
        doc_3: null,
      },
    });
  });

  it("deletes JudgementPhrases", async () => {
    mockModels("vote")
      .action("deleteMany")
      .with({
        where: {
          phrase: {
            phrase: { in: ["phrase a", "phrase b"] },
            judgementId: TEST_JUDGEMENT.id,
          },
        },
      })
      .resolvesTo({ count: 0 });
    mockModels("judgementPhrase")
      .action("deleteMany")
      .with({
        where: {
          phrase: { in: ["phrase a", "phrase b"] },
          judgementId: TEST_JUDGEMENT.id,
        },
      })
      .resolvesTo({ count: 2 });
    await setVotes(TEST_JUDGEMENT as Judgement, {
      "phrase a": null,
      "phrase b": null,
    });
  });
});
