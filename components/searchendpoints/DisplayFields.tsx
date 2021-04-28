import React, { useState } from "react";

import { makeStyles } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import Chip from "@material-ui/core/Chip";
import TextField from "@material-ui/core/TextField";

export type DisplayFieldsProps =  {
  displayFields: any
};

const useStyles = makeStyles((theme) => ({
  tagsInputRoot: {
    display: "flex",
    flexWrap: "wrap"
  },
  tagsInput: {
    maxWidth: "250px"
  }
}));

export default function DisplayFields({ displayFields }: DisplayFieldsProps) {
  const classes = useStyles();
  const [error, setError] = useState('');
  const [inputValue, setInputValue] = useState('');
  const supportedPrefixes = ['image', 'url', 'title'];

  const handleDeleteDisplayFields = (index: number) => {
    displayFields.input.value.splice(index, 1)
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
  }

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
              validDisplayField = false
            }
          })
          if (validDisplayField) {
            setNewValue(inputValue);
          } else {
            setError('Display fields with that prefix already exists')
          }
        } else {
          setError('Display fields prefix is not valid')
        }
      } else {
        setNewValue(inputValue);
      }
      event.preventDefault();
    }
  }

  const setNewValue = (inputValue: String) => {
    displayFields.input.onChange({
      target: {
        type: "input",
        value: [...displayFields.input.value, inputValue],
      },
    });
    setError('');
    setInputValue('');
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Display Fields"
          variant="outlined"
          error={!!error}
          helperText={error}
          value={inputValue}
          InputProps={{
            startAdornment: displayFields.input.value && displayFields.input.value.map((item: string, index: number) => (
              <Chip
                style={{ marginRight: "8px", marginTop: "8px"}}
                key={index}
                tabIndex={-1}
                label={item}
                onDelete={() => handleDeleteDisplayFields(index)}
              />
            )),
            classes: {
              root: classes.tagsInputRoot,
              input: classes.tagsInput
            }
          }}
          onKeyDown={handleKeyDown}
          onChange={handleOnChange}
        />
      </Grid>
    </Grid>
  )
}
