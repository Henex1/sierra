import { InstructionFieldProps } from "./types";
import { UpDownInstruction } from "../../../lib/rulesets/rules";
import Grid from "@material-ui/core/Grid";
import { Field } from "react-final-form";
import { useEffect } from "react";
import InlineQueryEditor from "../InlineQueryEditor";
import * as React from "react";
import { withStyles } from "@material-ui/core";
import Slider from "@material-ui/core/Slider";

const UpBoostSlider = withStyles({
  root: {
    color: "#4caf50",
  },
})(Slider);

export function UpBoostField({
  name,
  value,
  disabled,
}: InstructionFieldProps<UpDownInstruction>) {
  return (
    <>
      <Grid item xs={2}>
        <Field
          name={`${name}.weight`}
          render={({ input }) => {
            useEffect(() => {
              if (!input || input.value < 0) {
                input.onChange({
                  target: {
                    type: "select",
                    value: 1,
                  },
                });
              }
            }, []);
            return (
              <UpBoostSlider
                color="secondary"
                name={input?.name}
                value={input?.value || 1}
                onChange={(e, newValue) => {
                  input?.onChange({
                    target: {
                      type: "select",
                      value: newValue,
                    },
                  });
                }}
                valueLabelDisplay="auto"
                step={1}
                min={1}
                max={1000}
                disabled={disabled}
              />
            );
          }}
        />
      </Grid>
      <Grid style={{ position: "relative" }} item xs>
        <InlineQueryEditor
          name={name}
          disabled={disabled}
          value={value as UpDownInstruction}
        />
      </Grid>
    </>
  );
}
