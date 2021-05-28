import { InstructionFieldProps } from "./types";
import { FilterInstruction } from "../../../lib/rulesets/rules";
import Grid from "@material-ui/core/Grid";
import { Select } from "mui-rff";
import MenuItem from "@material-ui/core/MenuItem";
import InlineQueryEditor from "../InlineQueryEditor";
import * as React from "react";

export function FilterField({
  name,
  value,
  disabled,
}: InstructionFieldProps<FilterInstruction>) {
  return (
    <>
      <Grid item xs={2}>
        <Select name={`${name}.include`} disabled={disabled} required>
          <MenuItem value={true as any}>MUST</MenuItem>
          <MenuItem value={false as any}>MUST NOT</MenuItem>
        </Select>
      </Grid>
      <Grid style={{ position: "relative" }} item xs>
        <InlineQueryEditor name={name} value={value as FilterInstruction} />
      </Grid>
    </>
  );
}
