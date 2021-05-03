import { Grid, Typography } from "@material-ui/core";
import React from "react";

const NoExistingExcution = () => {
  return (
    <Grid container justify="center">
      <Grid item>
        <Typography>{`There's no existing execution`}</Typography>
      </Grid>
    </Grid>
  );
};

export default NoExistingExcution;
