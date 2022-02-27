import React, { useCallback, useEffect, useState } from "react";
import { signIn } from "next-auth/client";
import io from "socket.io-client";
import classNames from "classnames";

import { AppBar, Box, Button } from "@material-ui/core";
import HomeOutlinedIcon from "@material-ui/icons/HomeOutlined";
import FlaskIcon from "../common/FlaskIcon";

import { useSession, useActiveProject, useActiveOrg } from "../Session";
import Link, { LinkButton } from "../common/Link";
import useStyles from "./AppTopBarStyles";
import ResourcesMenu from "./ResourcesMenu";
import UserMenu from "./UserMenu";
import MobileUserMenu from "./MobileUserMenu";
import ProjectsMenu from "./ProjectsMenu";
import { RunningTasksSpinner } from "./RunningTasksSpinner";
import { FeedbackMenu } from "./FeedbackMenu";
import { AppTopBarBanner } from "./AppTopBarBanner";

export default function AppTopBar() {
  const [tasks, setTasks] = useState([]);
  const classes = useStyles();
  const { session } = useSession();
  const { project } = useActiveProject();
  const { activeOrg } = useActiveOrg();

  const activeProjectId = project?.id ?? 0;

  useEffect(() => {
    const socket = io();
    socket.on("running_tasks", ({ tasks: newTasks }) => {
      setTasks(newTasks);
    });
  }, []);

  const handleUserLoginClick = useCallback(() => {
    return signIn();
  }, []);

  return (
    <AppBar position="fixed" className={classes.appBar}>
      <Box className={classes.appBarWrapper}>
        <Box className={classNames(classes.leftWrapper, classes.sectionTablet)}>
          <Link href="/" color="inherit" underline="none">
            <img
              className={classes.headerLogo}
              src="/images/sierraLogo_white.svg"
              alt="Sierra Logo"
            />
          </Link>
        </Box>
        <Box
          className={classNames(classes.leftWrapper, classes.sectionDesktop)}
        >
          <Link href="/" color="inherit" underline="none">
            <img
              className={classes.headerLogo}
              src="/images/sierraLogo_white.svg"
              alt="Sierra Logo"
            />
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
            <span className={classes.sectionDesktop}>Lab</span>
          </LinkButton>
          <ResourcesMenu />
        </Box>
        <Box
          className={classNames(classes.rightWrapper, classes.sectionDesktop)}
        >
          <RunningTasksSpinner tasks={tasks} />
          <ProjectsMenu />
          <FeedbackMenu />
          {session.user ? (
            <UserMenu
              user={{
                name: session.user.name || "",
                image: session.user.image || "",
                email: session.user.email || "",
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
        <Box className={`${classes.rightWrapper} ${classes.sectionTablet}`}>
          <ProjectsMenu />
          <MobileUserMenu activeProjectId={activeProjectId} />
        </Box>
      </Box>
      <AppTopBarBanner />
    </AppBar>
  );
}
