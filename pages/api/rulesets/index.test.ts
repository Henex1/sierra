import prisma from "../../../lib/prisma";
import { handleCreateRuleset, handleCreateRulesetVersion } from "./index";
import { getApiRoute } from "../../../lib/test";

describe("api/rulesets", () => {
  it("/create", async () => {
    // Test create
    const initialInfo = {
      name: "My Test Ruleset",
    };
    const { ruleset } = await getApiRoute(handleCreateRuleset, initialInfo, {
      method: "POST",
    });
    expect(ruleset).toHaveProperty("id");
    expect(ruleset).toMatchObject(initialInfo);

    // Test actual underlying object
    const actualRuleset = await prisma.ruleset.findUnique({
      where: { id: ruleset.id },
    });
    expect(actualRuleset).toMatchObject(initialInfo);
  });

  it("/createVersion", async () => {
    // Create ruleset
    const ruleset = await prisma.ruleset.create({
      data: { orgId: 1, name: "createRulesetVersion test" },
    });

    // Test endpoint
    const initialInfo = {
      rulesetId: ruleset.id,
      parentId: null,
      value: {
        rules: [{ expression: "notebook", instructions: [], enabled: true }],
      },
    };
    const { version } = await getApiRoute(
      handleCreateRulesetVersion,
      initialInfo,
      { method: "POST" }
    );
    expect(ruleset).toHaveProperty("id");
    expect(version.value).toMatchObject(initialInfo.value);

    // Test actual underlying object
    const actualVersion = await prisma.rulesetVersion.findUnique({
      where: { id: version.id },
    });
    expect(actualVersion).not.toBeNull();
    expect(actualVersion!.value).toMatchObject(initialInfo.value);
  });
});
