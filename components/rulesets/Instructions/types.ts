import { RuleInstruction } from "../../../lib/rulesets/rules";

export interface InstructionFieldProps<V extends RuleInstruction> {
  name: string;
  value: V;
  onDelete: () => void;
  disabled?: boolean;
  facetFilterFields: string[];
}

export type InstructionsType =
  | "synonym"
  | "upboost"
  | "downboost"
  | "filter"
  | "facetFilter"
  | "delete"
  | "substitute";

export const instructionsTypes: InstructionsType[] = [
  "synonym",
  "upboost",
  "downboost",
  "filter",
  "facetFilter",
  "delete",
  "substitute",
];

export const instructionTitle = (type: InstructionsType): string => {
  const titles: { [k in InstructionsType]: string } = {
    delete: "DELETE",
    upboost: "UP BOOST",
    downboost: "DOWN BOOST",
    facetFilter: "FACET FILTER",
    filter: "FILTER",
    synonym: "SYNONYM",
    substitute: "SUBSTITUTE",
  };

  return titles[type];
};

export const isInstructionsType = (s: unknown): s is InstructionsType =>
  instructionsTypes.includes(s as InstructionsType);
