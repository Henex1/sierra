import {
  InstructionFieldProps,
  InstructionsType,
  instructionTitle,
  isInstructionsType,
} from "./types";
import {
  DeleteInstruction,
  FacetFilterInstruction,
  FilterInstruction,
  RuleInstruction,
  SubstituteInstruction,
  SynonymInstruction,
  UpDownInstruction,
} from "../../../lib/rulesets/rules";
import * as React from "react";
import { SynonymField } from "./Synoym";
import { UpBoostField } from "./UpBoost";
import { DownBoostField } from "./DownBoost";
import { FilterField } from "./Filter";
import { FacetFilterField } from "./FacetFilter";
import { DeleteField } from "./Delete";
import { Substitute } from "./Substitute";
import Grid from "@material-ui/core/Grid";
import Box from "@material-ui/core/Box";
import { Field } from "react-final-form";
import SelectMUI from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import IconButton from "@material-ui/core/IconButton";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import Menu from "@material-ui/core/Menu";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Switch from "@material-ui/core/Switch";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import DeleteIcon from "@material-ui/icons/Delete";
import ListItemText from "@material-ui/core/ListItemText";
import { makeStyles } from "@material-ui/core";
import { ReactElement, useMemo } from "react";

const useInstructionFieldStyles = makeStyles(() => ({
  listItemIcon: {
    minWidth: 46,
    paddingLeft: 6,
  },
}));

interface Props extends InstructionFieldProps<RuleInstruction> {
  types: InstructionsType[];
}

export function InstructionField(props: Props) {
  const classes = useInstructionFieldStyles();

  const { name, value, onDelete } = props;
  const typeValue =
    value.type === "updown"
      ? value.weight > 0
        ? "upBoost"
        : "downBoost"
      : value.type;
  const [
    instructionsType,
    setInstructionsType,
  ] = React.useState<InstructionsType>(typeValue);
  const isDisabled = !value.enabled;

  const editor = useMemo((): ReactElement => {
    switch (typeValue as string) {
      case "synonym":
        return (
          <SynonymField
            {...(props as InstructionFieldProps<SynonymInstruction>)}
            disabled={isDisabled}
          />
        );
      case "upBoost":
        return (
          <UpBoostField
            {...(props as InstructionFieldProps<UpDownInstruction>)}
            disabled={isDisabled}
          />
        );
      case "downBoost":
        return (
          <DownBoostField
            {...(props as InstructionFieldProps<UpDownInstruction>)}
            disabled={isDisabled}
          />
        );
      case "filter":
        return (
          <FilterField
            {...(props as InstructionFieldProps<FilterInstruction>)}
            disabled={isDisabled}
          />
        );
      case "facetFilter":
        return (
          <FacetFilterField
            {...(props as InstructionFieldProps<FacetFilterInstruction>)}
            disabled={isDisabled}
          />
        );
      case "delete":
        return (
          <DeleteField
            {...(props as InstructionFieldProps<DeleteInstruction>)}
            disabled={isDisabled}
          />
        );
      case "substitute":
        return (
          <Substitute
            {...(props as InstructionFieldProps<SubstituteInstruction>)}
            disabled={isDisabled}
          />
        );
      default:
        return <Grid item>Unsupported instruction: {(value as any).type}</Grid>;
    }
  }, [props, isDisabled]);

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
            {({ input }) => (
              <SelectMUI
                name={input?.name}
                value={
                  input?.value === instructionsType
                    ? input?.value
                    : instructionsType
                }
                onChange={(e) => {
                  const value = e.target.value;
                  if (isInstructionsType(value)) {
                    setInstructionsType(value);
                    input.onChange(e);
                  }
                }}
                required
                fullWidth
                disabled={isDisabled}
              >
                {isDisabled ? (
                  <MenuItem
                    key={instructionsType}
                    value={instructionsType}
                    disabled={isDisabled}
                  >
                    {instructionTitle(instructionsType)}
                  </MenuItem>
                ) : (
                  props.types.map((id) => (
                    <MenuItem key={id} value={id} disabled={isDisabled}>
                      {instructionTitle(id)}
                    </MenuItem>
                  ))
                )}
              </SelectMUI>
            )}
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
