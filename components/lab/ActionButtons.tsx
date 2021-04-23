import React from "react";
import { Fab, Drawer, CircularProgress, colors } from "@material-ui/core";
import PlayArrowIcon from "@material-ui/icons/PlayArrow";
import SettingsIcon from "@material-ui/icons/Settings";
import { makeStyles } from "@material-ui/core/styles";
import classnames from "classnames";

const useStyles = makeStyles((theme) => ({
  fabContainer: {
    position: "fixed",
    right: 50,
    bottom: 30,
  },
  runFab: {
    width: 140,
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
  configurations: {};
  isRunning: boolean;
  onRun: () => void;
  onConfigurationsChange: (config: {}) => void;
};

export default function ActionButtons({
  configurations,
  isRunning,
  onRun,
  onConfigurationsChange,
}: Props) {
  const classes = useStyles();
  const [open, setOpen] = React.useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <div className={classnames(classes.fabContainer, "mui-fixed")}>
      <Fab
        color="primary"
        variant="extended"
        className={classes.runFab}
        onClick={onRun}
        disabled={isRunning}
      >
        {isRunning ? (
          <CircularProgress size={24} className={classes.fabProgress} />
        ) : (
          <PlayArrowIcon className={classes.fabIcon} />
        )}

        {isRunning ? "Running" : "Run now"}
      </Fab>
      <Fab onClick={handleOpen}>
        <SettingsIcon />
      </Fab>
      <Drawer anchor={"right"} open={open} onClose={handleClose}>
        Run configurations
      </Drawer>
    </div>
  );
}
