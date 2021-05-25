import * as React from "react";
import { Avatar, Tooltip, colors } from "@material-ui/core";
import WarningIcon from "@material-ui/icons/Warning";
import { ReactElement } from "react";
import { useStyles } from "./hooks";

export function ErrorBox(): ReactElement {
  const classes = useStyles();

  return (
    <Tooltip title="Sierra score">
      <Avatar
        variant="rounded"
        className={classes.scoreBoxAvatar}
        style={{
          background: colors.red[500],
        }}
      >
        <WarningIcon />
      </Avatar>
    </Tooltip>
  );
}
