import * as z from "zod";

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
  query: z.string().optional(),
  enabled: z.boolean(),
});

export type UpDownInstruction = z.infer<typeof upDownInstructionSchema>;

export const filterInstructionSchema = z.object({
  type: z.literal("filter"),
  include: z.boolean(),
  term: z.string(),
  query: z.string().optional(),
  enabled: z.boolean(),
});

export type FilterInstruction = z.infer<typeof filterInstructionSchema>;

export const facetFilterInstructionSchema = z.object({
  type: z.literal("facetFilter"),
  include: z.boolean(),
  field: z.string(),
  value: z.string(),
  enabled: z.boolean(),
});

export type FacetFilterInstruction = z.infer<
  typeof facetFilterInstructionSchema
>;

export const deleteInstructionSchema = z.object({
  type: z.literal("delete"),
  term: z.string(),
  enabled: z.boolean(),
});

export type DeleteInstruction = z.infer<typeof deleteInstructionSchema>;

export const substituteInstructionSchema = z.object({
  type: z.literal("substitute"),
  value: z.string(),
  enabled: z.boolean(),
});

export type SubstituteInstruction = z.infer<typeof substituteInstructionSchema>;

export const ruleInstructionSchema = z.union([
  facetFilterInstructionSchema,
  synonymInstructionSchema,
  upDownInstructionSchema,
  filterInstructionSchema,
  deleteInstructionSchema,
  substituteInstructionSchema,
]);

export type RuleInstruction = z.infer<typeof ruleInstructionSchema>;

export const ruleSchema = z.object({
  expression: z.string(),
  expressionType: z.string(),
  isCaseSensitive: z.boolean(),
  instructions: z.array(ruleInstructionSchema),
  enabled: z.boolean(),
});

export type Rule = z.infer<typeof ruleSchema>;

export enum RuleSetConditionType {
  DateRange = "Date & Time Range",
  TimeRange = "Time Range",
  RequestHeader = "Request Header",
}

const rulesetConditionRangeSchema = z.object({
  type: z.string(),
  start: z.string(),
  end: z.string(),
});
export type RulesetConditionRange = z.infer<typeof rulesetConditionRangeSchema>;

const rulesetConditionKeyValueSchema = z.object({
  type: z.string(),
  key: z.string(),
  value: z.string(),
});

const rulesetConditionSchema = z.union([
  rulesetConditionRangeSchema,
  rulesetConditionKeyValueSchema,
]);

export type RuleSetCondition = z.infer<typeof rulesetConditionSchema>;

export const rulesetVersionValueSchema = z.object({
  rules: z.array(ruleSchema),
  conditions: z.array(rulesetConditionSchema),
});

export type RulesetVersionValue = z.infer<typeof rulesetVersionValueSchema>;
