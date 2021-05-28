import { InstructionFieldProps } from "./types";
import { DeleteInstruction } from "../../../lib/rulesets/rules";
import Grid from "@material-ui/core/Grid";
import { TextField } from "mui-rff";
import * as React from "react";

export function DeleteField({
  name,
  disabled,
}: InstructionFieldProps<DeleteInstruction>) {
  return (
    <Grid item xs>
      <TextField name={`${name}.term`} disabled={disabled} required />
    </Grid>
  );
}
