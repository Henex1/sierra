import { Grid, Typography } from "@material-ui/core";
import React from "react";
import _ from "lodash";

type Props = {
  isSearchConfig: boolean;
  isRunQuery: boolean;
};
const NoExistingExcution = ({
  isSearchConfig: isConfig,
  isRunQuery,
}: Props) => {
  let message: string = "";
  if (!isConfig) {
    message = `You didn't define your search configurations yet!`;
  } else if (!isRunQuery) {
    message = `You didn't execute your queries yet!`;
  }

  return (
    <Grid container justify="center">
      <Grid item>
        <Typography variant="h6">{message}</Typography>
      </Grid>
    </Grid>
  );
};

export default NoExistingExcution;
