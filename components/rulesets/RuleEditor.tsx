import * as React from "react";
import Grid from "@material-ui/core/Grid";
import { Field } from "react-final-form";
import { FieldArray } from "react-final-form-arrays";
import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import Divider from "@material-ui/core/Divider";
import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";
import Tooltip from "@material-ui/core/Tooltip";
import AddIcon from "@material-ui/icons/Add";
import DeleteIcon from "@material-ui/icons/Delete";
import CheckCircleOutlinedIcon from "@material-ui/icons/CheckCircleOutlined";
import PauseCircleOutlinedIcon from "@material-ui/icons/PauseCircleOutlineOutlined";
import RegexInput from "../RegexInput";
import { FormApi } from "final-form";

import { useEffect, useMemo } from "react";
import { InstructionField } from "./Instructions";
import { instructionsTypes } from "./Instructions/types";
import { RulesetVersionValue } from "../../lib/rulesets/rules";

export type RuleType = {
  [key: number]: {
    expression: string;
    expressionType: string;
    isCaseSensitive: boolean;
    instructions: Array<any>;
    enabled: boolean;
  };
};

export type RuleEditorProps<T> = {
  name: string;
  onDelete: () => void;
  facetFilterFields: string[];
  rules: RuleType;
  form: FormApi<T>;
  activeRuleset: number;
};

export default function RuleEditor<T extends RulesetVersionValue>({
  name,
  onDelete,
  form,
  facetFilterFields,
  rules,
  activeRuleset,
}: RuleEditorProps<T>) {
  const isReg =
    form.getState().values.rules[activeRuleset].expressionType === "regex";

  const types = useMemo(
    () => instructionsTypes.filter((t) => (!isReg ? t !== "substitute" : true)),
    [isReg]
  );

  const setRulesValue = (key: string, value: string | boolean) => {
    form.mutators.setRulesValue([key, value]);
  };

  useEffect(() => {
    form
      .getState()
      .values.rules[activeRuleset].instructions?.forEach((item, i) => {
        if (item.type === "substitute" && item.enabled !== isReg) {
          form.mutators.setRulesValue([
            `rules[${activeRuleset}].instructions[${i}].enabled`,
            isReg,
          ]);
        }
      });
  }, [isReg]);

  return (
    <React.Fragment key={name}>
      <Box pb={2}>
        <Grid container alignItems="center">
          <Grid item xs>
            <Field name={`${name}.expression`}>
              {({ input }) => {
                return (
                  <RegexInput
                    value={input.value}
                    rule={rules[activeRuleset]}
                    activeRuleset={activeRuleset}
                    setRulesValue={setRulesValue}
                    onChange={(value) => {
                      const isRegEx =
                        value.trim().length > 2 &&
                        value[0] === "/" &&
                        value[value.length - 1] === "/";
                      const name = `rules[${activeRuleset}].expressionType`;
                      isRegEx
                        ? setRulesValue(name, "regex")
                        : setRulesValue(name, "contained");
                      input.onChange(value);
                    }}
                  />
                );
              }}
            </Field>
          </Grid>
          <Grid item>
            <Field name={`${name}.enabled`}>
              {({ input }) => (
                <Tooltip title={input.value ? "Rule enabled" : "Rule disabled"}>
                  <IconButton
                    aria-label="toggle rule"
                    onClick={() => input.onChange(!input.value)}
                  >
                    {input.value ? (
                      <CheckCircleOutlinedIcon color="secondary" />
                    ) : (
                      <PauseCircleOutlinedIcon />
                    )}
                  </IconButton>
                </Tooltip>
              )}
            </Field>
          </Grid>
          <Grid item>
            <Tooltip title={"Delete rule"}>
              <IconButton aria-label="delete rule" onClick={onDelete}>
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </Grid>
        </Grid>
      </Box>
      <Box pt={2} pb={2}>
        <Divider />
      </Box>
      <Typography>Instructions</Typography>
      <FieldArray name={`${name}.instructions`}>
        {({ fields }) => (
          <>
            {fields.map((name, index) => (
              <InstructionField
                key={name}
                name={name}
                value={fields.value[index]}
                onDelete={() => fields.remove(index)}
                facetFilterFields={facetFilterFields}
                types={types}
              />
            ))}
            <Box mt={2} mb={2}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => fields.push({ type: "synonym", enabled: true })}
              >
                Add instruction
              </Button>
            </Box>
          </>
        )}
      </FieldArray>
    </React.Fragment>
  );
}
