import * as React from "react";
import Grid from "@material-ui/core/Grid";
import { Field } from "react-final-form";
import { FieldArray } from "react-final-form-arrays";
import { TextField, Select } from "mui-rff";
import Box from "@material-ui/core/Box";
import SelectMUI from "@material-ui/core/Select";
import Button from "@material-ui/core/Button";
import Divider from "@material-ui/core/Divider";
import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Tooltip from "@material-ui/core/Tooltip";
import Switch from "@material-ui/core/Switch";
import Slider from "@material-ui/core/Slider";
import { withStyles, makeStyles } from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import DeleteIcon from "@material-ui/icons/Delete";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import ArrowRightAltIcon from "@material-ui/icons/ArrowRightAlt";
import SyncAltIcon from "@material-ui/icons/SyncAlt";
import CheckCircleOutlinedIcon from "@material-ui/icons/CheckCircleOutlined";
import PauseCircleOutlinedIcon from "@material-ui/icons/PauseCircleOutlineOutlined";

import {
  RuleInstruction,
  FilterInstruction,
  UpDownInstruction,
} from "../../lib/rulesets/rules";
import { useEffect } from "react";
import { parseNumber } from "../common/form";
import InlineQueryEditor from "../rulesets/InlineQueryEditor";

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
  disabled?: boolean;
};

const useSynonymFieldStyles = makeStyles((theme) => ({
  select: {
    display: "flex",
    alignItems: "center",
  },
  icon: {
    minWidth: 34,
  },
}));

function SynonymField({ name, disabled }: InstructionFieldProps) {
  const classes = useSynonymFieldStyles();

  return (
    <>
      <Grid item xs={3}>
        <Select
          name={`${name}.directed`}
          classes={{
            root: classes.select,
          }}
          disabled={disabled}
          required
        >
          <MenuItem value={false as any}>
            <ListItemIcon className={classes.icon}>
              <SyncAltIcon />
            </ListItemIcon>
            <ListItemText>(undirected)</ListItemText>
          </MenuItem>
          <MenuItem value={true as any}>
            <ListItemIcon className={classes.icon}>
              <ArrowRightAltIcon />
            </ListItemIcon>
            <ListItemText>(directed)</ListItemText>
          </MenuItem>
        </Select>
      </Grid>
      <Grid item xs={1}>
        <TextField
          name={`${name}.weight`}
          placeholder="Weight"
          fieldProps={{
            parse: parseNumber,
          }}
          disabled={disabled}
        />
      </Grid>
      <Grid item xs>
        <TextField name={`${name}.term`} disabled={disabled} required />
      </Grid>
    </>
  );
}

function UpBoostField({ name, value, disabled }: InstructionFieldProps) {
  return (
    <>
      <Grid item xs={2}>
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
                disabled={disabled}
              />
            );
          }}
        />
      </Grid>
      <Grid style={{ position: "relative" }} item xs>
        <InlineQueryEditor name={name} value={value as UpDownInstruction} />
      </Grid>
    </>
  );
}

function DownBoostField({ name, value, disabled }: InstructionFieldProps) {
  return (
    <>
      <Grid item xs={2}>
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
                disabled={disabled}
              />
            );
          }}
        />
      </Grid>
      <Grid style={{ position: "relative" }} item xs>
        <InlineQueryEditor name={name} value={value as UpDownInstruction} />
      </Grid>
    </>
  );
}

function FilterField({ name, value, disabled }: InstructionFieldProps) {
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

function DeleteField({ name, disabled }: InstructionFieldProps) {
  return (
    <Grid item xs>
      <TextField name={`${name}.term`} disabled={disabled} required />
    </Grid>
  );
}

const useInstructionFieldStyles = makeStyles((theme) => ({
  listItemIcon: {
    minWidth: 46,
    paddingLeft: 6,
  },
}));

function InstructionField(props: InstructionFieldProps) {
  const classes = useInstructionFieldStyles();

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
  const isDisabled = !value.enabled;

  const editor =
    instructionsType === "synonym" ? (
      <SynonymField {...props} disabled={isDisabled} />
    ) : instructionsType === "upBoost" ? (
      <UpBoostField {...props} disabled={isDisabled} />
    ) : instructionsType === "downBoost" ? (
      <DownBoostField {...props} disabled={isDisabled} />
    ) : instructionsType === "filter" ? (
      <FilterField {...props} disabled={isDisabled} />
    ) : instructionsType === "delete" ? (
      <DeleteField {...props} disabled={isDisabled} />
    ) : (
      <Grid item>Unsupported instruction: {(value as any).type}</Grid>
    );

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const handleOpenMenu = (e: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(e.currentTarget);
  };
  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  return (
    <Box pb={2}>
      <Grid container spacing={2} alignItems="flex-end">
        <Grid item xs={3}>
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
                  fullWidth
                  disabled={isDisabled}
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
          <IconButton aria-label="more" onClick={handleOpenMenu}>
            <MoreVertIcon />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleCloseMenu}
          >
            <MenuItem>
              <Field name={`${name}.enabled`} type="checkbox">
                {({ input }) => (
                  <FormControlLabel
                    control={
                      <Switch
                        checked={input.checked}
                        onChange={input.onChange}
                        name={input.name}
                        color="primary"
                      />
                    }
                    label={input.checked ? "Enabled" : "Disabled"}
                  />
                )}
              </Field>
            </MenuItem>
            <MenuItem button onClick={onDelete}>
              <ListItemIcon className={classes.listItemIcon}>
                <DeleteIcon />
              </ListItemIcon>
              <ListItemText>Delete</ListItemText>
            </MenuItem>
          </Menu>
        </Grid>
      </Grid>
    </Box>
  );
}

const useRuleEditorStyles = makeStyles((theme) => ({
  input: {
    paddingRight: theme.spacing(2),
  },
}));

export type RuleEditorProps = {
  name: string;
  onDelete: () => void;
};

export default function RuleEditor({ name, onDelete }: RuleEditorProps) {
  const classes = useRuleEditorStyles();

  return (
    <React.Fragment key={name}>
      <Box pb={2}>
        <Grid container alignItems="center">
          <Grid item xs>
            <TextField
              name={`${name}.expression`}
              label="Expression"
              variant="filled"
              classes={{
                root: classes.input,
              }}
            />
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
