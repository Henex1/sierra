import React from "react";
import { Fab, Portal, colors, makeStyles, Theme } from "@material-ui/core";
import SettingsIcon from "@material-ui/icons/Settings";
import classnames from "classnames";

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
  fabProgress: {
    color: colors.blue[500],
    marginRight: theme.spacing(1),
  },
}));

export default function Configuration({
  searchEndpointType,
}: {
  searchEndpointType: string;
}) {
  const [open, setOpen] = React.useState(false);
  const [drawerWidth, setDrawerWidth] = React.useState(600);
  const classes = useStyles({ width: drawerWidth });

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
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
                  searchEndpointType={searchEndpointType}
                  width={drawerWidth}
                  setDrawerWidth={setDrawerWidth}
                  handleClose={handleClose}
                />
              )}
            </Portal>
          )}
        </LayoutContext.Consumer>
      </div>
    </div>
  );
}
