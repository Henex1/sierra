import prisma from "../../../lib/prisma";
import handler from "./[[...path]]";
import { getApiRoute, TEST_PROJECT_ID } from "../../../lib/test";

describe("api/searchphrases", () => {
  it("creates", async () => {
    const args = { phrase: "notebook", projectId: 1300 };
    const { phrase } = await getApiRoute(handler, args, {
      method: "POST",
      query: { method: "create" },
    });
    expect(phrase).toHaveProperty("id");
    expect(phrase).toMatchObject(args);

    // Test actual underlying object
    const actual = await prisma.searchPhrase.findUnique({
      where: { id: phrase.id },
    });
    expect(actual).toMatchObject(args);
  });

  it("deletes", async () => {
    // Create test object
    const searchPhrase = await prisma.searchPhrase.create({
      data: {
        projectId: TEST_PROJECT_ID,
        phrase: "xxx",
        judgement: {},
      },
    });

    const result = await getApiRoute(
      handler,
      {},
      {
        method: "DELETE",
        query: { path: [searchPhrase.id] },
      }
    );
    expect(result).toEqual({ success: true });
  });
});
