import React from "react";
import classnames from "classnames";
import { Box, makeStyles, Typography } from "@material-ui/core";
import { Check, Error, WarningRounded } from "@material-ui/icons";

type Props = {
  children: string;
  variant: "success" | "warning" | "danger";
};

const ICONS = {
  success: <Check />,
  warning: <WarningRounded />,
  danger: <Error />,
};

const useStyles = makeStyles((theme) => ({
  container: {
    padding: theme.spacing(1),
    display: "flex",
  },
  title: {
    fontWeight: theme.typography.fontWeightMedium,
    marginLeft: theme.spacing(1),
  },
  success: {
    backgroundColor: theme.palette.success.main,
  },
  warning: {
    backgroundColor: theme.palette.warning.main,
  },
  danger: {
    backgroundColor: theme.palette.error.main,
  },
}));

export const AppTopBarBanner = ({ children, variant }: Props) => {
  const classes = useStyles();

  return (
    <Box className={classnames(classes.container, classes[variant])}>
      {ICONS[variant]}
      <Typography className={classes.title}>{children}</Typography>
    </Box>
  );
};
