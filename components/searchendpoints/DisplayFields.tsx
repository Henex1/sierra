import React, { useState } from "react";
import classnames from "classnames";

import { makeStyles } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import Chip from "@material-ui/core/Chip";
import TextField from "@material-ui/core/TextField";

export type DisplayFieldsProps = {
  displayFields: any;
};

const useStyles = makeStyles((theme) => ({
  tagsInputRoot: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "baseline",
  },
  tagsInputRootFilled: {
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1.5),
  },
  tagsInput: {
    maxWidth: "250px",
  },
  tagsInputAdornedStart: {
    "& $input": {
      paddingLeft: 0,
    },
  },
  inputChip: {
    margin: theme.spacing(1, 1, 0, 0),
  },
}));

export default function DisplayFields({ displayFields }: DisplayFieldsProps) {
  const classes = useStyles();
  const [error, setError] = useState("");
  const [inputValue, setInputValue] = useState("");
  const supportedPrefixes = ["image", "url", "title"];

  const handleDeleteDisplayFields = (index: number) => {
    displayFields.input.value.splice(index, 1);
    displayFields.input.onChange({
      target: {
        type: "input",
        value: [...displayFields.input.value],
      },
    });
  };

  const handleOnChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = event.target.value;
    setInputValue(inputValue);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      // @ts-ignore
      const inputValue = event.target.value.trim();
      const prefixIndex = inputValue.indexOf(":");
      let validDisplayField = true;

      if (prefixIndex !== -1) {
        const prefix = inputValue.slice(0, prefixIndex);
        if (supportedPrefixes.includes(prefix)) {
          displayFields.input.value.forEach((value: String) => {
            if (value.indexOf(prefix) !== -1) {
              validDisplayField = false;
            }
          });
          if (validDisplayField) {
            setNewValue(inputValue);
          } else {
            setError("Display fields with that prefix already exists");
          }
        } else {
          setError("Display fields prefix is not valid");
        }
      } else {
        setNewValue(inputValue);
      }
      event.preventDefault();
    }
  };

  const setNewValue = (inputValue: String) => {
    displayFields.input.onChange({
      target: {
        type: "input",
        value: [...displayFields.input.value, inputValue],
      },
    });
    setError("");
    setInputValue("");
  };

  const isEmpty =
    !displayFields.input.value || !displayFields.input.value.length;
  const MuiRequiredLabel = (
    <>
      Display Fields
      <span
        aria-hidden="true"
        className="MuiFormLabel-asterisk MuiInputLabel-asterisk"
      >
        &thinsp;*
      </span>
    </>
  );

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <TextField
          required={isEmpty}
          fullWidth
          label={isEmpty ? "Display Fields" : MuiRequiredLabel}
          variant="outlined"
          size="small"
          error={!!error}
          helperText={error || "Press enter to add display fields"}
          value={inputValue}
          InputProps={{
            startAdornment:
              displayFields.input.value &&
              displayFields.input.value.map((item: string, index: number) => (
                <Chip
                  className={classes.inputChip}
                  key={index}
                  tabIndex={-1}
                  label={item}
                  onDelete={() => handleDeleteDisplayFields(index)}
                />
              )),
            classes: {
              root: classnames(
                classes.tagsInputRoot,
                !isEmpty && classes.tagsInputRootFilled
              ),
              input: classes.tagsInput,
              adornedStart: classes.tagsInputAdornedStart,
            },
          }}
          onKeyDown={handleKeyDown}
          onChange={handleOnChange}
        />
      </Grid>
    </Grid>
  );
}
