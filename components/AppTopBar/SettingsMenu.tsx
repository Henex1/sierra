import {Box, IconButton, Menu, MenuItem} from "@material-ui/core";
import SettingsOutlinedIcon from "@material-ui/icons/SettingsOutlined";
import React, {useCallback, useState} from "react";
import {useRouter} from "next/router";
import useStyles from "./AppTopBarStyles";

export default function SettingsMenu() {
  const router = useRouter()
  const classes = useStyles();

  const [settingsAnchorEl, setSettingsAnchorEl] = useState<null | HTMLElement>(null);

  const handleProjectsClick = useCallback(() => {
    handleSettingsMenuClose();
    return router.push("/projects");
  }, []);

  const handleSettingsMenuOpen = useCallback((event: React.MouseEvent<HTMLElement>) => {
    setSettingsAnchorEl(event.currentTarget);
  }, []);

  const handleSettingsMenuClose = useCallback(() => {
    setSettingsAnchorEl(null);
  }, []);

  return (
    <>
      <IconButton
        className={classes.topButton}
        color="inherit"
        onClick={handleSettingsMenuOpen}
      >
        <SettingsOutlinedIcon/>
      </IconButton>
      <Menu
        className={classes.dropMenu}
        anchorEl={settingsAnchorEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        keepMounted
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        open={Boolean(settingsAnchorEl)}
        onClose={handleSettingsMenuClose}
      >
        <MenuItem>Teams</MenuItem>
        <MenuItem onClick={handleProjectsClick}>Projects</MenuItem>
        <MenuItem>Scores</MenuItem>
        <MenuItem>Settings</MenuItem>
      </Menu>
    </>
  )
}
