import React, { useCallback } from "react";
import { signIn, useSession } from "next-auth/client";
import Link from 'next/link';

import {
  AppBar,
  Avatar,
  Box,
  Typography,
  Button,
} from "@material-ui/core";
import HomeOutlinedIcon from '@material-ui/icons/HomeOutlined';
import DomainOutlinedIcon from '@material-ui/icons/DomainOutlined';

import ResourcesMenu from "./ResourcesMenu";

import useStyles from "./AppTopBarStyles";
import SettingsMenu from "./SettingsMenu";
import UserMenu from "./UserMenu";
import ProjectsMenu from "./ProjectsMenu";

export default function AppTopBar() {
  const classes = useStyles();
  const [ session ] = useSession();

  const handleUserLoginClick = useCallback(() => {
    return signIn();
  }, []);

  return (
    <AppBar position="absolute" className={classes.appBar}>
      <Box className={classes.appBarWrapper}>
        <Box className={classes.leftWrapper}>
          <Typography variant="h5">Project Sierra</Typography>
          <Link href="/">
            <Button
              className={classes.topButton}
              size="large"
              color="inherit"
              startIcon={<HomeOutlinedIcon />}
            >
              Home
            </Button>
          </Link>
          {session && (
            <>
              <Link href="/lab">
                <Button
                  className={classes.topButton}
                  size="large"
                  color="inherit"
                  startIcon={<DomainOutlinedIcon />}
                >
                  Lab
                </Button>
              </Link>
              <ResourcesMenu />
            </>
          )}
        </Box>
        {session ? (
          <Box className={classes.rightWrapper}>
            <ProjectsMenu />
            <SettingsMenu />
            <Avatar
              className={classes.userAvatar}
              alt={session.user.name || ""}
              src={session.user.image || ""}
            />
            <UserMenu />
          </Box>
        ) : (
          <Box className={classes.rightWrapper}>
            <Button
              className={classes.topButton}
              size="large"
              color="inherit"
              onClick={handleUserLoginClick}
            >
              Log In
            </Button>
          </Box>
        )}
      </Box>
    </AppBar>
  );
}
