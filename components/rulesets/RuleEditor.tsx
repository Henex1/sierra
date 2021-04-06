import * as React from "react";
import Grid from "@material-ui/core/Grid";
import { useFormState } from "react-final-form";
import { FieldArray } from "react-final-form-arrays";
import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import Divider from "@material-ui/core/Divider";
import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";
import { Checkboxes, TextField, Select } from "mui-rff";
import MenuItem from "@material-ui/core/MenuItem";
import AddIcon from "@material-ui/icons/Add";
import ClearIcon from "@material-ui/icons/Clear";
import DeleteIcon from "@material-ui/icons/Delete";

import { RuleInstruction } from "../../lib/rulesets";

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
          <MenuItem value={false}>{"== (undirected)"}</MenuItem>
          <MenuItem value={true}>&ndash;{"> (directed)"}</MenuItem>
        </Select>
      </Grid>
      <Grid item xs={1}>
        <TextField name={`${name}.weight`} placeholder="Weight" />
      </Grid>
      <Grid item xs>
        <TextField name={`${name}.term`} required />
      </Grid>
    </>
  );
}

function UpdownField({ name }: InstructionFieldProps) {
  return (
    <>
      <Grid item xs={2}>
        <Select name={`${name}.weight`} required>
          <MenuItem value={4}>UP&emsp;&ensp; ++++</MenuItem>
          <MenuItem value={3}>UP&emsp;&ensp; +++</MenuItem>
          <MenuItem value={2}>UP&emsp;&ensp; ++</MenuItem>
          <MenuItem value={1}>UP&emsp;&ensp; +</MenuItem>
          <MenuItem value={-1}>DOWN &ndash;</MenuItem>
          <MenuItem value={-2}>DOWN &ndash;&ndash;</MenuItem>
          <MenuItem value={-3}>DOWN &ndash;&ndash;&ndash;</MenuItem>
          <MenuItem value={-4}>DOWN &ndash;&ndash;&ndash;&ndash;</MenuItem>
        </Select>
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
          <MenuItem value={true}>MUST</MenuItem>
          <MenuItem value={false}>MUST NOT</MenuItem>
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
    <>
      <Grid item xs>
        <TextField name={`${name}.term`} required />
      </Grid>
    </>
  );
}

function InstructionField(props: InstructionFieldProps) {
  const { name, value, onDelete } = props;
  const editor =
    value.type === "synonym" ? (
      <SynonymField {...props} />
    ) : value.type === "updown" ? (
      <UpdownField {...props} />
    ) : value.type === "filter" ? (
      <FilterField {...props} />
    ) : value.type === "delete" ? (
      <DeleteField {...props} />
    ) : (
      <Grid item>Unsupported instruction: {value.type}</Grid>
    );
  return (
    <Box pb={2}>
      <Grid container spacing={1}>
        <Grid item>
          <Checkboxes
            size="small"
            name={`${name}.enabled`}
            formControlLabelProps={{ labelPlacement: "start" }}
            data={{ label: undefined, value: true }}
          />
        </Grid>
        <Grid item xs={2}>
          <Select name={`${name}.type`} required>
            <MenuItem value="synonym">SYNONYM</MenuItem>
            <MenuItem value="updown">UP / DOWN</MenuItem>
            <MenuItem value="filter">FILTER</MenuItem>
            <MenuItem value="delete">DELETE</MenuItem>
          </Select>
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
  dirty: boolean;
  onDelete: () => void
};

export default function RuleEditor({ name, dirty, onDelete }: RuleEditorProps) {
  const { submitting } = useFormState();
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
      <Box pb={2}>
        <Button
          type="submit"
          disabled={submitting}
          variant="contained"
          color="primary"
        >
          Save
        </Button>
        <Box component="span" ml={2}>
          {dirty &&
            <Typography variant="caption">
              Unsaved changes
            </Typography>
          }
        </Box>
      </Box>
    </React.Fragment>
  );
}
