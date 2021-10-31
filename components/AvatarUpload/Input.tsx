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
}));

export interface Props {
  onChange: (file: File) => void;
}

export const Input: FC<Props> = ({ onChange, children }) => {
  const classes = useStyles();

  return (
    <label className={classes.root}>
      {children}
      <input
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
