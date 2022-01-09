import { mockModels } from "../../../lib/__mocks__/prisma";
import handler from "./[[...path]]";
import {
  getApiRoute,
  TEST_ORG,
  TEST_ORGUSER,
  TEST_SEARCHENDPOINT,
} from "../../../lib/test";

describe("api/searchendpoints", () => {
  const initialInfo = {
    name: "My Search Endpoint",
    type: "ELASTICSEARCH",
    description: "",
    resultId: "_id",
    displayFields: [],
    info: {
      endpoint: "http://localhost:9200/",
      index: "icecat",
      ignoreSSL: false,
    },
    orgId: TEST_ORG.id,
  };
  it("POST /", async () => {
    mockModels("orgUser")
      .action("findUnique")
      .with({})
      .resolvesTo(TEST_ORGUSER);
    mockModels("searchEndpoint")
      .action("create")
      .with({})
      .hasImplementation(({ args: { data } }: any) => ({
        id: TEST_SEARCHENDPOINT.id,
        ...data,
      }));

    const { searchEndpoint } = await getApiRoute(handler, initialInfo, {
      method: "POST",
      query: { path: [] },
    });
    expect(searchEndpoint).toHaveProperty("id");
    expect(searchEndpoint).toMatchObject(initialInfo);
  });

  it("PATCH /:id - no credentials", async () => {
    mockModels("searchEndpoint")
      .action("findFirst")
      .with({ where: { AND: { id: TEST_SEARCHENDPOINT.id } } })
      .resolvesTo({ id: TEST_SEARCHENDPOINT.id, ...initialInfo });
    const revisedInfo = {
      name: "Updated Endpoint Name",
      info: {
        endpoint: "http://eshost:9200/",
        index: "icecat",
        ignoreSSL: false,
      },
    };
    mockModels("searchEndpoint")
      .action("update")
      .with({ where: { id: TEST_SEARCHENDPOINT.id }, data: revisedInfo })
      .resolvesTo({
        id: TEST_SEARCHENDPOINT.id,
        ...initialInfo,
        ...revisedInfo,
      });
    const { searchEndpoint: revisedSearchEndpoint } = await getApiRoute(
      handler,
      revisedInfo,
      {
        method: "PATCH",
        query: { path: [TEST_SEARCHENDPOINT.id] },
      }
    );
    expect(revisedSearchEndpoint).toMatchObject(revisedInfo);
  });

  it("PATCH /:id - null credentials", async () => {
    mockModels("searchEndpoint")
      .action("findFirst")
      .with({ where: { AND: { id: TEST_SEARCHENDPOINT.id } } })
      .resolvesTo({ id: TEST_SEARCHENDPOINT.id, ...initialInfo });
    const revisedInfo = {
      name: "Updated Endpoint Name",
      info: {
        endpoint: "http://eshost:9200/",
        index: "icecat",
        ignoreSSL: false,
      },
      credentials: null,
    };
    mockModels("searchEndpoint")
      .action("update")
      .with({ where: { id: TEST_SEARCHENDPOINT.id }, data: revisedInfo })
      .resolvesTo({
        id: TEST_SEARCHENDPOINT.id,
        ...initialInfo,
        ...revisedInfo,
      });
    const { searchEndpoint: revisedSearchEndpoint } = await getApiRoute(
      handler,
      revisedInfo,
      {
        method: "PATCH",
        query: { path: [TEST_SEARCHENDPOINT.id] },
      }
    );
    const { credentials, ...expected } = revisedInfo;
    expect(revisedSearchEndpoint).toMatchObject(expected);
  });

  it("PATCH /:id - update credentials", async () => {
    mockModels("searchEndpoint")
      .action("findFirst")
      .with({ where: { AND: { id: TEST_SEARCHENDPOINT.id } } })
      .resolvesTo({ id: TEST_SEARCHENDPOINT.id, ...initialInfo });
    const revisedInfo = {
      name: "Updated Endpoint Name",
      info: {
        endpoint: "http://eshost:9200/",
        index: "icecat",
        ignoreSSL: false,
      },
      credentials: { username: "a", password: "b" },
    };
    const internalData = { ...revisedInfo, credentials: expect.any(String) };
    mockModels("searchEndpoint")
      .action("update")
      .with({ where: { id: TEST_SEARCHENDPOINT.id }, data: internalData })
      .resolvesTo({
        id: TEST_SEARCHENDPOINT.id,
        ...initialInfo,
        ...revisedInfo,
      });
    const { searchEndpoint: revisedSearchEndpoint } = await getApiRoute(
      handler,
      revisedInfo,
      {
        method: "PATCH",
        query: { path: [TEST_SEARCHENDPOINT.id] },
      }
    );
    const exposedData: any = {
      id: TEST_SEARCHENDPOINT.id,
      ...initialInfo,
      ...revisedInfo,
    };
    delete exposedData.credentials;
    expect(revisedSearchEndpoint).toMatchObject(exposedData);
  });

  it("DELETE /:id", async () => {
    mockModels("searchEndpoint")
      .action("findFirst")
      .with({ where: { AND: { id: TEST_SEARCHENDPOINT.id } } })
      .resolvesTo({ id: TEST_SEARCHENDPOINT.id, ...initialInfo });
    mockModels("searchEndpoint")
      .action("delete")
      .with({ where: { id: TEST_SEARCHENDPOINT.id } })
      .resolvesTo({ id: TEST_SEARCHENDPOINT.id, ...initialInfo });
    const { success } = await getApiRoute(
      handler,
      {},
      {
        method: "DELETE",
        query: { path: [TEST_SEARCHENDPOINT.id] },
      }
    );
    expect(success).toEqual(true);
  });
});
