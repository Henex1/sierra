import _ from "lodash";
import * as z from "zod";

import { Prisma, User, Ruleset, RulesetVersion } from "../prisma";
import { userCanAccessOrg } from "../org";

// This is the list of keys which are included in user requests for Ruleset
// by default.
const selectKeys = {
  id: true,
  orgId: true,
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
  const result: Prisma.RulesetWhereInput = { org: userCanAccessOrg(user) };
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

export const synonymInstructionSchema = z.object({
  type: z.literal("synonym"),
  weight: z.number().optional(),
  directed: z.boolean(),
  term: z.string(),
  enabled: z.boolean(),
});

export type SynonymInstruction = z.infer<typeof synonymInstructionSchema>;

export const upDownInstructionSchema = z.object({
  type: z.literal("updown"),
  weight: z.number(),
  term: z.string(),
  enabled: z.boolean(),
});

export type UpDownInstruction = z.infer<typeof upDownInstructionSchema>;

export const filterInstructionSchema = z.object({
  type: z.literal("filter"),
  include: z.boolean(),
  term: z.string(),
  enabled: z.boolean(),
});

export type FilterInstruction = z.infer<typeof filterInstructionSchema>;

export const deleteInstructionSchema = z.object({
  type: z.literal("delete"),
  term: z.string(),
  enabled: z.boolean(),
});

export type DeleteInstruction = z.infer<typeof deleteInstructionSchema>;

export const ruleInstructionSchema = z.union([
  synonymInstructionSchema,
  upDownInstructionSchema,
  filterInstructionSchema,
  deleteInstructionSchema,
]);

export type RuleInstruction = z.infer<typeof ruleInstructionSchema>;

export const ruleSchema = z.object({
  expression: z.string(),
  instructions: z.array(ruleInstructionSchema),
  enabled: z.boolean(),
});

export type Rule = z.infer<typeof ruleSchema>;

export const rulesetVersionValueSchema = z.object({
  rules: z.array(ruleSchema),
});

export type RulesetVersionValue = z.infer<typeof rulesetVersionValueSchema>;

// mocks
export const mockRulesetVersion: ExposedRulesetVersion = {
  id: 1,
  rulesetId: 1,
  parentId: null,
  value: {
    rules: [
      {
        expression: "notebook",
        instructions: [
          {
            type: "synonym",
            directed: false,
            weight: 1,
            term: "laptop",
            enabled: true,
          },
          {
            type: "synonym",
            directed: true,
            weight: 1,
            term: "netbook",
            enabled: true,
          },
          { type: "updown", weight: 2, term: "asus", enabled: true },
          {
            type: "updown",
            weight: -3,
            term: "keyboard",
            enabled: false,
          },
          {
            type: "updown",
            weight: -4,
            term: "mouse",
            enabled: true,
          },
          {
            type: "updown",
            weight: -4,
            term: "Optical",
            enabled: true,
          },
          {
            type: "updown",
            weight: -1,
            term: "Power Cord",
            enabled: true,
          },
          {
            type: "updown",
            weight: -3,
            term: "spare part",
            enabled: true,
          },
          {
            type: "filter",
            include: false,
            term: "title:accessory",
            enabled: true,
          },
          {
            type: "filter",
            include: false,
            term: "title:notebook",
            enabled: true,
          },
        ],
        enabled: true,
      },
      {
        expression: "cheap iphone",
        instructions: [{ type: "delete", term: "cheap", enabled: true }],
        enabled: true,
      },
    ],
  } as RulesetVersionValue,
};
