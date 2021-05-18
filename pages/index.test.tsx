import { screen } from "@testing-library/react";

import { getPage, TEST_PROJECT } from "../lib/test";
import { mockModels } from "../lib/__mocks__/prisma";

describe("Home", () => {
  it("renders without crashing", async () => {
    const testDate = new Date(2000, 0, 1);
    mockModels("project")
      .action("findMany")
      .with({})
      .resolvesTo([
        {
          ...TEST_PROJECT,
          updatedAt: testDate,
          queryTemplates: [],
          rulesets: [],
          judgements: [],
        },
      ]);
    const { render } = await getPage({
      route: "/",
    });
    render();
    expect(
      screen.getByRole("heading", { name: "Test User" })
    ).toBeInTheDocument();
  });
});
