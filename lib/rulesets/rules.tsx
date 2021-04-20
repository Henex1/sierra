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
