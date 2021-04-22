import React, { useCallback } from "react";
import { signIn } from "next-auth/client";

import { AppBar, Box, Typography, Button } from "@material-ui/core";
import HomeOutlinedIcon from "@material-ui/icons/HomeOutlined";
import FlaskIcon from "../common/FlaskIcon";

import { useSession, useActiveProject, useActiveOrg } from "../Session";
import Link, { LinkButton } from "../common/Link";
import useStyles from "./AppTopBarStyles";
import SettingsMenu from "./SettingsMenu";
import ResourcesMenu from "./ResourcesMenu";
import UserMenu from "./UserMenu";
import ProjectsMenu from "./ProjectsMenu";

export default function AppTopBar() {
  const classes = useStyles();
  const { session } = useSession();
  const { project } = useActiveProject();
  const { activeOrg } = useActiveOrg();

  const activeProjectId = project?.id ?? 0;

  const handleUserLoginClick = useCallback(() => {
    return signIn();
  }, []);

  return (
    <AppBar position="fixed" className={classes.appBar}>
      <Box className={classes.appBarWrapper}>
        <Box className={classes.leftWrapper}>
          <Link href="/" color="inherit" underline="none">
            <Typography variant="h5">Sierra</Typography>
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
            href={`/${activeProjectId}/lab`}
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
            <UserMenu
              user={{
                name: session.user.name || "",
                image: session.user.image || "",
              }}
              org={{
                name: activeOrg?.name || "",
                image: activeOrg?.image || "",
              }}
            />
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
