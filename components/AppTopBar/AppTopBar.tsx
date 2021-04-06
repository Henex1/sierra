import React, { useCallback } from "react";
import { signIn } from "next-auth/client";

import { AppBar, Avatar, Box, Typography, Button } from "@material-ui/core";
import HomeOutlinedIcon from "@material-ui/icons/HomeOutlined";
import DomainOutlinedIcon from "@material-ui/icons/DomainOutlined";
import FlaskIcon from "../common/FlaskIcon";

import { useSession } from "../Session";
import Link, { LinkButton } from "../common/Link";
import useStyles from "./AppTopBarStyles";
import SettingsMenu from "./SettingsMenu";
import ResourcesMenu from "./ResourcesMenu";
import UserMenu from "./UserMenu";
import ProjectsMenu from "./ProjectsMenu";

export default function AppTopBar() {
  const classes = useStyles();
  const { session } = useSession();

  const handleUserLoginClick = useCallback(() => {
    return signIn();
  }, []);

  return (
    <AppBar position="absolute" className={classes.appBar}>
      <Box className={classes.appBarWrapper}>
        <Box className={classes.leftWrapper}>
          <Link href="/" color="inherit" underline="none">
            <Typography variant="h5">Project Sierra</Typography>
          </Link>
          <LinkButton
            href="/"
            className={classes.topButton}
            size="large"
            color="inherit"
            startIcon={<HomeOutlinedIcon />}
          >
            Home
          </LinkButton>
          <LinkButton
            href="/lab"
            color="inherit"
            className={classes.topButton}
            size="large"
            startIcon={<FlaskIcon />}
          >
            Lab
          </LinkButton>
          <ResourcesMenu />
        </Box>
        <Box className={classes.rightWrapper}>
          <ProjectsMenu />
          <SettingsMenu />
          {session.user ? (
            <>
              <Avatar
                className={classes.userAvatar}
                alt={session.user.name || ""}
                title={`Signed in as ${session.user.name}`}
                src={session.user.image || ""}
              />
              <UserMenu />
            </>
          ) : (
            <Button
              className={classes.topButton}
              size="large"
              color="inherit"
              onClick={handleUserLoginClick}
            >
              Log In
            </Button>
          )}
        </Box>
      </Box>
    </AppBar>
  );
}
