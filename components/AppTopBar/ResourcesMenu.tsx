import React, { useCallback, useState } from "react";
import { useRouter } from "next/router";

import { Button, Menu, MenuItem } from "@material-ui/core";
import LandscapeIcon from '@material-ui/icons/Landscape';

import useStyles from "./AppTopBarStyles";

export default function ResourcesMenu() {
  const router = useRouter()
  const classes = useStyles();

  const [resourcesAnchorEl, setResourcesAnchorEl] = useState<null | HTMLElement>(null);

  const handleDataSourcesClick = useCallback(() => {
    handleResourcesMenuClose();
    return router.push("/datasources");
  }, []);

  const handleResourcesMenuOpen = useCallback((event: React.MouseEvent<HTMLElement>) => {
    setResourcesAnchorEl(event.currentTarget);
  }, []);

  const handleResourcesMenuClose = useCallback(() => {
    setResourcesAnchorEl(null);
  }, []);

  return (
    <>
      <Button
        className={classes.topButton}
        size="large"
        color="inherit"
        onClick={handleResourcesMenuOpen}
        startIcon={<LandscapeIcon />}
      >
        Resources
      </Button>
      <Menu
        className={classes.dropMenu}
        anchorEl={resourcesAnchorEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        keepMounted
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        open={Boolean(resourcesAnchorEl)}
        onClose={handleResourcesMenuClose}
      >
        <MenuItem onClick={handleDataSourcesClick}>Data sources</MenuItem>
        <MenuItem>Search phrases</MenuItem>
        <MenuItem>Judgments</MenuItem>
        <MenuItem>Rule sets</MenuItem>
      </Menu>
    </>
  )
}
