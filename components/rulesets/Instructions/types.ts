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
  | "upBoost"
  | "downBoost"
  | "filter"
  | "facetFilter"
  | "delete"
  | "substitute";

export const instructionsTypes: InstructionsType[] = [
  "synonym",
  "upBoost",
  "downBoost",
  "filter",
  "facetFilter",
  "delete",
  "substitute",
];

export const instructionTitle = (type: InstructionsType): string => {
  const titles: { [k in InstructionsType]: string } = {
    delete: "DELETE",
    upBoost: "UP BOOST",
    downBoost: "DOWN BOOST",
    facetFilter: "FACET FILTER",
    filter: "FILTER",
    synonym: "SYNONYM",
    substitute: "SUBSTITUTE",
  };

  return titles[type];
};

export const isInstructionsType = (s: unknown): s is InstructionsType =>
  instructionsTypes.includes(s as InstructionsType);
