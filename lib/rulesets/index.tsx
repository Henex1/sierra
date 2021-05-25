import _ from "lodash";
import * as z from "zod";

import prisma, {
  Prisma,
  Project,
  User,
  Ruleset,
  RulesetVersion,
  SearchConfiguration,
} from "../prisma";
import { userCanAccessProject } from "../projects";
import { rulesetVersionValueSchema } from "./rules";
import { ChangeTypeOfKeys } from "../pageHelpers";

export { rulesetVersionValueSchema };

// This is the list of keys which are included in user requests for Ruleset
// by default.
const selectKeys = {
  id: true,
  projectId: true,
  name: true,
  createdAt: true,
  updatedAt: true,
};

const versionSelectKeys = {
  id: true,
  rulesetId: true,
  parentId: true,
  value: true,
};

export type ExposedRuleset = Pick<
  ChangeTypeOfKeys<Ruleset, "createdAt" | "updatedAt", string>,
  keyof typeof selectKeys
>;
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
  const ruleset = {
    ...val,
    updatedAt: val.updatedAt.toString(),
    createdAt: val.createdAt.toString(),
  };
  return _.pick(ruleset, _.keys(ruleset)) as ExposedRuleset;
}

export function formatRulesetVersion(
  val: RulesetVersion
): ExposedRulesetVersion {
  return _.pick(val, _.keys(versionSelectKeys)) as ExposedRulesetVersion;
}

export async function getRuleset(
  user: User,
  id: string
): Promise<Ruleset | null> {
  const ruleset = await prisma.ruleset.findFirst({
    where: userCanAccessRuleset(user, { id }),
  });
  return ruleset;
}

export async function listRulesets(user: User): Promise<Ruleset[]> {
  const rulesets = await prisma.ruleset.findMany({
    where: userCanAccessRuleset(user),
  });
  return rulesets;
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
  parentId: z.string().nullable(),
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

export async function getRulesetsForSearchConfiguration(
  searchConfiguration: SearchConfiguration
): Promise<RulesetVersion[]> {
  const rulesets = await prisma.rulesetVersion.findMany({
    where: {
      searchConfigurations: {
        some: { id: searchConfiguration.id },
      },
    },
  });
  return rulesets;
}

export async function getLatestRulesets(
  user: User,
  project: Project,
  size: number
): Promise<Ruleset[]> {
  const rulesets = await prisma.ruleset.findMany({
    where: userCanAccessRuleset(user, { projectId: project.id }),
    orderBy: { updatedAt: "desc" },
    take: size,
  });
  return rulesets;
}
