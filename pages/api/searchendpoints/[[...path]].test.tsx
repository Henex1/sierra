import prisma from "../../../lib/prisma";
import { mockModels } from "../../../lib/__mocks__/prisma";
import handler from "./[[...path]]";
import { getApiRoute, TEST_ORG, TEST_ORGUSER } from "../../../lib/test";

describe("api/searchendpoints", () => {
  const initialInfo = {
    name: "My Search Endpoint",
    type: "ELASTICSEARCH",
    description: "",
    whitelist: [],
    resultId: "_id",
    displayFields: [],
    info: { endpoint: "http://localhost:9200/_search" },
  };
  it("POST /", async () => {
    mockModels("org").action("findMany").with({}).resolvesTo([TEST_ORG]);
    mockModels("orgUser")
      .action("findUnique")
      .with({})
      .resolvesTo(TEST_ORGUSER);
    mockModels("searchEndpoint")
      .action("create")
      .with({})
      .hasImplementation(({ args: { data } }: any) => ({ id: 42, ...data }));

    const { searchEndpoint } = await getApiRoute(handler, initialInfo, {
      method: "POST",
      query: { path: [] },
    });
    expect(searchEndpoint).toHaveProperty("id");
    expect(searchEndpoint).toMatchObject(initialInfo);
  });

  it("PATCH /:id", async () => {
    mockModels("searchEndpoint")
      .action("findFirst")
      .with({ where: { AND: { id: 42 } } })
      .resolvesTo({ id: 42, ...initialInfo });
    const revisedInfo = {
      name: "Updated Endpoint Name",
      info: { endpoint: "http://eshost:9200/_search" },
    };
    mockModels("searchEndpoint")
      .action("update")
      .with({ where: { id: 42 }, data: revisedInfo })
      .resolvesTo({ id: 42, ...initialInfo, ...revisedInfo });
    const { searchEndpoint: revisedSearchEndpoint } = await getApiRoute(
      handler,
      revisedInfo,
      {
        method: "PATCH",
        query: { path: [42] },
      }
    );
    expect(revisedSearchEndpoint).toMatchObject(revisedInfo);
  });

  it("DELETE /:id", async () => {
    mockModels("org").action("findMany").with({}).resolvesTo([TEST_ORG]);
    mockModels("searchEndpoint")
      .action("findFirst")
      .with({ where: { AND: { id: 42 } } })
      .resolvesTo({ id: 42, ...initialInfo });
    mockModels("searchEndpoint")
      .action("delete")
      .with({ where: { id: 42 } })
      .resolvesTo({ id: 42, ...initialInfo });
    const { success } = await getApiRoute(
      handler,
      {},
      {
        method: "DELETE",
        query: { path: [42] },
      }
    );
    expect(success).toEqual(true);
  });
});
