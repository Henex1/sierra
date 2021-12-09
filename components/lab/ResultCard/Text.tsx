import React from "react";
import { Box, Typography } from "@material-ui/core";
import { labelFromField } from "./utils";

export interface Props {
  text: string;
  field: string;
}

export const Text = ({ field, text }: Props) => {
  return (
    <Box>
      <Typography color="textSecondary" variant="caption">
        {labelFromField(field)}
      </Typography>
      <Typography>{text}</Typography>
    </Box>
  );
};
