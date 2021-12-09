import React, { ReactElement } from "react";
import { Box } from "@material-ui/core";
import { labelFromField } from "./utils";
import { useStyles } from "./styles";

export interface Props {
  src: string;
  field: string;
}

export const Image = ({ src, field }: Props): ReactElement => {
  const classes = useStyles();
  return (
    <Box mb={1} key={field} className={classes.imageContainer}>
      <img
        className={classes.image}
        src={src}
        alt={labelFromField(field)}
        title={labelFromField(field)}
      />
    </Box>
  );
};
