import { InstructionFieldProps } from "./types";
import { SynonymInstruction } from "../../../lib/rulesets/rules";
import Grid from "@material-ui/core/Grid";
import { Select, TextField } from "mui-rff";
import MenuItem from "@material-ui/core/MenuItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import SyncAltIcon from "@material-ui/icons/SyncAlt";
import ListItemText from "@material-ui/core/ListItemText";
import ArrowRightAltIcon from "@material-ui/icons/ArrowRightAlt";
import { parseNumber } from "../../common/form";
import * as React from "react";
import { makeStyles } from "@material-ui/core";

const useSynonymFieldStyles = makeStyles(() => ({
  select: {
    display: "flex",
    alignItems: "center",
  },
  icon: {
    minWidth: 34,
  },
}));

export function SynonymField({
  name,
  disabled,
}: InstructionFieldProps<SynonymInstruction>) {
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
