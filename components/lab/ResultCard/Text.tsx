import React from "react";
import { Box, Typography } from "@material-ui/core";
import { labelFromField } from "./utils";
import { useStyles } from "./styles";

export interface Props {
  text: string;
  field: string;
}

export const Text = ({ field, text }: Props) => {
  const classes = useStyles();

  return (
    <Box className={classes.withLabel}>
      <Typography color="textSecondary" variant="caption">
        {labelFromField(field)}
      </Typography>
      <Typography>{text}</Typography>
    </Box>
  );
};
