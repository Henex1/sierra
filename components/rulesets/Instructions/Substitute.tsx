import React, { ChangeEvent, ReactElement, useCallback } from "react";
import { InstructionFieldProps } from "./types";
import { SubstituteInstruction } from "../../../lib/rulesets/rules";
import { useForm } from "react-final-form";
import Grid from "@material-ui/core/Grid";
import { useDebouncedChange } from "../../../utils/react/hooks";
import { TextField } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles({
  input: {
    width: "100%",
  },
});

export const Substitute = ({
  name,
  value,
  disabled,
}: InstructionFieldProps<SubstituteInstruction>): ReactElement => {
  const classes = useStyles();
  const { change } = useForm();
  const prepareChange = useCallback((v: string) => change(`${name}.value`, v), [
    name,
    change,
  ]);
  const [code, onChange] = useDebouncedChange(value.value, prepareChange, 500);
  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value),
    [onChange]
  );

  return (
    <Grid item xs>
      <TextField
        value={code}
        placeholder="Substitute with. (E.g.: index-$1)"
        onChange={handleChange}
        className={classes.input}
        disabled={disabled}
      />
    </Grid>
  );
};
