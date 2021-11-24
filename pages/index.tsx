import React from "react";

import Avatar from "@material-ui/core/Avatar";
import Grid from "@material-ui/core/Grid";
import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";
import Portal from "@material-ui/core/Portal";
import { makeStyles } from "@material-ui/core/styles";
import { useSession } from "../components/Session";
import ProjectList from "../components/dashboard/ProjectList";
import { LayoutContext } from "../components/AppLayout";
import MenuDrawer from "../components/dashboard/MenuDrawer";
import { authenticatedPage } from "../lib/pageHelpers";
import { getRecentProjects, RecentProject } from "../lib/projects";
import { getActiveOrg } from "../lib/org";
import { getCookies } from "../lib/cookies";

type Props = {
  projects: RecentProject[];
};

export const getServerSideProps = authenticatedPage<Props>(async (context) => {
  const { activeOrgId } = getCookies(context.req as any);
  const activeOrg = await getActiveOrg(context.user, activeOrgId);
  if (!activeOrg) return { props: { projects: [] } };

  const projects = await getRecentProjects(activeOrg, context.user, {
    take: 3,
    skip: 0,
  });
  return {
    props: { projects },
  };
});

const useStyles = makeStyles((theme) => ({
  root: {
    margin: `${theme.spacing(5)}px 0`,
  },
  avatar: {
    width: 70,
    height: 70,
    marginRight: theme.spacing(2),
  },
}));

export default function Home({ projects }: Props) {
  const { session } = useSession();
  const classes = useStyles();

  return (
    <div className={classes.root} data-testid="home-root">
      <LayoutContext.Consumer>
        {({ sidebarRef }) => (
          <Portal container={sidebarRef.current}>
            <MenuDrawer />
          </Portal>
        )}
      </LayoutContext.Consumer>
      <Grid container alignItems="center">
        <Grid item>
          <Avatar
            className={classes.avatar}
            alt={session.user?.name || ""}
            src={session.user?.image || ""}
          />
        </Grid>
        <Grid item>
          <Typography variant="h5">{session.user?.name}</Typography>
          <Typography variant="body2" color="textSecondary">
            {session.user?.email}
          </Typography>
        </Grid>
      </Grid>

      <Box mt={5}>
        <Typography variant="h4">Projects</Typography>
      </Box>
      <ProjectList compact={true} projects={projects} />
    </div>
  );
}
