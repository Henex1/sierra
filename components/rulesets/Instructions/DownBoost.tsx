import { withStyles } from "@material-ui/core";
import Slider from "@material-ui/core/Slider";
import { InstructionFieldProps } from "./types";
import { UpDownInstruction } from "../../../lib/rulesets/rules";
import Grid from "@material-ui/core/Grid";
import { Field } from "react-final-form";
import { useEffect } from "react";
import InlineQueryEditor from "../InlineQueryEditor";
import * as React from "react";

const DownBoostSlider = withStyles({
  root: {
    color: "#f44336",
  },
})(Slider);

export function DownBoostField({
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
              if (!input || input.value > 0) {
                input.onChange({
                  target: {
                    type: "select",
                    value: -1,
                  },
                });
              }
            }, []);
            return (
              <DownBoostSlider
                name={input?.name}
                value={input?.value * -1 || 1}
                onChange={(e, newValue) => {
                  input?.onChange({
                    target: {
                      type: "select",
                      value:
                        typeof newValue === "number" ? newValue * -1 : newValue,
                    },
                  });
                }}
                valueLabelDisplay="auto"
                valueLabelFormat={(value) => value * -1}
                defaultValue={1}
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
