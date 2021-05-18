import { mockModels } from "../../../lib/__mocks__/prisma";
import { handleCreateRuleset, handleCreateRulesetVersion } from "./index";
import { getApiRoute, TEST_PROJECT } from "../../../lib/test";
import { RuleSetConditionType } from "../../../lib/rulesets/rules";

describe("api/rulesets", () => {
  it("/create", async () => {
    const initialInfo = {
      projectId: TEST_PROJECT.id,
      name: "My Test Ruleset",
    };
    mockModels("project").action("findFirst").with({}).resolvesTo(TEST_PROJECT);
    mockModels("ruleset")
      .action("create")
      .with({ data: expect.objectContaining(initialInfo) })
      .resolvesTo({ id: 42, ...initialInfo });

    const { ruleset } = await getApiRoute(handleCreateRuleset, initialInfo, {
      method: "POST",
    });
    expect(ruleset).toHaveProperty("id");
    expect(ruleset).toMatchObject(initialInfo);
  });

  it("/createVersion", async () => {
    mockModels("ruleset")
      .action("findFirst")
      .with({ where: { AND: { id: 42 } } })
      .resolvesTo({ name: "My Test Ruleset " });
    mockModels("rulesetVersion")
      .action("create")
      .with({})
      .hasImplementation(({ args: { data } }: any) => ({ ...data, id: 52 }));

    // Test endpoint
    const initialInfo = {
      rulesetId: 42,
      parentId: null,
      value: {
        conditions: [
          {
            type: RuleSetConditionType.RequestHeader,
            key: "key",
            value: "value",
          },
        ],
        rules: [
          {
            expression: "notebook",
            expressionType: "contained",
            isCaseSensitive: false,
            instructions: [],
            enabled: true,
          },
        ],
      },
    };
    const { version } = await getApiRoute(
      handleCreateRulesetVersion,
      initialInfo,
      { method: "POST" }
    );
    expect(version).toHaveProperty("id");
    expect(version.value).toMatchObject(initialInfo.value);
  });
});
