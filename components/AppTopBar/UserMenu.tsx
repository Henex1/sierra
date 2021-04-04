import React, { useCallback, useState } from "react";
import { signOut } from "next-auth/client";

import {
  IconButton,
  Menu,
  MenuItem
} from "@material-ui/core";
import KeyboardArrowDownIcon from "@material-ui/icons/KeyboardArrowDown";

import useStyles from "./AppTopBarStyles";

export default function UserMenu() {
  const classes = useStyles();

  const [userAnchorEl, setUserAnchorEl] = useState<null | HTMLElement>(null);

  const handleUserMenuOpen = useCallback((event: React.MouseEvent<HTMLElement>) => {
    setUserAnchorEl(event.currentTarget);
  }, []);

  const handleUserMenuClose = useCallback(() => {
    setUserAnchorEl(null);
  }, []);

  const handleUserLogoutClick = useCallback(() => {
    handleUserMenuClose();
    return signOut();
  }, []);

  const handleUserProfileClick = useCallback(() => {
    handleUserMenuClose();
  }, []);

  return (
    <>
      <IconButton
        color="inherit"
        onClick={handleUserMenuOpen}
      >
        <KeyboardArrowDownIcon/>
      </IconButton>
      <Menu
        className={classes.dropMenu}
        anchorEl={userAnchorEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        keepMounted
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        open={Boolean(userAnchorEl)}
        onClose={handleUserMenuClose}
      >
        <MenuItem onClick={handleUserProfileClick}>Profile</MenuItem>
        <MenuItem onClick={handleUserLogoutClick}>Logout</MenuItem>
      </Menu>
    </>
  )
}
