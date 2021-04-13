import * as React from "react";
import Grid from "@material-ui/core/Grid";
import { Field } from "react-final-form";
import { FieldArray } from "react-final-form-arrays";
import Box from "@material-ui/core/Box";
import SelectMUI from "@material-ui/core/Select";
import Button from "@material-ui/core/Button";
import Divider from "@material-ui/core/Divider";
import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";
import { Checkboxes, TextField, Select } from "mui-rff";
import MenuItem from "@material-ui/core/MenuItem";
import AddIcon from "@material-ui/icons/Add";
import ClearIcon from "@material-ui/icons/Clear";
import DeleteIcon from "@material-ui/icons/Delete";

import { RuleInstruction } from "../../lib/rulesets/rules";
import { Slider, withStyles } from "@material-ui/core";
import { useEffect } from "react";
import { parseNumber } from "../common/form";

const UpBoostSlider = withStyles({
  root: {
    color: "#4caf50",
  },
})(Slider);

const DownBoostSlider = withStyles({
  root: {
    color: "#f44336",
  },
})(Slider);

type InstructionFieldProps = {
  name: string;
  value: RuleInstruction;
  onDelete: () => void;
};

function SynonymField({ name }: InstructionFieldProps) {
  return (
    <>
      <Grid item xs={2}>
        <Select name={`${name}.directed`} required>
          <MenuItem value={false as any}>{"== (undirected)"}</MenuItem>
          <MenuItem value={true as any}>&ndash;{"> (directed)"}</MenuItem>
        </Select>
      </Grid>
      <Grid item xs={1}>
        <TextField
          name={`${name}.weight`}
          placeholder="Weight"
          fieldProps={{
            parse: parseNumber,
          }}
        />
      </Grid>
      <Grid item xs>
        <TextField name={`${name}.term`} required />
      </Grid>
    </>
  );
}

function UpBoostField({ name }: InstructionFieldProps) {
  return (
    <>
      <Grid item xs={4}>
        <Field
          name={`${name}.weight`}
          render={(props) => {
            useEffect(() => {
              if (!props.input.value || props.input.value < 0) {
                props.input.onChange({
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
                name={props.input.name}
                value={props.input.value || 1}
                onChange={(e, newValue) => {
                  props.input.onChange({
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
              />
            );
          }}
        />
      </Grid>
      <Grid item xs>
        <TextField name={`${name}.term`} required />
      </Grid>
    </>
  );
}

function DownBoostField({ name }: InstructionFieldProps) {
  return (
    <>
      <Grid item xs={4}>
        <Field
          name={`${name}.weight`}
          render={(props) => {
            useEffect(() => {
              if (!props.input.value || props.input.value > 0) {
                props.input.onChange({
                  target: {
                    type: "select",
                    value: -1,
                  },
                });
              }
            }, []);
            return (
              <DownBoostSlider
                name={props.input.name}
                value={props.input.value * -1 || 1}
                onChange={(e, newValue) => {
                  props.input.onChange({
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
              />
            );
          }}
        />
      </Grid>
      <Grid item xs>
        <TextField name={`${name}.term`} required />
      </Grid>
    </>
  );
}

function FilterField({ name }: InstructionFieldProps) {
  return (
    <>
      <Grid item xs={2}>
        <Select name={`${name}.include`} required>
          <MenuItem value={true as any}>MUST</MenuItem>
          <MenuItem value={false as any}>MUST NOT</MenuItem>
        </Select>
      </Grid>
      <Grid item xs>
        <TextField name={`${name}.term`} required />
      </Grid>
    </>
  );
}

function DeleteField({ name }: InstructionFieldProps) {
  return (
    <Grid item xs>
      <TextField name={`${name}.term`} required />
    </Grid>
  );
}

function InstructionField(props: InstructionFieldProps) {
  const { name, value, onDelete } = props;
  const typeValue =
    value.type === "updown"
      ? value.weight > 0
        ? "upBoost"
        : "downBoost"
      : value.type;
  const [instructionsType, setInstructionsType] = React.useState<
    string | unknown
  >(typeValue);

  const editor =
    instructionsType === "synonym" ? (
      <SynonymField {...props} />
    ) : instructionsType === "upBoost" ? (
      <UpBoostField {...props} />
    ) : instructionsType === "downBoost" ? (
      <DownBoostField {...props} />
    ) : instructionsType === "filter" ? (
      <FilterField {...props} />
    ) : instructionsType === "delete" ? (
      <DeleteField {...props} />
    ) : (
      <Grid item>Unsupported instruction: {(value as any).type}</Grid>
    );
  return (
    <Box pb={2}>
      <Grid container spacing={2}>
        <Grid item>
          <Checkboxes
            size="small"
            name={`${name}.enabled`}
            formControlLabelProps={{ labelPlacement: "start" }}
            data={{ label: undefined, value: true }}
          />
        </Grid>
        <Grid item xs={2}>
          <Field
            name={`${name}.type`}
            parse={(value: any) =>
              value === "upBoost" || value === "downBoost" ? "updown" : value
            }
          >
            {(props) => {
              return (
                <SelectMUI
                  name={props.input.name}
                  value={
                    props.input.value === instructionsType
                      ? props.input.value
                      : instructionsType
                  }
                  onChange={(e) => {
                    setInstructionsType(e.target.value);
                    props.input.onChange(e);
                  }}
                  required
                >
                  <MenuItem value="synonym">SYNONYM</MenuItem>
                  <MenuItem value="upBoost">UP BOOST</MenuItem>
                  <MenuItem value="downBoost">DOWN BOOST</MenuItem>
                  <MenuItem value="filter">FILTER</MenuItem>
                  <MenuItem value="delete">DELETE</MenuItem>
                </SelectMUI>
              );
            }}
          </Field>
        </Grid>
        {editor}
        <Grid item>
          <IconButton
            size="small"
            aria-label="delete instruction"
            onClick={onDelete}
          >
            <ClearIcon />
          </IconButton>
        </Grid>
      </Grid>
    </Box>
  );
}

export type RuleEditorProps = {
  name: string;
  onDelete: () => void;
};

export default function RuleEditor({ name, onDelete }: RuleEditorProps) {
  return (
    <React.Fragment key={name}>
      <Box pb={2}>
        <Grid container spacing={1}>
          <Grid item>
            <Checkboxes
              name={`${name}.enabled`}
              formControlLabelProps={{ labelPlacement: "start" }}
              data={{ label: undefined, value: true }}
            />
          </Grid>
          <Grid item xs>
            <TextField name={`${name}.expression`} label="Expression" />
          </Grid>
          <Grid item>
            <IconButton aria-label="delete rule" onClick={onDelete}>
              <DeleteIcon />
            </IconButton>
          </Grid>
        </Grid>
      </Box>
      <Box pb={2}>
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
              />
            ))}
            <Box pb={2}>
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
