import React, { FC } from "react";
import { makeStyles } from "@material-ui/styles";

const useStyles = makeStyles(() => ({
  root: {
    width: 250,
    height: 250,
    display: "block",
    cursor: "pointer",
  },
  input: {
    display: "none",
  },
  disabledInput: {
    width: 250,
    height: 250,
    display: "block",
    opacity: 0.3,
  },
}));

export interface Props {
  onChange: (file: File) => void;
  disabled: boolean | undefined;
}

export const Input: FC<Props> = ({ onChange, children, disabled = false }) => {
  const classes = useStyles();

  return (
    <label className={disabled ? classes.disabledInput : classes.root}>
      {children}
      <input
        disabled={disabled}
        type="file"
        accept="image/jpeg, image/png, image/svg+xml"
        className={classes.input}
        onChange={(e) => {
          e.target.files?.[0] && onChange(e.target.files[0]);
        }}
      />
    </label>
  );
};
