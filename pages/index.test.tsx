import { screen } from "@testing-library/react";

import {
  getPage,
  TEST_PROJECT,
  TEST_SEARCHCONFIGURATION,
  TEST_EXECUTION,
  TEST_PROJECT_ID,
  TEST_SEARCHCONFIGURATION_ID,
  TEST_ORG,
  TEST_SEARCHENDPOINT,
  TEST_JUDGEMENT,
  TEST_QUERYTEMPLATE,
  TEST_RULESET,
} from "../lib/test";
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
          createdAt: testDate,
          queryTemplates: [],
          rulesets: [],
          judgements: [],
        },
      ]);
    mockModels("judgement")
      .action("findMany")
      .with({})
      .resolvesTo([
        { ...TEST_JUDGEMENT, updatedAt: testDate, createdAt: testDate },
      ]);
    mockModels("queryTemplate")
      .action("findMany")
      .with({})
      .resolvesTo([
        { ...TEST_QUERYTEMPLATE, updatedAt: testDate, createdAt: testDate },
      ]);
    mockModels("ruleset")
      .action("findMany")
      .with({})
      .resolvesTo([
        { ...TEST_RULESET, updatedAt: testDate, createdAt: testDate },
      ]);
    mockModels("org").action("findFirst").with({}).resolvesTo(TEST_ORG);
    mockModels("searchEndpoint")
      .action("findFirst")
      .with({})
      .resolvesTo(TEST_SEARCHENDPOINT);
    mockModels("searchConfiguration")
      .action("findFirst")
      .with({
        where: {
          queryTemplate: { projectId: TEST_PROJECT_ID },
        },
      })
      .resolvesTo(TEST_SEARCHCONFIGURATION);
    mockModels("execution")
      .action("findFirst")
      .with({
        where: {
          searchConfigurationId: TEST_SEARCHCONFIGURATION_ID,
        },
      })
      .resolvesTo(TEST_EXECUTION);
    const { render } = await getPage({
      route: "/",
    });
    render();
    expect(
      screen.getByRole("heading", { name: "Test User" })
    ).toBeInTheDocument();
  });
});
