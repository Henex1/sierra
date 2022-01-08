import React from "react";
import classnames from "classnames";
import { Box, makeStyles, Typography } from "@material-ui/core";
import { Check, Error, WarningRounded } from "@material-ui/icons";
import { useAppTopBarBannerContext } from "../../utils/react/hooks/useAppTopBarBannerContext";

const ICONS = {
  success: <Check />,
  warning: <WarningRounded />,
  danger: <Error />,
};

const useStyles = makeStyles((theme) => ({
  container: {
    padding: theme.spacing(1),
    display: "flex",
    minHeight: theme.spacing(5),
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

export const AppTopBarBanner = () => {
  const classes = useStyles();
  const { banner, isPageAllowed } = useAppTopBarBannerContext();

  if (!banner || !isPageAllowed()) {
    return null;
  }

  return (
    <Box className={classnames(classes.container, classes[banner.variant])}>
      {ICONS[banner.variant]}
      <Typography className={classes.title}>{banner.message}</Typography>
    </Box>
  );
};
