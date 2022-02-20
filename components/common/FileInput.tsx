import React, { ChangeEvent } from "react";

import { makeStyles } from "@material-ui/core/styles";
import FormControl from "@material-ui/core/FormControl";
import Button from "@material-ui/core/Button";

const useStyles = makeStyles(() => ({
  container: {
    display: "flex",
    flexWrap: "wrap",
  },
  formControl: {},
  input: {
    display: "none",
  },
  label: {},
  button: {},
}));

type Props = {
  accept: string;
  id: string;
  label: string;
  onChange?: (ev: ChangeEvent<HTMLInputElement>) => void;
  inputProps?: any;
  labelProps?: any;
  buttonProps?: any;
  multiple?: boolean;
};

const FileInput = ({
  id = "file-input",
  label = "Add File",
  accept = "*.*",
  multiple = false,
  inputProps,
  labelProps,
  buttonProps,
  onChange,
}: Props) => {
  const classes = useStyles();

  return (
    <div className={classes.container}>
      <FormControl className={classes.formControl}>
        <input
          id={id}
          accept={accept}
          className={classes.input}
          multiple={multiple}
          type="file"
          onChange={onChange}
          {...inputProps}
        />
        <label className={classes.label} htmlFor={id} {...labelProps}>
          <Button
            variant="contained"
            component="span"
            className={classes.button}
            {...buttonProps}
          >
            {label}
          </Button>
        </label>
      </FormControl>
    </div>
  );
};

export default FileInput;
