import React from "react";
import { Fab, Portal, colors, makeStyles, Theme } from "@material-ui/core";
import SettingsIcon from "@material-ui/icons/Settings";
import CreateIcon from "@material-ui/icons/Create";
import classnames from "classnames";

import { ExposedQueryTemplate } from "../../lib/querytemplates";
import { ExposedRuleset, ExposedRulesetVersion } from "../../lib/rulesets";
import { ExposedSearchConfiguration } from "../../lib/searchconfigurations";
import { LayoutContext } from "../AppLayout";
import ConfigurationDrawer from "./ConfigurationDrawer";

const useStyles = makeStyles<Theme, { width: number }>((theme) => ({
  fabContainer: {
    position: "fixed",
    bottom: 30,
  },
  containerRight: {
    right: 50,
  },
  containerLeft: {
    left: 50,
  },
  runFab: {
    width: 140,
  },
  closeFab: (props) => ({
    transform: `translateX(${props.width}px)`,
  }),
  createFab: {
    width: 160,
    marginRight: theme.spacing(2),
  },
  fabIcon: {
    marginRight: theme.spacing(1),
  },
  fabProgress: {
    color: colors.blue[500],
    marginRight: theme.spacing(1),
  },
}));

type Props = {
  searchConfiguration:
    | (ExposedSearchConfiguration & {
        queryTemplate: ExposedQueryTemplate;
        rulesets: ExposedRulesetVersion[];
      })
    | null;
  rulesets: ExposedRuleset[];
  canRun: boolean;
  isRunning: boolean;
  onRun: () => void;
};

export default function ActionButtons({
  searchConfiguration,
  rulesets,
  canRun,
  isRunning,
  onRun,
}: Props) {
  const [open, setOpen] = React.useState(false);
  const [drawerWidth, setDrawerWidth] = React.useState(600);
  const classes = useStyles({ width: drawerWidth });

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return canRun ? (
    <div>
      <div
        className={classnames(
          classes.fabContainer,
          classes.containerLeft,
          "mui-fixed"
        )}
      >
        {!open && (
          <Fab onClick={handleOpen}>
            <SettingsIcon />
          </Fab>
        )}
        <LayoutContext.Consumer>
          {({ sidebarRef }) => (
            <Portal container={sidebarRef.current}>
              {open && (
                <ConfigurationDrawer
                  canRun={canRun}
                  isRunning={isRunning}
                  onRun={onRun}
                  width={drawerWidth}
                  setDrawerWidth={setDrawerWidth}
                  searchConfiguration={searchConfiguration}
                  rulesets={rulesets}
                  handleClose={handleClose}
                />
              )}
            </Portal>
          )}
        </LayoutContext.Consumer>
      </div>
    </div>
  ) : (
    <div className={classnames(classes.fabContainer, "mui-fixed")}>
      <Fab color="primary" variant="extended" className={classes.createFab}>
        <CreateIcon className={classes.fabIcon} />
        Create Now
      </Fab>
    </div>
  );
}
