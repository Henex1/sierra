import { makeStyles, Theme } from "@material-ui/core";
import React from "react";
import { useAppTopBarBannerContext } from "../../utils/react/hooks/useAppTopBarBannerContext";

const useStyles = makeStyles<Theme, { pageHasBanner: boolean }>((theme) => ({
  appBarSpacer: (props) => ({
    minHeight: props.pageHasBanner
      ? (theme.mixins.toolbar.minHeight as number) + theme.spacing(6)
      : theme.mixins.toolbar.minHeight,
  }),
}));

export default function AppBarSpacer() {
  const { banner, isPageAllowed } = useAppTopBarBannerContext();

  const classes = useStyles({ pageHasBanner: !!banner && isPageAllowed() });

  return <div className={classes.appBarSpacer} />;
}
