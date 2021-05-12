import React from "react";
import { makeStyles } from "@material-ui/core";
import { Skeleton } from "@material-ui/lab";

const useStyles = makeStyles((theme) => ({
  skeleton: {
    width: "100%",
    marginBottom: theme.spacing(1),
  },
}));

export default function LoadingContent() {
  const classes = useStyles();

  return (
    <div>
      <Skeleton variant="text" className={classes.skeleton} />
      <Skeleton variant="text" className={classes.skeleton} />
      <Skeleton variant="rect" height={100} className={classes.skeleton} />
    </div>
  );
}
