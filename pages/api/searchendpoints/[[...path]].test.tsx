import prisma from "../../../lib/prisma";
import handler from "./[[...path]]";
import { getApiRoute } from "../../../lib/test";

describe("SearchEndpoints", () => {
  it("integration test", async () => {
    // Test create
    const initialInfo = {
      name: "My Search Endpoint",
      type: "ELASTICSEARCH",
      info: { endpoint: "http://localhost:9200/_search" },
    };
    const { searchEndpoint } = await getApiRoute(handler, initialInfo, {
      method: "POST",
      query: { path: [] },
    });
    expect(searchEndpoint).toHaveProperty("id");
    expect(searchEndpoint).toMatchObject(initialInfo);

    // Test update
    const revisedInfo = {
      name: "Updated Endpoint Name",
      info: { endpoint: "http://eshost:9200/_search" },
    };
    const { searchEndpoint: revisedSearchEndpoint } = await getApiRoute(
      handler,
      revisedInfo,
      {
        method: "PATCH",
        query: { path: [searchEndpoint.id] },
      }
    );
    expect(revisedSearchEndpoint).toMatchObject(revisedInfo);

    // Test actual underlying object
    const actualSearchEndpoint = await prisma.searchEndpoint.findUnique({
      where: { id: searchEndpoint.id },
    });
    expect(actualSearchEndpoint).toMatchObject(revisedInfo);

    // Test delete
    const { success } = await getApiRoute(
      handler,
      {},
      {
        method: "DELETE",
        query: { path: [searchEndpoint.id] },
      }
    );
    expect(success).toEqual(true);
  });
});
