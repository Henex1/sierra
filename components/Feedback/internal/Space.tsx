import React, { ReactElement } from "react";
import { makeStyles } from "@material-ui/core";

const useStyles = makeStyles({
  root: {
    paddingTop: "10px",
    width: "100%",
  },
});

/**
 * @internal
 */
export const Space = (): ReactElement => {
  const C = useStyles();
  return <div className={C.root} />;
};
