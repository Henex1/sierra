import _ from "lodash";
import * as z from "zod";

import prisma, {
  Prisma,
  Project,
  User,
  Ruleset,
  RulesetVersion,
} from "../prisma";
import { userCanAccessProject } from "../projects";
import { rulesetVersionValueSchema } from "./rules";

export { rulesetVersionValueSchema };

// This is the list of keys which are included in user requests for Ruleset
// by default.
const selectKeys = {
  id: true,
  projectId: true,
  name: true,
};

const versionSelectKeys = {
  id: true,
  rulesetId: true,
  parentId: true,
  value: true,
};

export type ExposedRuleset = Pick<Ruleset, keyof typeof selectKeys>;
export type ExposedRulesetVersion = Pick<
  RulesetVersion,
  keyof typeof versionSelectKeys
>;

export function userCanAccessRuleset(
  user: User,
  rest?: Prisma.RulesetWhereInput
): Prisma.RulesetWhereInput {
  const result: Prisma.RulesetWhereInput = {
    project: userCanAccessProject(user),
  };
  if (rest) {
    result.AND = rest;
  }
  return result;
}

export function formatRuleset(val: Ruleset): ExposedRuleset {
  return _.pick(val, _.keys(selectKeys)) as ExposedRuleset;
}

export function formatRulesetVersion(
  val: RulesetVersion
): ExposedRulesetVersion {
  return _.pick(val, _.keys(versionSelectKeys)) as ExposedRulesetVersion;
}

export async function getRuleset(
  user: User,
  id: number
): Promise<Ruleset | null> {
  const ruleset = await prisma.ruleset.findFirst({
    where: userCanAccessRuleset(user, { id }),
  });
  return ruleset;
}

export const createRulesetSchema = z.object({
  name: z.string(),
});

export type CreateRuleset = z.infer<typeof createRulesetSchema>;

export async function createRuleset(
  project: Project,
  input: CreateRuleset
): Promise<Ruleset> {
  const ruleset = await prisma.ruleset.create({
    data: { ...input, projectId: project.id },
  });
  return ruleset;
}

export async function getLatestRulesetVersion(
  ruleset: Ruleset
): Promise<RulesetVersion | null> {
  const version = await prisma.rulesetVersion.findFirst({
    where: { ruleset: { id: ruleset.id } },
    orderBy: [{ updatedAt: "desc" }],
  });
  return version;
}

export const createRulesetVersionSchema = z.object({
  parentId: z.number().nullable(),
  value: rulesetVersionValueSchema,
});

export type CreateRulesetVersion = z.infer<typeof createRulesetVersionSchema>;

export async function createRulesetVersion(
  ruleset: Ruleset,
  input: CreateRulesetVersion
): Promise<RulesetVersion> {
  const version = await prisma.rulesetVersion.create({
    data: { ...input, rulesetId: ruleset.id },
  });
  return version;
}
